import { createContext, type ReactNode, useState } from "react";

export type SettingsPage = "account" | "preferences";

interface SettingsDisplayContextValue {
  sheetPage: SettingsPage | null;
  sheetSection: string | null;
  openSheet: (page: SettingsPage, section?: string) => void;
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
  const [sheetSection, setSheetSection] = useState<string | null>(null);

  const openSheet = (page: SettingsPage, section?: string) => {
    setSheetPage(page);
    setSheetSection(section ?? null);
  };

  return (
    <SettingsDisplayContext.Provider
      value={{
        sheetPage,
        sheetSection,
        openSheet,
        closeSheet: () => {
          setSheetPage(null);
          setSheetSection(null);
        },
      }}
    >
      {children}
    </SettingsDisplayContext.Provider>
  );
};
