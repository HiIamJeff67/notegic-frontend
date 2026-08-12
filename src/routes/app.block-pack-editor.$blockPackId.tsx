import { getClientRequestHeaders } from "@shared/api/clientHeaders";
import { useGetMyBlockPackAndItsParentById } from "@shared/api/hooks/blockPack.hook";
import { isValidUUID } from "@shared/types/uuidv4.type";
import {
  createFileRoute,
  notFound,
  useLoaderData,
} from "@tanstack/react-router";
import type { UUID } from "crypto";
import { useEffect, useState } from "react";
import StrictLoadingCover from "@/components/covers/LoadingCover/StrictLoadingCover";
import BlockPackEditorNotFoundPage from "@/pages/app/block-pack-editor/BlockPackEditorNotFoundPage";
import BlockPackEditorPage from "@/pages/app/block-pack-editor/BlockPackEditorPage";
import { BlockPackMeta } from "@/reducers/blockPackMeta.reducer";

export const Route = createFileRoute("/app/block-pack-editor/$blockPackId")({
  ssr: false, // since the blocknote editor view is a client side component
  validateSearch: search => ({
    parentSubShelfId:
      typeof search.parentSubShelfId === "string"
        ? search.parentSubShelfId
        : undefined,
    rootShelfId:
      typeof search.rootShelfId === "string" ? search.rootShelfId : undefined,
  }),
  loaderDeps: ({ search }) => {
    const { parentSubShelfId, rootShelfId } = search;

    if (
      !parentSubShelfId ||
      !rootShelfId ||
      !isValidUUID(parentSubShelfId) ||
      !isValidUUID(rootShelfId)
    ) {
      throw notFound();
    }

    return {
      parentSubShelfId: parentSubShelfId as UUID,
      rootShelfId: rootShelfId as UUID,
    };
  },
  loader: ({ params, deps }) => {
    return {
      blockPackId: params.blockPackId as UUID,
      ...deps,
    };
  },
  component: BlockPackEditorIndexRoute,
  notFoundComponent: () => <BlockPackEditorNotFoundPage />,
});

function BlockPackEditorIndexRoute() {
  const loaderData = useLoaderData({
    from: "/app/block-pack-editor/$blockPackId",
  });

  const blockPackQuerier = useGetMyBlockPackAndItsParentById(undefined, {
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
          parentId: loaderData.parentSubShelfId,
          rootId: loaderData.rootShelfId,
          permission: blockPackResponse.data.permission,
          name: blockPackResponse.data.name,
          icon: blockPackResponse.data.icon,
          headerBackgroundURL: blockPackResponse.data.headerBackgroundURL,
          blockCount: blockPackResponse.data.blockCount,
          path: (blockPackResponse.data.parentSubShelfPath || []) as UUID[],
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

    void fetchBlockPackMeta();

    return () => {
      isActive = false;
    };
  }, [
    loaderData.blockPackId,
    loaderData.parentSubShelfId,
    loaderData.rootShelfId,
  ]);

  if (isLoading) return <StrictLoadingCover />;
  if (isNotFound || !blockPackMeta) return <BlockPackEditorNotFoundPage />;

  return <BlockPackEditorPage blockPackMeta={blockPackMeta} />;
}
