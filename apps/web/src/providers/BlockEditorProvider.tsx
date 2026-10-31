import { BlockNoteEditor } from "@blocknote/core";
import {
  AccessControlPermission,
  RealtimePermission,
} from "@shared/api/interfaces/enums";
import { WebURLPathDictionary } from "@shared/constants";
import { useTranslation } from "@shared/i18n/useTranslation";
import {
  NOTEGIC_BLOCKNOTE_YJS_FRAGMENT_NAME,
  NotegicBlockPackEditor,
  notegicBlockPackSchema,
} from "@shared/lib/blockpack";
import { BlockPackMeta } from "@shared/reducers/blockPackMeta.reducer";
import { createContext, useCallback, useEffect, useMemo } from "react";
import type * as Y from "yjs";
import { useAppRouterActions } from "@/hooks/useAppRouter";
import { useBlockPackRealtimeChannel, useRealtime } from "@/hooks/useRealtime";
import { useUser } from "@/hooks/useUser";

const getBlockNoteXmlFragment = (doc: Y.Doc) =>
  doc.getXmlFragment(NOTEGIC_BLOCKNOTE_YJS_FRAGMENT_NAME);

interface BlockEditorContextType {
  editor: BlockNoteEditor<any, any, any>;
  state: BlockEditorState;
  resync: () => Promise<void>;
  maximumBlockCount: number | null;
  rejectQuotaExceededEdit: () => void;
}

export const BlockEditorContext = createContext<
  BlockEditorContextType | undefined
>(undefined);

interface BlockEditorProviderProps {
  children: React.ReactNode;
  blockPackMeta: BlockPackMeta;
}

export type BlockEditorState =
  | "initializing"
  | "connecting"
  | "subscribing"
  | "ready"
  | "readOnly"
  | "syncError";

export const BlockEditorProvider = ({
  children,
  blockPackMeta,
}: BlockEditorProviderProps) => {
  const { t } = useTranslation();
  const { userData } = useUser();
  const router = useAppRouterActions();
  const requestedRealtimePermission =
    blockPackMeta.permission === AccessControlPermission.Read
      ? RealtimePermission.Read
      : RealtimePermission.Write;
  const channel = useBlockPackRealtimeChannel(
    blockPackMeta.id,
    requestedRealtimePermission
  );
  const { resyncBlockPackChannel } = useRealtime();
  const resync = useCallback(
    async () =>
      await resyncBlockPackChannel(
        blockPackMeta.id,
        requestedRealtimePermission
      ),
    [blockPackMeta.id, requestedRealtimePermission, resyncBlockPackChannel]
  );
  const editor = useMemo(
    () =>
      NotegicBlockPackEditor.create({
        schema: notegicBlockPackSchema,
        collaboration: {
          fragment: getBlockNoteXmlFragment(channel.doc),
          provider: channel.provider,
          user: {
            name:
              userData?.displayName ??
              userData?.name ??
              t("workspace.dialogs.user"),
            publicId: userData?.publicId,
            color: `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`,
          } as { name: string; color: string },
          showCursorLabels: "activity",
        },
        trailingBlock: true,
      }),
    [blockPackMeta.id, channel.doc, channel.provider, t, userData]
  );

  const rejectQuotaExceededEdit = useCallback(() => {
    channel.provider.setReadOnly(true);
    editor.undo();
    channel.provider.setReadOnly(
      channel.permission === RealtimePermission.Read
    );
  }, [channel.permission, channel.provider, editor]);

  const state: BlockEditorState =
    channel.status === "error"
      ? "syncError"
      : channel.permission === RealtimePermission.Read
        ? "readOnly"
        : channel.hasSubscribed
          ? "ready"
          : channel.status === "ticketing" || channel.status === "subscribing"
            ? "subscribing"
            : "connecting";

  useEffect(() => {
    editor.isEditable =
      channel.permission === RealtimePermission.Write &&
      channel.status !== "readOnly" &&
      channel.status !== "error";
  }, [
    blockPackMeta.id,
    blockPackMeta.permission,
    channel.permission,
    channel.status,
    editor,
    requestedRealtimePermission,
  ]);

  useEffect(() => {
    if (channel.lifecycleErrorCode === null) return;
    if (
      channel.lifecycleErrorCode === "resync_required" ||
      channel.lifecycleErrorCode === "resubscribe_required" ||
      channel.lifecycleErrorCode === "channel_backpressure" ||
      channel.lifecycleErrorCode === "worker_unavailable"
    )
      return;

    window.dispatchEvent(
      new CustomEvent("notegic:block-pack-room-unavailable", {
        detail: {
          rootShelfId: blockPackMeta.rootId,
          blockPackId: blockPackMeta.id,
          reason: channel.lifecycleErrorCode,
        },
      })
    );
    router.replace(WebURLPathDictionary.app.blockPackEditor.index);
  }, [
    blockPackMeta.id,
    blockPackMeta.rootId,
    channel.lifecycleErrorCode,
    router,
  ]);

  return (
    <BlockEditorContext.Provider
      value={{
        editor,
        state,
        resync,
        maximumBlockCount: channel.maximumBlockCount,
        rejectQuotaExceededEdit,
      }}
    >
      {children}
    </BlockEditorContext.Provider>
  );
};
