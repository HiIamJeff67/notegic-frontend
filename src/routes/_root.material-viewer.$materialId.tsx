import { getClientRequestHeaders } from "@shared/api/clientHeaders";
import { useGetMyMaterialAndItsParentById } from "@shared/api/hooks/material.hook";
import { isValidUUID } from "@shared/types/uuidv4.type";
import {
  createFileRoute,
  notFound,
  useLoaderData,
} from "@tanstack/react-router";
import type { UUID } from "crypto";
import { useEffect, useState } from "react";
import StrictLoadingCover from "@/components/covers/LoadingCover/StrictLoadingCover";
import MaterialViewerNotFoundPage from "@/pages/root/material-viewer/MaterialViewerNotFoundPage";
import MaterialViewerPage from "@/pages/root/material-viewer/MaterialViewerPage";
import { MaterialMeta } from "@/reducers/materialMeta.reducer";

export const Route = createFileRoute("/_root/material-viewer/$materialId")({
  ssr: false,
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
    if (!isValidUUID(params.materialId)) {
      throw notFound();
    }

    return {
      materialId: params.materialId as UUID,
      ...deps,
    };
  },
  component: MaterialViewerRoute,
  notFoundComponent: () => <MaterialViewerNotFoundPage />,
});

function MaterialViewerRoute() {
  const loaderData = useLoaderData({
    from: "/_root/material-viewer/$materialId",
  });

  const materialQuerier = useGetMyMaterialAndItsParentById();
  const [materialMeta, setMaterialMeta] = useState<MaterialMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);

  useEffect(() => {
    let isActive = true;

    const fetchMaterialMeta = async () => {
      setIsLoading(true);
      setIsNotFound(false);

      try {
        const response = await materialQuerier.fetch({
          header: getClientRequestHeaders(navigator.userAgent),
          param: {
            materialId: loaderData.materialId,
          },
        });

        if (!isActive) return;

        if (!response?.data) {
          setIsNotFound(true);
          setMaterialMeta(null);
          return;
        }

        setMaterialMeta({
          id: response.data.id as UUID,
          parentId: response.data.parentSubShelfId as UUID,
          rootId: response.data.rootShelfId as UUID,
          name: response.data.name,
          size: response.data.size,
          contentType: response.data.contentType,
          parseMediaType: response.data.parseMediaType,
          downloadURL: response.data.downloadURL ?? null,
          path: (response.data.parentSubShelfPath ?? []) as UUID[],
          deletedAt: response.data.deletedAt,
          updatedAt: response.data.updatedAt,
          createdAt: response.data.createdAt,
        });
      } catch {
        if (!isActive) return;
        setIsNotFound(true);
        setMaterialMeta(null);
      } finally {
        if (!isActive) return;
        setIsLoading(false);
      }
    };

    void fetchMaterialMeta();

    return () => {
      isActive = false;
    };
  }, [
    loaderData.materialId,
    loaderData.parentSubShelfId,
    loaderData.rootShelfId,
  ]);

  if (isLoading) return <StrictLoadingCover />;
  if (isNotFound || !materialMeta)
    return <MaterialViewerNotFoundPage id={loaderData.materialId} />;

  return <MaterialViewerPage materialMeta={materialMeta} />;
}
