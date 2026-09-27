import { MaterialMeta } from "@shared/reducers/materialMeta.reducer";
import { Suspense } from "react";
import MaterialViewer from "@/components/core/MaterialViewer/MaterialViewer";
import LoadingCover from "@/components/covers/LoadingCover/LoadingCover";

interface MaterialViewerPageProps {
  materialMeta: MaterialMeta;
}

const MaterialViewerPage = ({ materialMeta }: MaterialViewerPageProps) => {
  return (
    <Suspense fallback={<LoadingCover />}>
      <MaterialViewer
        key={`${materialMeta.id}:${materialMeta.parentId}:${materialMeta.rootId}`}
        materialMeta={materialMeta}
      />
    </Suspense>
  );
};

export default MaterialViewerPage;
