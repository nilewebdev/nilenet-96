#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::sync::{Arc, Mutex};
use tauri::{Manager, Window, WindowUrl, Wry, AppHandle, GlobalShortcutManager};
use serde::{Serialize, Deserialize};
use anyhow::Result;
use std::collections::HashMap;
use tauri::api::path::app_config_dir;
use std::fs::{self};
use tauri::async_runtime;
use reqwest::Client;
use uuid::Uuid;
use std::time::{Instant};
use tokio::sync::{oneshot, Mutex as AsyncMutex};
use std::sync::atomic::{AtomicBool, Ordering};

#[derive(Serialize, Deserialize, Debug, Clone)]
struct TabInfo {
  id: String,
  label: String,
  url: String,
  title: Option<String>,
  favicon: Option<String>,
  loading: Option<bool>,
}

struct AppState {
  tabs: HashMap<String, TabInfo>,
  permissions: HashMap<String, bool>, // naive store for permissions by origin+kind
  downloads: HashMap<String, oneshot::Sender<()>>, // cancel senders
}

type SharedState = Arc<Mutex<AppState>>;

#[tauri::command]
fn list_tabs(state: tauri::State<SharedState>) -> Result<Vec<TabInfo>, String> {
  let s = state.lock().unwrap();
  Ok(s.tabs.values().cloned().collect())
}

#[tauri::command]
fn create_tab(app: tauri::AppHandle<Wry>, state: tauri::State<SharedState>, url: String) -> Result<TabInfo, String> {
  let id = Uuid::new_v4().to_string();
  let label = format!("tab-{}", &id);
  let url_clone = url.clone();
  // create a new window as a webview for this tab
  let win = tauri::WindowBuilder::new(&app, label.clone(), WindowUrl::External(url_clone.parse().map_err(|e| e.to_string())?))
    .title("New Tab")
    .inner_size(1200.0, 720.0)
    .resizable(true)
    .visible(true)
    .build().map_err(|e| e.to_string())?;

  let tab = TabInfo { id: id.clone(), label: label.clone(), url: url.clone(), title: None, favicon: None, loading: Some(true) };
  {
    let mut s = state.lock().unwrap();
    s.tabs.insert(id.clone(), tab.clone());
  }

  // inject JS into the created webview to report title/loading/favicon updates back to the backend via invoke
  // the injected script will call window.__TAURI__.invoke('notify_tab_update', { tabId: "...", title, url, favicon, loading })
  let inject = format!(r#"(() => {{
    const TAB_ID = {tabid};
    function send() {{
      try {{
        const title = document.title || "";
        const url = location.href || "";
        let favicon = "";
        const el = document.querySelector("link[rel~='icon']") || document.querySelector("link[rel='shortcut icon']");
        if (el) favicon = el.href || "";
        const loading = document.readyState !== "complete";
        // call the backend command
        if (window.__TAURI && window.__TAURI.invoke) {{
          window.__TAURI.invoke('notify_tab_update', {{ tab_id: TAB_ID, title: title, url: url, favicon: favicon, loading: loading }}).catch(()=>{{}});
        }} else if (window.invoke) {{
          try {{ window.invoke('notify_tab_update', {{ tab_id: TAB_ID, title: title, url: url, favicon: favicon, loading: loading }}); }} catch(e){{}}
        }}
      }} catch(e){{}}
    }}
    // Observe changes
    const obs = new MutationObserver(send);
    obs.observe(document, {{ subtree: true, childList: true, attributes: true }});
    window.addEventListener('load', send);
    setInterval(send, 1500);
    send();
  }})();"#,
  tabid = serde_json::to_string(&id).unwrap());
  let _ = win.eval(&inject);

  // emit event to main window so UI updates
  let _ = app.get_window("main").and_then(|w| w.emit("tab-created", tab.clone()).ok());

  Ok(tab)
}

#[tauri::command]
fn notify_tab_update(app: tauri::AppHandle<Wry>, state: tauri::State<SharedState>, tab_id: String, title: String, url: String, favicon: String, loading: bool) -> Result<(), String> {
  let mut s = state.lock().unwrap();
  if let Some(tab) = s.tabs.get_mut(&tab_id) {
    tab.title = Some(title.clone());
    tab.url = url.clone().into();
    if !favicon.is_empty() { tab.favicon = Some(favicon.clone()); }
    tab.loading = Some(loading);
    let payload = serde_json::json!({ "id": tab_id.clone(), "title": title, "url": url, "favicon": tab.favicon.clone().unwrap_or_default(), "loading": loading });
    let _ = app.get_window("main").and_then(|w| w.emit("tab-updated", payload.clone()).ok());
  }
  Ok(())
}

