import { expect, test } from "@playwright/test";
import type { RealtimeExample } from "./realtimeClientTestSupport";
import type { mountRealtimeProviderExample } from "./realtimeProviderTestSupport";

test.beforeEach(async ({ page }) => {
  await page.route("https://www.youtube-nocookie.com/embed/**", route =>
    route.fulfill({ contentType: "text/html", body: "<p>Player fixture</p>" })
  );
});

declare global {
  interface Window {
    realtimeExample: RealtimeExample;
    realtimeProviderExample: ReturnType<typeof mountRealtimeProviderExample>;
  }
}

test.describe("realtime client lifecycle", () => {
  test.beforeEach(async ({ page }) => {
    test.skip(
      process.env.E2E_PRODUCTION === "true",
      "Uses Vite source imports"
    );
    await page.goto("/document");
    await page.waitForLoadState("networkidle");
    await page.clock.install({ time: new Date("2026-10-21T00:00:00Z") });
    await page.clock.pauseAt(new Date("2026-10-21T00:00:01Z"));
    await page.evaluate(async () => {
      const path = "/test/e2e/realtimeClientTestSupport.ts";
      const { createRealtimeExample } = await import(/* @vite-ignore */ path);
      window.realtimeExample = createRealtimeExample();
      window.realtimeExample.client.start();
    });
    await expect
      .poll(() => page.evaluate(() => window.realtimeExample.sockets.length))
      .toBe(1);
  });

  test("idle sockets keep sending correlated ping/pong and stop clears timers", async ({
    page,
  }) => {
    await page.evaluate(() => window.realtimeExample.sockets[0].open());
    await page.clock.runFor(120_000);
    expect(
      await page.evaluate(() => {
        const { sockets, events, client } = window.realtimeExample;
        const pings = sockets[0].sent.filter(
          frame =>
            typeof frame === "string" && JSON.parse(frame).type === "ping"
        );
        client.stop();
        return {
          pings: pings.length,
          errors: events.errors,
          sockets: sockets.length,
        };
      })
    ).toEqual({ pings: 5, errors: [], sockets: 1 });
    await page.clock.runFor(120_000);
    expect(
      await page.evaluate(() => window.realtimeExample.sockets[0].sent.length)
    ).toBe(5);
  });

  test("a missing pong retires the half-open socket and recovers without an error toast", async ({
    page,
  }) => {
    await page.evaluate(() => {
      const socket = window.realtimeExample.sockets[0];
      socket.autoPong = false;
      socket.open();
      socket.message({ version: 1, type: "pong", requestId: "unrelated" });
    });
    await page.clock.runFor(11_000);
    expect(
      await page.evaluate(() => window.realtimeExample.sockets.length)
    ).toBe(2);
    await page.evaluate(() => window.realtimeExample.sockets[1].open());
    await page.clock.runFor(60_000);
    expect(
      await page.evaluate(() => {
        const { events, sockets } = window.realtimeExample;
        return {
          errors: events.errors,
          state: events.states.at(-1),
          reconnects: events.reconnects,
          oldState: sockets[0].readyState,
        };
      })
    ).toEqual({ errors: [], state: "connected", reconnects: 1, oldState: 3 });
  });

  test("late open, message, error and close events cannot alter a replacement socket", async ({
    page,
  }) => {
    await page.evaluate(() => {
      const socket = window.realtimeExample.sockets[0];
      socket.open();
      socket.onerror?.(new Event("error"));
      socket.onclose?.(new CloseEvent("close", { code: 1006 }));
    });
    await page.clock.runFor(1000);
    expect(
      await page.evaluate(() => window.realtimeExample.sockets.length)
    ).toBe(2);
    await page.evaluate(() => window.realtimeExample.sockets[1].open());
    expect(
      await page.evaluate(() => {
        const { sockets, events } = window.realtimeExample;
        const before = JSON.stringify(events);
        sockets[0].onopen?.(new Event("open"));
        sockets[0].message({
          version: 1,
          type: "ready",
          connectionId: "obsolete",
          resubscribeRequired: true,
        });
        sockets[0].message({
          version: 1,
          type: "error",
          code: "unsupported_control_type",
          message: "stale",
        });
        sockets[0].onerror?.(new Event("error"));
        sockets[0].onclose?.(new CloseEvent("close", { code: 1006 }));
        return JSON.stringify(events) === before;
      })
    ).toBe(true);
    await page.clock.runFor(2000);
    expect(
      await page.evaluate(() => window.realtimeExample.sockets.length)
    ).toBe(2);
  });

  test("stopping during an upgrade ignores the browser's later error events", async ({
    page,
  }) => {
    expect(
      await page.evaluate(() => {
        const { client, sockets, events } = window.realtimeExample;
        client.stop();
        const before = JSON.stringify(events);
        sockets[0].onerror?.(new Event("error"));
        sockets[0].onclose?.(new CloseEvent("close", { code: 1006 }));
        sockets[0].open();
        return JSON.stringify(events) === before;
      })
    ).toBe(true);
    await page.clock.runFor(60_000);
    expect(
      await page.evaluate(() => window.realtimeExample.sockets.length)
    ).toBe(1);
  });

  test("an obsolete pending ticket cannot replace or expire a restarted client", async ({
    page,
  }) => {
    await page.evaluate(() => {
      const fixture = window.realtimeExample;
      fixture.client.stop();
      fixture.connectionTickets.push(
        () =>
          new Promise((_, reject) => {
            (
              window as Window & { rejectOldTicket?: () => void }
            ).rejectOldTicket = () => reject(fixture.expiredRealtimeSession());
          })
      );
      fixture.client.start();
      fixture.client.stop();
      fixture.client.start();
    });
    await expect
      .poll(() => page.evaluate(() => window.realtimeExample.sockets.length))
      .toBe(2);
    await page.evaluate(() => {
      window.realtimeExample.sockets[1].open();
      (window as Window & { rejectOldTicket?: () => void }).rejectOldTicket?.();
    });
    expect(
      await page.evaluate(() => ({
        failures: window.realtimeExample.events.authFailures,
        errors: window.realtimeExample.events.errors,
        state: window.realtimeExample.events.states.at(-1),
      }))
    ).toEqual({ failures: 0, errors: [], state: "connected" });
  });

  test("a prolonged outage keeps retrying at the capped delay without notifications", async ({
    page,
  }) => {
    for (const delay of [1000, 2000, 4000, 8000, 10000]) {
      await page.evaluate(() =>
        window.realtimeExample.sockets.at(-1)!.onerror?.(new Event("error"))
      );
      await page.clock.runFor(delay);
    }
    expect(
      await page.evaluate(() => window.realtimeExample.sockets.length)
    ).toBe(6);
    await page.evaluate(() =>
      window.realtimeExample.sockets.at(-1)!.onerror?.(new Event("error"))
    );
    await page.clock.runFor(60_000);
    expect(
      await page.evaluate(() => ({
        errors: window.realtimeExample.events.errors,
        state: window.realtimeExample.events.states.at(-1),
        requests: window.realtimeExample.events.ticketRequests,
      }))
    ).toEqual({
      errors: [],
      state: "reconnecting",
      requests: 7,
    });
  });

  test("current session expiry still stops immediately without reconnecting", async ({
    page,
  }) => {
    await page.evaluate(() => {
      const fixture = window.realtimeExample;
      fixture.client.stop();
      fixture.connectionTickets.push(() =>
        Promise.reject(fixture.expiredRealtimeSession())
      );
      fixture.client.start();
    });
    await expect
      .poll(() =>
        page.evaluate(() => window.realtimeExample.events.authFailures)
      )
      .toBe(1);
    await page.clock.runFor(60_000);
    expect(
      await page.evaluate(() => window.realtimeExample.events.ticketRequests)
    ).toBe(2);
  });

  test("a temporary ticket failure retries quietly before restoring the connection", async ({
    page,
  }) => {
    await page.evaluate(() => {
      const fixture = window.realtimeExample;
      fixture.sockets[0].open();
      fixture.connectionTickets.push(() =>
        Promise.reject(new Error("Fixture service unavailable"))
      );
      fixture.sockets[0].onerror?.(new Event("error"));
    });
    await page.clock.runFor(1000);
    expect(
      await page.evaluate(() => ({
        errors: window.realtimeExample.events.errors,
        requests: window.realtimeExample.events.ticketRequests,
      }))
    ).toEqual({ errors: [], requests: 2 });
    await page.clock.runFor(2000);
    await page.evaluate(() => window.realtimeExample.sockets[1].open());
    expect(
      await page.evaluate(() => ({
        errors: window.realtimeExample.events.errors,
        state: window.realtimeExample.events.states.at(-1),
      }))
    ).toEqual({ errors: [], state: "connected" });
  });

  test("an obsolete resolved ticket cannot create another socket after restart", async ({
    page,
  }) => {
    await page.evaluate(() => {
      const fixture = window.realtimeExample;
      fixture.client.stop();
      fixture.connectionTickets.push(
        () =>
          new Promise(resolve => {
            (
              window as Window & { resolveOldTicket?: () => void }
            ).resolveOldTicket = () => resolve(fixture.ticket());
          })
      );
      fixture.client.start();
      fixture.client.stop();
      fixture.client.start();
    });
    await expect
      .poll(() => page.evaluate(() => window.realtimeExample.sockets.length))
      .toBe(2);
    await page.evaluate(() => {
      window.realtimeExample.sockets[1].open();
      (
        window as Window & { resolveOldTicket?: () => void }
      ).resolveOldTicket?.();
    });
    expect(
      await page.evaluate(() => window.realtimeExample.sockets.length)
    ).toBe(2);
  });

  test("current protocol errors are not hidden as recoverable network failures", async ({
    page,
  }) => {
    await page.evaluate(() => {
      const socket = window.realtimeExample.sockets[0];
      socket.open();
      socket.message({
        version: 1,
        type: "error",
        code: "unsupported_control_type",
        message: "fixture failure",
      });
    });
    expect(
      await page.evaluate(() => window.realtimeExample.events.errors.length)
    ).toBe(1);
  });

  test("late channel tickets and Blob decoding cannot affect a replacement connection", async ({
    page,
  }) => {
    await page.evaluate(() => {
      const fixture = window.realtimeExample;
      fixture.channelTickets.push(
        () =>
          new Promise((_, reject) => {
            (window as Window & { rejectChannel?: () => void }).rejectChannel =
              () => reject(fixture.expiredRealtimeSession());
          })
      );
      fixture.sockets[0].open();
      fixture.client.registerBlockPackChannel(
        "fixture-block-pack",
        fixture.permission
      );
      const pending = new Blob();
      pending.arrayBuffer = () =>
        new Promise((_, reject) => {
          (window as Window & { rejectBlob?: () => void }).rejectBlob = () =>
            reject(new Error("obsolete Blob failure"));
        });
      fixture.sockets[0].onmessage?.(
        new MessageEvent("message", { data: pending })
      );
      fixture.sockets[0].onerror?.(new Event("error"));
      fixture.client.unregisterBlockPackChannel("fixture-block-pack");
    });
    await page.clock.runFor(1000);
    await page.evaluate(() => {
      window.realtimeExample.sockets[1].open();
      (window as Window & { rejectChannel?: () => void }).rejectChannel?.();
      (window as Window & { rejectBlob?: () => void }).rejectBlob?.();
    });
    expect(
      await page.evaluate(() => ({
        errors: window.realtimeExample.events.errors,
        failures: window.realtimeExample.events.authFailures,
        state: window.realtimeExample.events.states.at(-1),
      }))
    ).toEqual({ errors: [], failures: 0, state: "connected" });
  });

  test("worker outages retry with capped backoff and recover without resetting the channel", async ({
    page,
  }) => {
    await page.evaluate(() => {
      const fixture = window.realtimeExample;
      fixture.channelTickets.push(
        ...Array.from({ length: 10 }, () => async () => fixture.channelTicket())
      );
      fixture.sockets[0].open();
      fixture.client.registerBlockPackChannel(
        fixture.channelTicket().channelId,
        fixture.permission
      );
    });
    await expect
      .poll(() =>
        page.evaluate(() => window.realtimeExample.channelFrames().length)
      )
      .toBe(1);
    for (const delay of [1000, 2000, 4000, 8000, 10000, 10000]) {
      const before = await page.evaluate(() => {
        const fixture = window.realtimeExample;
        const frames = fixture.channelFrames();
        fixture.sockets[0].message({
          version: 1,
          type: "error",
          channelId: fixture.channelTicket().channelId,
          requestId: frames.at(-1).requestId,
          code: "worker_unavailable",
          message: "Worker unavailable",
        });
        return frames.length;
      });
      await page.clock.runFor(delay - 1);
      expect(
        await page.evaluate(() => window.realtimeExample.channelFrames().length)
      ).toBe(before);
      await page.clock.runFor(1);
      await expect
        .poll(() =>
          page.evaluate(() => window.realtimeExample.channelFrames().length)
        )
        .toBe(before + 1);
    }
    await page.evaluate(() => {
      const fixture = window.realtimeExample;
      fixture.sockets[0].message({
        version: 1,
        type: "subscribed",
        requestId: fixture.channelFrames().at(-1).requestId,
        channelType: "BlockPack",
        channelId: fixture.channelTicket().channelId,
        connectorChannelId: 7,
        existing: false,
        documentQuotaPolicyVersion: 1,
        maximumBlockCount: 100,
        participants: [],
      });
      for (const code of ["worker_unavailable", "resync_required"]) {
        fixture.sockets[0].message({
          version: 1,
          type: "error",
          requestId: fixture.channelFrames()[0].requestId,
          channelId: fixture.channelTicket().channelId,
          code,
          message: "Obsolete error",
        });
      }
    });
    await page.clock.runFor(20000);
    expect(
      await page.evaluate(() => {
        const { events, channelFrames, sockets } = window.realtimeExample;
        return {
          frames: channelFrames().length,
          subscriptions: events.subscriptions,
          errors: events.errors,
          channelErrors: events.channelErrors.length,
          status: events.channelStatuses.at(-1),
          sockets: sockets.length,
        };
      })
    ).toEqual({
      frames: 7,
      subscriptions: 1,
      errors: [],
      channelErrors: 6,
      status: "subscribed",
      sockets: 1,
    });
  });

  for (const cleanup of [
    "stop",
    "unregisterBlockPackChannel",
    "resetBlockPackChannel",
  ] as const) {
    test(`worker retry is cancelled by ${cleanup}`, async ({ page }) => {
      await page.evaluate(() => {
        const fixture = window.realtimeExample;
        fixture.channelTickets.push(
          async () => fixture.channelTicket(),
          async () => fixture.channelTicket()
        );
        fixture.sockets[0].open();
        fixture.client.registerBlockPackChannel(
          fixture.channelTicket().channelId,
          fixture.permission
        );
      });
      await expect
        .poll(() =>
          page.evaluate(() => window.realtimeExample.channelFrames().length)
        )
        .toBe(1);
      await page.evaluate(cleanup => {
        const fixture = window.realtimeExample;
        fixture.sockets[0].message({
          version: 1,
          type: "error",
          channelId: fixture.channelTicket().channelId,
          requestId: fixture.channelFrames()[0].requestId,
          code: "worker_unavailable",
          message: "Worker unavailable",
        });
        if (cleanup === "stop") fixture.client.stop();
        else fixture.client[cleanup](fixture.channelTicket().channelId);
      }, cleanup);
      await page.clock.runFor(60000);
      expect(
        await page.evaluate(
          () => window.realtimeExample.events.channelTicketRequests
        )
      ).toBe(1);
    });
  }

  for (const failure of ["temporary", "permission", "session"] as const) {
    test(`worker recovery handles ${failure} channel ticket failures safely`, async ({
      page,
    }) => {
      await page.evaluate(failure => {
        const fixture = window.realtimeExample;
        fixture.channelTickets.push(
          async () => fixture.channelTicket(),
          async () => {
            throw failure === "session"
              ? fixture.expiredRealtimeSession()
              : failure === "permission"
                ? fixture.deniedChannelTicket()
                : new TypeError("Temporary network failure");
          },
          async () => fixture.channelTicket()
        );
        fixture.sockets[0].open();
        fixture.client.registerBlockPackChannel(
          fixture.channelTicket().channelId,
          fixture.permission
        );
      }, failure);
      await expect
        .poll(() =>
          page.evaluate(() => window.realtimeExample.channelFrames().length)
        )
        .toBe(1);
      await page.evaluate(() => {
        const fixture = window.realtimeExample;
        fixture.sockets[0].message({
          version: 1,
          type: "error",
          channelId: fixture.channelTicket().channelId,
          requestId: fixture.channelFrames()[0].requestId,
          code: "worker_unavailable",
          message: "Worker unavailable",
        });
      });
      await page.clock.runFor(1000);
      await expect
        .poll(() =>
          page.evaluate(
            () => window.realtimeExample.events.channelTicketRequests
          )
        )
        .toBe(2);
      await page.clock.runFor(20000);
      const result = await page.evaluate(() => ({
        requests: window.realtimeExample.events.channelTicketRequests,
        errors: window.realtimeExample.events.errors.length,
        authFailures: window.realtimeExample.events.authFailures,
      }));
      expect(result).toEqual(
        failure === "temporary"
          ? { requests: 3, errors: 0, authFailures: 0 }
          : failure === "permission"
            ? { requests: 2, errors: 1, authFailures: 0 }
            : { requests: 2, errors: 0, authFailures: 1 }
      );
    });
  }

  test("root reconnect replaces a pending worker retry with one fresh subscription", async ({
    page,
  }) => {
    await page.evaluate(() => {
      const fixture = window.realtimeExample;
      fixture.channelTickets.push(
        ...Array.from({ length: 3 }, () => async () => fixture.channelTicket())
      );
      fixture.sockets[0].open();
      fixture.client.registerBlockPackChannel(
        fixture.channelTicket().channelId,
        fixture.permission
      );
    });
    await expect
      .poll(() =>
        page.evaluate(() => window.realtimeExample.channelFrames().length)
      )
      .toBe(1);
    await page.evaluate(() => {
      const fixture = window.realtimeExample;
      fixture.sockets[0].message({
        version: 1,
        type: "error",
        channelId: fixture.channelTicket().channelId,
        requestId: fixture.channelFrames()[0].requestId,
        code: "worker_unavailable",
        message: "Worker unavailable",
      });
      fixture.sockets[0].onerror?.(new Event("error"));
    });
    await page.clock.runFor(1000);
    await page.evaluate(() => window.realtimeExample.sockets[1].open());
    await expect
      .poll(() =>
        page.evaluate(() => window.realtimeExample.channelFrames().length)
      )
      .toBe(2);
    await page.clock.runFor(20000);
    expect(
      await page.evaluate(
        () => window.realtimeExample.events.channelTicketRequests
      )
    ).toBe(2);
  });

  test("a genuine resync remains blocked across reconnect until explicitly reset", async ({
    page,
  }) => {
    await page.evaluate(() => {
      const fixture = window.realtimeExample;
      fixture.channelTickets.push(
        ...Array.from({ length: 3 }, () => async () => fixture.channelTicket())
      );
      fixture.sockets[0].open();
      fixture.client.registerBlockPackChannel(
        fixture.channelTicket().channelId,
        fixture.permission
      );
    });
    await expect
      .poll(() =>
        page.evaluate(() => window.realtimeExample.channelFrames().length)
      )
      .toBe(1);
    await page.evaluate(() => {
      const fixture = window.realtimeExample;
      fixture.sockets[0].message({
        version: 1,
        type: "error",
        channelId: fixture.channelTicket().channelId,
        requestId: fixture.channelFrames()[0].requestId,
        code: "resync_required",
        message: "Resync required",
      });
      fixture.sockets[0].onerror?.(new Event("error"));
    });
    await page.clock.runFor(1000);
    await page.evaluate(() => window.realtimeExample.sockets[1].open());
    await page.clock.runFor(60000);
    expect(
      await page.evaluate(
        () => window.realtimeExample.events.channelTicketRequests
      )
    ).toBe(1);
    await page.evaluate(() => {
      const fixture = window.realtimeExample;
      fixture.client.resetBlockPackChannel(fixture.channelTicket().channelId);
      fixture.client.registerBlockPackChannel(
        fixture.channelTicket().channelId,
        fixture.permission
      );
    });
    await expect
      .poll(() =>
        page.evaluate(() => window.realtimeExample.channelFrames().length)
      )
      .toBe(2);
  });

  test("recoverable resubscriptions preserve the live editor, offline edits and silent recovery", async ({
    page,
  }) => {
    const notifications: string[] = [];
    page.on("console", message => {
      if (
        (message.type() === "warning" || message.type() === "error") &&
        /Realtime|resync/i.test(message.text())
      ) {
        notifications.push(message.text());
      }
    });
    await page.route("**/src/api/invokers/realtime.invoker.ts*", route =>
      route.fulfill({
        contentType: "application/javascript",
        body: `export const mutationFnCreateMyRealtimeConnectionTicket = async () => ({ data: window.realtimeExample.ticket() });
        export const mutationFnCreateMyBlockPackChannelTicket = async () => ({ data: window.realtimeExample.channelTicket() });`,
      })
    );
    await page.evaluate(async () => {
      const fixture = window.realtimeExample;
      fixture.client.stop();
      const path = "/test/e2e/realtimeProviderTestSupport.tsx";
      const { mountRealtimeProviderExample } = await import(
        /* @vite-ignore */ path
      );
      window.realtimeProviderExample = mountRealtimeProviderExample(
        fixture.channelTicket()
          .channelId as `${string}-${string}-${string}-${string}-${string}`,
        true
      );
    });
    await expect
      .poll(() => page.evaluate(() => window.realtimeExample.sockets.length))
      .toBe(2);
    await page.evaluate(() => window.realtimeExample.sockets[1].open());
    await expect
      .poll(() =>
        page.evaluate(() => window.realtimeExample.channelFrames().length)
      )
      .toBe(1);
    await page.evaluate(() => {
      const fixture = window.realtimeExample;
      fixture.sockets[1].message({
        version: 1,
        type: "subscribed",
        requestId: fixture.channelFrames().at(-1).requestId,
        channelType: "BlockPack",
        channelId: fixture.channelTicket().channelId,
        connectorChannelId: 1,
        existing: false,
        documentQuotaPolicyVersion: 1,
        maximumBlockCount: 100,
        participants: [],
      });
    });
    await expect(page.locator("[data-editor-state]")).toHaveAttribute(
      "data-editor-state",
      "ready"
    );
    const editorElement = await page
      .locator("[data-editor-state] .ProseMirror")
      .elementHandle();
    expect(editorElement).not.toBeNull();

    for (const [index, code] of [
      "resubscribe_required",
      "channel_backpressure",
    ].entries()) {
      const before = await page.evaluate(
        () => window.realtimeExample.channelFrames().length
      );
      await page.evaluate(
        ({ code, index }) => {
          const fixture = window.realtimeExample;
          fixture.sockets[1].message({
            version: 1,
            type: "error",
            channelId: fixture.channelTicket().channelId,
            connectorChannelId: index + 1,
            code,
            recoverable: true,
            message: "fixture temporary recovery",
          });
        },
        { code, index }
      );
      await expect(page.locator("[data-channel-status]")).toHaveAttribute(
        "data-channel-status",
        "idle"
      );
      await expect(page.locator("[data-editor-state]")).toHaveAttribute(
        "data-editor-state",
        "ready"
      );
      await page
        .locator("[data-editor-state] .ProseMirror")
        .pressSequentially(`offline-${index} `);
      await page.evaluate(async () => {
        await window.realtimeProviderExample
          .getChannel()!
          .provider.snapshotLocalDocument();
      });
      expect(
        await page.evaluate(
          async () =>
            (await window.realtimeProviderExample.getCachedDocument())
              ?.needsFlush
        )
      ).toBe(true);
      await page.clock.runFor(1000);
      await expect
        .poll(() =>
          page.evaluate(() => window.realtimeExample.channelFrames().length)
        )
        .toBe(before + 1);
      await page.evaluate(index => {
        const fixture = window.realtimeExample;
        fixture.sockets[1].message({
          version: 1,
          type: "subscribed",
          requestId: fixture.channelFrames().at(-1).requestId,
          channelType: "BlockPack",
          channelId: fixture.channelTicket().channelId,
          connectorChannelId: index + 2,
          existing: false,
          documentQuotaPolicyVersion: 1,
          maximumBlockCount: 100,
          participants: [],
        });
      }, index);
      await expect(page.locator("[data-channel-status]")).toHaveAttribute(
        "data-channel-status",
        "subscribed"
      );
    }

    await page.evaluate(() => {
      const socket = window.realtimeExample.sockets[1];
      socket.deferClose = true;
      socket.failBinarySend = true;
    });
    await page
      .locator("[data-editor-state] .ProseMirror")
      .pressSequentially("send-failure ");
    await page.evaluate(async () => {
      await window.realtimeProviderExample
        .getChannel()!
        .provider.flushPendingDocumentUpdatesNow();
    });
    await page.clock.runFor(1000);
    await expect
      .poll(() => page.evaluate(() => window.realtimeExample.sockets.length))
      .toBe(3);
    expect(
      await page.evaluate(() => window.realtimeExample.sockets[1].readyState)
    ).toBe(2);
    await page.evaluate(() => window.realtimeExample.sockets[2].open());
    await expect
      .poll(() =>
        page.evaluate(() => window.realtimeExample.channelFrames().length)
      )
      .toBe(4);
    await page.evaluate(() => {
      const fixture = window.realtimeExample;
      fixture.sockets[2].message({
        version: 1,
        type: "subscribed",
        requestId: fixture.channelFrames().at(-1).requestId,
        channelType: "BlockPack",
        channelId: fixture.channelTicket().channelId,
        connectorChannelId: 1,
        existing: false,
        documentQuotaPolicyVersion: 1,
        maximumBlockCount: 100,
        participants: [],
      });
    });
    await expect(page.locator("[data-editor-state]")).toHaveAttribute(
      "data-editor-state",
      "ready"
    );
    expect(
      await editorElement!.evaluate(
        element =>
          element === document.querySelector("[data-editor-state] .ProseMirror")
      )
    ).toBe(true);
    await expect(page.locator("[data-editor-state]")).toContainText(
      "offline-0 offline-1 send-failure"
    );
    expect(
      await page.evaluate(() => ({
        editable:
          window.realtimeProviderExample.getBlockEditor()!.editor.isEditable,
        replayed: window.realtimeExample.sockets[2].sent.some(
          frame => frame instanceof ArrayBuffer
        ),
      }))
    ).toEqual({ editable: true, replayed: true });
    expect(
      await page.evaluate(() => window.realtimeProviderExample.getNavigations())
    ).toBe(0);
    await expect(page.locator("[data-slot='toast']")).toHaveCount(0);
    expect(notifications).toEqual([]);
    await page.evaluate(() => window.realtimeProviderExample.unmount());
  });

  test("provider keeps the document and pending edits during worker recovery", async ({
    page,
  }) => {
    await page.route("**/src/api/invokers/realtime.invoker.ts*", route =>
      route.fulfill({
        contentType: "application/javascript",
        body: `export const mutationFnCreateMyRealtimeConnectionTicket = async () => ({ data: window.realtimeExample.ticket() });
        export const mutationFnCreateMyBlockPackChannelTicket = async () => ({ data: window.realtimeExample.channelTicket() });`,
      })
    );
    await page.evaluate(async () => {
      const fixture = window.realtimeExample;
      fixture.client.stop();
      const path = "/test/e2e/realtimeProviderTestSupport.tsx";
      const { mountRealtimeProviderExample } = await import(
        /* @vite-ignore */ path
      );
      window.realtimeProviderExample = mountRealtimeProviderExample(
        fixture.channelTicket()
          .channelId as `${string}-${string}-${string}-${string}-${string}`
      );
    });
    await expect
      .poll(() => page.evaluate(() => window.realtimeExample.sockets.length))
      .toBe(2);
    await page.evaluate(() => window.realtimeExample.sockets[1].open());
    await expect
      .poll(() =>
        page.evaluate(() => window.realtimeExample.channelFrames().length)
      )
      .toBe(1);
    await page.evaluate(() => {
      const fixture = window.realtimeExample;
      const channel = window.realtimeProviderExample.getChannel()!;
      channel.doc.getMap("recovery").set("draft", "preserved");
      (
        window as Window & { originalRecoveryDoc?: unknown }
      ).originalRecoveryDoc = channel.doc;
      fixture.sockets[1].message({
        version: 1,
        type: "error",
        channelId: fixture.channelTicket().channelId,
        requestId: fixture.channelFrames()[0].requestId,
        code: "worker_unavailable",
        message: "Worker unavailable",
      });
    });
    await expect(page.locator("[data-channel-status]")).toHaveAttribute(
      "data-channel-status",
      "idle"
    );
    expect(
      await page.evaluate(() => {
        const channel = window.realtimeProviderExample.getChannel()!;
        return {
          error: channel.lifecycleErrorCode,
          draft: channel.doc.getMap("recovery").get("draft"),
          pending: channel.provider.hasUnconfirmedLocalChanges(),
        };
      })
    ).toEqual({ error: null, draft: "preserved", pending: true });
    await page.clock.runFor(1000);
    await expect
      .poll(() =>
        page.evaluate(() => window.realtimeExample.channelFrames().length)
      )
      .toBe(2);
    await page.evaluate(() => {
      const fixture = window.realtimeExample;
      fixture.sockets[1].message({
        version: 1,
        type: "subscribed",
        requestId: fixture.channelFrames().at(-1).requestId,
        channelType: "BlockPack",
        channelId: fixture.channelTicket().channelId,
        connectorChannelId: 8,
        existing: false,
        documentQuotaPolicyVersion: 1,
        maximumBlockCount: 100,
        participants: [],
      });
    });
    await expect(page.locator("[data-channel-status]")).toHaveAttribute(
      "data-channel-status",
      "subscribed"
    );
    expect(
      await page.evaluate(() => {
        const channel = window.realtimeProviderExample.getChannel()!;
        return {
          sameDocument:
            channel.doc ===
            (window as Window & { originalRecoveryDoc?: unknown })
              .originalRecoveryDoc,
          draft: channel.doc.getMap("recovery").get("draft"),
          sentUpdates: window.realtimeExample.sockets[1].sent.some(
            frame => frame instanceof ArrayBuffer
          ),
        };
      })
    ).toEqual({ sameDocument: true, draft: "preserved", sentUpdates: true });
    await page.evaluate(() => {
      const fixture = window.realtimeExample;
      fixture.sockets[1].message({
        version: 1,
        type: "error",
        channelId: fixture.channelTicket().channelId,
        connectorChannelId: 8,
        code: "resync_required",
        message: "Explicit resync required",
      });
    });
    await expect(page.locator("[data-channel-status]")).toHaveAttribute(
      "data-channel-status",
      "error"
    );
    expect(
      await page.evaluate(
        () => window.realtimeProviderExample.getChannel()!.lifecycleErrorCode
      )
    ).toBe("resync_required");
    await page.clock.runFor(20000);
    expect(
      await page.evaluate(() => window.realtimeExample.channelFrames().length)
    ).toBe(2);
    await page.evaluate(() => window.realtimeProviderExample.unmount());
  });

  test("user data refresh does not recreate the provider socket but identity changes do", async ({
    page,
  }) => {
    let ticketRequests = 0;
    await page.route("**/_serverFn/**", () => {
      ticketRequests++;
    });
    await page.evaluate(async () => {
      window.realtimeExample.client.stop();
      const path = "/test/e2e/realtimeProviderTestSupport.tsx";
      const { mountRealtimeProviderExample } = await import(
        /* @vite-ignore */ path
      );
      window.realtimeProviderExample = mountRealtimeProviderExample();
    });
    await expect.poll(() => ticketRequests).toBe(1);
    await page.evaluate(() =>
      window.realtimeProviderExample.updateUser("fixture-user")
    );
    await expect(page.locator("[data-realtime-revision]")).toHaveAttribute(
      "data-realtime-revision",
      "1"
    );
    expect(ticketRequests).toBe(1);
    await page.evaluate(() =>
      window.realtimeProviderExample.updateUser("another-fixture-user")
    );
    await expect.poll(() => ticketRequests).toBe(2);
    await page.evaluate(() => window.realtimeProviderExample.updateUser(null));
    await page.evaluate(() => window.realtimeProviderExample.unmount());
    expect(ticketRequests).toBe(2);
  });
});

