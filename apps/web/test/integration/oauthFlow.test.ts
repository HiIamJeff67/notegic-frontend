import path from "node:path";
import {
  type Browser,
  expect as browserExpect,
  chromium,
  type Page,
} from "@playwright/test";
import { build } from "esbuild";

const fixture = `
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import AccountModificationTab from '@/pages/app/setting/account/tabs/AccountModificationTab';
import BindingTab from '@/pages/app/setting/account/tabs/BindingTab';
import SecurityTab from '@/pages/app/setting/account/tabs/SecurityTab';
import OAuthRedirectPage from '@/pages/auth/redirect/OAuthRedirectPage';
import { NotegicAPIError, NotegicException } from '@shared/api/exceptions';
import { AuthCodeProvider } from '@/providers/AuthCodeProvider';
import { OAuthProvider } from '@/providers/OAuthProvider';
import { LoadingProvider } from '@/providers/LoadingProvider';
window.events = { navigations: [], pushes: [], replacements: [], requests: [], errors: [], fetched: 0, cleared: 0, authCodesSent: 0 };
window.callbackSearch = '';
window.pathname = '/';
window.turnstileRequired = false;
window.rejectRequest = false;
window.rejectReason = '';
window.routePending = false;
window.googleBound = false;
window.registeredAuthProviderType = "Email";
window.passwordConfigured = true;
window.backupEmail = null;
window.phoneNumber = null;
window.emailVerified = false;
window.githubBound = false;
window.xBound = false;
window.oauthFallbackProviders = [];
window.accountQueryError = false;
window.accountDataAvailable = true;
window.verifyFallbackEmail = false;
window.router = {
  forceNavigate: url => window.events.navigations.push(url),
  push: url => window.events.pushes.push(url),
  replace: async url => {
    window.events.replacements.push(url);
    window.pathname = '/' + url.split(/[?#]/, 1)[0];
    window.dispatchEvent(new Event('fixture-route-status'));
    if (!window.navigationReady) return;
    window.routePending = true;
    window.dispatchEvent(new Event('fixture-route-status'));
    await window.navigationReady;
    window.routePending = false;
    window.dispatchEvent(new Event('fixture-route-status'));
  },
};
window.user = { userData: { email: 'account@example.test' }, fetchUserData: async () => { window.events.fetched++; } };
window.mutator = action => ({ mutateAsync: async request => {
  window.events.requests.push({ action, request, pending: sessionStorage.getItem('notegic_PendingOAuthState') });
  await window.oauthRequestReady;
  if (window.rejectReason) throw new NotegicAPIError(new NotegicException({
    reason: window.rejectReason, domain: 'Auth', operation: 'OAuth',
    message: 'Fixture diagnostic detail', retryable: false,
  }, 409));
  if (window.rejectRequest) throw new Error('Fixture rejection');
  if (action.endsWith('-unbind')) {
    return { data: window.verifyFallbackEmail && !request.body.fallbackEmailCode
      ? { verificationRequired: true, fallbackProvider: "X" }
      : { updatedAt: new Date() } };
  }
} });
const root = createRoot(document.getElementById('root'));
const queryClient = new QueryClient();
let revision = 0;
window.mount = (surface, remount = true) => {
  if (remount) {
    revision++;
    window.pathname = surface.startsWith('redirect')
      ? '/redirect/' + (surface.split('-')[1] ?? 'google')
      : '/';
  }
  root.render(<React.StrictMode><QueryClientProvider client={queryClient}><AuthCodeProvider><LoadingProvider><OAuthProvider>
  {surface === 'login' ? <LoginPage /> :
   surface === 'register' ? <RegisterPage /> :
   surface === 'binding' ? <BindingTab layout="panel" /> :
   surface === 'security' ? <SecurityTab layout="panel" /> :
   surface === 'account-modification' ? <AccountModificationTab layout="panel" onPanelClose={() => {}} /> :
   <OAuthRedirectPage key={revision} provider={surface === 'redirect-github' ? 'github' : surface === 'redirect-x' ? 'x' : surface === 'redirect-apple' ? 'apple' : 'google'} />}
</OAuthProvider></LoadingProvider></AuthCodeProvider></QueryClientProvider></React.StrictMode>);
};
window.renderDestinationLocation = () => {
  const callbackSearch = window.callbackSearch;
  window.callbackSearch = '';
  flushSync(() => window.mount('redirect', false));
  window.callbackSearch = callbackSearch;
};
`;