#[tauri::command]
fn open_url_in_tab(app: tauri::AppHandle<Wry>, state: tauri::State<SharedState>, tab_id: String, url: String) -> Result<(), String> {
  let s = state.lock().unwrap();
  if let Some(tab) = s.tabs.get(&tab_id) {
    if let Some(win) = app.get_window(&tab.label) {
      win.eval(&format!("window.location.href = {}", serde_json::to_string(&url).unwrap())).map_err(|e| e.to_string())?;
      return Ok(());
    }
  }
  Err("tab not found".into())
}

#[tauri::command]
fn close_tab(app: tauri::AppHandle<Wry>, state: tauri::State<SharedState>, tab_id: String) -> Result<(), String> {
  let mut s = state.lock().unwrap();
  if let Some(tab) = s.tabs.remove(&tab_id) {
    if let Some(win) = app.get_window(&tab.label) {
      let _ = win.close();
    }
    let _ = app.get_window("main").and_then(|w| w.emit("tab-closed", tab_id.clone()).ok());
    return Ok(());
  }
  Err("tab not found".into())
}

#[tauri::command]
fn persist_tabs(state: tauri::State<SharedState>) -> Result<(), String> {
  let s = state.lock().unwrap();
  let tabs: Vec<_> = s.tabs.values().cloned().collect();
  let dir = app_config_dir().ok_or("cannot get app config dir")?;
  let mut path = dir.clone();
  path.push("nile-browser");
  fs::create_dir_all(&path).map_err(|e| e.to_string())?;
  path.push("tabs.json");
  let json = serde_json::to_string_pretty(&tabs).map_err(|e| e.to_string())?;
  fs::write(&path, json).map_err(|e| e.to_string())?;
  Ok(())
}

#[tauri::command]
fn restore_tabs(app: tauri::AppHandle<Wry>, state: tauri::State<SharedState>) -> Result<Vec<TabInfo>, String> {
  let dir = app_config_dir().ok_or("cannot get app config dir")?;
  let mut path = dir.clone();
  path.push("nile-browser");
  path.push("tabs.json");
  if !path.exists() {
    return Ok(vec![]);
  }
  let data = fs::read_to_string(&path).map_err(|e| e.to_string())?;
  let tabs: Vec<TabInfo> = serde_json::from_str(&data).map_err(|e| e.to_string())?;
  for tab in &tabs {
    // recreate windows
    let _ = tauri::WindowBuilder::new(&app, tab.label.clone(), WindowUrl::External(tab.url.parse().map_err(|e| e.to_string())?))
      .title(tab.title.clone().unwrap_or("Restored Tab".into()))
      .inner_size(1200.0, 720.0)
      .resizable(true)
      .visible(true)
      .build();
    let mut s = state.lock().unwrap();
    s.tabs.insert(tab.id.clone(), tab.clone());
  }
  Ok(tabs)
}

// Simple permission API: frontend should call this before attempting to access camera/mic/geolocation
#[tauri::command]
fn request_permission(state: tauri::State<SharedState>, origin: String, kind: String) -> Result<bool, String> {
  let key = format!("{}:{}", origin, kind);
  {
    let s = state.lock().unwrap();
    if let Some(dec) = s.permissions.get(&key) {
      return Ok(*dec);
    }
  }
  // default to false (frontend should show prompt and call set_permission)
  Ok(false)
}

#[tauri::command]
fn set_permission(state: tauri::State<SharedState>, origin: String, kind: String, allow: bool) -> Result<(), String> {
  let key = format!("{}:{}", origin, kind);
  let mut s = state.lock().unwrap();
  s.permissions.insert(key, allow);
  Ok(())
}

