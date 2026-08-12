import type { UUID } from "crypto";
import { useTranslation } from "react-i18next";

const MaterialViewerNotFoundPage = ({ id }: { id?: UUID }) => {
  const { t } = useTranslation();
  const notFoundMessage = id
    ? t("workspace.pages.materialIdNotFound", { id })
    : t("workspace.pages.materialNotFound");
  return (
    <div className="w-full h-full flex justify-center items-center">
      {notFoundMessage}
    </div>
  );
};

export default MaterialViewerNotFoundPage;
