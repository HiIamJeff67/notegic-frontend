import type { RealtimeResourceEventFrame } from "@shared/api/websocket";
import {
  MaxMaterialsOfRootShelf,
  MaxSubShelvesOfRootShelf,
  MaxTriggerValue,
} from "@shared/constants";
import { LRUCache } from "@shared/lib/LRUCache";
import { BlockPackNode, MaterialNode } from "@shared/types/itemNodes.type";
import { RootShelfNode, SubShelfNode } from "@shared/types/shelfNodes.type";
import { ShelfTreeSummary } from "@shared/types/shelfTreeSummary.type";
import type { UUID } from "crypto";
import {
  createContext,
  RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useItemLogic } from "./ItemLogic";
import { useRootShelfLogic } from "./RootShelfLogic";
import { useSubShelfLogic } from "./SubShelfLogic";

interface ShelfItemBaseContext {
  inputRef: RefObject<HTMLInputElement | null>;
  searchInput: { query: string; after: string | null };
  setSearchInput: (input: { query: string; after: string | null }) => void;
  expandedShelves: LRUCache<string, ShelfTreeSummary>;
  isFocused: (id: UUID) => boolean;
  resetFocusNode: () => void;
}

export type ShelfItemContextType = ShelfItemBaseContext &
  ReturnType<typeof useRootShelfLogic> &
  ReturnType<typeof useSubShelfLogic> &
  ReturnType<typeof useItemLogic>;

export const ShelfItemContext = createContext<ShelfItemContextType | undefined>(
  undefined
);

export const ShelfItemProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [_, setUpdateTrigger] = useState(0);
  const [focusedNode, setFocusedNode] = useState<
    RootShelfNode | SubShelfNode | MaterialNode | BlockPackNode | undefined
  >(undefined);

  const inputRef = useRef<HTMLInputElement>(null);
  const expandedShelvesRef = useRef(
    new LRUCache<string, ShelfTreeSummary>(
      MaxSubShelvesOfRootShelf + MaxMaterialsOfRootShelf
    )
  );

  const forceUpdate = useCallback(() => {
    setUpdateTrigger(prev => (prev + 1) % MaxTriggerValue);
  }, []);

  const isFocused = useCallback(
    (id: UUID): boolean => {
      return !!focusedNode && focusedNode.id === id;
    },
    [focusedNode, setFocusedNode]
  );

  const rootShelfLogic = useRootShelfLogic({
    expandedShelvesRef,
    inputRef,
    setFocusedNode,
    forceUpdate,
  });

  const subShelfLogic = useSubShelfLogic({
    expandedShelvesRef,
    inputRef,
    setFocusedNode,
    forceUpdate,
  });

  const itemLogic = useItemLogic({
    expandedShelvesRef,
    inputRef,
    setFocusedNode,
    forceUpdate,
  });

  useEffect(() => {
    const handleRealtimeUnavailable = (event: Event) => {
      const detail = (event as CustomEvent).detail as
        | {
            rootShelfId?: UUID;
            blockPackId?: UUID;
            reason?: string;
          }
        | undefined;
      if (!detail) return;

      if (detail.reason === "permission_revoked" && detail.blockPackId) {
        itemLogic.removeBlockPackOptimistically(detail.blockPackId);
        return;
      }
      if (detail.reason === "resource_unavailable" && detail.blockPackId) {
        itemLogic.removeBlockPackOptimistically(detail.blockPackId);
      }
    };

    window.addEventListener(
      "notegic:block-pack-room-unavailable",
      handleRealtimeUnavailable
    );
    const handleResourceEvent = (event: Event) => {
      const frame = (event as CustomEvent<RealtimeResourceEventFrame>).detail;
      if (!frame) return;

      if (
        frame.eventType === "RootShelfDeleted" ||
        frame.eventType === "RootShelfPermissionRevoked"
      ) {
        rootShelfLogic.removeRootShelfOptimistically(frame.resourceId as UUID);
      } else if (frame.eventType.startsWith("RootShelf")) {
        void rootShelfLogic.searchRootShelves();
      }

      if (frame.eventType === "BlockPackDeleted") {
        itemLogic.removeBlockPackOptimistically(frame.resourceId as UUID);
      } else if (frame.eventType.startsWith("BlockPack")) {
        void rootShelfLogic.searchRootShelves();
      }
    };

    window.addEventListener(
      "notegic:realtime-resource-event",
      handleResourceEvent
    );
    return () => {
      window.removeEventListener(
        "notegic:block-pack-room-unavailable",
        handleRealtimeUnavailable
      );
      window.removeEventListener(
        "notegic:realtime-resource-event",
        handleResourceEvent
      );
    };
  }, [
    itemLogic.removeBlockPackOptimistically,
    rootShelfLogic.removeRootShelfOptimistically,
    rootShelfLogic.searchRootShelves,
  ]);

  const contextValue: ShelfItemContextType = {
    inputRef: inputRef,
    searchInput: rootShelfLogic.searchRootShelvesInput,
    setSearchInput: rootShelfLogic.setSearchRootShelvesInput,
    expandedShelves: expandedShelvesRef.current,
    isFocused: isFocused,
    resetFocusNode: () => setFocusedNode(undefined),
    ...rootShelfLogic,
    ...subShelfLogic,
    ...itemLogic,
  };

  return <ShelfItemContext value={contextValue}>{children}</ShelfItemContext>;
};
