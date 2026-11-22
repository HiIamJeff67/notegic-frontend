import { useGetMyBlockPackById } from "@shared/api/hooks/blockPack.hook";
import { useTranslation } from "@shared/hooks/useTranslation";
import { useParams } from "@tanstack/react-router";
import { GetMyBlockPackById } from "../../../api/functions/blockPack.function";
import { readNetworkOnline } from "../../../invocations/network.invocation";
import { useDesktopSession } from "../../../providers/DesktopSessionProvider";

const BlockPackBody = ({
  client,
  blockPackId,
}: {
  client: NonNullable<ReturnType<typeof useDesktopSession>["client"]>;
  blockPackId: string;
}) => {
  const { t } = useTranslation();
  const blockPack = useGetMyBlockPackById(
    client,
    readNetworkOnline,
    GetMyBlockPackById,
    { param: { blockPackId, isDeleted: false } }
  );
  return (
    <main className="min-w-0 p-6">
      <h1 className="truncate text-lg font-medium">
        {blockPack.data?.name || t("workspace.navigation.shelves")}
      </h1>
    </main>
  );
};

export default function BlockPackPage() {
  const { t } = useTranslation();
  const { blockPackId } = useParams({ from: "/app/block-packs/$blockPackId" });
  const session = useDesktopSession();
  if (!session.client || !session.account) {
    return (
      <main className="min-w-0 p-6">
        <h1 className="text-lg font-medium">{t("auth.login")}</h1>
      </main>
    );
  }
  return <BlockPackBody client={session.client} blockPackId={blockPackId} />;
}
