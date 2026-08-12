import { WebURLPathDictionary } from "@shared/constants";
import { BookTextIcon } from "lucide-react";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { TerrainBackground } from "@/components/backgrounds/TerrainBackground/TerrainBackground";
import StrictLoadingCover from "@/components/covers/LoadingCover/StrictLoadingCover";
import NoteIcon from "@/components/icons/NoteIcon";
import { HomeMenu } from "@/components/menus/HomeMenu/HomeMenu";
import { Button } from "@/components/ui/button";
import { useAppRouter, useTheme } from "@/hooks";

const DisplayTitle = {
  mainTitle: "Notezy",
  secondaryTitle: "A More Humanized AI-Driven Note-Taking Application",
};

export const HomePage = () => {
  const router = useAppRouter();
  const { t } = useTranslation();
  const themeManager = useTheme();

  const [displayTitle, setDisplayTitle] = useState<boolean>(true);
  const [currentText, setCurrentText] = useState("");
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach(timer => clearTimeout(timer));
    timersRef.current = [];
  }, []);

  const typeWriter = function (text: string, isErasing: boolean) {
    const chars = text.split("");
    let currentIndex = isErasing ? chars.length : 0;

    const timer = setInterval(() => {
      if (isErasing) {
        currentIndex--;
        setCurrentText(chars.slice(0, currentIndex).join(""));
        if (currentIndex <= 0) {
          clearInterval(timer);
        }
      } else {
        currentIndex++;
        setCurrentText(chars.slice(0, currentIndex).join(""));
        if (currentIndex >= chars.length) {
          clearInterval(timer);
        }
      }
    }, 50);

    timersRef.current.push(timer);
  };

  const startCycle = useCallback(() => {
    clearAllTimers();

    setDisplayTitle(true);
    typeWriter(DisplayTitle.mainTitle, false);

    const erasingTopicTimer = setTimeout(() => {
      typeWriter(DisplayTitle.mainTitle, true);

      const displayingContentTimer = setTimeout(() => {
        setDisplayTitle(false);
        typeWriter(DisplayTitle.secondaryTitle, false);

        const erasingContentTimer = setTimeout(() => {
          typeWriter(DisplayTitle.secondaryTitle, true);

          const restartTimer = setTimeout(() => {
            startCycle();
          }, 3500);

          timersRef.current.push(restartTimer);
        }, 3500);

        timersRef.current.push(erasingContentTimer);
      }, 1000);

      timersRef.current.push(displayingContentTimer);
    }, 4000);

    timersRef.current.push(erasingTopicTimer);
  }, []);

  useEffect(() => {
    startCycle();
    return () => clearAllTimers();
  }, []);

  return (
    <TerrainBackground isDark={themeManager.currentTheme.isDark}>
      <Suspense fallback={<StrictLoadingCover />}>
        <HomeMenu />

        <div className="pointer-events-none relative z-10 flex min-h-screen items-center justify-center px-4">
          <div className="text-foreground text-center select-none flex flex-col items-center justify-center gap-0">
            <div className="min-h-[160px] flex flex-col items-center justify-center">
              <div
                className={`
                ${
                  displayTitle
                    ? "max-w-[400px] text-6xl"
                    : "max-w-[600px] text-4xl"
                }
                font-bold pb-2 leading-tight text-center
              `}
              >
                {currentText}
                <span className="animate-pulse text-foreground">|</span>
              </div>
              <p className="text-lg opacity-80">{t("homePage.subtitle")}</p>
            </div>
            <div className="flex items-center justify-center gap-6 mt-4">
              <Button
                variant="secondary"
                className="pointer-events-auto cursor-pointer font-bold hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground active:bg-accent active:text-accent-foreground"
                onClick={() => {
                  router.push(WebURLPathDictionary.document);
                }}
              >
                <BookTextIcon size={18} />
                {t("homePage.viewDocs")}
              </Button>
              <Button
                variant="default"
                className="pointer-events-auto cursor-pointer font-bold hover:bg-primary/90 focus:bg-primary/90 active:bg-primary/90"
                onClick={() => {
                  router.push(WebURLPathDictionary.auth.login);
                }}
              >
                <NoteIcon size={18} />
                {t("homePage.getStarted")}
              </Button>
              {/* <Button disabled variant="secondary" onClick={localDB.download}>
                Download Local DB File
              </Button> */}
            </div>
          </div>
        </div>
      </Suspense>
    </TerrainBackground>
  );
};