test("browser WebSocket transport stays live while idle and recovers from lost pong replies", async ({
  page,
}) => {
  test.skip(process.env.E2E_PRODUCTION === "true", "Uses Vite source imports");
  let connections = 0;
  let pings = 0;
  let reply = true;
  await page.routeWebSocket("**/fixture-realtime", socket => {
    connections++;
    const connection = connections;
    socket.onMessage(message => {
      const frame = JSON.parse(String(message));
      if (frame.type !== "ping") return;
      pings++;
      if (reply || connection > 1) {
        socket.send(
          JSON.stringify({
            version: 1,
            type: "pong",
            requestId: frame.requestId,
          })
        );
      }
    });
    socket.send(
      JSON.stringify({
        version: 1,
        type: "ready",
        connectionId: `native-${connection}`,
        resubscribeRequired: true,
      })
    );
  });
  await page.goto("/document");
  await page.waitForLoadState("networkidle");
  await page.clock.install();
  await page.evaluate(async () => {
    const browserWebSocket = window.WebSocket;
    const path = "/test/e2e/realtimeClientTestSupport.ts";
    const { createRealtimeExample } = await import(/* @vite-ignore */ path);
    window.realtimeExample = createRealtimeExample(browserWebSocket);
    window.realtimeExample.client.start();
  });
  await expect.poll(() => connections).toBe(1);
  await expect
    .poll(() =>
      page.evaluate(() => window.realtimeExample.events.states.at(-1))
    )
    .toBe("connected");
  for (let interval = 1; interval <= 3; interval++) {
    await page.clock.runFor(30_000);
    await expect.poll(() => pings).toBe(interval + 1);
    await expect
      .poll(() =>
        page.evaluate(() => window.realtimeExample.events.states.at(-1))
      )
      .toBe("connected");
  }
  expect(connections).toBe(1);
  reply = false;
  await page.clock.runFor(30_000);
  await expect.poll(() => pings).toBe(5);
  await page.clock.runFor(11_000);
  await expect.poll(() => connections).toBe(2);
  await expect
    .poll(() =>
      page.evaluate(() => window.realtimeExample.events.states.at(-1))
    )
    .toBe("connected");
  expect(
    await page.evaluate(() => ({
      errors: window.realtimeExample.events.errors,
      reconnects: window.realtimeExample.events.reconnects,
    }))
  ).toEqual({ errors: [], reconnects: 1 });
  await page.evaluate(() => window.realtimeExample.client.stop());
});
