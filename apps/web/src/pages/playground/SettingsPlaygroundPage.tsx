import type { ContextType, ReactNode } from "react";
import { useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AccountSettingsPage from "@/pages/app/setting/account/AccountSettingsPage";
import PreferencesPage from "@/pages/app/setting/preferences/PreferencesPage";
import { BackgroundImagesProvider } from "@/providers/BackgroundImagesProvider";
import { MaterialAttachmentCacheProvider } from "@/providers/MaterialAttachmentCacheProvider";
import { RealtimeContext } from "@/providers/RealtimeProvider";
import { SettingsDisplayProvider } from "@/providers/SettingsDisplayProvider";
import { TransactionSynchronizerContext } from "@/providers/TransactionSynchronizerProvider/TransactionSynchronizerProvider";
import { UserContext } from "@/providers/UserProvider";

const previewUserContextValue = {
  userData: null,
  setUserData: () => undefined,
  updateUserData: () => false,
  fetchUserData: async () => {
    throw new Error("User data is unavailable in the settings playground.");
  },
  user: null,
  setUser: () => undefined,
  updateUser: () => false,
  fetchUser: async () => undefined,
  userInfo: null,
  setUserInfo: () => undefined,
  updateUserInfo: () => false,
  fetchUserInfo: async () => undefined,
  userAccount: null,
  setUserAccount: () => undefined,
  updateUserAccount: () => false,
  fetchUserAccount: async () => undefined,
  logout: () => undefined,
};

const previewRealtimeContextValue = {
  activeBlockPackChannelCount: 0,
} as ContextType<typeof RealtimeContext>;

const previewTransactionSynchronizerContextValue = {
  status: "synchronized",
  getTransactionCount: async () => 0,
  getTerminalTransactionCount: async () => 0,
  clearTerminalTransactions: async () => undefined,
  synchronizeTransactions: async () => undefined,
  synchronizationProgress: 0,
} as ContextType<typeof TransactionSynchronizerContext>;

const SettingsPlaygroundPage = () => {
  const [page, setPage] = useState<"account" | "preferences">("preferences");

  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-canvas">
      <div className="absolute top-2 left-1/2 z-50 -translate-x-1/2">
        <Tabs
          value={page}
          onValueChange={value => setPage(value as typeof page)}
        >
          <TabsList>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <SettingsPlaygroundProviders>
        {page === "preferences" ? (
          <PreferencesPage />
        ) : (
          <AccountSettingsPage previewMode />
        )}
      </SettingsPlaygroundProviders>
    </div>
  );
};

const SettingsPlaygroundProviders = ({ children }: { children: ReactNode }) => (
  <MaterialAttachmentCacheProvider>
    <UserContext.Provider value={previewUserContextValue}>
      <RealtimeContext.Provider value={previewRealtimeContextValue}>
        <TransactionSynchronizerContext.Provider
          value={previewTransactionSynchronizerContextValue}
        >
          <BackgroundImagesProvider>
            <DndProvider backend={HTML5Backend}>
              <SidebarProvider>
                <SettingsDisplayProvider>{children}</SettingsDisplayProvider>
              </SidebarProvider>
            </DndProvider>
          </BackgroundImagesProvider>
        </TransactionSynchronizerContext.Provider>
      </RealtimeContext.Provider>
    </UserContext.Provider>
  </MaterialAttachmentCacheProvider>
);

export default SettingsPlaygroundPage;
