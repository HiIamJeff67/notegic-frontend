import toast from "@shared/lib/toast";
import { GraduationCapIcon } from "lucide-react";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLoading, useShelfItem } from "@/hooks";
import { translateError } from "@/i18n/error";

const BlockPackEditorIndexPage = () => {
  const loadingManager = useLoading();
  const { t } = useTranslation();
  const shelfItemManager = useShelfItem();

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
    <div className="w-full h-full flex flex-col justify-center items-center gap-4">
      <div className="w-full text-center font-bold text-4xl mb-2 px-2">
        {t("workspace.pages.newBlockPackSpace")}
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

export default BlockPackEditorIndexPage;
