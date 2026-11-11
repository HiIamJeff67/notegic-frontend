import { NetworkExceptions } from "@shared/api/exceptions/network.exception";
import { WebURLPathDictionary } from "@shared/lib/url/web";
import { BookOpenIcon, LoaderCircleIcon } from "lucide-react";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { isVirtualMode } from "@/api/availability";
import { getClientRequestHeaders } from "@/api/clientHeaders";
import { TryGetUserData } from "@/api/functions/user.serverFn";
import { UserLocalSynchronizer } from "@/api/local/synchronizers/user.synchronizer";
import { TerrainBackground } from "@/components/backgrounds/TerrainBackground/TerrainBackground";
import LoadingCover from "@/components/covers/LoadingCover/LoadingCover";
import NoteIcon from "@/components/icons/NoteIcon";
import { HomeMenu } from "@/components/menus/HomeMenu/HomeMenu";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { useAppRouter, useTheme } from "@/hooks";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useTranslation } from "@/hooks/useTranslation";
import { pageTitle } from "@/seo/pageTitle";
import { publicFacts, publicFaqs, publicPages } from "@/seo/publicPage";

const homeVeil =
  "pointer-events-none absolute inset-0 backdrop-blur-[4px] light:bg-[color-mix(in_oklch,oklch(0.93_0_0)_8%,transparent)] dark:bg-[color-mix(in_oklch,black_4%,transparent)]";

const DisplayTitle = {
  mainTitle: "Notegic",
  secondaryTitle: "A More Humanized AI-Driven Note-Taking Application",
};

export const HomePage = () => {
  usePageTitle(pageTitle("Home"));

  const router = useAppRouter();
  const { t } = useTranslation();
  const themeManager = useTheme();

  const [displayTitle, setDisplayTitle] = useState<boolean>(true);
  const [currentText, setCurrentText] = useState("");
  const [isStarting, setIsStarting] = useState(false);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  const handleGetStartedOnClick = async () => {
    if (isStarting) return;

    setIsStarting(true);
    let destination = WebURLPathDictionary.auth.login;

    if (isVirtualMode()) {
      router.push(WebURLPathDictionary.app.dashboard._);
      setIsStarting(false);
      return;
    }

    try {
      const hasValidSession = await TryGetUserData({
        data: {
          header: getClientRequestHeaders(navigator.userAgent),
        },
      });

      if (hasValidSession) {
        destination = WebURLPathDictionary.app.dashboard._;
      }
    } catch (error) {
      if (NetworkExceptions.isNetworkFallbackError(error)) {
        const localUser = await UserLocalSynchronizer.getLoggedInUser();
        if (localUser) destination = WebURLPathDictionary.app.dashboard._;
      }
    }

    if (
      destination === WebURLPathDictionary.auth.login &&
      typeof navigator !== "undefined" &&
      navigator.onLine === false
    ) {
      const localUser = await UserLocalSynchronizer.getLoggedInUser();
      if (localUser) destination = WebURLPathDictionary.app.dashboard._;
    }

    router.push(destination);
    setIsStarting(false);
  };

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
      <Suspense fallback={<LoadingCover />}>
        <HomeMenu />

        <div className="pointer-events-none relative z-10 flex min-h-screen items-center justify-center px-4">
          <div className="text-foreground flex flex-col items-center justify-center gap-0 text-center select-none">
            <div className="flex min-h-[160px] flex-col items-center justify-center">
              <div
                className={`
                ${
                  displayTitle
                    ? "max-w-[400px] text-6xl"
                    : "max-w-[600px] text-4xl"
                }
                pb-2 text-center leading-tight font-bold
              `}
              >
                {currentText}
                <span className="text-foreground animate-pulse">|</span>
              </div>
              <p className="text-lg opacity-80">{t("homePage.subtitle")}</p>
            </div>
            <div className="mt-4 flex items-center justify-center gap-6">
              <Button
                variant="secondary"
                className="pointer-events-auto cursor-pointer font-bold hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground active:bg-accent active:text-accent-foreground"
                onClick={() => {
                  router.push(WebURLPathDictionary.document);
                }}
              >
                <BookOpenIcon size={18} />
                {t("homePage.viewDocs")}
              </Button>
              <Button
                variant="default"
                className="pointer-events-auto cursor-pointer font-bold hover:bg-primary/90 focus:bg-primary/90 active:bg-primary/90"
                onClick={() => void handleGetStartedOnClick()}
                disabled={isStarting}
                aria-busy={isStarting}
              >
                {isStarting ? (
                  <LoaderCircleIcon className="size-[18px] animate-spin" />
                ) : (
                  <NoteIcon size={18} />
                )}
                {t("homePage.getStarted")}
              </Button>
            </div>
          </div>
        </div>
        <div className="relative z-10 min-w-0">
          <div className={homeVeil} />
          <section className="text-foreground pointer-events-auto relative z-10 min-w-0">
            <div className="flex min-w-0 flex-col px-6 pt-24 pb-8 text-left sm:px-16 lg:px-24">
              <h1 className="max-w-4xl text-6xl leading-[0.9] font-bold tracking-tight sm:text-8xl">
                {publicFacts.name}
              </h1>
              <p className="mt-10 max-w-xl text-xl leading-snug sm:text-2xl">
                {publicFacts.definition}
              </p>
              <div className="mt-14 grid max-w-3xl min-w-0 gap-10 border-t border-foreground/20 pt-8 sm:grid-cols-2">
                <p className="text-sm leading-relaxed">
                  {publicFacts.audience}
                </p>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {publicFacts.limits}
                </p>
              </div>
              <nav className="mt-12 flex min-w-0 flex-wrap gap-x-6 gap-y-2 text-sm">
                {publicPages
                  .filter(page => page.path !== "/")
                  .map(page => (
                    <a key={page.path} className="underline" href={page.path}>
                      {page.linkLabel}
                    </a>
                  ))}
              </nav>
            </div>
          </section>
          <section className="text-foreground pointer-events-auto relative z-10 flex min-w-0 justify-end px-6 pt-72 pb-16 text-left sm:px-16 lg:px-24">
            <div className="w-full min-w-0 max-w-3xl">
              <h2 className="text-5xl leading-none font-bold tracking-tight sm:text-6xl">
                Q&A
              </h2>
              <Accordion
                type="single"
                collapsible
                className="mt-12 w-full min-w-0"
              >
                {publicFaqs.map(faq => (
                  <AccordionItem key={faq.question} value={faq.question}>
                    <AccordionTrigger className="text-base sm:text-lg">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </section>
        </div>
      </Suspense>
    </TerrainBackground>
  );
};
