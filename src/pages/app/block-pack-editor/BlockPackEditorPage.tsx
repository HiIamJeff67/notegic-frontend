import { Suspense } from "react";
import BlockPackEditor from "@/components/core/BlockPackEditor/BlockPackEditor";
import StrictLoadingCover from "@/components/covers/LoadingCover/StrictLoadingCover";
import { BlockPackMeta } from "@/reducers/blockPackMeta.reducer";

interface BlockPackEditorPageProps {
  blockPackMeta: BlockPackMeta;
}

const BlockPackEditorPage = ({ blockPackMeta }: BlockPackEditorPageProps) => {
  return (
    <Suspense fallback={<StrictLoadingCover />}>
      <BlockPackEditor
        key={`${blockPackMeta.id}:${blockPackMeta.parentId}:${blockPackMeta.rootId}`}
        blockPackMeta={blockPackMeta}
      />
    </Suspense>
  );
};

export default BlockPackEditorPage;
