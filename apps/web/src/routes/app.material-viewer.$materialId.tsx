import { getClientRequestHeaders } from "@/api/clientHeaders";
import {
  useCreateMaterialObjectTicket,
  useGetMyMaterialAndItsParentById,
  useResolveMaterialObjectTicket,
} from "@/api/hooks/material.hook";
import { isValidUUID } from "@shared/types/uuidv4.type";
import {
  createFileRoute,
  notFound,
  useLoaderData,
} from "@tanstack/react-router";
import type { UUID } from "crypto";
import { useEffect, useState } from "react";
import StrictLoadingCover from "@/components/covers/LoadingCover/StrictLoadingCover";
import MaterialViewerNotFoundPage from "@/pages/app/material-viewer/MaterialViewerNotFoundPage";
import MaterialViewerPage from "@/pages/app/material-viewer/MaterialViewerPage";
import { MaterialMeta } from "@shared/reducers/materialMeta.reducer";

export const Route = createFileRoute("/app/material-viewer/$materialId")({
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
    from: "/app/material-viewer/$materialId",
  });

  const materialQuerier = useGetMyMaterialAndItsParentById();
  const createObjectTicketMutator = useCreateMaterialObjectTicket();
  const [materialMeta, setMaterialMeta] = useState<MaterialMeta | null>(null);
  const [objectTicket, setObjectTicket] = useState<string | null>(null);
  const objectURLQuery = useResolveMaterialObjectTicket(objectTicket);
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
          objectKey: response.data.objectKey,
          downloadURL: null,
          path: (response.data.parentSubShelfPath ?? []) as UUID[],
          deletedAt: response.data.deletedAt,
          updatedAt: response.data.updatedAt,
          createdAt: response.data.createdAt,
        });

        setObjectTicket(null);
        try {
          const ticketResponse = await createObjectTicketMutator.mutateAsync({
            header: getClientRequestHeaders(navigator.userAgent),
            body: { objectKey: response.data.objectKey },
          });
          if (isActive) {
            setObjectTicket(ticketResponse.data.objectTicket);
          }
        } catch {
          // Metadata remains available while the file is unavailable offline.
        }
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
    createObjectTicketMutator,
    loaderData.materialId,
    loaderData.parentSubShelfId,
    loaderData.rootShelfId,
  ]);

  useEffect(() => {
    const objectURL = objectURLQuery.data?.data.objectURL;
    if (!objectURL) return;
    setMaterialMeta(current =>
      current ? { ...current, downloadURL: objectURL } : current
    );
  }, [objectURLQuery.data?.data.objectURL]);

  if (isLoading) return <StrictLoadingCover />;
  if (isNotFound || !materialMeta)
    return <MaterialViewerNotFoundPage id={loaderData.materialId} />;

  return <MaterialViewerPage materialMeta={materialMeta} />;
}
