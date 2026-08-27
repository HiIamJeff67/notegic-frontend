import { DefaultThemes } from "@shared/constants";
import { ThemeData } from "@shared/types/theme.type";
import { useCallback, useState } from "react";

export const useThemeStore = () => {
  const [availableThemes, setAvailableThemes] =
    useState<ThemeData[]>(DefaultThemes);
  const [loadingThemes, setLoadingThemes] = useState<Set<string>>(new Set());

  /* ==================== Helper Function to Load the Remote CSS ==================== */
  const loadRemoteCSS = (url: string, themeId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const existingLink = document.querySelector(
        `link[theme-id="${themeId}"]`
      );
      if (existingLink) {
        resolve();
        return;
      }

      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = url;
      link.setAttribute("theme-id", themeId);
      link.onload = () => resolve();
      link.onerror = () => reject(new Error(`Failed to load CSS from ${url}`));
      document.head.appendChild(link);
    });
  };

  /* ==================== Function to Add a New Theme ==================== */
  const addTheme = useCallback((themeData: ThemeData) => {
    setAvailableThemes(prev => {
      const existing = prev.find(t => t.id === themeData.id);
      if (existing) {
        return prev.map(t => (t.id === themeData.id ? themeData : t));
      }
      return [...prev, themeData];
    });
  }, []);

  /* ==================== Function to Load the Available Theme ==================== */
  const loadTheme = useCallback(
    async (themeId: string): Promise<boolean> => {
      const theme = availableThemes.find(t => t.id === themeId);
      if (!theme) return false;
      if (theme.isLoaded) return true;

      // first set the theme to loading status
      setLoadingThemes(prev => new Set([...prev, themeId]));

      try {
        // check if the theme is not default theme, and it does have a download url
        if (!theme.isDefault && theme.downloadURL) {
          await loadRemoteCSS(theme.downloadURL, themeId);
        }

        // add it to the available themes if the above download procedure is successful
        setAvailableThemes(prev =>
          prev.map(t => (t.id === themeId ? { ...t, isLoaded: true } : t))
        );

        return true;
      } catch (error) {
        console.error(`Failed to load theme ${themeId}:`, error);
        return false;
      } finally {
        // finally, set the theme to done status
        setLoadingThemes(prev => {
          const newSet = new Set(prev);
          newSet.delete(themeId);
          return newSet;
        });
      }
    },
    [availableThemes]
  );

  /* ==================== Function to Remove Loaded(Current) Theme ==================== */
  const removeTheme = useCallback((themeId: string) => {
    // remove the theme from the link
    const link = document.querySelector(`link[theme-id="${themeId}"]`);
    if (link) {
      link.remove();
    }

    // remove the theme from available themes if it is not default theme
    setAvailableThemes(prev =>
      prev.filter(t => (t.id === themeId ? t.isDefault : true))
    );
  }, []);

  return {
    availableThemes: availableThemes,
    loadingThemes: loadingThemes,
    addTheme: addTheme,
    loadTheme: loadTheme,
    removeTheme: removeTheme,
    isThemeLoading: (themeId: string) => loadingThemes.has(themeId),
  };
};
