mod native_auth;
mod network;
mod sidecar;

use tauri::{Manager, RunEvent};

use native_auth::NativeSession;
use sidecar::Sidecar;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_single_instance::init(|app, argv, _cwd| {
            for argument in argv {
                if argument.starts_with("com.notegic.desktop:") {
                    NativeSession::accept_callback(app, &argument);
                }
            }
        }))
        .invoke_handler(tauri::generate_handler![
            sidecar::sidecar_session,
            network::network_status,
            native_auth::start_native_login,
            native_auth::native_session,
            native_auth::logout_native
        ])
        .setup(|app| {
            NativeSession::manage(app.handle());
            let handle = app.handle().clone();
            use tauri_plugin_deep_link::DeepLinkExt;
            let _ = app.deep_link().on_open_url(move |event| {
                for url in event.urls() {
                    NativeSession::accept_callback(&handle, url.as_str());
                }
            });
            let directory = app.path().app_data_dir().expect("app data directory");
            std::fs::create_dir_all(&directory).expect("app data directory");
            let database_path = directory.join("notegic.sqlite");
            app.manage(Sidecar::start(
                database_path.to_str().expect("database path"),
            ));
            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("error while running tauri application")
        .run(|app, event| {
            if let RunEvent::Exit = event {
                if let Some(sidecar) = app.try_state::<Sidecar>() {
                    sidecar.stop();
                }
            }
        });
}
