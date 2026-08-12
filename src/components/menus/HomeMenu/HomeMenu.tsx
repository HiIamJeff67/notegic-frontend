import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import LanguageIcon from "@/components/icons/LanguageIcon";
import { ThemeIcon } from "@/components/icons/ThemeIcon";
import { HomeMenuFrame } from "./HomeMenuSection";
import { InformationMenu } from "./InformationMenu";
import { InitializationMenu } from "./InitializationMenu";
import { LanguageMenu } from "./LanguageMenu";
import { RulerDecoration } from "./RulerDecoration";
import { ThemeMenu } from "./ThemeMenu";
import { WaveMenu } from "./WaveMenu";

const initializationMaxValue = 2;

export const HomeMenu = () => {
  const { t } = useTranslation();
  const [initializationValue, setInitializationValue] = useState(0);
  const [mobileMenu, setMobileMenu] = useState<"language" | "theme" | null>(
    null
  );

  useEffect(() => {
    const startedAt = performance.now();
    let frame = 0;

    const animate = (now: number) => {
      const value = Math.min(initializationMaxValue, (now - startedAt) / 1_000);
      setInitializationValue(value);
      if (value < initializationMaxValue)
        frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  const isInitializing = initializationValue < initializationMaxValue;

  return (
    <>
      <RulerDecoration />

      <aside className="pointer-events-auto fixed left-3 top-4 z-50 hidden w-56 text-foreground md:left-12 md:top-8 md:block md:w-60">
        <HomeMenuFrame>
          <InformationMenu />
        </HomeMenuFrame>
      </aside>

      <aside className="pointer-events-auto fixed bottom-4 left-3 z-50 hidden w-80 max-w-[calc(100vw-1.5rem)] text-foreground md:bottom-8 md:left-12 md:block xl:w-96 2xl:w-[28rem] 3xl:w-[30rem]">
        <div className="space-y-1">
          <HomeMenuFrame>
            <WaveMenu active={isInitializing} />
          </HomeMenuFrame>
          <HomeMenuFrame>
            <InitializationMenu
              maxValue={initializationMaxValue}
              value={initializationValue}
            />
          </HomeMenuFrame>
        </div>
      </aside>

      <aside className="pointer-events-auto fixed right-3 top-4 z-50 hidden w-56 max-w-[calc(100vw-1.5rem)] text-foreground md:right-12 md:top-8 md:block md:w-64 md:max-w-[calc(100vw-6rem)]">
        <div className="space-y-8">
          <HomeMenuFrame className="px-5 py-4">
            <LanguageMenu />
          </HomeMenuFrame>
          <HomeMenuFrame className="px-5 py-4">
            <ThemeMenu />
          </HomeMenuFrame>
        </div>
      </aside>

      <aside className="pointer-events-auto fixed right-3 top-4 z-50 flex items-start gap-2 text-foreground md:hidden">
        <div
          className={`relative max-w-[calc(100vw-3.75rem)] transition-[width] duration-300 ease-in-out ${mobileMenu === "language" ? "w-48" : "w-10"}`}
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
          className={`relative max-w-[calc(100vw-3.75rem)] transition-[width] duration-300 ease-in-out ${mobileMenu === "theme" ? "w-48" : "w-10"}`}
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
