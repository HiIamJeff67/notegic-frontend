import { Button } from "@shared/components/shadcn/button";
import { useTranslation } from "@shared/hooks/useTranslation";
import { tError } from "@shared/i18n/error";
import { WebURLPathDictionary } from "@shared/lib/url/web";
import { useEffect, useState } from "react";
import { fetchGetUserData } from "@/api/fetches/user.fetch";
import { HasAuthCookies } from "@/api/functions/auth.serverFn";
import { getClientRequestHeaders } from "@/api/functions/headers/clientHeaders";
import { AuthorizeNative } from "@/api/functions/nativeAuth.serverFn";
import {
  clearNativeAuthorizationRequest,
  desktopCallback,
  nativeCallbackUrl,
  readNativeAuthorizationRequest,
  storeNativeAuthorizationRequest,
} from "@/api/tokens/nativeAuthorization";
import { useAppRouter } from "@/hooks";

type GrantedCode = {
  href: string;
};

export default function NativeAuthorizePage() {
  const { t } = useTranslation();
  const router = useAppRouter();
  const [requestId, setRequestId] = useState<string | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [granted, setGranted] = useState<GrantedCode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const fragment = new URLSearchParams(window.location.hash.slice(1));
    const fromFragment = fragment.get("requestId")?.trim();
    const start = new URLSearchParams(window.location.search).get("start");
    if (fromFragment) {
      storeNativeAuthorizationRequest(fromFragment);
      window.history.replaceState(null, "", window.location.pathname);
      if (start === "register") {
        router.push(`/${WebURLPathDictionary.auth.register}`);
      }
    }
    setRequestId(fromFragment || readNativeAuthorizationRequest());
  }, [router]);

  useEffect(() => {
    if (!requestId) return;
    let cancelled = false;
    void (async () => {
      if (!(await HasAuthCookies())) return;
      const response = await fetchGetUserData(
        { header: getClientRequestHeaders() },
        undefined,
        { staleTime: 0 }
      );
      if (!cancelled && response?.success) {
        setAccount(response.data.displayName);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [requestId]);

  const confirm = async () => {
    if (!requestId || pending) return;
    setPending(true);
    setError(null);
    try {
      const response = await AuthorizeNative(requestId);
      if (response.data.redirectUri !== desktopCallback) {
        throw new Error("Unregistered desktop callback");
      }
      clearNativeAuthorizationRequest();
      setGranted({
        href: nativeCallbackUrl(
          response.data.redirectUri,
          response.data.code,
          response.data.state
        ),
      });
    } catch (caught) {
      setError(tError(caught, t));
    } finally {
      setPending(false);
    }
  };

  const cancel = () => {
    clearNativeAuthorizationRequest();
    router.push(`/${WebURLPathDictionary.home}`);
  };

  if (!requestId) {
    return (
      <main className="mx-auto flex min-h-svh max-w-md flex-col justify-center gap-4 p-6">
        <h1 className="text-xl font-semibold">Desktop sign-in</h1>
        <p>Open this page from the Notegic desktop app.</p>
      </main>
    );
  }

  if (granted) {
    return (
      <main className="mx-auto flex min-h-svh max-w-md flex-col justify-center gap-4 p-6">
        <h1 className="text-xl font-semibold">Desktop sign-in succeeded</h1>
        <p>Return to the Notegic app to finish signing in.</p>
        <Button asChild>
          <a href={granted.href} rel="noreferrer">
            Open Notegic
          </a>
        </Button>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-svh max-w-md flex-col justify-center gap-4 p-6">
      <h1 className="text-xl font-semibold">Sign in to Desktop</h1>
      {account ? (
        <>
          <p>Continue as {account}.</p>
          <Button disabled={pending} onClick={() => void confirm()}>
            {pending ? "Confirming" : "Continue"}
          </Button>
          <Button variant="outline" onClick={cancel}>
            Cancel
          </Button>
        </>
      ) : (
        <>
          <Button
            onClick={() => router.push(`/${WebURLPathDictionary.auth.login}`)}
          >
            Log in
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              router.push(`/${WebURLPathDictionary.auth.register}`)
            }
          >
            Register
          </Button>
          <Button variant="outline" onClick={cancel}>
            Cancel
          </Button>
        </>
      )}
      {error ? <p role="alert">{error}</p> : null}
    </main>
  );
}
