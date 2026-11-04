import path from "node:path";
import { build } from "esbuild";
import { chromium, type Browser, type Page } from "playwright";

const fixture = `
import React, { useContext } from 'react';
import { createRoot } from 'react-dom/client';
import { ModalProvider, ModalContext } from '@/providers/ModalProvider';
window.renamed = [];
function EntryPoints() {
  const modal = useContext(ModalContext);
  return <>{['shelf', 'routine'].map(target => <button key={target} onClick={() => modal.open('RenameDialog', {
    dialogHeader: 'Rename ' + target,
    dialogDescription: 'Change the name', currentName: target + ' original',
    onRename: async name => { window.renamed.push({ target, name }); }, onCancel: () => {},
  })}>Rename {target}</button>)}</>;
}
createRoot(document.getElementById('root')).render(<ModalProvider><EntryPoints /></ModalProvider>);
`;

let browser: Browser;
let page: Page;
let script: string;
beforeAll(async () => {
  const result = await build({
    stdin: { contents: fixture, loader: "tsx", resolveDir: process.cwd() },
    bundle: true,
    write: false,
    platform: "browser",
    jsx: "automatic",
    define: { "process.env.NODE_ENV": '"development"' },
    tsconfig: path.resolve("apps/web/tsconfig.json"),
    plugins: [
      {
        name: "rename-dialog-boundaries",
        setup(builder) {
          builder.onResolve({ filter: /^@\/components\/dialogs\// }, args =>
            args.path.includes("/RenameDialog/")
              ? undefined
              : { path: args.path, namespace: "unused-dialog" }
          );
          builder.onLoad({ filter: /.*/, namespace: "unused-dialog" }, () => ({
            contents: "export default () => null;",
            loader: "tsx",
          }));
          builder.onResolve({ filter: /^@\/hooks\/useTranslation$/ }, () => ({
            path: "translation",
            namespace: "rename-test",
          }));
          builder.onLoad({ filter: /.*/, namespace: "rename-test" }, () => ({
            contents: "export const useTranslation = () => ({t: key => key});",
          }));
        },
      },
    ],
  });
  script = result.outputFiles[0].text;
  browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL });
}, 30_000);
beforeEach(async () => {
  page = await browser.newPage();
  await page.setContent('<div id="root"></div>');
  await page.addScriptTag({ content: script });
});
afterEach(async () => {
  await page?.close();
});
afterAll(async () => {
  await browser?.close();
});

test("shelf and routine entry points share the modal owner and retain their own values", async () => {
  for (const target of ["shelf", "routine"]) {
    await page
      .getByRole("button", { name: `Rename ${target}`, exact: true })
      .click();
    const input = page.getByRole("dialog").getByRole("textbox");
    await input.waitFor();
    expect(await input.inputValue()).toBe(`${target} original`);
    await input.fill(`${target} renamed`);
    await page
      .getByRole("button", { name: "workspace.menu.rename", exact: true })
      .click();
    await page.getByRole("dialog").waitFor({ state: "hidden" });
  }
  expect(
    await page.evaluate(
      () => (window as unknown as { renamed: unknown[] }).renamed
    )
  ).toEqual([
    { target: "shelf", name: "shelf renamed" },
    { target: "routine", name: "routine renamed" },
  ]);
});
