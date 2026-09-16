import { useEffect, useRef } from "react";
import { useTheme } from "@/hooks/useTheme";

interface TurnstileRenderOptions {
  sitekey: string;
  size?: "normal" | "flexible" | "compact";
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
  const themeManager = useTheme();
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
        size: "flexible",
        callback: token => onTokenChangeRef.current(token),
        "expired-callback": () => onTokenChangeRef.current(null),
        "error-callback": () => onTokenChangeRef.current(null),
      });
    };

    const handleScriptError = () => onTokenChangeRef.current(null);

    const existingScript = document.getElementById(
      "cloudflare-turnstile-script"
    );
    if (window.turnstile) {
      renderWidget();
    } else if (existingScript) {
      existingScript.addEventListener("load", renderWidget);
      existingScript.addEventListener("error", handleScriptError);
    } else {
      script = document.createElement("script");
      script.id = "cloudflare-turnstile-script";
      script.src =
        "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.addEventListener("load", renderWidget);
      script.addEventListener("error", handleScriptError);
      document.head.appendChild(script);
    }

    return () => {
      cancelled = true;
      existingScript?.removeEventListener("load", renderWidget);
      existingScript?.removeEventListener("error", handleScriptError);
      script?.removeEventListener("load", renderWidget);
      script?.removeEventListener("error", handleScriptError);
      if (widgetId && window.turnstile?.remove) {
        window.turnstile.remove(widgetId);
      }
      onTokenChangeRef.current(null);
    };
  }, []);

  if (!import.meta.env.VITE_TURNSTILE_SITE_KEY?.trim()) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className={`flex w-full min-h-[65px] justify-center overflow-hidden rounded border ${
        themeManager.currentTheme.isDark ? "border-gray-700" : "border-gray-300"
      }`}
      aria-label="Human verification"
    />
  );
};

export default CloudflareTurnstile;
