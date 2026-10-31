import { SideMenuExtension } from "@blocknote/core/extensions";
import {
  DragHandleMenu,
  SideMenu,
  useDictionary,
  useExtension,
  useExtensionState,
} from "@blocknote/react";
import { components as blockNoteShadcnComponents } from "@blocknote/shadcn";
import { useTranslation } from "@shared/i18n/useTranslation";
import { EllipsisVerticalIcon, GripVerticalIcon } from "lucide-react";
import type { ReactNode } from "react";

const BlockSideMenu = ({ children }: { children?: ReactNode }) => {
  const dictionary = useDictionary();
  const { t } = useTranslation();
  const sideMenu = useExtension(SideMenuExtension);
  const block = useExtensionState(SideMenuExtension, {
    selector: state => state?.block,
  });

  if (!block) return null;

  return (
    <SideMenu>
      <blockNoteShadcnComponents.SideMenu.Button
        className="bn-button"
        label={dictionary.side_menu.drag_handle_label}
        draggable
        icon={<GripVerticalIcon className="size-4" aria-hidden="true" />}
        onDragStart={event => sideMenu.blockDragStart(event, block)}
        onDragEnd={() => sideMenu.blockDragEnd()}
      />
      {children}
      <blockNoteShadcnComponents.Generic.Menu.Root
        position="left"
        onOpenChange={isOpen => {
          if (isOpen) {
            sideMenu.freezeMenu();
            return;
          }
          sideMenu.unfreezeMenu();
        }}
      >
        <blockNoteShadcnComponents.Generic.Menu.Trigger>
          <blockNoteShadcnComponents.SideMenu.Button
            className="bn-button"
            label={t("common.more")}
            icon={
              <EllipsisVerticalIcon className="size-4" aria-hidden="true" />
            }
          />
        </blockNoteShadcnComponents.Generic.Menu.Trigger>
        <DragHandleMenu />
      </blockNoteShadcnComponents.Generic.Menu.Root>
    </SideMenu>
  );
};

export default BlockSideMenu;
