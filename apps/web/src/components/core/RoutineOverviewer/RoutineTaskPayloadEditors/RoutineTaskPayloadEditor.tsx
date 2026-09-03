import { RoutineTaskPurpose } from "@shared/api/interfaces/enums";
import CreateBlockPackPayloadEditor from "./CreateBlockPackPayloadEditor/CreateBlockPackPayloadEditor";
import CreateRoutinePayloadEditor from "./CreateRoutinePayloadEditor/CreateRoutinePayloadEditor";
import CreateSubShelfPayloadEditor from "./CreateSubShelfPayloadEditor/CreateSubShelfPayloadEditor";
import JsonRoutineTaskPayloadEditor from "./JsonRoutineTaskPayloadEditor";
import UpdateBlockPackPayloadEditor from "./UpdateBlockPackPayloadEditor/UpdateBlockPackPayloadEditor";
import UpdateRoutinePayloadEditor from "./UpdateRoutinePayloadEditor/UpdateRoutinePayloadEditor";
import UpdateSubShelfPayloadEditor from "./UpdateSubShelfPayloadEditor/UpdateSubShelfPayloadEditor";

interface RoutineTaskPayloadEditorProps {
  isOpen: boolean;
  purpose: RoutineTaskPurpose;
  initialPayload: string;
  onClose: () => void;
  onConfirm: (payload: string) => void;
}

const RoutineTaskPayloadEditor = (props: RoutineTaskPayloadEditorProps) => {
  switch (props.purpose) {
    case RoutineTaskPurpose.GetSubShelf:
    case RoutineTaskPurpose.DeleteSubShelf:
    case RoutineTaskPurpose.GetBlockPack:
    case RoutineTaskPurpose.DeleteBlockPack:
    case RoutineTaskPurpose.GetRoutine:
    case RoutineTaskPurpose.DeleteRoutine:
    case RoutineTaskPurpose.GetMaterial:
    case RoutineTaskPurpose.CreateMaterial:
    case RoutineTaskPurpose.UpdateMaterial:
    case RoutineTaskPurpose.DeleteMaterial:
      return <JsonRoutineTaskPayloadEditor {...props} />;
    case RoutineTaskPurpose.CreateSubShelf:
      return <CreateSubShelfPayloadEditor {...props} />;
    case RoutineTaskPurpose.UpdateSubShelf:
      return <UpdateSubShelfPayloadEditor {...props} />;
    case RoutineTaskPurpose.CreateBlockPack:
      return <CreateBlockPackPayloadEditor {...props} />;
    case RoutineTaskPurpose.UpdateBlockPack:
      return <UpdateBlockPackPayloadEditor {...props} />;
    case RoutineTaskPurpose.CreateRoutine:
      return <CreateRoutinePayloadEditor {...props} />;
    case RoutineTaskPurpose.UpdateRoutine:
      return <UpdateRoutinePayloadEditor {...props} />;
    default:
      return <JsonRoutineTaskPayloadEditor {...props} />;
  }
};

export default RoutineTaskPayloadEditor;
