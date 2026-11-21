import { invoke } from "@tauri-apps/api/core";

const nativeApiBase = "https://client.notegic.com/v1";
const nativeAuthorizeUrl = "https://www.notegic.com/native/authorize";

const startNativeAuthorization = (start?: "register") =>
  invoke("start_native_login", {
    apiBase: nativeApiBase,
    authorizeUrl:
      start === "register"
        ? `${nativeAuthorizeUrl}?start=register`
        : nativeAuthorizeUrl,
  });

export const startNativeLogin = () => startNativeAuthorization();

export const startNativeRegister = () => startNativeAuthorization("register");

export const logoutNative = () =>
  invoke("logout_native", {
    apiBase: nativeApiBase,
  });
