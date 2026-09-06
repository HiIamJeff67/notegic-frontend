import { translateError } from "@shared/i18n/error";
import toast from "@shared/lib/toast";
import { GraduationCapIcon } from "lucide-react";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { useLoading, useShelfItem } from "@/hooks";

const MaterialViewerIndexPage = () => {
  const loadingManager = useLoading();
  const { t } = useTranslation();
  const shelfItemManager = useShelfItem();
  const sidebarManager = useSidebar();

  const [newShelfName, setNewShelfName] = useState<string>("");

  const handleCreateRootShelfOnSubmit = useCallback(async (): Promise<void> => {
    await loadingManager.startAsyncTransactionLoading(async () => {
      try {
        if (newShelfName.replaceAll(" ", "") === "") {
          throw new Error(t("workspace.pages.newShelfNameEmpty"));
        }

        await shelfItemManager.createRootShelf(newShelfName);
      } catch (error) {
        toast.error(translateError(error, t));
      } finally {
        setNewShelfName("");
      }
    });
  }, [newShelfName, loadingManager, t, shelfItemManager]);

  return (
    <div
      className={
        sidebarManager.isMobile
          ? "flex h-full w-full flex-col items-center justify-center gap-4 pt-10"
          : "flex h-full w-full flex-col items-center justify-center gap-4"
      }
    >
      {sidebarManager.isMobile && (
        <SidebarTrigger className="fixed top-2 left-2 z-40 border-none bg-transparent" />
      )}
      <div className="w-full text-center font-bold text-4xl mb-2 px-2">
        {t("workspace.pages.writeSomething")}
      </div>
      <Input
        placeholder={t("workspace.navigation.shelfNamePlaceholder")}
        value={newShelfName}
        onChange={e => setNewShelfName(e.target.value)}
        className="w-2/3"
      />
      <div className="flex justify-center items-center gap-16">
        <Button
          variant="default"
          type="submit"
          onClick={handleCreateRootShelfOnSubmit}
        >
          {t("common.confirm")}
        </Button>
        <Button variant="secondary">
          <GraduationCapIcon />
          <span>{t("workspace.navigation.seeTutorial")}</span>
        </Button>
      </div>
    </div>
  );
};

export default MaterialViewerIndexPage;