// Start a download: frontend should first call file save dialog and provide save_path
#[tauri::command]
fn start_download(app: tauri::AppHandle<Wry>, state: tauri::State<SharedState>, url: String, save_path: String) -> Result<String, String> {
  let download_id = Uuid::new_v4().to_string();
  let (tx, rx) = oneshot::channel::<()>();
  {
    let mut s = state.lock().unwrap();
    s.downloads.insert(download_id.clone(), tx);
  }

  async fn do_download(app: AppHandle<Wry>, id: String, url: String, path: String, mut cancel_rx: oneshot::Receiver<()>) {
    let client = Client::new();
    let res = match client.get(&url).send().await {
      Ok(r) => r,
      Err(e) => {
        let _ = app.emit_all("download-error", format!("{}::{}", id, e.to_string()));
        return;
      }
    };
    let total = res.content_length().unwrap_or(0);
    let mut stream = res.bytes_stream();
    // create file
    let mut file = match tokio::fs::File::create(&path).await {
      Ok(f) => f,
      Err(e) => {
        let _ = app.emit_all("download-error", format!("{}::{}", id, e.to_string()));
        return;
      }
    };
    let mut downloaded: u64 = 0;
    let start = Instant::now();
    use futures_util::StreamExt;
    loop {
      tokio::select! {
        _ = &mut cancel_rx => {
          let _ = app.emit_all("download-cancelled", serde_json::json!({"id": id, "path": path}));
          // remove partial file
          let _ = tokio::fs::remove_file(&path).await;
          return;
        },
        chunk = stream.next() => {
          match chunk {
            Some(Ok(bytes)) => {
              if let Err(e) = file.write_all(&bytes).await {
                let _ = app.emit_all("download-error", format!("{}::{}", id, e.to_string()));
                return;
              }
              downloaded += bytes.len() as u64;
              // emit progress event
              let progress = if total > 0 { (downloaded as f64 / total as f64) * 100.0 } else { -1.0 };
              let elapsed = start.elapsed().as_secs_f64();
              let speed = if elapsed > 0.0 { downloaded as f64 / elapsed } else { 0.0 };
              let payload = serde_json::json!({
                "id": id,
                "downloaded": downloaded,
                "total": total,
                "percent": progress,
                "speed": speed,
                "path": path
              });
              let _ = app.emit_all("download-progress", payload);
            }
            Some(Err(e)) => {
              let _ = app.emit_all("download-error", format!("{}::{}", id, e.to_string()));
              return;
            }
            None => { break; }
          }
        }
      }
    }
    let _ = app.emit_all("download-complete", serde_json::json!({ "id": id, "path": path }));
  }

  let apph = app.clone();
  let rx_owned = rx;
  async_runtime::spawn(do_download(apph, download_id.clone(), url.clone(), save_path.clone(), rx_owned));
  Ok(download_id)
}

#[tauri::command]
fn cancel_download(state: tauri::State<SharedState>, download_id: String) -> Result<(), String> {
  let mut s = state.lock().unwrap();
  if let Some(tx) = s.downloads.remove(&download_id) {
    let _ = tx.send(());
    return Ok(());
  }
  Err("download not found".into())
}

#[tauri::command]
fn open_devtools(app: tauri::AppHandle<Wry>, state: tauri::State<SharedState>, tab_id: String) -> Result<(), String> {
  let s = state.lock().unwrap();
  if let Some(tab) = s.tabs.get(&tab_id) {
    if let Some(win) = app.get_window(&tab.label) {
      win.open_devtools();
      return Ok(());
    }
  }
  Err("tab not found".into())
}

fn main() {
  // initialize state
  let state: SharedState = Arc::new(Mutex::new(AppState { tabs: HashMap::new(), permissions: HashMap::new(), downloads: HashMap::new() }));

  tauri::Builder::default()
    .manage(state.clone())
    .invoke_handler(tauri::generate_handler![create_tab, close_tab, list_tabs, open_url_in_tab, persist_tabs, restore_tabs, request_permission, set_permission, start_download, cancel_download, notify_tab_update, open_devtools])
    .setup(|app| {
      // restore tabs on startup (best effort)
      let app_handle = app.handle();
      let s = state.clone();
      // register global shortcut for F12 to open devtools for focused tab (best-effort)
      if let Some(gsm) = app.global_shortcut_manager() {
        let ah = app_handle.clone();
        let s2 = s.clone();
        let _ = gsm.register("F12", move || {
          // attempt to find an active tab (first tab) and open its devtools
          let tabs = s2.lock().unwrap().tabs.clone();
          if let Some((_id, tab)) = tabs.iter().next() {
            if let Some(win) = ah.get_window(&tab.label) {
              let _ = win.open_devtools();
            }
          }
        });
      }
      std::thread::spawn(move || {
        let _ = restore_tabs(app_handle, tauri::State::from(&s));
      });
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
