import { useEffect, useRef } from "react";

interface TurnstileRenderOptions {
  sitekey: string;
  callback: (token: string) => void;
  "expired-callback": () => void;
  "error-callback": () => void;
}

interface TurnstileApi {
  render: (container: HTMLElement, options: TurnstileRenderOptions) => string;
  remove?: (widgetId: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

interface CloudflareTurnstileProps {
  onTokenChange: (token: string | null) => void;
}

const CloudflareTurnstile = ({ onTokenChange }: CloudflareTurnstileProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const onTokenChangeRef = useRef(onTokenChange);

  useEffect(() => {
    onTokenChangeRef.current = onTokenChange;
  }, [onTokenChange]);

  useEffect(() => {
    const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY?.trim();
    if (!siteKey) {
      onTokenChangeRef.current(null);
      return;
    }

    let widgetId: string | undefined;
    let cancelled = false;
    const container = containerRef.current;
    let script: HTMLScriptElement | undefined;

    const renderWidget = () => {
      if (cancelled || !container || !window.turnstile) return;

      widgetId = window.turnstile.render(container, {
        sitekey: siteKey,
        callback: token => onTokenChangeRef.current(token),
        "expired-callback": () => onTokenChangeRef.current(null),
        "error-callback": () => onTokenChangeRef.current(null),
      });
    };

    const existingScript = document.getElementById(
      "cloudflare-turnstile-script"
    );
    if (window.turnstile) {
      renderWidget();
    } else if (existingScript) {
      existingScript.addEventListener("load", renderWidget);
    } else {
      script = document.createElement("script");
      script.id = "cloudflare-turnstile-script";
      script.src =
        "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.addEventListener("load", renderWidget);
      document.head.appendChild(script);
    }

    return () => {
      cancelled = true;
      existingScript?.removeEventListener("load", renderWidget);
      script?.removeEventListener("load", renderWidget);
      if (widgetId && window.turnstile?.remove) {
        window.turnstile.remove(widgetId);
      }
      onTokenChangeRef.current(null);
    };
  }, []);

  if (!import.meta.env.VITE_TURNSTILE_SITE_KEY?.trim()) return null;

  return (
    <div
      ref={containerRef}
      className="flex min-h-[65px] justify-center"
      aria-label="Human verification"
    />
  );
};

export default CloudflareTurnstile;
