import { useState } from "react";
import { useTranslation } from "react-i18next";
import LanguageIcon from "@/components/icons/LanguageIcon";
import { ThemeIcon } from "@/components/icons/ThemeIcon";
import { HomeMenuFrame } from "./HomeMenuSection";
import { LanguageMenu } from "./LanguageMenu";
import { RulerDecoration } from "./RulerDecoration";
import { ThemeMenu } from "./ThemeMenu";

export const HomeMenu = () => {
  const { t } = useTranslation();
  const [mobileMenu, setMobileMenu] = useState<"language" | "theme" | null>(
    null
  );

  return (
    <>
      <RulerDecoration />

      <aside className="pointer-events-auto fixed right-3 top-4 z-50 flex items-start gap-2 text-foreground md:right-12 md:top-8">
        <div
          className={`relative max-w-[calc(100vw-3.75rem)] transition-[width] duration-300 ease-in-out ${mobileMenu === "language" ? "w-60 md:w-72" : "w-10"}`}
        >
          <button
            aria-expanded={mobileMenu === "language"}
            aria-label={t("languages.language")}
            className="flex size-10 items-center justify-center bg-background/5 text-foreground backdrop-blur-[1px] transition-colors hover:bg-background/15 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground/60"
            onClick={() =>
              setMobileMenu(current =>
                current === "language" ? null : "language"
              )
            }
            type="button"
          >
            <LanguageIcon size={18} />
          </button>
          {mobileMenu === "language" && (
            <HomeMenuFrame className="mt-2 max-h-[min(60vh,18rem)] w-full overflow-y-auto px-4 py-3">
              <LanguageMenu />
            </HomeMenuFrame>
          )}
        </div>

        <div
          className={`relative max-w-[calc(100vw-3.75rem)] transition-[width] duration-300 ease-in-out ${mobileMenu === "theme" ? "w-60 md:w-72" : "w-10"}`}
        >
          <button
            aria-expanded={mobileMenu === "theme"}
            aria-label={t("themes.theme")}
            className="flex size-10 items-center justify-center bg-background/5 text-foreground backdrop-blur-[1px] transition-colors hover:bg-background/15 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground/60"
            onClick={() =>
              setMobileMenu(current => (current === "theme" ? null : "theme"))
            }
            type="button"
          >
            <ThemeIcon size={18} />
          </button>
          {mobileMenu === "theme" && (
            <HomeMenuFrame className="mt-2 max-h-[min(60vh,18rem)] w-full overflow-y-auto px-4 py-3">
              <ThemeMenu />
            </HomeMenuFrame>
          )}
        </div>
      </aside>
    </>
  );
};
