use std::ffi::c_void;

/* ============================== Network ============================== */

#[cfg(target_os = "macos")]
#[repr(C)]
struct SockaddrIn {
    sin_len: u8,
    sin_family: u8,
    sin_port: u16,
    sin_addr: u32,
    sin_zero: [u8; 8],
}

#[cfg(target_os = "macos")]
#[link(name = "SystemConfiguration", kind = "framework")]
unsafe extern "C" {
    fn SCNetworkReachabilityCreateWithAddress(
        allocator: *const c_void,
        address: *const SockaddrIn,
    ) -> *mut c_void;
    fn SCNetworkReachabilityGetFlags(target: *mut c_void, flags: *mut u32) -> bool;
    fn CFRelease(cf: *const c_void);
}

#[cfg(target_os = "macos")]
const AF_INET: u8 = 2;
#[cfg(target_os = "macos")]
const REACHABLE: u32 = 1 << 1;
#[cfg(target_os = "macos")]
const CONNECTION_REQUIRED: u32 = 1 << 2;

pub(crate) struct NetworkStatus;

impl NetworkStatus {
    pub(crate) fn online() -> bool {
        #[cfg(target_os = "macos")]
        {
            let address = SockaddrIn {
                sin_len: std::mem::size_of::<SockaddrIn>() as u8,
                sin_family: AF_INET,
                sin_port: 0,
                sin_addr: 0,
                sin_zero: [0; 8],
            };
            unsafe {
                let target = SCNetworkReachabilityCreateWithAddress(std::ptr::null(), &address);
                if target.is_null() {
                    return false;
                }
                let mut flags = 0;
                let read = SCNetworkReachabilityGetFlags(target, &mut flags);
                CFRelease(target);
                read && flags & REACHABLE != 0 && flags & CONNECTION_REQUIRED == 0
            }
        }
        #[cfg(not(target_os = "macos"))]
        {
            false
        }
    }
}

/* ============================== Commands ============================== */

#[tauri::command]
pub fn network_status() -> bool {
    NetworkStatus::online()
}
