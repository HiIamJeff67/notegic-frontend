import { useGetMyMaterialById } from "@shared/api/hooks/material.hook";
import { useTranslation } from "@shared/hooks/useTranslation";
import { useParams } from "@tanstack/react-router";
import { GetMyMaterialById } from "../../../api/functions/material.function";
import { readNetworkOnline } from "../../../invocations/network.invocation";
import { useDesktopSession } from "../../../providers/DesktopSessionProvider";

const MaterialBody = ({
  client,
  materialId,
}: {
  client: NonNullable<ReturnType<typeof useDesktopSession>["client"]>;
  materialId: string;
}) => {
  const { t } = useTranslation();
  const material = useGetMyMaterialById(
    client,
    readNetworkOnline,
    GetMyMaterialById,
    { param: { materialId, isDeleted: false } }
  );
  return (
    <main className="min-w-0 p-6">
      <h1 className="truncate text-lg font-medium">
        {material.data?.name || t("workspace.navigation.shelves")}
      </h1>
    </main>
  );
};

export default function MaterialPage() {
  const { t } = useTranslation();
  const { materialId } = useParams({ from: "/app/materials/$materialId" });
  const session = useDesktopSession();
  if (!session.client || !session.account) {
    return (
      <main className="min-w-0 p-6">
        <h1 className="text-lg font-medium">{t("auth.login")}</h1>
      </main>
    );
  }
  return <MaterialBody client={session.client} materialId={materialId} />;
}
