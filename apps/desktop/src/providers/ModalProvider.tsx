import CreateShelfItemDialog from "@shared/components/commons/CreateShelfItemDialog/CreateShelfItemDialog";
import type { UUID } from "crypto";
import React, { createContext, useEffect, useRef, useState } from "react";
import CreateRoutineDialog from "../components/dialogs/CreateRoutineDialog";
import CreateRoutineTagDialog from "../components/dialogs/CreateRoutineTagDialog";
import CreateStationDialog from "../components/dialogs/CreateStationDialog";
import SelectBackgroundImageDialog from "../components/dialogs/ImageDialog/SelectBackgroundImageDialog";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export type ModalPropsMap = {
  SelectBackgroundImageDialog: {
    cropperAspectRatio: number;
  };
  CreateShelfItemDialog: {
    dialogHeader: React.ReactNode;
    dialogDescription: React.ReactNode;
    disableInput?: boolean;
    inputPlaceholder?: string;
    submitLabel?: string;
    onCreate: (value: string) => void | Promise<void>;
    onCancel: () => void;
  };
  CreateStationDialog: Record<string, never>;
  CreateRoutineTagDialog: Record<string, never>;
  CreateRoutineDialog: {
    stationId: UUID;
    stationName?: string;
    onCreated?: (routineId: string) => void;
  };
};

export type ModalType = keyof ModalPropsMap;

type ActiveModal = {
  [Type in ModalType]: { type: Type; props: ModalPropsMap[Type] };
}[ModalType];

interface ModalContextType {
  open: <T extends ModalType>(type: T, props: ModalPropsMap[T]) => void;
  close: () => void;
  closeAll: () => void;
  isOpen: (type: ModalType) => boolean;
}

export const ModalContext = createContext<ModalContextType | undefined>(
  undefined
);

export const ModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [activeModals, setActiveModals] = useState<ActiveModal[]>([]);
  const openTimerIdsRef = useRef<number[]>([]);

  useEffect(
    () => () => {
      openTimerIdsRef.current.forEach(id => window.clearTimeout(id));
    },
    []
  );

  const open = <T extends ModalType>(type: T, props: ModalPropsMap[T]) => {
    const timerId = window.setTimeout(() => {
      openTimerIdsRef.current = openTimerIdsRef.current.filter(
        id => id !== timerId
      );
      setActiveModals(previous => [
        ...previous,
        { type, props } as ActiveModal,
      ]);
    }, 0);
    openTimerIdsRef.current = [...openTimerIdsRef.current, timerId];
  };

  const close = () => setActiveModals(previous => previous.slice(0, -1));
  const closeAll = () => setActiveModals([]);
  const isOpen = (type: ModalType) =>
    activeModals.some(modal => modal.type === type);

  return (
    <ModalContext.Provider value={{ open, close, closeAll, isOpen }}>
      {children}
      {activeModals.map((modal, index) => {
        const key = `${modal.type}-${index}`;
        if (modal.type === "SelectBackgroundImageDialog" && modal.props) {
          return (
            <SelectBackgroundImageDialog
              isOpen
              key={key}
              onClose={close}
              cropperAspectRatio={modal.props.cropperAspectRatio}
            />
          );
        }
        if (modal.type === "CreateShelfItemDialog" && modal.props) {
          return (
            <CreateShelfItemDialog
              isOpen
              key={key}
              onClose={close}
              {...modal.props}
            />
          );
        }
        if (modal.type === "CreateStationDialog") {
          return <CreateStationDialog isOpen key={key} onClose={close} />;
        }
        if (modal.type === "CreateRoutineTagDialog") {
          return <CreateRoutineTagDialog isOpen key={key} onClose={close} />;
        }
        if (modal.type === "CreateRoutineDialog" && modal.props) {
          return (
            <CreateRoutineDialog
              isOpen
              key={key}
              onClose={close}
              stationId={modal.props.stationId}
              stationName={modal.props.stationName}
              onCreated={modal.props.onCreated}
            />
          );
        }
        return null;
      })}
    </ModalContext.Provider>
  );
};
