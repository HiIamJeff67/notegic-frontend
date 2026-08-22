import { useApolloClient } from "@apollo/client/react";
import { getClientRequestHeaders } from "@shared/api/clientHeaders";
import {
  SearchItemsDocument,
  SearchRootShelvesDocument,
} from "@shared/api/graphql/generated/graphql";
import {
  RealtimePermission,
  RealtimePermissionSchema,
} from "@shared/api/interfaces/enums";
import {
  mutationFnCreateMyBlockPackChannelTicket,
  mutationFnCreateMyRealtimeConnectionTicket,
} from "@shared/api/invokers/realtime.invoker";
import { mergeRealtimeNotificationIntoCache } from "@shared/api/notificationCache";
import { getQueryClient } from "@shared/api/queryClient";
import { queryKeys } from "@shared/api/queryKeys";
import {
  RealtimeBinaryFrameType,
  type RealtimeBlockPackChannelStatus,
  RealtimeClient,
  type RealtimeConnectionState,
  type RealtimeErrorCode,
  type RealtimeResourceEventFrame,
  type RealtimeRoutineTaskLifecycleFrame,
} from "@shared/api/websocket";
import { RealtimeYjsProvider } from "@shared/blockpack/core";
import { LocalYjsDocumentStore } from "@shared/blockpack/core/localYjsDocumentStore";
import toast from "@shared/lib/toast";
import type { UUID } from "crypto";
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as Y from "yjs";
import type { z } from "zod";
import { useLocalPreferences } from "@/hooks/localPreferences";
import { useNetwork } from "@/hooks/useNetwork";
import { useUser } from "@/hooks/useUser";
import i18n from "@/i18n";
import {
  canSendDesktopNotification,
  isQuietHours,
} from "./notificationPreferences";

const RealtimeBlockPackChannelReleaseDelayMs =
  Number.parseInt(
    import.meta.env.VITE_REALTIME_BLOCK_PACK_CHANNEL_RELEASE_DELAY_MS ?? "250",
    10
  ) || 250;

export type RealtimeBlockPackChannel = {
  blockPackId: UUID;
  permission: z.infer<typeof RealtimePermissionSchema>;
  status: RealtimeBlockPackChannelStatus;
  connectorChannelId: number | null;
  doc: Y.Doc;
  provider: RealtimeYjsProvider;
  error: string | null;
  lifecycleErrorCode: RealtimeErrorCode | null;
  documentQuotaPolicyVersion: number | null;
  maximumBlockCount: number | null;
  hasRejectedDraft: boolean;
};

type RealtimeChannelStore = RealtimeBlockPackChannel & {
  retainCount: number;
  isDisposed: boolean;
};

export type RealtimeContextType = {
  rootState: RealtimeConnectionState;
  connectionId: string | null;
  version: number;
  getOrCreateBlockPackChannel: (
    blockPackId: UUID,
    permission: z.infer<typeof RealtimePermissionSchema>
  ) => RealtimeBlockPackChannel;
  retainBlockPackChannel: (
    blockPackId: UUID,
    permission: z.infer<typeof RealtimePermissionSchema>
  ) => RealtimeBlockPackChannel;
  releaseBlockPackChannel: (blockPackId: UUID) => void;
  getBlockPackChannel: (blockPackId: UUID) => RealtimeBlockPackChannel | null;
  resyncBlockPackChannel: (
    blockPackId: UUID,
    permission: z.infer<typeof RealtimePermissionSchema>
  ) => Promise<void>;
  activeBlockPackChannelCount: number;
};

export const RealtimeContext = createContext<RealtimeContextType | undefined>(
  undefined
);

