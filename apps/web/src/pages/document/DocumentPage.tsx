import { useRef } from "react";
import {
  Article,
  ArticleContent,
  ArticleDisplayProvider,
  type ArticleNavigationItem,
  ArticleParagraphSeparator,
  ArticleSidebar,
} from "@/components/commons/Article/Article";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import API, { apiNavigation } from "./api/API";
import Overview, { overviewNavigation } from "./overview/Overview";
import PrivacyPolicy, {
  privacyPolicyNavigation,
} from "./privacy-policy/PrivacyPolicy";
import Versions, { versionsNavigation } from "./versions/Versions";
import Website, { websiteNavigation } from "./website/Website";

const DocumentPage = () => {
  const articleRef = useRef<HTMLElement>(null);
  const navigationItems = [
    overviewNavigation,
    websiteNavigation,
    apiNavigation,
    versionsNavigation,
    privacyPolicyNavigation,
  ] satisfies ArticleNavigationItem[];
  return (
    <div className="h-svh min-h-0 overflow-hidden bg-canvas">
      <ArticleDisplayProvider headerLinks={[{ label: "Home", href: "/" }]}>
        <SidebarProvider className="h-full min-h-0">
          <div className="flex h-full min-h-0 w-full min-w-0">
            <ArticleSidebar
              items={navigationItems}
              scrollContainerRef={articleRef}
            />
            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
              <div className="flex h-10 shrink-0 items-center px-3">
                <SidebarTrigger className="border-none bg-transparent shadow-none hover:bg-transparent" />
              </div>
              <Article scrollRef={articleRef} className="h-0 min-w-0 flex-1">
                <ArticleContent className="max-w-full md:max-w-4xl md:[--article-reading-width:var(--container-2xl)] xl:max-w-6xl xl:[--article-reading-width:var(--container-4xl)] 2xl:max-w-7xl">
                  <Overview />
                  <ArticleParagraphSeparator fullWidth />
                  <Website />
                  <ArticleParagraphSeparator fullWidth />
                  <API />
                  <ArticleParagraphSeparator fullWidth />
                  <Versions />
                  <ArticleParagraphSeparator fullWidth />
                  <PrivacyPolicy />
                </ArticleContent>
              </Article>
            </div>
          </div>
        </SidebarProvider>
      </ArticleDisplayProvider>
    </div>
  );
};

export default DocumentPage;
