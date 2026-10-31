import path from "node:path";
import { type Browser, chromium, type Page } from "@playwright/test";
import { build } from "esbuild";

const fixture = `
import React, { useContext } from 'react';
import { createRoot } from 'react-dom/client';
import { UserContext, UserProvider } from '@/providers/UserProvider';
import { NotegicAPIError, NotegicException } from '@shared/api/exceptions';
window.state = { logouts: 0, clears: 0, messages: [], redirects: [], path: '/app/dashboard' };
window.rejectSession = () => new NotegicAPIError(new NotegicException({
  reason: 'InvalidCSRFToken', domain: 'Token', operation: 'ValidateCSRFToken',
  message: 'Invalid token', retryable: false,
}, 401));
function Probe() {
  window.user = useContext(UserContext);
  window.state.userId = window.user.userData?.publicId ?? null;
  return null;
}
createRoot(document.getElementById('root')).render(
  <React.StrictMode><UserProvider><Probe /></UserProvider></React.StrictMode>
);
`;

const mocks: Record<string, string> = {
  "@/hooks": `const router = {
    getCurrentPath: () => window.state.path,
    isSamePath: (left, right) => '/' + left.replace(/^\\//, '') === '/' + right.replace(/^\\//, ''),
    push: path => { const target = '/' + path.replace(/^\\//, ''); window.state.redirects.push(target); window.state.path = target; },
  };
  export const useAppRouterActions = () => router;
  export const useLoading = () => ({ startAsyncTransactionLoading: task => task() });
  export const useNetwork = () => ({ isOnline: true });`,
  "@/api/clientHeaders": `export const getClientRequestHeaders = () => ({});`,
  "@/api/hooks/auth.hook": `const mutator = { mutateAsync: async () => {
    window.state.logouts++;
    if (window.state.reentrant) window.rejectSession();
    if (window.state.deferred) await new Promise(resolve => { window.finishLogout = resolve; });
    if (window.state.failLogout) throw new Error('Fixture logout failure');
  } }; export const useLogout = () => mutator;`,
  "@/api/hooks/user.hook": `const querier = { fetch: async () => ({ data: { publicId: 'new-session' } }) };
    export const useGetUserData = () => querier; export const useGetMe = () => querier;`,
  "@/api/hooks/userInfo.hook": `export const useGetMyInfo = () => ({ fetch: async () => ({ data: {} }) });`,
  "@/api/hooks/userAccount.hook": `export const useGetMyAccount = () => ({ fetch: async () => ({ data: {} }) });`,
  "@/api/hooks/userQuota.hook": `const querier = { fetch: async () => ({ data: {} }) }; export const useGetMyQuota = () => querier;`,
  "@shared/i18n/useTranslation": `const t = key => key; export const useTranslation = () => ({ t });`,
  "@shared/lib/toast/toast": `export default { error: message => window.state.messages.push(message) };`,
  "@/providers/MaterialAttachmentCacheProvider": `export const clearMaterialAttachmentCache = async () => { window.state.clears++; };`,
};

describe("UserProvider session expiry", () => {
  let browser: Browser;
  let page: Page;
  let script: string;

  beforeAll(async () => {
    const result = await build({
      stdin: { contents: fixture, resolveDir: process.cwd(), loader: "tsx" },
      bundle: true,
      write: false,
      platform: "browser",
      define: { "process.env.NODE_ENV": '"development"' },
      tsconfig: path.resolve("apps/web/tsconfig.json"),
      plugins: [
        {
          name: "session-test-boundaries",
          setup(builder) {
            builder.onResolve({ filter: /.*/ }, args =>
              args.path in mocks
                ? { path: args.path, namespace: "session-test" }
                : undefined
            );
            builder.onLoad(
              { filter: /.*/, namespace: "session-test" },
              args => ({
                contents: mocks[args.path],
                loader: "js",
              })
            );
          },
        },
      ],
    });
    script = result.outputFiles[0].text;
    browser = await chromium.launch({
      channel: process.env.PLAYWRIGHT_CHANNEL,
    });
  }, 30_000);

  beforeEach(async () => {
    page = await browser.newPage();
    await page.setContent('<div id="root"></div>');
    await page.addScriptTag({ content: script });
    await page.waitForFunction("window.user !== undefined");
  });

  afterEach(async () => {
    await page?.close();
  });
  afterAll(async () => {
    await browser?.close();
  });

  test.each([
    false,
    true,
  ])("coalesces concurrent and late failures, including failed logout=%s", async failLogout => {
    await page.evaluate(`state.deferred = true; state.failLogout = ${failLogout};
      for (let index = 0; index < 5; index++) rejectSession();`);
    await page.waitForFunction(
      "state.logouts === 1 && typeof finishLogout === 'function'"
    );
    await page.evaluate("finishLogout()");
    await page.waitForFunction("state.redirects.length > 0");
    await page.evaluate("rejectSession(); rejectSession()");
    expect(
      await page.evaluate(
        "({logouts: state.logouts, clears: state.clears, messages: state.messages, redirects: state.redirects})"
      )
    ).toEqual({
      logouts: 1,
      clears: 1,
      messages: ["workspace.notifications.sessionExpired"],
      redirects: ["/login"],
    });
  });

  test("does not recursively log out when logout itself reports an authentication failure", async () => {
    await page.evaluate("state.reentrant = true; rejectSession()");
    await page.waitForFunction("state.redirects.length > 0");
    expect(
      await page.evaluate(
        "[state.logouts, state.messages.length, state.redirects.length]"
      )
    ).toEqual([1, 1, 1]);
  });

  test("handles another expiry after successful reauthentication", async () => {
    await page.evaluate("rejectSession()");
    await page.waitForFunction("state.redirects.length === 1");
    await page.evaluate("user.fetchUserData()");
    await page.waitForFunction("state.userId === 'new-session'");
    await page.evaluate("state.path = '/app/dashboard'; rejectSession()");
    await page.waitForFunction("state.redirects.length === 2");
    expect(
      await page.evaluate("[state.logouts, state.messages.length]")
    ).toEqual([2, 2]);
  });

  test.each([
    "/",
    "/login",
  ])("does not show session-ended prompts on %s", async currentPath => {
    await page.evaluate(
      `state.path = ${JSON.stringify(currentPath)}; rejectSession()`
    );
    await page.waitForFunction("state.clears === 1");
    expect(
      await page.evaluate(
        "[state.logouts, state.messages.length, state.redirects.length]"
      )
    ).toEqual([1, 0, 0]);
  });
});
