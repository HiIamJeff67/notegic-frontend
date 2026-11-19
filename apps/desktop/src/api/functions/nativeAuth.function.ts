import { APIURLPathDictionary, CurrentAPIBaseURL } from "@shared/lib/url/api";
import { WebURLPathDictionary } from "@shared/lib/url/web";
import { invoke } from "@tauri-apps/api/core";

export const startNativeLogin = () => {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  return invoke("start_native_login", {
    apiBase: `${APIURLPathDictionary.origin()}/${CurrentAPIBaseURL}`.replace(
      /\/$/,
      ""
    ),
    authorizeUrl: `${window.location.origin}${base}/${WebURLPathDictionary.nativeAuthorize}`,
  });
};

export const logoutNative = () =>
  invoke("logout_native", {
    apiBase: `${APIURLPathDictionary.origin()}/${CurrentAPIBaseURL}`.replace(
      /\/$/,
      ""
    ),
  });
