import { ListNotificationsResponseSchema } from "@shared/api/interfaces/notification.interface";
import { parseRealtimeNotificationFrame } from "@shared/api/websocket/types/frames/notification.frame";
import { parseRealtimeResourceEventFrame } from "@shared/api/websocket/types/frames/resourceEvent.frame";
import { parseRealtimeServerFrame } from "@shared/api/websocket/types/frames/server.frame";

describe("realtime control frames", () => {
  it("parses the canonical resource-event frame", () => {
    expect(
      parseRealtimeServerFrame(
        JSON.stringify({
          version: 1,
          type: "resource-event",
          eventId: "event-1",
          eventType: "RootShelfPermissionChanged",
          resourceId: "root-1",
          targetUserPublicId: "user-1",
          change: "permission_updated",
          permission: "write",
        })
      )
    ).toMatchObject({
      type: "resource-event",
      eventId: "event-1",
      eventType: "RootShelfPermissionChanged",
      resourceId: "root-1",
      change: "permission_updated",
      permission: "write",
    });
  });

  it("parses presence deltas and reconnect metadata", () => {
    expect(
      parseRealtimeServerFrame(
        JSON.stringify({
          version: 1,
          type: "ready",
          connectionId: "connection-1",
          resubscribeRequired: true,
        })
      )
    ).toMatchObject({
      type: "ready",
      connectionId: "connection-1",
      resubscribeRequired: true,
    });

    expect(
      parseRealtimeServerFrame(
        JSON.stringify({
          version: 1,
          type: "presence-left",
          channelType: "BlockPack",
          channelId: "block-pack-1",
          participant: {
            userPublicId: "user-1",
            channelPermission: "read",
            connectionCount: 0,
          },
        })
      )
    ).toMatchObject({
      type: "presence-left",
      channelId: "block-pack-1",
      participant: { connectionCount: 0 },
    });
  });

  it("rejects resource events without the invalidation fields", () => {
    expect(() =>
      parseRealtimeResourceEventFrame({
        version: 1,
        type: "resource-event",
        eventId: "event-1",
        eventType: "BlockPackChanged",
        resourceId: "block-pack-1",
      })
    ).toThrow();
  });

  it("does not accept the underscore compatibility alias", () => {
    expect(() =>
      parseRealtimeServerFrame(
        JSON.stringify({
          version: 1,
          type: "resource_event",
          eventId: "event-1",
          eventType: "BlockPackChanged",
          resourceId: "block-pack-1",
          change: "updated",
        })
      )
    ).toThrow();
  });

  it("parses notification frames and keeps unknown types renderable", () => {
    expect(
      parseRealtimeNotificationFrame({
        version: 1,
        type: "notification",
        eventId: "event-2",
        notificationId: "notification-1",
        notificationType: "future-type",
        priority: "normal",
        templateKey: "workspace.maintenance",
        templateVersion: 1,
        payload: { title: "Maintenance" },
        createdAt: "2026-08-09T00:00:00.000Z",
        expiresAt: null,
      })
    ).toMatchObject({
      type: "notification",
      notificationId: "notification-1",
      notificationType: "future-type",
    });
  });

  it("parses routine task lifecycle frames", () => {
    expect(
      parseRealtimeServerFrame(
        JSON.stringify({
          version: 1,
          type: "routine-task-lifecycle",
          eventId: "event-3",
          routineTaskId: "task-1",
          routineTaskRecordId: "record-1",
          routineId: "routine-1",
          purpose: "CreateBlockPack",
          status: "running",
          attempt: 1,
          occurredAt: "2026-08-13T09:00:00.000Z",
        })
      )
    ).toMatchObject({
      type: "routine-task-lifecycle",
      routineTaskId: "task-1",
      status: "running",
    });
  });

  it("normalizes omitted nullable notification timestamps", () => {
    const parsed = ListNotificationsResponseSchema.parse({
      success: true,
      data: {
        searchEdges: [
          {
            encodedSearchCursor: "cursor-1",
            node: {
              id: "4e4b3c2e-2ae4-4c5f-90fd-6e92ef2f4a19",
              recipientUserPublicId: "00000000-0000-0000-0000-000000000000",
              type: "news",
              priority: "normal",
              templateKey: "news",
              templateVersion: 1,
              payload: { title: "Welcome" },
              createdAt: "2026-08-09T12:00:00Z",
            },
          },
        ],
        searchPageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
        },
        totalCount: 1,
        searchTime: 1.42,
      },
      exception: null,
    });

    expect(parsed.data.searchEdges[0].node).toMatchObject({
      readAt: null,
      deletedAt: null,
      expiresAt: null,
    });
  });
});
