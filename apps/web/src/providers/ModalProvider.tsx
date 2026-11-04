import type { CreateRoutineTaskByRoutineIdRequest } from "@shared/api/interfaces/routineTask.interface";
import type { UUID } from "crypto";
import React, {
  createContext,
  lazy,
  Suspense,
  useEffect,
  useRef,
  useState,
} from "react";
import RoutineTaskRecordDialogSkeleton from "@/components/dialogs/StationRoutineDialogs/RoutineTaskRecordDialog/RoutineTaskRecordDialogSkeleton";

const SelectBackgroundImageDialog = lazy(
  () => import("@/components/dialogs/ImageDialog/SelectBackgroundImageDialog")
);
const CreateShelfItemDialog = lazy(
  () =>
    import(
      "@/components/dialogs/ShelfItemDialogs/CreateShelfItemDialog/CreateShelfItemDialog"
    )
);
const DeleteShelfItemDialog = lazy(
  () =>
    import(
      "@/components/dialogs/ShelfItemDialogs/DeleteShelfItemDialog/DeleteShelfItemDialog"
    )
);
const RenameDialog = lazy(
  () => import("@/components/dialogs/RenameDialog/RenameDialog")
);
const CreateRoutineDialog = lazy(
  () =>
    import(
      "@/components/dialogs/StationRoutineDialogs/CreateRoutineDialog/CreateRoutineDialog"
    )
);
const CreateRoutineTagDialog = lazy(
  () =>
    import(
      "@/components/dialogs/StationRoutineDialogs/CreateRoutineTagDialog/CreateRoutineTagDialog"
    )
);
const CreateRoutineTaskDialog = lazy(
  () =>
    import(
      "@/components/dialogs/StationRoutineDialogs/CreateRoutineTaskDialog/CreateRoutineTaskDialog"
    )
);
const CreateStationDialog = lazy(
  () =>
    import(
      "@/components/dialogs/StationRoutineDialogs/CreateStationDialog/CreateStationDialog"
    )
);
const DeleteRoutineDialog = lazy(
  () =>
    import(
      "@/components/dialogs/StationRoutineDialogs/DeleteRoutineDialog/DeleteRoutineDialog"
    )
);
const DeleteStationDialog = lazy(
  () =>
    import(
      "@/components/dialogs/StationRoutineDialogs/DeleteStationDialog/DeleteStationDialog"
    )
);
const RoutineTaskRecordDialog = lazy(
  () =>
    import(
      "@/components/dialogs/StationRoutineDialogs/RoutineTaskRecordDialog/RoutineTaskRecordDialog"
    )
);

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export type ModalPropsMap = {
  // make sure don't place the default modal props here, ex. isOpen, onClose
  CreateShelfItemDialog: {
    dialogHeader: React.ReactNode;
    dialogDescription: React.ReactNode;
    disableInput?: boolean;
    inputPlaceholder?: string;
    submitLabel?: string;
    onCreate: (value: string) => void | Promise<void>;
    onCancel: () => void;
  };
  DeleteShelfItemDialog: {
    dialogHeader: React.ReactNode;
    dialogDescription: React.ReactNode;
    confirmKeyword?: string;
    inputPlaceholder?: string;
    onDelete: () => void | Promise<void>;
    onCancel: () => void;
  };
  RenameDialog: {
    dialogHeader: React.ReactNode;
    dialogDescription: React.ReactNode;
    currentName: string;
    inputPlaceholder?: string;
    submitLabel?: string;
    onRename: (name: string) => void | Promise<void>;
    onCancel: () => void;
  };

  CreateStationDialog: {
    onCreated?: (stationId: UUID) => void | Promise<void>;
  };
  DeleteStationDialog: {
    stationId: UUID;
    stationName: string;
    onDeleted?: () => void | Promise<void>;
  };
  CreateRoutineDialog: {
    stationId: UUID;
    stationName?: string;
    onCreated?: (routineId: UUID) => void | Promise<void>;
  };
  DeleteRoutineDialog: {
    routineId: UUID;
    routineTitle: string;
    onDeleted?: () => void | Promise<void>;
  };
  CreateRoutineTagDialog: {
    onCreated?: (routineTagId: UUID) => void | Promise<void>;
  };
  CreateRoutineTaskDialog: {
    onCreate?: (
      body: CreateRoutineTaskByRoutineIdRequest["body"]
    ) => Promise<UUID>;
    routineId: UUID;
    expectedDefinitionVersion?: number;
    stationName?: string;
    routineTitle?: string;
    onCreated?: (routineTaskId: UUID) => void | Promise<void>;
  };
  RoutineTaskRecordDialog: {
    routineTitle: string;
    routineId?: UUID;
    routineTaskIds: UUID[];
    routineRecordId?: UUID;
  };
  SelectBackgroundImageDialog: {
    cropperAspectRatio: number;
  };
};

