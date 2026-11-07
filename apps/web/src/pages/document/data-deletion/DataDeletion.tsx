import { Trash2Icon } from "lucide-react";
import {
  ArticleParagraph,
  ArticleParagraphContent,
  ArticleParagraphHeader,
} from "@/components/commons/Article/Article";
import DataDeletionContent from "./DataDeletionContent";
import { dataDeletionSections } from "./generated";

export const dataDeletionNavigation = {
  id: "data-deletion",
  title: "Data deletion",
  description: "Remove linked sign-in data, content, or your Notegic account.",
  weight: 4 as const,
  icon: Trash2Icon,
  children: dataDeletionSections,
  command: { layout: "flat" as const },
} as const;

const DataDeletion = ({ standalone = false }: { standalone?: boolean }) => {
  const Heading = standalone ? "h1" : "h2";

  return (
    <ArticleParagraph
      id={dataDeletionNavigation.id}
      className="mx-auto max-w-full md:max-w-2xl xl:max-w-4xl"
    >
      <ArticleParagraphHeader>
        <Heading className="text-2xl font-semibold tracking-tight">
          {dataDeletionNavigation.title}
        </Heading>
      </ArticleParagraphHeader>
      <ArticleParagraphContent>
        <div lang="en">
          <DataDeletionContent />
        </div>
      </ArticleParagraphContent>
    </ArticleParagraph>
  );
};

export default DataDeletion;
