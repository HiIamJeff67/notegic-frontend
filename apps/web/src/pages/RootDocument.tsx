import { HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { useEffect } from "react";
import LoadingOverlay from "@/components/covers/LoadingCover/LoadingCover";
import { Toaster } from "@/components/ui/toaster";
import { syncStoredLanguage } from "@/i18n";
import Providers from "@/providers/Providers";

export function RootDocument() {
  useEffect(() => {
    syncStoredLanguage();
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try {
              const theme = JSON.parse(localStorage.getItem("notegic_theme") ?? "null");
              const isDark = typeof theme?.isDark === "boolean" ? theme.isDark : true;
              document.documentElement.classList.toggle("dark", isDark);
              document.documentElement.classList.toggle("light", !isDark);
            } catch {
              document.documentElement.classList.add("dark");
            }`,
          }}
        />
        <HeadContent />
      </head>
      <body>
        <Providers>
          <Toaster />
          <LoadingOverlay />
          {/* the component as the start point of the entire application */}
          <Outlet />
          <Scripts />
        </Providers>
      </body>
    </html>
  );
}
