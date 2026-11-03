import { GitBranchIcon } from "lucide-react";
import { useLocation } from "@tanstack/react-router";
import {
  type Ref,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { flushSync } from "react-dom";
import {
  ArticleParagraph,
  ArticleParagraphContent,
  ArticleParagraphHeader,
} from "@/components/commons/Article/Article";
import VersionsContent, { versionSections } from "./VersionsContent";
import { versionsDescription } from "./generated";

export const versionsNavigation = {
  id: "versions",
  title: "Versions",
  description:
    "Past work, current development, the next release and future plans.",
  weight: 4 as const,
  icon: GitBranchIcon,
  children: versionSections.map(section => section.navigation),
} as const;

export type VersionsHandle = { reveal: (id: string) => boolean };

const previousSections = versionSections.filter(
  section => section.version.status === "previous"
);

const Versions = ({ ref }: { ref?: Ref<VersionsHandle> }) => {
  const hash = useLocation({ select: location => location.hash });
  const [visiblePreviousCount, setVisiblePreviousCount] = useState(0);
  const reveal = useCallback((id: string) => {
    const index = previousSections.findIndex(
      section => section.navigation.id === id
    );
    if (index < 0) return false;
    setVisiblePreviousCount(count => Math.max(count, index + 1));
    return true;
  }, []);

  useImperativeHandle(ref, () => ({ reveal }), [reveal]);

  useEffect(() => {
    let id: string;
    try {
      id = decodeURIComponent(hash);
    } catch {
      return;
    }
    if (!reveal(id)) return;
    const frame = requestAnimationFrame(() => {
      document
        .getElementById(id)
        ?.scrollIntoView({ block: "start", behavior: "auto" });
    });
    return () => cancelAnimationFrame(frame);
  }, [hash, reveal]);

  return (
    <ArticleParagraph
      id={versionsNavigation.id}
      className="mx-auto max-w-full md:max-w-2xl xl:max-w-4xl"
    >
      <ArticleParagraphHeader>
        <h2 className="text-2xl font-semibold tracking-tight">
          {versionsNavigation.title}
        </h2>
      </ArticleParagraphHeader>
      <ArticleParagraphContent>
        <p className="mb-6 text-sm leading-relaxed">{versionsDescription}</p>
        <VersionsContent
          visiblePreviousCount={visiblePreviousCount}
          onShowMore={() => {
            flushSync(() => setVisiblePreviousCount(1));
            document
              .getElementById(
                previousSections.length > 1
                  ? "versions-show-all"
                  : "versions-show-less"
              )
              ?.focus({ preventScroll: true });
          }}
          onShowAll={() => {
            flushSync(() => setVisiblePreviousCount(previousSections.length));
            document
              .getElementById("versions-show-less")
              ?.focus({ preventScroll: true });
          }}
          onShowLess={() => {
            flushSync(() => setVisiblePreviousCount(0));
            document.getElementById("versions-show-more")?.focus();
          }}
        />
      </ArticleParagraphContent>
    </ArticleParagraph>
  );
};

export default Versions;