export const RealtimeProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { userData } = useUser();
  const { isOnline } = useNetwork();
  const { preferences, notificationPermission } = useLocalPreferences();
  const apolloClient = useApolloClient();
  const queryClient = getQueryClient();
  const clientRef = useRef<RealtimeClient | null>(null);
  const channelsRef = useRef<Map<UUID, RealtimeChannelStore>>(new Map());
  const releaseTimersRef = useRef<Map<UUID, ReturnType<typeof setTimeout>>>(
    new Map()
  );
  const rejectedDraftBlockPackIdsRef = useRef<Set<UUID>>(new Set());
  const preferencesRef = useRef(preferences);
  const notificationPermissionRef = useRef(notificationPermission);

  preferencesRef.current = preferences;
  notificationPermissionRef.current = notificationPermission;
  const [rootState, setRootState] = useState<RealtimeConnectionState>("idle");
  const [connectionId, setConnectionId] = useState<string | null>(null);
  const [version, setVersion] = useState(0);
  const activeBlockPackChannelCount = Array.from(
    channelsRef.current.values()
  ).filter(channel => channel.retainCount > 0 && !channel.isDisposed).length;

  const rerender = useCallback(() => setVersion(value => value + 1), []);

  const clearReleaseTimer = useCallback((blockPackId: UUID) => {
    const releaseTimer = releaseTimersRef.current.get(blockPackId);
    if (!releaseTimer) return;
    clearTimeout(releaseTimer);
    releaseTimersRef.current.delete(blockPackId);
  }, []);

  const disposeBlockPackChannel = useCallback(
    (channel: RealtimeChannelStore) => {
      if (channel.isDisposed) return;
      clearReleaseTimer(channel.blockPackId);
      channel.provider.setReadOnly(true);
      channel.provider.disconnect();
      void channel.provider.destroy();
      channel.doc.destroy();
      channel.connectorChannelId = null;
      channel.hasRejectedDraft = false;
      channel.isDisposed = true;
    },
    [clearReleaseTimer]
  );

  const getRequestHeader = useCallback(() => {
    return getClientRequestHeaders();
  }, []);

  const setChannelStatus = useCallback(
    (blockPackId: string, status: RealtimeBlockPackChannelStatus) => {
      const channel = channelsRef.current.get(blockPackId as UUID);
      if (!channel) return;
      channel.status = status;
      if (status !== "error") channel.error = null;
      if (status === "idle" || status === "unsubscribed") {
        channel.connectorChannelId = null;
        channel.provider.disconnect();
      }
      rerender();
    },
    [rerender]
  );

  const flushAllBlockPackDocumentUpdates = useCallback(() => {
    for (const channel of channelsRef.current.values()) {
      channel.provider.flushPendingDocumentUpdatesNow();
    }
  }, []);

  const refetchCanonicalState = useCallback(() => {
    void queryClient.invalidateQueries({ refetchType: "active" });
    void apolloClient.refetchQueries({ include: "active" });
  }, [apolloClient, queryClient]);

  const showSyncError = useCallback((message: string) => {
    if (preferencesRef.current.syncNotifications) toast.error(message);
  }, []);

  const showSyncConnected = useCallback(() => {
    const currentPreferences = preferencesRef.current;
    if (
      !currentPreferences.syncNotifications ||
      (currentPreferences.quietMode &&
        isQuietHours(
          new Date(),
          currentPreferences.quietModeStart,
          currentPreferences.quietModeEnd
        ))
    ) {
      return;
    }
    toast.success(i18n.t("workspace.notifications.syncConnected"));
  }, []);

  const showDesktopNotification = useCallback(
    (
      title: string,
      body: string,
      priority: "low" | "normal" | "high" | "critical"
    ) => {
      if (
        typeof window === "undefined" ||
        typeof Notification === "undefined" ||
        !canSendDesktopNotification(
          preferencesRef.current,
          notificationPermissionRef.current,
          priority
        )
      ) {
        return;
      }

      try {
        new Notification(title, { body, tag: "notegic" });
      } catch {
        // Browser notification APIs can fail when permission changes externally.
      }
    },
    []
  );

  const handleResourceEvent = useCallback(
    (frame: RealtimeResourceEventFrame) => {
      const resourceId = frame.resourceId as UUID;
      const isRootShelfEvent = frame.eventType.startsWith("RootShelf");
      const isBlockPackEvent = frame.eventType.startsWith("BlockPack");

      if (isRootShelfEvent) {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.rootShelf.all(),
        });
        void queryClient.invalidateQueries({
          queryKey: queryKeys.subShelf.all(),
        });
        void queryClient.invalidateQueries({
          queryKey: queryKeys.material.all(),
        });
        void queryClient.invalidateQueries({
          queryKey: queryKeys.blockPack.all(),
        });
        if (
          frame.eventType === "RootShelfDeleted" ||
          frame.eventType === "RootShelfPermissionRevoked"
        ) {
          apolloClient.cache.evict({
            id: apolloClient.cache.identify({
              __typename: "PrivateRootShelf",
              id: resourceId,
            }),
          });
          apolloClient.cache.gc();
        }
        void apolloClient.refetchQueries({
          include: [SearchRootShelvesDocument],
        });
      }

      if (isBlockPackEvent) {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.blockPack.all(),
        });
        void queryClient.invalidateQueries({
          queryKey: queryKeys.block.all(),
        });
        if (frame.eventType === "BlockPackDeleted") {
          apolloClient.cache.evict({
            id: apolloClient.cache.identify({
              __typename: "PrivateItem",
              id: resourceId,
            }),
          });
          apolloClient.cache.gc();
        }
        void apolloClient.refetchQueries({
          include: [SearchItemsDocument],
        });
      }

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("notegic:realtime-resource-event", {
            detail: frame,
          })
        );
      }
    },
    [apolloClient, queryClient]
  );

  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined")
      return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        flushAllBlockPackDocumentUpdates();
      }
    };

    window.addEventListener("pagehide", flushAllBlockPackDocumentUpdates);
    window.addEventListener("beforeunload", flushAllBlockPackDocumentUpdates);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      for (const releaseTimer of releaseTimersRef.current.values()) {
        clearTimeout(releaseTimer);
      }
      releaseTimersRef.current.clear();
      window.removeEventListener("pagehide", flushAllBlockPackDocumentUpdates);
      window.removeEventListener(
        "beforeunload",
        flushAllBlockPackDocumentUpdates
      );
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [flushAllBlockPackDocumentUpdates]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!userData || !isOnline) {
      clientRef.current?.stop();
      clientRef.current = null;
      setRootState("idle");
      setConnectionId(null);
      for (const channel of channelsRef.current.values()) {
        channel.connectorChannelId = null;
        channel.status = "idle";
        channel.provider.disconnect();
      }
      rerender();
      return;
    }

    if (clientRef.current) return;

    const client = new RealtimeClient({
      getConnectionTicket: async () => {
        const response = await mutationFnCreateMyRealtimeConnectionTicket({
          header: getRequestHeader(),
          body: {},
        });
        return response.data;
      },
      getBlockPackChannelTicket: async (blockPackId, permission) => {
        const response = await mutationFnCreateMyBlockPackChannelTicket({
          header: getRequestHeader(),
          body: {
            blockPackId,
            permission,
          },
        });
        return response.data;
      },
      onState: setRootState,
      onReady: nextConnectionId => {
        setConnectionId(nextConnectionId);
      },
      onReconnect: () => {
        refetchCanonicalState();
        void queryClient.invalidateQueries({
          queryKey: queryKeys.notification.list(),
        });
        void queryClient.invalidateQueries({
          queryKey: queryKeys.notification.unreadCount(),
        });
        showSyncConnected();
      },
      onNotification: frame => {
        if (!userData) return;
        mergeRealtimeNotificationIntoCache({
          id: frame.notificationId,
          recipientUserPublicId: userData.publicId,
          type: frame.notificationType,
          priority: frame.priority,
          templateKey: frame.templateKey,
          templateVersion: frame.templateVersion,
          payload: frame.payload,
          createdAt: new Date(frame.createdAt),
          readAt: null,
          deletedAt: null,
          expiresAt: frame.expiresAt ? new Date(frame.expiresAt) : null,
        });

        const title =
          typeof frame.payload.title === "string" &&
          frame.payload.title.trim().length > 0
            ? frame.payload.title
            : frame.templateKey;
        const body =
          typeof frame.payload.summary === "string" &&
          frame.payload.summary.trim().length > 0
            ? frame.payload.summary
            : typeof frame.payload.body === "string"
              ? frame.payload.body
              : "";
        showDesktopNotification(title, body, frame.priority);
      },
      onRoutineTaskLifecycle: (frame: RealtimeRoutineTaskLifecycleFrame) => {
        if (typeof window === "undefined") return;
        if (
          frame.status === "running" &&
          preferencesRef.current.routineNudges
        ) {
          showDesktopNotification(
            i18n.t("workspace.notifications.routineReminder"),
            frame.purpose,
            "normal"
          );
        }
        window.dispatchEvent(
          new CustomEvent("notegic:realtime-routine-task-lifecycle", {
            detail: frame,
          })
        );
      },
      onChannelStatus: setChannelStatus,
      onChannelTicket: (blockPackId, ticket) => {
        const channel = channelsRef.current.get(blockPackId as UUID);
        if (!channel) return;
        channel.documentQuotaPolicyVersion = ticket.documentQuotaPolicyVersion;
        channel.maximumBlockCount = ticket.maximumBlockCount;
        rerender();
      },
      onChannelSubscribed: (blockPackId, frame, permission) => {
        const channel = channelsRef.current.get(blockPackId as UUID);
        if (!channel) return;
        channel.connectorChannelId = frame.connectorChannelId;
        channel.permission = permission;
        channel.documentQuotaPolicyVersion = frame.documentQuotaPolicyVersion;
        channel.maximumBlockCount = frame.maximumBlockCount;
        channel.provider.setReadOnly(permission === RealtimePermission.Read);
        channel.provider.connect((type, payload) => {
          return client.sendBlockPackBinary(blockPackId, type, payload);
        });
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("notegic:realtime-presence-snapshot", {
              detail: {
                blockPackId,
                participants: frame.participants,
              },
            })
          );
        }
        rerender();
      },
      onChannelBinary: (blockPackId, frame) => {
        const channel = channelsRef.current.get(blockPackId as UUID);
        if (!channel) return;
        if (frame.type === RealtimeBinaryFrameType.YjsDocument) {
          channel.provider.applyDocumentUpdate(frame.payload);
        } else if (frame.type === RealtimeBinaryFrameType.Awareness) {
          channel.provider.applyAwarenessUpdate(frame.payload);
        }
      },
      onResourceEvent: handleResourceEvent,
      onPresence: (blockPackId, frame) => {
        if (typeof window === "undefined") return;
        window.dispatchEvent(
          new CustomEvent("notegic:realtime-presence", {
            detail: { blockPackId, frame },
          })
        );
      },
      onChannelError: (blockPackId, frame) => {
        const channel = channelsRef.current.get(blockPackId as UUID);
        if (!channel) return;
        if (frame.code === "block_pack_quota_exceeded") {
          channel.error = frame.message;
          channel.connectorChannelId = null;
          channel.status = "error";
          channel.provider.setReadOnly(true);
          channel.provider.disconnect();
          showSyncError(i18n.t("workspace.notifications.realtimeError"));
          rerender();

          void (async () => {
            try {
              const rejectedUpdate =
                await channel.provider.snapshotLocalDocument();
              await LocalYjsDocumentStore.saveRejectedDraft(
                userData?.publicId ?? null,
                channel.blockPackId,
                rejectedUpdate
              );
              rejectedDraftBlockPackIdsRef.current.add(channel.blockPackId);
              if (channelsRef.current.get(channel.blockPackId) !== channel) {
                return;
              }
              await resyncBlockPackChannel(
                channel.blockPackId,
                channel.permission
              );
            } catch (error) {
              console.error(
                "[RealtimeProvider] failed to preserve quota-rejected draft",
                error
              );
              channel.error = frame.message;
              channel.status = "error";
              rerender();
              showSyncError(i18n.t("workspace.notifications.realtimeError"));
            }
          })();
          return;
        }
        if (channel.lifecycleErrorCode !== null) return;

        if (frame.code === "channel_not_found") {
          channel.error = null;
          channel.connectorChannelId = null;
          channel.status = "idle";
          channel.provider.disconnect();
          rerender();
          return;
        }

        channel.error = frame.message;
        channel.connectorChannelId = null;
        if (frame.code === "permission_revoked") {
          channel.lifecycleErrorCode = frame.code;
          channel.status = "error";
          void disposeBlockPackChannel(channel);
          showSyncError(
            i18n.t("workspace.notifications.blockPackRoomUnavailable")
          );
        } else if (frame.code === "resource_unavailable") {
          channel.lifecycleErrorCode = frame.code;
          channel.status = "error";
          void disposeBlockPackChannel(channel);
          showSyncError(i18n.t("workspace.notifications.blockPackUnavailable"));
        } else if (
          frame.code === "resync_required" ||
          frame.code === "channel_backpressure" ||
          frame.code === "worker_unavailable"
        ) {
          channel.lifecycleErrorCode = frame.code;
          channel.status = "error";
          channel.provider.setReadOnly(true);
          channel.provider.disconnect();
          showSyncError(
            i18n.t("workspace.notifications.realtimeResyncRequired")
          );
        } else {
          channel.provider.disconnect();
          showSyncError(i18n.t("workspace.notifications.realtimeError"));
        }
        rerender();
      },
      onError: error => {
        console.error("[Realtime]", error);
        showSyncError(i18n.t("workspace.notifications.realtimeError"));
      },
    });

    clientRef.current = client;
    client.start();
    for (const channel of channelsRef.current.values()) {
      client.registerBlockPackChannel(channel.blockPackId, channel.permission);
    }

    return () => {
      if (clientRef.current === client) {
        client.stop();
        clientRef.current = null;
      }
    };
  }, [
    disposeBlockPackChannel,
    getRequestHeader,
    handleResourceEvent,
    isOnline,
    refetchCanonicalState,
    rerender,
    setChannelStatus,
    showDesktopNotification,
    showSyncConnected,
    showSyncError,
    userData,
  ]);

  const createBlockPackChannel = useCallback(
    (
      blockPackId: UUID,
      permission: z.infer<typeof RealtimePermissionSchema>,
      retainCount = 0
    ): RealtimeChannelStore => {
      const doc = new Y.Doc();
      const provider = new RealtimeYjsProvider(
        doc,
        blockPackId,
        userData?.publicId ?? null
      );
      provider.setReadOnly(permission === RealtimePermission.Read);
      return {
        blockPackId,
        permission,
        status: "idle",
        connectorChannelId: null,
        doc,
        provider,
        error: null,
        lifecycleErrorCode: null,
        documentQuotaPolicyVersion: null,
        maximumBlockCount: null,
        hasRejectedDraft: rejectedDraftBlockPackIdsRef.current.has(blockPackId),
        retainCount,
        isDisposed: false,
      };
    },
    [userData?.publicId]
  );

  const getOrCreateBlockPackChannel = useCallback(
    (
      blockPackId: UUID,
      permission: z.infer<typeof RealtimePermissionSchema>
    ) => {
      let channel = channelsRef.current.get(blockPackId);
      if (!channel) {
        channel = createBlockPackChannel(blockPackId, permission);
        channelsRef.current.set(blockPackId, channel);
      }

      if (channel.lifecycleErrorCode !== null) return channel;

      channel.permission = permission;
      channel.provider.setReadOnly(permission === RealtimePermission.Read);
      return channel;
    },
    [createBlockPackChannel]
  );

  const retainBlockPackChannel = useCallback(
    (
      blockPackId: UUID,
      permission: z.infer<typeof RealtimePermissionSchema>
    ) => {
      const channel = getOrCreateBlockPackChannel(blockPackId, permission);
      clearReleaseTimer(blockPackId);
      channel.retainCount += 1;
      if (channel.lifecycleErrorCode === null) {
        clientRef.current?.registerBlockPackChannel(blockPackId, permission);
      }
      rerender();
      return channel;
    },
    [clearReleaseTimer, getOrCreateBlockPackChannel, rerender]
  );

  const releaseBlockPackChannel = useCallback(
    (blockPackId: UUID) => {
      const channel = channelsRef.current.get(blockPackId);
      if (!channel) return;
      channel.retainCount = Math.max(0, channel.retainCount - 1);
      if (channel.retainCount > 0) return;

      clearReleaseTimer(blockPackId);
      const releaseTimer = setTimeout(() => {
        releaseTimersRef.current.delete(blockPackId);
        const latestChannel = channelsRef.current.get(blockPackId);
        if (!latestChannel || latestChannel.retainCount > 0) return;

        if (!latestChannel.isDisposed) {
          void latestChannel.provider.destroy();
          latestChannel.doc.destroy();
        }
        clientRef.current?.unregisterBlockPackChannel(blockPackId);
        channelsRef.current.delete(blockPackId);
        rerender();
      }, RealtimeBlockPackChannelReleaseDelayMs);
      releaseTimersRef.current.set(blockPackId, releaseTimer);
      rerender();
    },
    [clearReleaseTimer, rerender]
  );

  const getBlockPackChannel = useCallback((blockPackId: UUID) => {
    return channelsRef.current.get(blockPackId) ?? null;
  }, []);

  const resyncBlockPackChannel = useCallback(
    async (
      blockPackId: UUID,
      permission: z.infer<typeof RealtimePermissionSchema>
    ) => {
      const client = clientRef.current;
      if (!client) throw new Error("Realtime connection is unavailable.");

      clearReleaseTimer(blockPackId);
      const previousChannel = channelsRef.current.get(blockPackId);

      if (previousChannel && !previousChannel.isDisposed) {
        if (previousChannel.provider.hasUnconfirmedLocalChanges()) {
          const rejectedUpdate =
            await previousChannel.provider.snapshotLocalDocument();
          await LocalYjsDocumentStore.saveRejectedDraft(
            userData?.publicId ?? null,
            blockPackId,
            rejectedUpdate
          );
          rejectedDraftBlockPackIdsRef.current.add(blockPackId);
          previousChannel.hasRejectedDraft = true;
        }
        previousChannel.provider.setReadOnly(true);
        previousChannel.provider.disconnect();
        await previousChannel.provider.destroy();
        previousChannel.doc.destroy();
        previousChannel.isDisposed = true;
      }

      client.resetBlockPackChannel(blockPackId);

      const nextChannel = createBlockPackChannel(
        blockPackId,
        permission,
        previousChannel?.retainCount ?? 0
      );
      channelsRef.current.set(blockPackId, nextChannel);
      client.registerBlockPackChannel(blockPackId, permission);
      rerender();
    },
    [clearReleaseTimer, createBlockPackChannel, rerender, userData?.publicId]
  );

  const value = useMemo<RealtimeContextType>(
    () => ({
      rootState,
      connectionId,
      version,
      activeBlockPackChannelCount,
      getOrCreateBlockPackChannel,
      retainBlockPackChannel,
      releaseBlockPackChannel,
      getBlockPackChannel,
      resyncBlockPackChannel,
    }),
    [
      connectionId,
      activeBlockPackChannelCount,
      getBlockPackChannel,
      getOrCreateBlockPackChannel,
      releaseBlockPackChannel,
      resyncBlockPackChannel,
      retainBlockPackChannel,
      rootState,
      version,
    ]
  );

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
};
