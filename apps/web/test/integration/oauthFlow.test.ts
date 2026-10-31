import path from "node:path";
import {
  type Browser,
  expect as browserExpect,
  chromium,
  type Page,
} from "@playwright/test";
import { build } from "esbuild";

const fixture = `
import React from 'react';
import { createRoot } from 'react-dom/client';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import BindingTab from '@/pages/app/setting/account/tabs/BindingTab';
import GoogleRedirectPage from '@/pages/auth/redirect/GoogleRedirectPage';
window.events = { navigations: [], pushes: [], requests: [], errors: [], fetched: 0, cleared: 0 };
window.callbackSearch = '';
window.turnstileRequired = false;
window.rejectRequest = false;
window.router = {
  forceNavigate: url => window.events.navigations.push(url),
  push: url => window.events.pushes.push(url),
};
window.user = { fetchUserData: async () => { window.events.fetched++; } };
window.mutator = action => ({ mutateAsync: async request => {
  window.events.requests.push({ action, request, pending: sessionStorage.getItem('notegic_PendingOAuthState') });
  if (window.rejectRequest) throw new Error('Fixture rejection');
} });
const root = createRoot(document.getElementById('root'));
let revision = 0;
window.mount = surface => root.render(<React.StrictMode>
  {surface === 'login' ? <LoginPage /> :
   surface === 'register' ? <RegisterPage /> :
   surface === 'binding' ? <BindingTab layout="panel" sendAuthCodeTimeCounter={0}
     setSendAuthCodeTimeCounter={() => {}} isSendAuthCodePending={false}
     handleSendAuthCode={() => {}} onPanelClose={() => {}} /> :
   <GoogleRedirectPage key={++revision} />}
</React.StrictMode>);
`;

const mocks: Record<string, string> = {
  "@shared/i18n/useTranslation":
    "const t = key => key; export const useTranslation = () => ({ t });",
  "@shared/i18n/error": "export const tError = () => 'Fixture error';",
  "@shared/lib/toast/toast":
    "export default { error: message => window.events.errors.push(message) };",
  "@/hooks": `export const useAppRouter = () => window.router;
    export const useUser = () => window.user;
    const loading = { startAsyncTransactionLoading: operation => operation() };
    export const useLoading = () => loading;`,
  "@/hooks/useTheme":
    "export const useTheme = () => ({ currentTheme: { isDark: false } });",
  "@/hooks/useLoading":
    "export const useRegisterLoadingDependencies = () => {};",
  "@/hooks/useLocalPreferences":
    "export const useLocalPreferences = () => ({ preferences: {} });",
  "@/providers/LocalPreferencesProvider":
    "export const getPreferredStartPath = () => 'app/dashboard';",
  "@/components/covers/LoadingCover/LoadingCover": "export default () => null;",
  "@/components/commons/CloudflareTurnstile/CloudflareTurnstile":
    "export default () => null;",
  "@/components/commons/Article/Article":
    "export { default as ArticleSettingItem } from '@/components/commons/Article/ArticleSettingItem';",
  "@/api/hooks/auth.hook": `export const useLogin = () => window.mutator('password-login');
    export const useRegister = () => window.mutator('password-register');
    export const useLoginViaGoogle = () => window.mutator('login');
    export const useRegisterViaGoogle = () => window.mutator('register');`,
  "@/api/hooks/userAccount.hook": `export const useUpdateMyAccount = () => window.mutator('update-account');
    export const useBindGoogleAccount = () => window.mutator('binding');`,
  "@/api/turnstile": `export const isTurnstileEnabled = () => window.turnstileRequired;
    export const getTurnstileToken = () => null;
    export const setTurnstileToken = () => {};
    export const clearTurnstileToken = () => { window.events.cleared++; };`,
  "@/api/clientHeaders":
    "export const getClientRequestHeaders = () => ({}); export const getClientMutationHeaders = () => ({});",
  "@tanstack/react-router":
    "export const useLocation = () => ({ search: window.callbackSearch });",
};

