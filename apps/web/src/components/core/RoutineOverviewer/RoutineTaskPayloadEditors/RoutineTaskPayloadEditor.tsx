import { RoutineTaskPurpose } from "@shared/api/interfaces/enums";
import CreateBlockPackPayloadEditor from "./CreateBlockPackPayloadEditor/CreateBlockPackPayloadEditor";
import CreateRootShelfPayloadEditor from "./CreateRootShelfPayloadEditor/CreateRootShelfPayloadEditor";
import CreateRoutinePayloadEditor from "./CreateRoutinePayloadEditor/CreateRoutinePayloadEditor";
import CreateSubShelfPayloadEditor from "./CreateSubShelfPayloadEditor/CreateSubShelfPayloadEditor";
import ResetBlockPackPayloadEditor from "./ResetBlockPackPayloadEditor/ResetBlockPackPayloadEditor";
import ResetRootShelfPayloadEditor from "./ResetRootShelfPayloadEditor/ResetRootShelfPayloadEditor";
import ResetSubShelfPayloadEditor from "./ResetSubShelfPayloadEditor/ResetSubShelfPayloadEditor";
import UpdateBlockPackPayloadEditor from "./UpdateBlockPackPayloadEditor/UpdateBlockPackPayloadEditor";
import UpdateRootShelfPayloadEditor from "./UpdateRootShelfPayloadEditor/UpdateRootShelfPayloadEditor";
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
    case RoutineTaskPurpose.CreateRootShelf:
      return <CreateRootShelfPayloadEditor {...props} />;
    case RoutineTaskPurpose.UpdateRootShelf:
      return <UpdateRootShelfPayloadEditor {...props} />;
    case RoutineTaskPurpose.ResetRootShelf:
      return <ResetRootShelfPayloadEditor {...props} />;
    case RoutineTaskPurpose.CreateSubShelf:
      return <CreateSubShelfPayloadEditor {...props} />;
    case RoutineTaskPurpose.UpdateSubShelf:
      return <UpdateSubShelfPayloadEditor {...props} />;
    case RoutineTaskPurpose.ResetSubShelf:
      return <ResetSubShelfPayloadEditor {...props} />;
    case RoutineTaskPurpose.CreateBlockPack:
    case RoutineTaskPurpose.AppendBlock:
    case RoutineTaskPurpose.UpdateBlock:
    case RoutineTaskPurpose.ResetBlock:
      return <CreateBlockPackPayloadEditor {...props} />;
    case RoutineTaskPurpose.UpdateBlockPack:
      return <UpdateBlockPackPayloadEditor {...props} />;
    case RoutineTaskPurpose.ResetBlockPack:
      return <ResetBlockPackPayloadEditor {...props} />;
    case RoutineTaskPurpose.CreateRoutine:
      return <CreateRoutinePayloadEditor {...props} />;
    case RoutineTaskPurpose.UpdateRoutine:
      return <UpdateRoutinePayloadEditor {...props} />;
    default:
      return <CreateBlockPackPayloadEditor {...props} />;
  }
};

export default RoutineTaskPayloadEditor;
