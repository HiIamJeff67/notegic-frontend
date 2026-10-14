import { createInstance } from "i18next";
import { renderToStaticMarkup } from "react-dom/server";
import { I18nextProvider } from "react-i18next";
import { resources } from "./index";
import { useTranslation } from "./useTranslation";

test("uses the supplied i18n context without importing the Web runtime", async () => {
  const i18n = createInstance();
  await i18n.init({ resources, lng: "en", fallbackLng: "en" });
  let retainedT: ReturnType<typeof useTranslation>["t"] | undefined;

  function Probe() {
    const { t, ready } = useTranslation();
    retainedT ??= t;
    return <span data-ready={ready}>{t("common.save")}</span>;
  }

  const render = () =>
    renderToStaticMarkup(
      <I18nextProvider i18n={i18n}>
        <Probe />
      </I18nextProvider>
    );

  expect(render()).toContain('data-ready="true">Save');
  await i18n.changeLanguage("zh-TW");
  expect(render()).toContain('data-ready="true">儲存');
  expect(retainedT?.("common.save")).toBe("儲存");
  expect(retainedT?.("common.save", { lng: "en" })).toBe("Save");
});
