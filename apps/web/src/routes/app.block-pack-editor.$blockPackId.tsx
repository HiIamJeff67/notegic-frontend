import { BlockPackMeta } from "@shared/reducers/blockPackMeta.reducer";
import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import type { UUID } from "crypto";
import { useEffect, useState } from "react";
import { getClientRequestHeaders } from "@/api/clientHeaders";
import { useGetMyBlockPackById } from "@/api/hooks/blockPack.hook";
import LoadingCover from "@/components/covers/LoadingCover/LoadingCover";
import { useLoading } from "@/hooks/useLoading";
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
  const { startAsyncTransactionLoading } = useLoading();

  const blockPackQuerier = useGetMyBlockPackById(undefined, {
    staleTime: 0,
  });
  const [blockPackMeta, setBlockPackMeta] = useState<BlockPackMeta | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);

  useEffect(() => {
    let isActive = true;

    const fetchBlockPackMeta = async () => {
      setIsLoading(true);
      setIsNotFound(false);

      const userAgent = navigator.userAgent;

      try {
        const blockPackResponse = await blockPackQuerier.fetch({
          header: getClientRequestHeaders(userAgent),
          param: {
            blockPackId: loaderData.blockPackId,
          },
        });

        if (!isActive) return;

        if (!blockPackResponse?.data) {
          setIsNotFound(true);
          setBlockPackMeta(null);
          return;
        }

        setBlockPackMeta({
          id: blockPackResponse.data.id as UUID,
          parentId: blockPackResponse.data.parentSubShelfId as UUID,
          rootId: blockPackResponse.data.rootShelfId as UUID,
          permission: blockPackResponse.data.permission,
          name: blockPackResponse.data.name,
          icon: blockPackResponse.data.icon,
          headerBackgroundURL: blockPackResponse.data.headerBackgroundURL,
          blockCount: blockPackResponse.data.blockCount,
          path: blockPackResponse.data.path
            .slice(1, -1)
            .map(pathItem => pathItem.id as UUID),
          pathItems: blockPackResponse.data.path.map(pathItem => ({
            id: pathItem.id as UUID,
            name: pathItem.name,
          })),
          deletedAt: blockPackResponse.data.deletedAt
            ? new Date(blockPackResponse.data.deletedAt)
            : null,
          updatedAt: new Date(blockPackResponse.data.updatedAt),
          createdAt: new Date(blockPackResponse.data.createdAt),
          blocks: [],
        });
      } catch {
        if (!isActive) return;
        setIsNotFound(true);
        setBlockPackMeta(null);
      } finally {
        if (!isActive) return;
        setIsLoading(false);
      }
    };

    void startAsyncTransactionLoading(fetchBlockPackMeta);

    return () => {
      isActive = false;
    };
  }, [loaderData.blockPackId, startAsyncTransactionLoading]);

  if (isLoading) return <LoadingCover />;
  if (isNotFound || !blockPackMeta) return <BlockPackEditorNotFoundPage />;

  return <BlockPackEditorPage blockPackMeta={blockPackMeta} />;
}
