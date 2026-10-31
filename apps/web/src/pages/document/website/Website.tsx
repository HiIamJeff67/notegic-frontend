import { BookOpenIcon } from "lucide-react";
import {
  ArticleParagraph,
  ArticleParagraphContent,
  ArticleParagraphHeader,
} from "@/components/commons/Article/Article";
import { websiteSections } from "./generated";
import WebsiteContent from "./WebsiteContent";

export const websiteNavigation = {
  id: "website",
  title: "Website",
  description:
    "Write notes, review references, and configure recurring work in Notegic.",
  weight: 5 as const,
  icon: BookOpenIcon,
  children: websiteSections,
};

const Website = () => {
  return (
    <ArticleParagraph
      id={websiteNavigation.id}
      className="mx-auto max-w-full md:max-w-2xl xl:max-w-4xl"
    >
      <ArticleParagraphHeader>
        <h2 className="text-2xl font-semibold tracking-tight">Website</h2>
      </ArticleParagraphHeader>
      <ArticleParagraphContent>
        <div lang="en">
          <WebsiteContent />
        </div>
      </ArticleParagraphContent>
    </ArticleParagraph>
  );
};

export default Website;
