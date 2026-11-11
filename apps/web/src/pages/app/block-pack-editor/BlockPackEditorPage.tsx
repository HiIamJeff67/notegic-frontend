import { BlockPackMeta } from "@shared/reducers/blockPackMeta.reducer";
import { Suspense } from "react";
import BlockPackEditor from "@/components/core/BlockPackEditor/BlockPackEditor";
import LoadingCover from "@/components/covers/LoadingCover/LoadingCover";
import { usePageTitle } from "@/hooks/usePageTitle";
import { pageTitle } from "@/seo/pageTitle";

interface BlockPackEditorPageProps {
  blockPackMeta: BlockPackMeta;
}

const BlockPackEditorPage = ({ blockPackMeta }: BlockPackEditorPageProps) => {
  usePageTitle(pageTitle(blockPackMeta.name || "Block Pack"));

  return (
    <Suspense fallback={<LoadingCover />}>
      <BlockPackEditor
        key={`${blockPackMeta.id}:${blockPackMeta.parentId}:${blockPackMeta.rootId}`}
        blockPackMeta={blockPackMeta}
      />
    </Suspense>
  );
};

export default BlockPackEditorPage;