const mocks: Record<string, string> = {
  "@/hooks/useTranslation": `const t = (key, options) => {
    if (key === 'settingsPage.account.binding.currentBackupEmail') return 'Current backup email: ' + options.email;
    if (key === 'settingsPage.account.binding.currentPhoneNumber') return 'Current phone number: ' + options.phone;
    if (key === 'settingsPage.account.modification.currentEmail') return 'Current email: ' + options.email;
    if (key === 'settingsPage.account.security.enterCodeForEmail') return 'Send a verification code to ' + options.email;
    return key.includes('.') ? key : options?.defaultValue ?? key;
  };
     export const useTranslation = () => ({ t });`,
  "@shared/lib/toast/toast":
    "export default { error: message => window.events.errors.push(message), success: () => {} };",
  "@/hooks": `export const useAppRouter = () => window.router;
    export const useUser = () => window.user;
    export const useStationRoutine = () => ({ refresh: async () => {} });
    export { useLoading } from "@/hooks/useLoading";`,
  "@/hooks/useTheme":
    "export const useTheme = () => ({ currentTheme: { isDark: false } });",
  "@/hooks/useLocalPreferences":
    "export const useLocalPreferences = () => ({ startPath: 'app/dashboard' });",
  "@/components/commons/CloudflareTurnstile/CloudflareTurnstile":
    "export default () => null;",
  "@/components/commons/Article/Article":
    "export { default as ArticleSettingItem } from '@/components/commons/Article/ArticleSettingItem';",
  "@/api/hooks/auth.hook": `import { useMutation } from '@tanstack/react-query';
    export const useLogin = () => window.mutator('password-login');
    export const useValidateEmail = () => window.mutator('validate-email');
    export const useDeleteMe = () => window.mutator('delete-account');
    export const useForgetPassword = () => window.mutator('change-password');
    export const useResetEmail = () => window.mutator('change-email');
    export const useResetMe = () => window.mutator('reset-account');
    export const useSendAuthCode = () => useMutation({ mutationFn: async () => {
      window.events.authCodesSent++;
      await window.authCodeRequestReady;
      const updatedAt = new Date();
      return { data: { updatedAt, blockAuthCodeUntil: new Date(updatedAt.getTime() + 60000) } };
    } });
    export const useRegister = () => window.mutator('password-register');
    export const useLoginViaGoogle = () => window.mutator('login');
    export const useRegisterViaGoogle = () => window.mutator('register');
    export const useLoginViaGithub = () => window.mutator('github-login');
    export const useRegisterViaGithub = () => window.mutator('github-register');
    export const useLoginViaX = () => window.mutator('x-login');
    export const useRegisterViaX = () => window.mutator('x-register');`,
  "@/api/hooks/userAccount.hook": `export const useUpdateMyAccount = () => window.mutator('update-account');
    export const useBindGoogleAccount = () => window.mutator('binding');
    export const useBindGithubAccount = () => window.mutator('github-binding');
    export const usePrepareOAuthOperation = () => ({ mutateAsync: async ({ body }) => {
      if (body.authCode !== "123456") throw new Error("missing email code");
      return { data: {
        state: Array.from(crypto.getRandomValues(new Uint8Array(32)), x => x.toString(16).padStart(2, "0")).join(""),
        codeChallenge: "C".repeat(43)
      }};
    } });
    export const useGetMyAccount = () => ({
      isPending: false,
      isError: window.accountQueryError,
      refetch: async () => {
        window.accountQueryError = false;
        window.accountDataAvailable = true;
        window.mount("binding", false);
      },
      data: window.accountDataAvailable ? { data: { registeredAuthProviderType: window.registeredAuthProviderType, passwordConfigured: window.passwordConfigured, emailVerified: window.emailVerified, backupEmail: window.backupEmail, phoneNumber: window.phoneNumber, countryCode: window.countryCode, googleBound: window.googleBound, githubBound: window.githubBound, xBound: window.xBound, oauthFallbackProviders: window.oauthFallbackProviders } } : undefined });
    export const useUnbindGoogleAccount = () => window.mutator('google-unbind');
    export const useUnbindGithubAccount = () => window.mutator('github-unbind');
    export const useBindXAccount = () => window.mutator('x-binding');
    export const useUnbindXAccount = () => window.mutator('x-unbind');`,
  "@/api/turnstile": `export const isTurnstileEnabled = () => window.turnstileRequired;
    export const getTurnstileToken = () => null;
    export const setTurnstileToken = () => {};
    export const clearTurnstileToken = () => { window.events.cleared++; };`,
  "@/api/clientHeaders":
    "export const getClientRequestHeaders = () => ({}); export const getClientMutationHeaders = () => ({});",
  "@tanstack/react-router": `import { useSyncExternalStore } from 'react';
    const subscribe = notify => {
      window.addEventListener('fixture-route-status', notify);
      return () => window.removeEventListener('fixture-route-status', notify);
    };
    export const useRouterState = ({ select }) =>
      useSyncExternalStore(subscribe, () => select({ status: window.routePending ? 'pending' : 'idle', location: { pathname: window.pathname } }));
    export const useLocation = () => ({ searchStr: window.callbackSearch });`,
};

