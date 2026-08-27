import toast from "@shared/lib/toast";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocalPreferences } from "@/hooks/localPreferences";

const builtInSensitivePatterns = [
  /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/i,
  /\b[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/,
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
  /\b(?:api[_-]?key|access[_-]?token|secret|password)\b\s*[:=]\s*\S+/i,
  /\b(?:sk|pk)_[A-Za-z0-9]{24,}\b/,
  /\b[0-9a-f]{32,}\b/i,
];

const getSelectedText = () => {
  const activeElement = document.activeElement;

  if (
    activeElement instanceof HTMLInputElement ||
    activeElement instanceof HTMLTextAreaElement
  ) {
    const selectionStart = activeElement.selectionStart ?? 0;
    const selectionEnd = activeElement.selectionEnd ?? 0;
    return activeElement.value.slice(selectionStart, selectionEnd);
  }

  return window.getSelection()?.toString() ?? "";
};

export const isPotentiallySensitive = (
  text: string,
  customPatternTexts: string[] = []
) => {
  const trimmedText = text.trim();
  if (!trimmedText) return false;

  if (builtInSensitivePatterns.some(pattern => pattern.test(trimmedText))) {
    return true;
  }

  return customPatternTexts.some(patternText => {
    try {
      return new RegExp(patternText).test(trimmedText);
    } catch {
      return false;
    }
  });
};

export const ClipboardGuardProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { t } = useTranslation();
  const { preferences } = useLocalPreferences();

  useEffect(() => {
    if (!preferences.clipboardGuard) return;

    const handleCopy = () => {
      const copiedText = getSelectedText();
      if (
        !isPotentiallySensitive(copiedText, preferences.clipboardGuardPatterns)
      ) {
        return;
      }

      toast.warning(t("workspace.notifications.sensitiveClipboard"));
    };

    document.addEventListener("copy", handleCopy);
    return () => document.removeEventListener("copy", handleCopy);
  }, [preferences.clipboardGuard, preferences.clipboardGuardPatterns, t]);

  return children;
};
