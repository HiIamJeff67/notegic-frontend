import { localDB } from "@shared/api/local/db";
import { User } from "@shared/api/local/schemas";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import StrictLoadingCover from "@/components/covers/LoadingCover/StrictLoadingCover";
import { Button } from "@/components/ui/button";

const AdminPage = () => {
  const { t } = useTranslation();
  const [isLoadingPreviewOpen, setIsLoadingPreviewOpen] = useState(false);

  const logAllExistingUsers = async (): Promise<void> => {
    const existingUsers = await localDB.select().from(User);
    console.debug("existingUsers: ", existingUsers);
  };

  return (
    <>
      <div className="p-4 flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={localDB.download}>
            {t("workspace.pages.downloadLocalDb")}
          </Button>
          <Button variant="secondary" onClick={logAllExistingUsers}>
            {t("workspace.pages.logUsers")}
          </Button>
        </div>

        <div className="max-w-md rounded-xl border border-border bg-card p-4">
          <p className="text-base font-semibold">
            {t("workspace.pages.loadingTest")}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("workspace.pages.loadingTestDescription")}
          </p>
          <div className="mt-3 flex gap-2">
            <Button onClick={() => setIsLoadingPreviewOpen(true)}>
              {t("workspace.pages.showLoading")}
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsLoadingPreviewOpen(false)}
            >
              {t("workspace.pages.hideLoading")}
            </Button>
          </div>
        </div>
      </div>

      <StrictLoadingCover condition={isLoadingPreviewOpen} />
      {isLoadingPreviewOpen ? (
        <div className="fixed top-4 right-4 z-[10000]">
          <Button
            variant="destructive"
            onClick={() => setIsLoadingPreviewOpen(false)}
          >
            {t("workspace.pages.closeLoading")}
          </Button>
        </div>
      ) : null}
    </>
  );
};

export default AdminPage;
