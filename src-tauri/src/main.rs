// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet])
        .setup(|app| {
            // Additional setup for macOS optimization
            #[cfg(target_os = "macos")]
            {
                // Disable GPU acceleration for old Macs
                app.get_window("main").unwrap().with_webview(|webview| {
                    #[cfg(target_os = "macos")]
                    unsafe {
                        use objc::*;
                        let () = msg_send![webview.inner(), setValue:false forKey:"drawsBackground"];
                    }
                });
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}