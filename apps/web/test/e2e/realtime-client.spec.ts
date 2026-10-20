import { expect, test } from "@playwright/test";
import type { RealtimeExample } from "./realtime-client-test-support";
import type { mountRealtimeProviderExample } from "./realtime-provider-test-support";

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
    await page.clock.install();
    await page.evaluate(async () => {
      const path = "/test/e2e/realtime-client-test-support.ts";
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

  test("retry exhaustion reports one failure instead of a toast on every attempt", async ({
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
      errors: ["Error: Realtime connection retry limit reached."],
      state: "error",
      requests: 6,
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

  test("user data refresh does not recreate the provider socket but identity changes do", async ({
    page,
  }) => {
    let ticketRequests = 0;
    await page.route("**/_serverFn/**", () => {
      ticketRequests++;
    });
    await page.evaluate(async () => {
      window.realtimeExample.client.stop();
      const path = "/test/e2e/realtime-provider-test-support.tsx";
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
    const path = "/test/e2e/realtime-client-test-support.ts";
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
