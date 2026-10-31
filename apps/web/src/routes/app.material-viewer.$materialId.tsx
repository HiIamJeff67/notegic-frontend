import { queryKeys } from "@shared/api/queryKeys";
import { isValidUUID } from "@shared/lib/uuid/uuidv4.type";
import { useQuery } from "@tanstack/react-query";
import {
  createFileRoute,
  notFound,
  useLoaderData,
} from "@tanstack/react-router";
import type { UUID } from "crypto";
import { getClientRequestHeaders } from "@/api/clientHeaders";
import {
  useCreateMaterialObjectTicket,
  useGetMyMaterialAndItsParentById,
  useResolveMaterialObjectTicket,
} from "@/api/hooks/material.hook";
import LoadingCover from "@/components/covers/LoadingCover/LoadingCover";
import MaterialViewerNotFoundPage from "@/pages/app/material-viewer/MaterialViewerNotFoundPage";
import MaterialViewerPage from "@/pages/app/material-viewer/MaterialViewerPage";

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
  const materialQuerier = useGetMyMaterialAndItsParentById({
    header: getClientRequestHeaders(navigator.userAgent),
    param: { materialId: loaderData.materialId },
  });
  const { mutateAsync: createMaterialObjectTicket } =
    useCreateMaterialObjectTicket();
  const objectURLResolver = useResolveMaterialObjectTicket();
  const material = materialQuerier.data?.data;
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

  if (materialQuerier.isPending) return <LoadingCover />;
  if (!material)
    return <MaterialViewerNotFoundPage id={loaderData.materialId} />;

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
