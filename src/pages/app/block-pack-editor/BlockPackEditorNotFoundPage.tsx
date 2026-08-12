import type { UUID } from "crypto";
import { useTranslation } from "react-i18next";

const BlockPackEditorNotFoundPage = ({ id }: { id?: UUID }) => {
  const { t } = useTranslation();
  const notFoundMessage = id
    ? t("workspace.pages.blockPackIdNotFound", { id })
    : t("workspace.pages.blockPackNotFound");
  return (
    <div className="w-full h-full flex justify-center items-center">
      {notFoundMessage}
    </div>
  );
};

export default BlockPackEditorNotFoundPage;
