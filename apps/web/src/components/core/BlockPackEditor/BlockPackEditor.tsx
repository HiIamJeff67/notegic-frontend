import {
  BlockPackMeta,
  blockPackMetaReducer,
} from "@shared/reducers/blockPackMeta.reducer";
import LoadingCover from "@/components/covers/LoadingCover/LoadingCover";
import { useShelfItem } from "@/hooks/useShelfItem";
import { BlockEditorProvider } from "@/providers/BlockEditorProvider";
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
    <Suspense fallback={<LoadingCover />}>
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