describe("OAuth state in the real entry and callback components", () => {
  let browser: Browser;
  let page: Page;
  let script: string;

  beforeAll(async () => {
    const result = await build({
      stdin: { contents: fixture, resolveDir: process.cwd(), loader: "tsx" },
      bundle: true,
      write: false,
      platform: "browser",
      jsx: "automatic",
      loader: { ".css": "empty" },
      define: {
        "process.env.NODE_ENV": '"development"',
        "import.meta.env": JSON.stringify({
          VITE_OAUTH_GOOGLE_REDIRECT_URL: "http://localhost/redirect/google",
          VITE_OAUTH_GOOGLE_CLIENT_ID: "fixture-client",
        }),
      },
      tsconfig: path.resolve("apps/web/tsconfig.json"),
      plugins: [
        {
          name: "oauth-flow-boundaries",
          setup(builder) {
            builder.onResolve({ filter: /.*/ }, args =>
              args.path in mocks
                ? { path: args.path, namespace: "oauth-test" }
                : undefined
            );
            builder.onLoad({ filter: /.*/, namespace: "oauth-test" }, args => ({
              contents: mocks[args.path],
              loader: "tsx",
              resolveDir: process.cwd(),
            }));
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
    await page.route("http://oauth.example.test/**", route =>
      route.fulfill({
        contentType: "text/html",
        body: '<div id="root"></div>',
      })
    );
    await page.goto("http://oauth.example.test/");
    await page.clock.setFixedTime(new Date("2026-10-31T00:00:00Z"));
    await page.addScriptTag({ content: script });
  });
  afterEach(async () => {
    await page?.close();
  });
  afterAll(async () => {
    await browser?.close();
  });

  for (const action of ["login", "register", "binding"] as const) {
    test(`${action} stores unpredictable state before navigating and consumes it once`, async () => {
      await page.evaluate(action => (window as any).mount(action), action);
      const button =
        action === "binding"
          ? page
              .getByText("settingsPage.account.binding.gmail", { exact: true })
              .locator("..")
              .locator("..")
              .getByRole("button")
          : page.getByRole("button", {
              name:
                action === "login"
                  ? "workspace.pages.googleLogin"
                  : "workspace.pages.googleRegister",
              exact: true,
            });
      await button.click();
      const first = await page.evaluate(() =>
        JSON.parse(sessionStorage.getItem("notegic_PendingOAuthState")!)
      );
      await button.click();
      const pending = await page.evaluate(() =>
        JSON.parse(sessionStorage.getItem("notegic_PendingOAuthState")!)
      );
      expect(pending.state).toMatch(/^[0-9a-f]{64}$/);
      expect(pending.state).not.toBe(first.state);
      expect(pending.action).toBe(action);
      expect(pending.createdAt).toBe(Date.parse("2026-10-31T00:00:00Z"));
      const navigation = await page.evaluate(() =>
        (window as any).events.navigations.at(-1)
      );
      expect(new URL(navigation).hostname).toBe("accounts.google.com");
      expect(new URL(navigation).searchParams.get("state")).toBe(pending.state);
      await page.evaluate(state => {
        (window as any).callbackSearch = "?code=fixture-code&state=" + state;
        (window as any).mount("redirect");
      }, pending.state);
      await browserExpect
        .poll(() => page.evaluate(() => (window as any).events.requests.length))
        .toBe(1);
      const events = await page.evaluate(() => (window as any).events);
      expect(events.requests[0]).toEqual({
        action,
        request: { header: {}, body: { authorizationCode: "fixture-code" } },
        pending: null,
      });
      expect(events.fetched).toBe(1);
      expect(events.pushes).toEqual(["app/dashboard"]);
      expect(events.errors).toEqual([]);
      await page.evaluate(() => (window as any).mount("redirect"));
      await browserExpect
        .poll(() => page.evaluate(() => (window as any).events.errors.length))
        .toBe(1);
      expect(
        await page.evaluate(() => (window as any).events.requests.length)
      ).toBe(1);
    });

    test(`${action} stays on the page when session storage cannot be written`, async () => {
      await page.evaluate(action => {
        Storage.prototype.setItem = () => {
          throw new DOMException(
            "Fixture storage denied",
            "QuotaExceededError"
          );
        };
        (window as any).mount(action);
      }, action);
      const button =
        action === "binding"
          ? page
              .getByText("settingsPage.account.binding.gmail", { exact: true })
              .locator("..")
              .locator("..")
              .getByRole("button")
          : page.getByRole("button", {
              name:
                action === "login"
                  ? "workspace.pages.googleLogin"
                  : "workspace.pages.googleRegister",
              exact: true,
            });
      await button.click();
      const events = await page.evaluate(() => (window as any).events);
      expect(events.navigations).toEqual([]);
      expect(events.errors).toEqual(["error.encounterUnknownError"]);
    });
  }

  test.each([
    "missing",
    "mismatch",
    "expired",
    "future",
    "malformed-action",
    "malformed-json",
    "missing-state",
    "missing-code",
    "provider-error",
    "turnstile",
  ])("rejects and consumes %s callbacks without an API request", async failure => {
    await page.evaluate(failure => {
      const now = Date.now();
      const state = "a".repeat(64);
      const pending = {
        state,
        action: failure === "malformed-action" ? "delete" : "login",
        createdAt:
          failure === "expired"
            ? now - 300_001
            : failure === "future"
              ? now + 1
              : now,
      };
      if (failure !== "missing")
        sessionStorage.setItem(
          "notegic_PendingOAuthState",
          failure === "malformed-json" ? "{invalid" : JSON.stringify(pending)
        );
      const params = new URLSearchParams();
      if (failure !== "missing-state")
        params.set("state", failure === "mismatch" ? "b".repeat(64) : state);
      if (failure !== "missing-code") params.set("code", "fixture-code");
      if (failure === "provider-error") params.set("error", "access_denied");
      (window as any).turnstileRequired = failure === "turnstile";
      (window as any).callbackSearch = "?" + params;
      (window as any).mount("redirect");
    }, failure);
    await browserExpect
      .poll(() => page.evaluate(() => (window as any).events.errors.length))
      .toBe(1);
    const events = await page.evaluate(() => (window as any).events);
    expect(events.requests).toEqual([]);
    expect(events.pushes[0]).toContain("redirect/error?");
    expect(
      await page.evaluate(() =>
        sessionStorage.getItem("notegic_PendingOAuthState")
      )
    ).toBeNull();
  });

  test("accepts the TTL boundary and does not retry a rejected API request", async () => {
    await page.evaluate(() => {
      const state = "a".repeat(64);
      sessionStorage.setItem(
        "notegic_PendingOAuthState",
        JSON.stringify({
          state,
          action: "login",
          createdAt: Date.now() - 300_000,
        })
      );
      (window as any).rejectRequest = true;
      (window as any).callbackSearch = "?code=fixture-code&state=" + state;
      (window as any).mount("redirect");
    });
    await browserExpect
      .poll(() => page.evaluate(() => (window as any).events.errors.length))
      .toBe(1);
    const events = await page.evaluate(() => (window as any).events);
    expect(events.requests).toHaveLength(1);
    expect(events.requests[0].pending).toBeNull();
    expect(events.cleared).toBe(1);
    expect(events.fetched).toBe(0);
  });
});
