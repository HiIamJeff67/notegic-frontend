import { BookOpenIcon } from "lucide-react";
import {
  ArticleParagraph,
  ArticleParagraphContent,
  ArticleParagraphHeader,
} from "@/components/commons/Article/Article";

export const overviewNavigation = {
  id: "overview",
  title: "Overview",
  description: "Website guides and the published API contract.",
  weight: 5 as const,
  icon: BookOpenIcon,
} as const;

const Overview = () => {
  return (
    <ArticleParagraph
      id={overviewNavigation.id}
      className="mx-auto max-w-full md:max-w-2xl xl:max-w-4xl"
    >
      <ArticleParagraphHeader>
        <h1 className="text-3xl font-semibold tracking-tight">Overview</h1>
      </ArticleParagraphHeader>
      <ArticleParagraphContent className="mt-4 space-y-3">
        <p>
          Notegic brings notes, reference files, collaboration, and recurring
          work into one workspace. This documentation covers using the website
          and connecting external tools through the public API.
        </p>
        <p>
          Start with Website for note editing, file previews, routines, and
          settings. Use API for authentication, endpoints, and request and
          response formats. Versions covers releases and planned work; Privacy
          and policy explains data handling.
        </p>
      </ArticleParagraphContent>
    </ArticleParagraph>
  );
};

export default Overview;
