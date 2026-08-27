import { createContext, type ReactNode, useState } from "react";

export type SettingsPage = "account" | "preferences";

interface SettingsDisplayContextValue {
  sheetPage: SettingsPage | null;
  openSheet: (page: SettingsPage) => void;
  closeSheet: () => void;
}

export const SettingsDisplayContext =
  createContext<SettingsDisplayContextValue | null>(null);

export const SettingsDisplayProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [sheetPage, setSheetPage] = useState<SettingsPage | null>(null);

  return (
    <SettingsDisplayContext.Provider
      value={{
        sheetPage,
        openSheet: setSheetPage,
        closeSheet: () => setSheetPage(null),
      }}
    >
      {children}
    </SettingsDisplayContext.Provider>
  );
};
