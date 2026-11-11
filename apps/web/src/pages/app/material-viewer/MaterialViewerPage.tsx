import { MaterialMeta } from "@shared/reducers/materialMeta.reducer";
import { Suspense } from "react";
import MaterialViewer from "@/components/core/MaterialViewer/MaterialViewer";
import type { MaterialFileState } from "@/components/core/MaterialViewer/MaterialViewerFrame";
import LoadingCover from "@/components/covers/LoadingCover/LoadingCover";
import { usePageTitle } from "@/hooks/usePageTitle";
import { pageTitle } from "@/seo/pageTitle";

interface MaterialViewerPageProps {
  materialMeta: MaterialMeta;
  file: MaterialFileState;
}

const MaterialViewerPage = ({
  materialMeta,
  file,
}: MaterialViewerPageProps) => {
  usePageTitle(pageTitle(materialMeta.name || "Material"));

  return (
    <Suspense fallback={<LoadingCover />}>
      <MaterialViewer
        key={`${materialMeta.id}:${materialMeta.parentId}:${materialMeta.rootId}`}
        materialMeta={materialMeta}
        file={file}
      />
    </Suspense>
  );
};

export default MaterialViewerPage;
