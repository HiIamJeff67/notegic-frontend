import { queryKeys } from "@shared/api/queryKeys";
import { tError } from "@shared/i18n/error";
import toast from "@shared/lib/toast/toast";
import { isValidUUID } from "@shared/lib/uuid/uuidv4.type";
import { useQuery } from "@tanstack/react-query";
import { notFound, useLoaderData } from "@tanstack/react-router";
import type { UUID } from "crypto";
import { useEffect } from "react";
import { getClientRequestHeaders } from "@/api/clientHeaders";
import {
  useCreateMaterialObjectTicket,
  useGetMyMaterialAndItsParentById,
  useResolveMaterialObjectTicket,
} from "@/api/hooks/material.hook";
import LoadingCover from "@/components/covers/LoadingCover/LoadingCover";
import { useTranslation } from "@/hooks/useTranslation";
import MaterialViewerNotFoundPage from "@/pages/app/material-viewer/MaterialViewerNotFoundPage";
import MaterialViewerPage from "@/pages/app/material-viewer/MaterialViewerPage";

export const readMaterialViewerSearch = (search: Record<string, unknown>) => ({
  parentSubShelfId:
    typeof search.parentSubShelfId === "string"
      ? search.parentSubShelfId
      : undefined,
  rootShelfId:
    typeof search.rootShelfId === "string" ? search.rootShelfId : undefined,
});

export const loadMaterialViewer = ({
  materialId,
  parentSubShelfId,
  rootShelfId,
}: {
  materialId: string;
  parentSubShelfId?: string;
  rootShelfId?: string;
}) => {
  if (
    !parentSubShelfId ||
    !rootShelfId ||
    !isValidUUID(parentSubShelfId) ||
    !isValidUUID(rootShelfId) ||
    !isValidUUID(materialId)
  ) {
    throw notFound();
  }

  return {
    materialId: materialId as UUID,
    parentSubShelfId: parentSubShelfId as UUID,
    rootShelfId: rootShelfId as UUID,
  };
};

export function MaterialViewerRoute() {
  const { t } = useTranslation();
  const loaderData = useLoaderData({ strict: false }) as {
    materialId: UUID;
    parentSubShelfId: UUID;
    rootShelfId: UUID;
  };
  const materialQuerier = useGetMyMaterialAndItsParentById(
    {
      header: getClientRequestHeaders(navigator.userAgent),
      param: { materialId: loaderData.materialId },
    },
    { staleTime: 0, refetchOnWindowFocus: true }
  );
  const { mutateAsync: createMaterialObjectTicket } =
    useCreateMaterialObjectTicket();
  const objectURLResolver = useResolveMaterialObjectTicket();
  const material = materialQuerier.data?.data?.deletedAt
    ? null
    : materialQuerier.data?.data;
  const objectURLQuery = useQuery({
    // A metadata refetch also renews the ticket after replacing the same object.
    queryKey: queryKeys.material.objectURL(
      loaderData.materialId,
      material?.objectKey,
      materialQuerier.dataUpdatedAt
    ),
    queryFn: async () => {
      if (!material?.objectKey)
        throw new Error("Material file is unavailable.");
      const ticketResponse = await createMaterialObjectTicket({
        header: getClientRequestHeaders(navigator.userAgent),
        body: { objectKey: material.objectKey },
      });
      const response = await objectURLResolver.fetch({
        header: getClientRequestHeaders(navigator.userAgent),
        body: { objectTicket: ticketResponse.data.objectTicket },
      });
      return response.data.objectURL;
    },
    enabled: Boolean(material?.objectKey),
    retry: false,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!materialQuerier.isError) return;
    toast.error(tError(materialQuerier.error, t));
  }, [materialQuerier.error, materialQuerier.isError, t]);

  if (materialQuerier.isPending) return <LoadingCover />;
  if (materialQuerier.isError && !material) throw materialQuerier.error;
  if (!material) return <MaterialViewerNotFoundPage />;

  return (
    <MaterialViewerPage
      materialMeta={{
        id: material.id as UUID,
        parentId: material.parentSubShelfId as UUID,
        rootId: material.rootShelfId as UUID,
        name: material.name,
        size: material.size,
        contentType: material.contentType,
        parseMediaType: material.parseMediaType,
        objectKey: material.objectKey,
        downloadURL: objectURLQuery.data ?? null,
        path: (material.parentSubShelfPath ?? []) as UUID[],
        deletedAt: material.deletedAt,
        updatedAt: material.updatedAt,
        createdAt: material.createdAt,
      }}
      file={{
        isLoading: materialQuerier.isFetching || objectURLQuery.isLoading,
        isError: materialQuerier.isError || objectURLQuery.isError,
        onRefresh: () => {
          void materialQuerier.refetch();
        },
      }}
    />
  );
}
