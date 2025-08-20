#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet])
        .setup(|app| {
            #[cfg(target_os = "macos")]
            {
                // Optimizations for older Macs
                let window = app.get_window("main").unwrap();
                window.set_title("Nile Browser").unwrap();
                
                // Disable GPU acceleration for old Macs
                window.with_webview(|webview| {
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