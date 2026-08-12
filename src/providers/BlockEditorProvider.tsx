import { BlockNoteEditor } from "@blocknote/core";
import {
  AccessControlPermission,
  RealtimePermission,
} from "@shared/api/interfaces/enums";
import {
  getNotezyBlockNoteXmlFragment,
  NotezyBlockPackEditor,
} from "@shared/blockpack/core";
import { WebURLPathDictionary } from "@shared/constants";
import { randomColor } from "@shared/util/random";
import { createContext, useCallback, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import type * as Y from "yjs";
import { useAppRouterActions } from "@/hooks/useAppRouter";
import { useBlockPackRealtimeChannel, useRealtime } from "@/hooks/useRealtime";
import { useUser } from "@/hooks/useUser";
import { BlockPackMeta } from "@/reducers/blockPackMeta.reducer";

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
      NotezyBlockPackEditor.create({
        collaboration: {
          fragment: getNotezyBlockNoteXmlFragment(channel.doc) as Y.XmlFragment,
          provider: channel.provider,
          user: {
            name:
              userData?.displayName ??
              userData?.name ??
              t("workspace.dialogs.user"),
            publicId: userData?.publicId,
            color: randomColor(),
          } as { name: string; color: string },
          showCursorLabels: "activity",
        },
        trailingBlock: false,
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
    channel.status === "ticketing" || channel.status === "subscribing"
      ? "subscribing"
      : channel.status === "subscribed"
        ? "ready"
        : channel.status === "readOnly"
          ? "readOnly"
          : channel.status === "error"
            ? "syncError"
            : "connecting";

  useEffect(() => {
    editor.isEditable =
      channel.permission === RealtimePermission.Write &&
      channel.status !== "readOnly" &&
      channel.status !== "error";
    if (import.meta.env.DEV) {
      console.debug("[BlockEditorProvider] editor realtime state", {
        blockPackId: blockPackMeta.id,
        accessPermission: blockPackMeta.permission,
        requestedRealtimePermission,
        channelPermission: channel.permission,
        channelStatus: channel.status,
        isEditable: editor.isEditable,
      });
    }
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
      channel.lifecycleErrorCode === "channel_backpressure" ||
      channel.lifecycleErrorCode === "worker_unavailable"
    )
      return;

    window.dispatchEvent(
      new CustomEvent("notezy:block-pack-room-unavailable", {
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
