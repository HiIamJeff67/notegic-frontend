import { getQueryClient } from "@shared/api/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { LocalDBRecoveryCover } from "@/components/covers/LocalDBRecoveryCover/LocalDBRecoveryCover";
import { AppRouterProvider } from "@/providers/AppRouterProvider";
import { AuthCodeProvider } from "@/providers/AuthCodeProvider";
import { ClipboardGuardProvider } from "@/providers/ClipboardGuardProvider";
import { LoadingProvider } from "@/providers/LoadingProvider";
import { LocalPreferencesProvider } from "@/providers/LocalPreferencesProvider";
import { PerformanceProvider } from "@/providers/PerformanceProvider";
import { ScreenProvider } from "@/providers/ScreenProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <PerformanceProvider>
      <ScreenProvider>
        <QueryClientProvider client={queryClient}>
          <AuthCodeProvider>
            <LoadingProvider>
              <AppRouterProvider>
                <ThemeProvider>
                  <LocalPreferencesProvider>
                    <ClipboardGuardProvider>
                      <LocalDBRecoveryCover />
                      {children}
                    </ClipboardGuardProvider>
                  </LocalPreferencesProvider>
                </ThemeProvider>
              </AppRouterProvider>
            </LoadingProvider>
          </AuthCodeProvider>
        </QueryClientProvider>
      </ScreenProvider>
    </PerformanceProvider>
  );
}
