import { BlockPackMeta } from "@shared/reducers/blockPackMeta.reducer";
import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import type { UUID } from "crypto";
import { getClientRequestHeaders } from "@/api/clientHeaders";
import { useGetMyBlockPackById } from "@/api/hooks/blockPack.hook";
import LoadingCover from "@/components/covers/LoadingCover/LoadingCover";
import BlockPackEditorNotFoundPage from "@/pages/app/block-pack-editor/BlockPackEditorNotFoundPage";
import BlockPackEditorPage from "@/pages/app/block-pack-editor/BlockPackEditorPage";

export const Route = createFileRoute("/app/block-pack-editor/$blockPackId")({
  ssr: false, // since the blocknote editor view is a client side component
  loader: ({ params }) => {
    return {
      blockPackId: params.blockPackId as UUID,
    };
  },
  component: BlockPackEditorIndexRoute,
  notFoundComponent: () => <BlockPackEditorNotFoundPage />,
});

function BlockPackEditorIndexRoute() {
  const loaderData = useLoaderData({
    from: "/app/block-pack-editor/$blockPackId",
  });
  const blockPackQuerier = useGetMyBlockPackById(
    {
      header: getClientRequestHeaders(navigator.userAgent),
      param: { blockPackId: loaderData.blockPackId },
    },
    { staleTime: 0, refetchOnWindowFocus: true }
  );
  const blockPack = blockPackQuerier.data?.data;

  if (blockPackQuerier.isPending) return <LoadingCover />;
  if (blockPackQuerier.isError && !blockPack) throw blockPackQuerier.error;
  if (!blockPack || blockPack.deletedAt) return <BlockPackEditorNotFoundPage />;

  const blockPackMeta: BlockPackMeta = {
    id: blockPack.id as UUID,
    parentId: blockPack.parentSubShelfId as UUID,
    rootId: blockPack.rootShelfId as UUID,
    permission: blockPack.permission,
    name: blockPack.name,
    icon: blockPack.icon,
    headerBackgroundURL: blockPack.headerBackgroundURL,
    blockCount: blockPack.blockCount,
    path: blockPack.path.slice(1, -1).map(pathItem => pathItem.id as UUID),
    pathItems: blockPack.path.map(pathItem => ({
      id: pathItem.id as UUID,
      name: pathItem.name,
    })),
    deletedAt: blockPack.deletedAt ? new Date(blockPack.deletedAt) : null,
    updatedAt: new Date(blockPack.updatedAt),
    createdAt: new Date(blockPack.createdAt),
    blocks: [],
  };
  return <BlockPackEditorPage blockPackMeta={blockPackMeta} />;
}
