import type { UUID } from "crypto";
import React, { createContext, useEffect, useRef, useState } from "react";
import SelectBackgroundImageDialog from "../components/dialogs/ImageDialog/SelectBackgroundImageDialog";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export type ModalPropsMap = {
  SelectBackgroundImageDialog: {
    cropperAspectRatio: number;
  };
};

export type ModalType = keyof ModalPropsMap;

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
  const [activeModals, setActiveModals] = useState<
    { type: ModalType; props?: ModalPropsMap[ModalType] }[]
  >([]);
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
      setActiveModals(previous => [...previous, { type, props }]);
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
      {activeModals.map((modal, index) =>
        modal.type === "SelectBackgroundImageDialog" && modal.props ? (
          <SelectBackgroundImageDialog
            isOpen
            key={`${modal.type}-${index}`}
            onClose={close}
            cropperAspectRatio={modal.props.cropperAspectRatio}
          />
        ) : null
      )}
    </ModalContext.Provider>
  );
};