export type ModalType = keyof ModalPropsMap;

interface ModalContextType {
  open: <T extends ModalType>(
    type: T,
    ...args: ModalPropsMap[T] extends undefined
      ? [undefined?]
      : [ModalPropsMap[T]]
  ) => void;
  close: () => void;
  closeAll: () => void;
  isOpen: (type: ModalType) => boolean;
}

export const ModalContext = createContext<ModalContextType | undefined>(
  undefined
);

export const ModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [activeModals, setActiveModals] = useState<
    { type: ModalType; props?: any }[]
  >([]);
  const openTimerIdsRef = useRef<number[]>([]);

  useEffect(
    () => () => {
      for (const timerId of openTimerIdsRef.current) {
        window.clearTimeout(timerId);
      }
      openTimerIdsRef.current = [];
    },
    []
  );

  useEffect(() => {
    if (activeModals.length > 0 || typeof document === "undefined") return;

    const timerId = window.setTimeout(() => {
      document.body.style.pointerEvents = "";
    }, 0);

    return () => window.clearTimeout(timerId);
  }, [activeModals.length]);

  const open = <T extends ModalType>(type: T, props?: any) => {
    if (typeof window === "undefined") {
      setActiveModals(prev => [...prev, { type, props }]);
      return;
    }

    const timerId = window.setTimeout(() => {
      openTimerIdsRef.current = openTimerIdsRef.current.filter(
        id => id !== timerId
      );
      setActiveModals(prev => [...prev, { type, props }]);
    }, 0);

    openTimerIdsRef.current = [...openTimerIdsRef.current, timerId];
  };

  const close = () => setActiveModals(prev => prev.slice(0, -1));

  const closeAll = () => setActiveModals([]);

  const isOpen = (type: ModalType) => activeModals.some(m => m.type === type);

  const renderModal = (
    modal: { type: ModalType; props?: any },
    index: number
  ) => {
    const props = modal.props;
    const modalKey = `${modal.type}-${index}`;

    switch (modal.type) {
      case "CreateShelfItemDialog":
        return (
          <CreateShelfItemDialog
            isOpen={true}
            key={modalKey}
            onClose={close}
            {...props}
          />
        );
      case "DeleteShelfItemDialog":
        return (
          <DeleteShelfItemDialog
            isOpen={true}
            key={modalKey}
            onClose={close}
            {...props}
          />
        );
      case "RenameDialog":
        return (
          <RenameDialog
            isOpen={true}
            key={modalKey}
            onClose={close}
            {...props}
          />
        );

      case "CreateStationDialog":
        return (
          <CreateStationDialog
            isOpen={true}
            key={modalKey}
            onClose={close}
            {...props}
          />
        );
      case "DeleteStationDialog":
        return (
          <DeleteStationDialog
            isOpen={true}
            key={modalKey}
            onClose={close}
            {...props}
          />
        );
      case "CreateRoutineDialog":
        return (
          <CreateRoutineDialog
            isOpen={true}
            key={modalKey}
            onClose={close}
            {...props}
          />
        );
      case "DeleteRoutineDialog":
        return (
          <DeleteRoutineDialog
            isOpen={true}
            key={modalKey}
            onClose={close}
            {...props}
          />
        );
      case "CreateRoutineTagDialog":
        return (
          <CreateRoutineTagDialog
            isOpen={true}
            key={modalKey}
            onClose={close}
            {...props}
          />
        );
      case "CreateRoutineTaskDialog":
        return (
          <CreateRoutineTaskDialog
            isOpen={true}
            key={modalKey}
            onClose={close}
            {...props}
          />
        );
      case "RoutineTaskRecordDialog":
        return (
          <RoutineTaskRecordDialog
            isOpen={true}
            key={modalKey}
            onClose={close}
            {...props}
          />
        );
      case "SelectBackgroundImageDialog":
        return (
          <SelectBackgroundImageDialog
            isOpen={true}
            key={modalKey}
            onClose={close}
            {...props}
          />
        );
    }
  };

  return (
    <ModalContext.Provider value={{ open, close, closeAll, isOpen }}>
      {children}
      {activeModals.map((modal, index) => (
        <Suspense
          key={`${modal.type}-${index}`}
          fallback={
            modal.type === "RoutineTaskRecordDialog" ? (
              <RoutineTaskRecordDialogSkeleton isOpen={true} onClose={close} />
            ) : null
          }
        >
          {renderModal(modal, index)}
        </Suspense>
      ))}
    </ModalContext.Provider>
  );
};
