import StrictLoadingCover from "@/components/covers/LoadingCover/StrictLoadingCover";
import { useShelfItem } from "@/hooks/useShelfItem";
import { BlockEditorProvider } from "@/providers/BlockEditorProvider";
import {
  BlockPackMeta,
  blockPackMetaReducer,
} from "@shared/reducers/blockPackMeta.reducer";
// @ts-ignore allow side-effect import of BlockNote
import "@blocknote/core/style.css";
import { Suspense, useEffect, useMemo, useReducer } from "react";
import BlockPackEditorContent from "./BlockPackEditorContent";

interface BlockPackEditorProps {
  blockPackMeta: BlockPackMeta;
}

const BlockPackEditor = ({ blockPackMeta }: BlockPackEditorProps) => {
  const shelfItemManager = useShelfItem();

  const [meta, dispatchMeta] = useReducer(blockPackMetaReducer, blockPackMeta);

  useEffect(() => {
    if (shelfItemManager.isItemNodeEditing(meta.id)) {
      dispatchMeta({
        type: "setName",
        newName: shelfItemManager.editItemName,
      });
    }
  }, [shelfItemManager.editItemName]);

  return (
    <Suspense fallback={<StrictLoadingCover />}>
      <BlockEditorProvider blockPackMeta={meta}>
        <BlockPackEditorContent
          blockPackMeta={meta}
          dispatchMeta={dispatchMeta}
        />
      </BlockEditorProvider>
    </Suspense>
  );
};

export default BlockPackEditor;