async function verifyOAuthDialog(page: Page, confirm: string) {
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("textbox").fill("123456");
  await dialog.getByRole("button", { name: confirm }).click();
}

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
          DEV: true,
          VITE_OAUTH_GOOGLE_REDIRECT_URL: "http://localhost/redirect/google",
          VITE_OAUTH_GOOGLE_CLIENT_ID: "fixture-client",
          VITE_OAUTH_GITHUB_CLIENT_ID: "fixture-github-client",
          VITE_OAUTH_GITHUB_REDIRECT_URL: "http://localhost/redirect/github",
          VITE_OAUTH_X_CLIENT_ID: "fixture-x-client",
          VITE_OAUTH_X_REDIRECT_URL: "http://127.0.0.1:6779/redirect/x",
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
    await page.route("http://localhost:6779/**", route =>
      route.fulfill({
        contentType: "text/html",
        body: '<div id="root"></div>',
      })
    );
    await page.goto("http://localhost:6779/");
    await page.clock.setFixedTime(new Date("2026-10-31T00:00:00Z"));
    await page.addScriptTag({ content: script });
  });
  afterEach(async () => {
    await page?.close();
  });
  afterAll(async () => {
    await browser?.close();
  });

  test.each([
    "login",
    "register",
  ] as const)("%s shows icon-only OAuth buttons in provider order", async action => {
    await page.evaluate(action => (window as any).mount(action), action);
    const suffix = action === "login" ? "Login" : "Register";
    const buttons = page.getByRole("button", {
      name: /^(workspace\.pages\.(google|github|x)(Login|Register)|Apple|Discord|Microsoft)$/,
    });
    await browserExpect(buttons).toHaveCount(6);
    expect(
      await buttons.evaluateAll(elements =>
        elements.map(button => [
          button.getAttribute("aria-label"),
          button.textContent,
        ])
      )
    ).toEqual([
      [`workspace.pages.google${suffix}`, ""],
      ["Apple", ""],
      [`workspace.pages.x${suffix}`, ""],
      ["Discord", ""],
      [`workspace.pages.github${suffix}`, ""],
      ["Microsoft", ""],
    ]);
    await browserExpect(buttons.nth(2)).toBeEnabled();
    for (const name of ["Apple", "Discord", "Microsoft"]) {
      await browserExpect(page.getByRole("button", { name })).toBeDisabled();
    }
  });

  test("protects the only registered OAuth provider and allows an email account to disconnect it", async () => {
    await page.evaluate(() => {
      (window as any).googleBound = true;
      (window as any).registeredAuthProviderType = "Google";
      (window as any).mount("binding");
    });
    const disconnect = page.getByRole("button", {
      name: "settingsPage.account.binding.unbind",
    });
    await browserExpect(disconnect).toBeDisabled();
    await browserExpect(disconnect.locator("..")).toHaveAttribute(
      "title",
      "settingsPage.account.binding.oauthFallbackHint"
    );

    await page.evaluate(() => {
      (window as any).registeredAuthProviderType = "Email";
      (window as any).passwordConfigured = false;
      (window as any).mount("binding");
    });
    await browserExpect(disconnect).toBeDisabled();
    await browserExpect(disconnect.locator("..")).toHaveAttribute(
      "title",
      "server.error.OAuthPasswordSetupRequired"
    );

    await page.evaluate(() => {
      (window as any).passwordConfigured = true;
      (window as any).mount("binding");
    });
    await browserExpect(disconnect).toBeEnabled();
    await disconnect.click();
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("button", { name: "common.cancel" }).click();
    await browserExpect(dialog).toBeHidden();
    expect(await page.evaluate(() => (window as any).events.requests)).toEqual(
      []
    );
  });

  test("opens Backup email when an older account response omits the field", async () => {
    await page.evaluate(() => {
      (window as any).backupEmail = undefined;
      (window as any).mount("binding");
    });
    const row = page
      .getByText("settingsPage.account.binding.backupEmail", { exact: true })
      .locator("../..");
    await row
      .getByRole("button", { name: "settingsPage.account.binding.set" })
      .click();
    const dialog = page.getByRole("dialog", {
      name: "settingsPage.account.binding.backupEmail",
    });
    await browserExpect(dialog).toBeVisible();
    await browserExpect(
      dialog.getByText("Send a verification code to account@example.test")
    ).toBeVisible();
    await browserExpect(row.getByText(/Current backup email:/)).toHaveCount(0);
    expect(
      await page.evaluate(() => (window as any).events.authCodesSent)
    ).toBe(0);
  });

  test("displays current contact details with enabled Change actions", async () => {
    await page.evaluate(() => {
      (window as any).backupEmail = "backup@example.test";
      (window as any).phoneNumber = "912345678";
      (window as any).countryCode = "+886";
      (window as any).mount("binding");
    });
    for (const label of [
      "settingsPage.account.binding.backupEmail",
      "settingsPage.account.binding.phoneNumber",
    ]) {
      const row = page.getByText(label, { exact: true }).locator("../..");
      await browserExpect(
        row.getByRole("button", {
          name: "settingsPage.account.modification.changeAction",
        })
      ).toBeEnabled();
    }
    await browserExpect(
      page
        .getByText("Current backup email: backup@example.test", { exact: true })
        .locator("..")
    ).toHaveText(
      /backupEmailDescription\s*Current backup email: backup@example\.test/
    );
    await browserExpect(
      page
        .getByText("Current phone number: +886 912345678", { exact: true })
        .locator("..")
    ).toHaveText(
      /phoneNumberDescription\s*Current phone number: \+886 912345678/
    );
  });

  test("prefers account verification status and keeps Verified visible when that field is unavailable", async () => {
    await page.evaluate(() => {
      (window as any).user.userData.role = "Normal";
      (window as any).mount("security");
    });
    await browserExpect(
      page.getByRole("button", {
        name: "settingsPage.account.security.verify",
        exact: true,
      })
    ).toBeEnabled();
    await page.evaluate(() => {
      (window as any).emailVerified = true;
      (window as any).mount("security");
    });
    await browserExpect(
      page.getByRole("button", {
        name: "settingsPage.account.security.verified",
        exact: true,
      })
    ).toBeDisabled();
    await page.evaluate(() => {
      (window as any).emailVerified = undefined;
      (window as any).mount("security");
    });
    await browserExpect(
      page.getByRole("button", {
        name: "settingsPage.account.security.verified",
        exact: true,
      })
    ).toBeDisabled();
  });

  test("shows the signed-in email below Change email", async () => {
    await page.evaluate(() => (window as any).mount("account-modification"));
    await browserExpect(
      page
        .getByText("Current email: account@example.test", { exact: true })
        .locator("..")
    ).toHaveText(
      /changeEmailDialogDescription\s*Current email: account@example\.test/
    );
  });

  test("sends only on request and keeps one cooldown across routes and verification dialogs", async () => {
    await page.evaluate(() => (window as any).mount("binding"));
    const dialog = page.getByRole("dialog");
    const send = dialog.getByRole("button", {
      name: "common.send",
      exact: true,
    });
    const countdown = dialog.getByRole("button", {
      name: "settingsPage.account.security.resendIn",
    });
    const cancel = dialog.getByRole("button", { name: "common.cancel" });
    const backup = page
      .getByText("settingsPage.account.binding.backupEmail", { exact: true })
      .locator("../..");
    const connectBackup = backup.getByRole("button", {
      name: "settingsPage.account.binding.set",
    });

    await connectBackup.click();
    await cancel.click();
    expect(
      await page.evaluate(() => (window as any).events.authCodesSent)
    ).toBe(0);

    await connectBackup.click();
    await page.evaluate(() => {
      const fixture = window as any;
      fixture.authCodeRequestReady = new Promise(resolve => {
        fixture.finishAuthCodeRequest = resolve;
      });
    });
    await send.evaluate((button: HTMLButtonElement) => {
      button.click();
      button.click();
    });
    await browserExpect(send).toBeDisabled();
    expect(
      await page.evaluate(() => (window as any).events.authCodesSent)
    ).toBe(1);
    await page.evaluate(() => (window as any).finishAuthCodeRequest());
    await browserExpect(countdown).toBeDisabled();
    await page.clock.setFixedTime(new Date("2026-10-31T00:01:00Z"));
    await browserExpect(
      dialog.getByRole("button", {
        name: "settingsPage.account.security.resendCode",
      })
    ).toBeEnabled();
    await dialog
      .getByRole("button", {
        name: "settingsPage.account.security.resendCode",
      })
      .click();
    await browserExpect(countdown).toBeDisabled();
    await cancel.click();

    await page.evaluate(() => (window as any).mount("login"));
    await browserExpect(
      page.getByRole("button", { name: "workspace.pages.googleLogin" })
    ).toBeVisible();
    await page.evaluate(() => (window as any).mount("binding"));
    await page
      .getByText("settingsPage.account.binding.phoneNumber", { exact: true })
      .locator("../..")
      .getByRole("button", { name: "settingsPage.account.binding.set" })
      .click();
    await browserExpect(countdown).toBeDisabled();
    expect(
      await page.evaluate(() => (window as any).events.authCodesSent)
    ).toBe(2);
    await page.clock.setFixedTime(new Date("2026-10-31T00:02:00Z"));
    await browserExpect(send).toBeEnabled();
  });

  test("keeps binding controls visible offline and disables an open verification form", async () => {
    await page.evaluate(() => {
      (window as any).googleBound = true;
      (window as any).mount("binding");
    });
    const disconnect = page.getByRole("button", {
      name: "settingsPage.account.binding.unbind",
    });
    await page.context().setOffline(true);
    await browserExpect(disconnect).toBeDisabled();
    await browserExpect(disconnect.locator("..")).toHaveAttribute(
      "title",
      "workspace.pages.accountOffline"
    );
    await page.context().setOffline(false);
    await disconnect.click();

    const dialog = page.getByRole("dialog");
    const code = dialog.getByRole("textbox");
    await code.fill("123456");
    await page.context().setOffline(true);
    await browserExpect(code).toBeDisabled();
    await browserExpect(
      dialog.getByRole("button", {
        name: "settingsPage.account.binding.unbind",
      })
    ).toBeDisabled();
    await page.context().setOffline(false);
    await browserExpect(code).toBeEnabled();
    await browserExpect(code).toHaveValue("123456");
  });

  test("keeps cached binding actions enabled when the refresh fails", async () => {
    await page.evaluate(() => {
      (window as any).xBound = true;
      (window as any).accountQueryError = true;
      (window as any).mount("binding");
    });
    const disconnect = page.getByRole("button", {
      name: "settingsPage.account.binding.unbind",
    });
    await browserExpect(disconnect).toBeEnabled();
    await browserExpect(
      page.getByRole("button", {
        name: "settingsPage.account.binding.oauthRetryStatus",
      })
    ).toBeHidden();
  });

  test("offers retry when binding status could not be loaded", async () => {
    await page.evaluate(() => {
      (window as any).xBound = true;
      (window as any).accountQueryError = true;
      (window as any).accountDataAvailable = false;
      (window as any).mount("binding");
    });
    const disconnect = page.getByRole("button", {
      name: "settingsPage.account.binding.unbind",
    });
    await browserExpect(disconnect).toBeHidden();
    const retry = page.getByRole("button", {
      name: "settingsPage.account.binding.oauthRetryStatus",
    });
    await retry.click();
    await browserExpect(retry).toBeHidden();
    await browserExpect(disconnect).toBeEnabled();
  });

  test.each([
    false,
    true,
  ])("disconnects Google without another OAuth redirect (second mailbox proof: %p)", async verifyEmail => {
    await page.evaluate(verifyEmail => {
      (window as any).googleBound = true;
      (window as any).xBound = true;
      (window as any).registeredAuthProviderType = "Google";
      (window as any).oauthFallbackProviders = ["X"];
      (window as any).verifyFallbackEmail = verifyEmail;
      (window as any).mount("binding");
    }, verifyEmail);
    const disconnect = "settingsPage.account.binding.unbind";
    await page
      .getByRole("group", { name: "settingsPage.account.binding.gmail" })
      .getByRole("button", { name: disconnect })
      .click();
    const dialog = page.getByRole("dialog", {
      name: "settingsPage.account.binding.googleUnbind",
    });
    await browserExpect(dialog.getByRole("combobox")).toHaveCount(0);
    await browserExpect(dialog.getByRole("textbox")).toBeVisible();
    expect(
      await page.evaluate(() => (window as any).events.authCodesSent)
    ).toBe(0);
    await dialog
      .getByRole("button", { name: "common.send", exact: true })
      .click();
    expect(
      await page.evaluate(() => (window as any).events.authCodesSent)
    ).toBe(1);
    const countdown = dialog.getByRole("button", {
      name: "settingsPage.account.security.resendIn",
    });
    await browserExpect(countdown).toBeDisabled();
    await browserExpect(dialog.getByRole("textbox")).toBeEmpty();
    await verifyOAuthDialog(page, disconnect);
    if (verifyEmail) {
      await browserExpect(
        dialog.getByText(
          "settingsPage.account.binding.oauthVerifyFallbackEmail"
        )
      ).toBeVisible();
      await browserExpect(countdown).toHaveCount(0);
      await browserExpect(dialog.getByRole("textbox")).toHaveValue("");
      await dialog.getByRole("textbox").fill("654321");
      await dialog.getByRole("button", { name: disconnect }).click();
    }
    await browserExpect(dialog).toBeHidden();
    const events = await page.evaluate(() => (window as any).events);
    expect(events.navigations).toEqual([]);
    expect(events.fetched).toBe(1);
    expect(events.requests.map((entry: any) => entry.request.body)).toEqual([
      { authCode: "123456", fallbackProvider: "X" },
      ...(verifyEmail
        ? [{ fallbackEmailCode: "654321", fallbackProvider: "X" }]
        : []),
    ]);
    expect(events.requests.every((entry: any) => entry.pending === null)).toBe(
      true
    );
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
      if (action === "binding") {
        await verifyOAuthDialog(page, "settingsPage.account.binding.bind");
      }
      await browserExpect
        .poll(() =>
          page.evaluate(() => (window as any).events.navigations.length)
        )
        .toBe(1);
      const first = await page.evaluate(() =>
        JSON.parse(sessionStorage.getItem("notegic_PendingOAuthState")!)
      );
      if (action === "binding") await page.keyboard.press("Escape");
      await button.click();
      if (action === "binding") {
        await verifyOAuthDialog(page, "settingsPage.account.binding.bind");
      }
      await browserExpect
        .poll(() =>
          page.evaluate(() => (window as any).events.navigations.length)
        )
        .toBe(2);
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
      expect(new URL(navigation).searchParams.get("prompt")).toBe(
        "select_account consent"
      );
      expect(new URL(navigation).searchParams.get("state")).toBe(pending.state);
      expect(
        new URL(navigation).searchParams.get("code_challenge_method")
      ).toBe("S256");
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
        request: {
          header: {},
          body: {
            authorizationCode: "fixture-code",
            ...(action === "binding"
              ? { state: pending.state }
              : { codeVerifier: pending.codeVerifier }),
          },
        },
        pending: null,
      });
      const destination =
        action === "binding" ? "app/setting/account#binding" : "app/dashboard";
      expect(events.fetched).toBe(action === "binding" ? 0 : 1);
      expect(events.replacements).toEqual([destination]);
      expect(events.errors).toEqual([]);
      const duringNavigation = await page.evaluate(() => {
        (window as any).renderDestinationLocation();
        return (window as any).events;
      });
      expect(duringNavigation.errors).toEqual([]);
      expect(duringNavigation.replacements).toEqual([destination]);
      await page.evaluate(() => (window as any).mount("redirect"));
      await browserExpect
        .poll(() => page.evaluate(() => (window as any).events.replacements))
        .toEqual([destination]);
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
      if (action === "binding") {
        await verifyOAuthDialog(page, "settingsPage.account.binding.bind");
      }
      await browserExpect
        .poll(() => page.evaluate(() => (window as any).events.errors.length))
        .toBe(1);
      const events = await page.evaluate(() => (window as any).events);
      expect(events.navigations).toEqual([]);
      expect(events.errors).toEqual(["workspace.pages.oauthError.storage"]);
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
  ])("rejects %s callbacks without an API request", async failure => {
    await page.evaluate(failure => {
      const now = Date.now();
      const state = "a".repeat(64);
      const pending = {
        state,
        action: failure === "malformed-action" ? "delete" : "login",
        codeVerifier: "b".repeat(64),
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
      .poll(() => page.evaluate(() => (window as any).events.replacements))
      .toEqual(["login?oauthFailed=true"]);
    const events = await page.evaluate(() => (window as any).events);
    expect(events.requests).toEqual([]);
    expect(events.pushes).toEqual([]);
    expect(events.errors).toEqual([
      failure === "missing-code"
        ? "workspace.pages.oauthError.missingCode"
        : failure === "provider-error"
          ? "workspace.pages.oauthError.cancelled"
          : failure === "turnstile"
            ? "auth.turnstileRequired"
            : "workspace.pages.oauthError.restart",
    ]);
    const stored = await page.evaluate(() =>
      sessionStorage.getItem("notegic_PendingOAuthState")
    );
    if (failure === "mismatch" || failure === "missing-state") {
      expect(JSON.parse(stored!).state).toBe("a".repeat(64));
    } else {
      expect(stored).toBeNull();
    }
  });

  test.each([
    ["XAccountNotLinked", "login"],
    ["XEmailRequired", "register"],
    ["XCredentialAlreadyBound", "binding"],
  ])("returns to the appropriate page and shows the translated %s error", async (reason, action) => {
    await page.evaluate(
      ({ reason, action }) => {
        const state = "a".repeat(64);
        sessionStorage.setItem(
          "notegic_PendingOAuthState",
          JSON.stringify({
            provider: "x",
            state,
            action,
            codeVerifier: "b".repeat(64),
            createdAt: Date.now(),
          })
        );
        (window as any).rejectReason = reason;
        (window as any).callbackSearch = "?code=fixture-code&state=" + state;
        (window as any).mount("redirect-x");
      },
      { reason, action }
    );
    await browserExpect
      .poll(() => page.evaluate(() => (window as any).events.replacements))
      .toEqual([
        action === "binding"
          ? "app/setting/account#binding"
          : "login?oauthFailed=true",
      ]);
    const events = await page.evaluate(() => (window as any).events);
    expect(events.pushes).toEqual([]);
    expect(events.errors).toEqual([`server.error.${reason}`]);
  });

  test("accepts the TTL boundary and does not retry a rejected API request", async () => {
    await page.evaluate(() => {
      const state = "a".repeat(64);
      sessionStorage.setItem(
        "notegic_PendingOAuthState",
        JSON.stringify({
          state,
          action: "login",
          codeVerifier: "b".repeat(64),
          createdAt: Date.now() - 300_000,
        })
      );
      (window as any).rejectRequest = true;
      (window as any).callbackSearch = "?code=fixture-code&state=" + state;
      (window as any).mount("redirect");
    });
    await browserExpect
      .poll(() => page.evaluate(() => (window as any).events.replacements))
      .toEqual(["login?oauthFailed=true"]);
    const events = await page.evaluate(() => (window as any).events);
    expect(events.errors).toEqual(["workspace.pages.oauthError.failed"]);
    expect(events.requests).toHaveLength(1);
    expect(events.requests[0].pending).toBeNull();
    expect(events.cleared).toBe(1);
    expect(events.fetched).toBe(0);
  });
  for (const provider of ["github", "x"] as const) {
    for (const action of ["login", "register", "binding"] as const) {
      test(`${provider} ${action} binds PKCE and consumes state before the API request`, async () => {
        await page.evaluate(action => (window as any).mount(action), action);
        const button =
          action === "binding"
            ? page
                .getByText(`settingsPage.account.binding.${provider}`, {
                  exact: true,
                })
                .locator("..")
                .locator("..")
                .getByRole("button")
            : page.getByRole("button", {
                name:
                  action === "login"
                    ? `workspace.pages.${provider}Login`
                    : `workspace.pages.${provider}Register`,
                exact: true,
              });
        await button.click();
        if (action === "binding") {
          await verifyOAuthDialog(page, "settingsPage.account.binding.bind");
        }
        await browserExpect
          .poll(() =>
            page.evaluate(() => (window as any).events.navigations.length)
          )
          .toBe(1);
        const pending = await page.evaluate(() =>
          JSON.parse(sessionStorage.getItem("notegic_PendingOAuthState")!)
        );
        const url = new URL(
          await page.evaluate(() => (window as any).events.navigations[0])
        );
        expect(url.origin + url.pathname).toBe(
          provider === "github"
            ? "https://github.com/login/oauth/authorize"
            : "https://x.com/i/oauth2/authorize"
        );
        expect(url.searchParams.get("scope")).toBe(
          provider === "github"
            ? "user:email"
            : "tweet.read users.read users.email"
        );
        expect(url.searchParams.get("prompt")).toBe(
          provider === "github" ? "select_account" : null
        );
        if (provider === "x")
          expect(url.searchParams.get("response_type")).toBe("code");
        expect(url.searchParams.get("redirect_uri")).toBe(
          provider === "x"
            ? "http://127.0.0.1:6779/redirect/x"
            : "http://localhost/redirect/github"
        );
        expect(url.searchParams.get("code_challenge_method")).toBe("S256");
        expect(pending.provider).toBe(provider);
        if (action === "binding") {
          expect(pending.codeVerifier).toBeUndefined();
          expect(url.searchParams.get("code_challenge")).toBe("C".repeat(43));
        } else {
          expect(pending.codeVerifier).toMatch(/^[a-f0-9]{64}$/);
          const expectedChallenge = await page.evaluate(async verifier => {
            const digest = await crypto.subtle.digest(
              "SHA-256",
              new TextEncoder().encode(verifier)
            );
            return btoa(String.fromCharCode(...new Uint8Array(digest)))
              .replace(/\+/g, "-")
              .replace(/\//g, "_")
              .replace(/=+$/, "");
          }, pending.codeVerifier);
          expect(url.searchParams.get("code_challenge")).toBe(
            expectedChallenge
          );
        }
        expect(url.searchParams.get("state")).toBe(
          provider === "x" ? `localhost.${pending.state}` : pending.state
        );
        expect(url.searchParams.has("code_verifier")).toBe(false);
        await page.evaluate(
          ({ state, provider }) => {
            (window as any).callbackSearch =
              "?code=fixture-code&state=" + state;
            (window as any).mount(`redirect-${provider}`);
          },
          { state: pending.state, provider }
        );
        await browserExpect
          .poll(() =>
            page.evaluate(() => (window as any).events.requests.length)
          )
          .toBe(1);
        const events = await page.evaluate(() => (window as any).events);
        expect(events.requests[0]).toEqual({
          action: `${provider}-${action}`,
          request: {
            header: {},
            body: {
              authorizationCode: "fixture-code",
              ...(action === "binding"
                ? { state: pending.state }
                : { codeVerifier: pending.codeVerifier }),
            },
          },
          pending: null,
        });
        const destination =
          action === "binding"
            ? "app/setting/account#binding"
            : "app/dashboard";
        expect(events.fetched).toBe(action === "binding" ? 0 : 1);
        expect(events.replacements).toEqual([destination]);
        await page.evaluate(
          provider => (window as any).mount(`redirect-${provider}`),
          provider
        );
        await browserExpect
          .poll(() => page.evaluate(() => (window as any).events.replacements))
          .toEqual([destination]);
        expect(
          await page.evaluate(() => (window as any).events.requests.length)
        ).toBe(1);
      });
    }

    test(`disconnecting ${provider} submits the account verification code`, async () => {
      await page.evaluate(provider => {
        (window as any)[`${provider}Bound`] = true;
        (window as any).mount("binding");
      }, provider);
      await page
        .getByRole("button", {
          name: "settingsPage.account.binding.unbind",
        })
        .click();
      const dialog = page.getByRole("dialog");
      await dialog.getByRole("textbox").fill("123456");
      await dialog
        .getByRole("button", {
          name: "settingsPage.account.binding.unbind",
        })
        .click();
      await browserExpect
        .poll(() => page.evaluate(() => (window as any).events.requests))
        .toEqual([
          {
            action: `${provider}-unbind`,
            request: { header: {}, body: { authCode: "123456" } },
            pending: null,
          },
        ]);
    });
  }

  test("an X unlink rejection explains how to retry and keeps the dialog open", async () => {
    await page.evaluate(() => {
      (window as any).xBound = true;
      (window as any).rejectReason = "InvalidRequest";
      (window as any).mount("binding");
    });
    const unbind = "settingsPage.account.binding.unbind";
    await page.getByRole("button", { name: unbind }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("textbox").fill("123456");
    await dialog.getByRole("button", { name: unbind }).click();
    await browserExpect
      .poll(() => page.evaluate(() => (window as any).events.errors))
      .toEqual(["settingsPage.account.binding.oauthUnbindRejected"]);
    await browserExpect(dialog).toBeVisible();
  });

  test.each([
    "success",
    "cancel",
  ] as const)("X %s keeps one animated cover mounted until navigation finishes", async result => {
    await page.addStyleTag({
      path: "apps/web/src/global/styles/loading.css",
    });
    await page.evaluate(result => {
      const fixture = window as any;
      fixture.navigationReady = new Promise(resolve => {
        fixture.finishNavigation = resolve;
      });
      fixture.oauthRequestReady = new Promise(resolve => {
        fixture.finishOAuthRequest = resolve;
      });

      const state = "a".repeat(64);
      sessionStorage.setItem(
        "notegic_PendingOAuthState",
        JSON.stringify({
          provider: "x",
          state,
          action: "login",
          codeVerifier: "b".repeat(64),
          createdAt: Date.now(),
        })
      );
      fixture.callbackSearch =
        `?state=${state}&` +
        (result === "success" ? "code=fixture-code" : "error=access_denied");
      fixture.mount("redirect-x");
    }, result);
    const cover = page.getByRole("status");
    await browserExpect(cover).toHaveCount(1);
    await browserExpect(cover).toHaveText(
      result === "success" ? "workspace.pages.validatingX" : "common.loading"
    );
    await cover.evaluate(element => {
      const logo = element.querySelector("svg")!;
      (window as any).initialCover = {
        element,
        logo,
        animation: logo
          .querySelector(".loading-logo-front")!
          .getAnimations()[0],
      };
    });

    if (result === "success") {
      await page.evaluate(() => (window as any).finishOAuthRequest());
    }
    await browserExpect
      .poll(() => page.evaluate(() => (window as any).routePending))
      .toBe(true);
    await browserExpect(cover).toHaveCount(1);
    await browserExpect(cover).toHaveText(
      result === "success"
        ? "workspace.pages.redirectingToDashboard"
        : "common.loading"
    );
    expect(
      await cover.evaluate(element => {
        const original = (window as any).initialCover;
        return (
          element === original.element &&
          element.querySelector("svg") === original.logo &&
          original.animation !== undefined &&
          element.querySelector(".loading-logo-front")!.getAnimations()[0] ===
            original.animation
        );
      })
    ).toBe(true);

    await page.evaluate(() => (window as any).finishNavigation());
    await browserExpect(cover).toHaveCount(0);
    expect(
      await page.evaluate(() => (window as any).events.replacements)
    ).toEqual([
      result === "success" ? "app/dashboard" : "login?oauthFailed=true",
    ]);
  });

  test("X loopback callback returns to the tab's localhost session before binding", async () => {
    await page.evaluate(() => (window as any).mount("binding"));
    await page
      .getByText("settingsPage.account.binding.x", { exact: true })
      .locator("..")
      .locator("..")
      .getByRole("button")
      .click();
    await verifyOAuthDialog(page, "settingsPage.account.binding.bind");
    await browserExpect
      .poll(() =>
        page.evaluate(() => (window as any).events.navigations.length)
      )
      .toBe(1);
    const authorizeURL = await page.evaluate(
      () => (window as any).events.navigations[0]
    );
    const authorization = new URL(authorizeURL);
    const callback = new URL(authorization.searchParams.get("redirect_uri")!);
    const providerState = authorization.searchParams.get("state")!;
    callback.searchParams.set("state", providerState);
    callback.searchParams.set("code", "fixture-code");
    await page.route("http://127.0.0.1:6779/**", route =>
      route.fulfill({ contentType: "text/html", body: '<div id="root"></div>' })
    );
    await page.goto(callback.toString());
    await page.addScriptTag({ content: script });
    await page.evaluate(() => {
      (window as any).callbackSearch = location.search;
      (window as any).mount("redirect-x");
    });
    await page.waitForURL(
      url => url.hostname === "localhost" && url.pathname === "/redirect/x"
    );
    expect(new URL(page.url()).searchParams.get("state")).toBe(
      providerState.slice("localhost.".length)
    );
    await page.addScriptTag({ content: script });
    await page.evaluate(() => {
      (window as any).callbackSearch = location.search;
      (window as any).mount("redirect-x");
    });
    await browserExpect
      .poll(() => page.evaluate(() => (window as any).events.replacements))
      .toEqual(["app/setting/account#binding"]);
    const events = await page.evaluate(() => (window as any).events);
    expect(events.errors).toEqual([]);
    expect(events.requests).toHaveLength(1);
    expect(events.requests[0].action).toBe("x-binding");
  });

  test.each([
    "google-state",
    "x-state",
    "missing-verifier",
    "expired",
    "provider-error",
    "mismatch",
  ])("GitHub rejects %s before exchange", async failure => {
    await page.evaluate(failure => {
      const state = "a".repeat(64);
      sessionStorage.setItem(
        "notegic_PendingOAuthState",
        JSON.stringify({
          state,
          action: "login",
          provider:
            failure === "google-state"
              ? "google"
              : failure === "x-state"
                ? "x"
                : "github",
          codeVerifier:
            failure === "missing-verifier" ? undefined : "b".repeat(64),
          createdAt: Date.now() - (failure === "expired" ? 300001 : 0),
        })
      );
      (window as any).callbackSearch =
        "?code=fixture-code&state=" +
        (failure === "mismatch" ? "c".repeat(64) : state) +
        (failure === "provider-error" ? "&error=access_denied" : "");
      (window as any).mount("redirect-github");
    }, failure);
    await browserExpect
      .poll(() => page.evaluate(() => (window as any).events.replacements))
      .toEqual(["login?oauthFailed=true"]);
    expect(await page.evaluate(() => (window as any).events.requests)).toEqual(
      []
    );
    const stored = await page.evaluate(() =>
      sessionStorage.getItem("notegic_PendingOAuthState")
    );
    if (["google-state", "x-state", "mismatch"].includes(failure)) {
      expect(JSON.parse(stored!).state).toBe("a".repeat(64));
    } else {
      expect(stored).toBeNull();
    }
  });

  test.each([
    "apple",
  ] as const)("reserved %s callback returns to login without an API request", async provider => {
    await page.evaluate(provider => {
      const state = "a".repeat(64);
      sessionStorage.setItem(
        "notegic_PendingOAuthState",
        JSON.stringify({
          provider: "google",
          state,
          action: "login",
          codeVerifier: "b".repeat(64),
          createdAt: Date.now(),
        })
      );
      (window as any).callbackSearch = "?code=fixture-code&state=" + state;
      (window as any).mount(`redirect-${provider}`);
    }, provider);
    await browserExpect
      .poll(() => page.evaluate(() => (window as any).events.replacements))
      .toEqual(["login?oauthFailed=true"]);
    const events = await page.evaluate(() => (window as any).events);
    expect(events.requests).toEqual([]);
    expect(events.pushes).toEqual([]);
    expect(events.errors).toEqual(["workspace.pages.appleRedirectUnavailable"]);
    const stored = await page.evaluate(() =>
      sessionStorage.getItem("notegic_PendingOAuthState")
    );
    expect(JSON.parse(stored!).provider).toBe("google");
  });
});
