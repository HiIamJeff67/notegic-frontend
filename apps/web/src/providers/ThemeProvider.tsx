import { DefaultStandardTheme } from "@shared/constants";
import { LocalStorageManipulator } from "@shared/lib/localStorageManipulator";
import { LocalStorageKey } from "@shared/types/localStorage.type";
import { ThemeData } from "@shared/types/theme.type";
import React, { createContext, useEffect, useState } from "react";
import { useThemeStore } from "@/hooks/useThemeStore";

interface ThemeContextType {
  currentTheme: ThemeData;
  switchCurrentTheme: (themeId: string) => Promise<boolean>;
  availableThemes: ThemeData[];
  loadingThemes: Set<string>;
  addThemeFromStore: (theme: ThemeData) => void;
  removeThemeFromStore: (themeId: string) => void;
  isThemeLoading: (themeId: string) => boolean;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined
);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentTheme, setCurrentTheme] =
    useState<ThemeData>(DefaultStandardTheme);
  const [prevTheme, setPrevTheme] = useState<ThemeData | null>(null);
  const [isThemeInitialized, setIsThemeInitialized] = useState(false);
  const themeStore = useThemeStore();

  // initialize the default theme
  useEffect(() => {
    const savedTheme = LocalStorageManipulator.getItemByKey(
      LocalStorageKey.theme
    );
    if (!savedTheme) {
      setCurrentTheme(DefaultStandardTheme);
      LocalStorageManipulator.setItem(
        LocalStorageKey.theme,
        DefaultStandardTheme
      );
      setIsThemeInitialized(true);
      return;
    }

    const isThemeExists = themeStore.availableThemes.find(
      t => t.id === savedTheme.id
    );

    if (!isThemeExists) {
      setCurrentTheme(DefaultStandardTheme);
      LocalStorageManipulator.setItem(
        LocalStorageKey.theme,
        DefaultStandardTheme
      );
      setIsThemeInitialized(true);
      return;
    }

    setCurrentTheme(savedTheme);
    setIsThemeInitialized(true);
  }, []);

  // while switch the theme, also update the DOM
  useEffect(() => {
    if (!isThemeInitialized || !currentTheme) return;

    LocalStorageManipulator.setItem(LocalStorageKey.theme, currentTheme);

    if (prevTheme !== null) {
      const prevThemeCSSClassName = prevTheme.isDefault
        ? prevTheme.name.split(" ")[1].toLowerCase()
        : prevTheme.id;
      document.documentElement.classList.remove(prevThemeCSSClassName);
    }

    document.documentElement.classList.toggle("dark", currentTheme.isDark);
    document.documentElement.classList.toggle("light", !currentTheme.isDark);

    // get the css class name, and make sure we convert it to correct name if the theme is a default theme
    // do this conversion here to not disturb other lower logics
    const themeCSSClassName = currentTheme.isDefault
      ? currentTheme.name.split(" ")[1].toLowerCase()
      : currentTheme.id;
    document.documentElement.classList.add(themeCSSClassName);

    setPrevTheme(currentTheme);
  }, [currentTheme, isThemeInitialized]);

  const switchCurrentTheme = async (themeId: string): Promise<boolean> => {
    const theme = themeStore.availableThemes.find(t => t.id === themeId);
    if (!theme) return false;

    // if the theme is not loaded, load it first
    if (!theme.isLoaded) {
      const loaded = await themeStore.loadTheme(themeId);
      if (!loaded) return false;
    }

    setCurrentTheme(theme);
    return true;
  };

  const contextValue: ThemeContextType = {
    currentTheme: currentTheme,
    switchCurrentTheme: switchCurrentTheme,
    availableThemes: themeStore.availableThemes,
    loadingThemes: themeStore.loadingThemes,
    addThemeFromStore: themeStore.addTheme,
    removeThemeFromStore: themeStore.removeTheme,
    isThemeLoading: themeStore.isThemeLoading,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};
