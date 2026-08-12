import { Suspense } from "react";
import MaterialViewer from "@/components/core/MaterialViewer/MaterialViewer";
import StrictLoadingCover from "@/components/covers/LoadingCover/StrictLoadingCover";
import { MaterialMeta } from "@/reducers/materialMeta.reducer";

interface MaterialViewerPageProps {
  materialMeta: MaterialMeta;
}

const MaterialViewerPage = ({ materialMeta }: MaterialViewerPageProps) => {
  return (
    <Suspense fallback={<StrictLoadingCover />}>
      <MaterialViewer
        key={`${materialMeta.id}:${materialMeta.parentId}:${materialMeta.rootId}`}
        materialMeta={materialMeta}
      />
    </Suspense>
  );
};

export default MaterialViewerPage;
