import { debugTurnstile } from "@/api/turnstile";
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
    debugTurnstile("callback reference updated");
  }, [onTokenChange]);

  useEffect(() => {
    const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY?.trim();
    debugTurnstile("widget effect started", {
      siteKeyPresent: Boolean(siteKey),
      siteKeyLength: siteKey?.length ?? 0,
      containerPresent: Boolean(containerRef.current),
      turnstileApiPresent: Boolean(window.turnstile),
    });

    if (!siteKey) {
      debugTurnstile("widget disabled because site key is missing");
      onTokenChangeRef.current(null);
      return;
    }

    let widgetId: string | undefined;
    let cancelled = false;
    const container = containerRef.current;
    let script: HTMLScriptElement | undefined;

    const renderWidget = () => {
      debugTurnstile("render callback reached", {
        cancelled,
        containerPresent: Boolean(container),
        turnstileApiPresent: Boolean(window.turnstile),
      });

      if (cancelled || !container || !window.turnstile) {
        debugTurnstile("widget render skipped", {
          reason: cancelled
            ? "effect_cancelled"
            : !container
              ? "container_missing"
              : "turnstile_api_missing",
        });
        return;
      }

      debugTurnstile("calling turnstile.render");
      try {
        widgetId = window.turnstile.render(container, {
          sitekey: siteKey,
          callback: token => {
            debugTurnstile("token callback received", {
              tokenPresent: Boolean(token),
              tokenLength: token.length,
            });
            onTokenChangeRef.current(token);
          },
          "expired-callback": () => {
            debugTurnstile("token expired callback received");
            onTokenChangeRef.current(null);
          },
          "error-callback": () => {
            debugTurnstile("widget error callback received");
            onTokenChangeRef.current(null);
          },
        });
        debugTurnstile("turnstile.render completed", {
          widgetIdPresent: Boolean(widgetId),
        });
      } catch (error) {
        debugTurnstile("turnstile.render failed", {
          errorName: error instanceof Error ? error.name : "unknown",
          errorMessage: error instanceof Error ? error.message : "unknown",
        });
        throw error;
      }
    };

    const handleScriptError = () => {
      debugTurnstile("Turnstile script failed to load");
      onTokenChangeRef.current(null);
    };

    const existingScript = document.getElementById(
      "cloudflare-turnstile-script"
    );
    if (window.turnstile) {
      debugTurnstile("using existing Turnstile API");
      renderWidget();
    } else if (existingScript) {
      debugTurnstile("waiting for existing Turnstile script");
      existingScript.addEventListener("load", renderWidget);
      existingScript.addEventListener("error", handleScriptError);
    } else {
      debugTurnstile("creating Turnstile script", {
        scriptUrl:
          "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit",
      });
      script = document.createElement("script");
      script.id = "cloudflare-turnstile-script";
      script.src =
        "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.addEventListener("load", renderWidget);
      script.addEventListener("error", handleScriptError);
      document.head.appendChild(script);
      debugTurnstile("Turnstile script appended");
    }

    return () => {
      cancelled = true;
      debugTurnstile("widget effect cleanup started", {
        widgetIdPresent: Boolean(widgetId),
      });
      existingScript?.removeEventListener("load", renderWidget);
      existingScript?.removeEventListener("error", handleScriptError);
      script?.removeEventListener("load", renderWidget);
      script?.removeEventListener("error", handleScriptError);
      if (widgetId && window.turnstile?.remove) {
        window.turnstile.remove(widgetId);
        debugTurnstile("turnstile.remove completed");
      }
      onTokenChangeRef.current(null);
      debugTurnstile("widget effect cleanup completed");
    };
  }, []);

  if (!import.meta.env.VITE_TURNSTILE_SITE_KEY?.trim()) {
    debugTurnstile("render skipped because site key is missing");
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="flex min-h-[65px] justify-center"
      aria-label="Human verification"
    />
  );
};

export default CloudflareTurnstile;
