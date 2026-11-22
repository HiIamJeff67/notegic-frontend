import { useStationRoutineSidebar } from "@shared/api/hooks/react/StationRoutineSidebarProvider";
import { useShelfItem } from "@shared/api/hooks/react/useShelfItem";
import { useGetMyRoutinesByStationId } from "@shared/api/hooks/routine.hook";
import { ItemType } from "@shared/api/interfaces/enums/itemType.enum";
import { WorkspaceSidebar } from "@shared/components/commons/WorkspaceSidebar/WorkspaceSidebar";
import AvatarIcon from "@shared/components/icons/AvatarIcon";
import {
  BlockPackIcon,
  MaterialIcon,
  RoutineIcon,
  StationIcon,
} from "@shared/components/icons/WorkspaceEntityIcons";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@shared/components/shadcn/collapsible";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@shared/components/shadcn/context-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@shared/components/shadcn/sidebar";
import { useTranslation } from "@shared/hooks/useTranslation";
import { useNavigate } from "@tanstack/react-router";
import type { UUID } from "crypto";
import {
  Bookmark,
  ChevronDownIcon,
  ChevronRightIcon,
  FolderPlus,
  LogIn,
  PackagePlus,
  Pencil,
  Trash2,
  UserRoundPlus,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { GetMyRoutinesByStationId } from "../../../../api/functions/routine.function";
import { setAccessToken } from "../../../../api/tokens/accessToken";
import { useModal } from "../../../../hooks/useModal";
import {
  logoutNative,
  startNativeLogin,
  startNativeRegister,
} from "../../../../invocations/nativeAuth.invocation";
import { useDesktopSession } from "../../../../providers/DesktopSessionProvider";

export function AppSidebar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const session = useDesktopSession();
  const account = session.account;
  const [createRootSignal, setCreateRootSignal] = useState(0);
  const [createStationSignal, setCreateStationSignal] = useState(0);
  const [createTagSignal, setCreateTagSignal] = useState(0);

  return (
    <WorkspaceSidebar
      dashboardLabel={t("workspace.navigation.dashboard")}
      onDashboard={() => void navigate({ to: "/app/dashboard" })}
      routinesLabel={t("workspace.navigation.routinesOverview")}
      onRoutines={
        account ? () => void navigate({ to: "/app/routines" }) : undefined
      }
      shelvesLabel={t("workspace.navigation.shelves")}
      createShelfLabel={t("workspace.navigation.createRootShelf")}
      onCreateShelf={
        account ? () => setCreateRootSignal(value => value + 1) : undefined
      }
      shelfMenu={
        account ? <DesktopShelfMenu createSignal={createRootSignal} /> : null
      }
      stationsLabel={t("workspace.navigation.stations")}
      createStationLabel={t("workspace.navigation.createStation")}
      onCreateStation={
        account ? () => setCreateStationSignal(value => value + 1) : undefined
      }
      stationMenu={
        account ? (
          <DesktopStationMenu createSignal={createStationSignal} />
        ) : null
      }
      routineTagsLabel={t("workspace.navigation.routineTags")}
      createRoutineTagLabel={t("workspace.navigation.createRoutineTag")}
      onCreateRoutineTag={
        account ? () => setCreateTagSignal(value => value + 1) : undefined
      }
      routineTagMenu={
        account ? (
          <DesktopRoutineTagMenu createSignal={createTagSignal} />
        ) : null
      }
      account={
        account
          ? {
              name: account.displayName || account.name,
              status: account.email,
              avatar: (
                <AvatarIcon
                  avatarURL={null}
                  fallbackText={account.displayName || account.name}
                  size={30}
                />
              ),
            }
          : undefined
      }
      settingsLabel={t("workspace.navigation.settings")}
      accountLabel={t("workspace.navigation.account")}
      preferencesLabel={t("workspace.navigation.preferences")}
      logoutLabel={t("auth.logout")}
      onLogout={
        account
          ? async () => {
              await logoutNative();
              setAccessToken("");
              session.setAccount(null);
            }
          : undefined
      }
      signedOut={account ? undefined : <SignedOutMenu />}
    />
  );
}

const SignedOutMenu = () => {
  const { t } = useTranslation();
  const sidebar = useSidebar();
  const expanded = sidebar.open || sidebar.isMobile;
  return (
    <SidebarMenu className={expanded ? "px-1 py-1" : "items-center px-1 py-1"}>
      <SidebarMenuItem>
        <SidebarMenuButton
          className={`flex w-full items-center select-none hover:bg-primary ${
            expanded ? "justify-start" : "justify-center"
          }`}
          onClick={() => void startNativeLogin()}
        >
          <LogIn />
          {expanded ? (
            <span className="truncate">{t("auth.login")}</span>
          ) : null}
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton
          className={`flex w-full items-center select-none hover:bg-primary ${
            expanded ? "justify-start" : "justify-center"
          }`}
          onClick={() => void startNativeRegister()}
        >
          <UserRoundPlus />
          {expanded ? (
            <span className="truncate">{t("auth.register")}</span>
          ) : null}
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};

const NameField = ({
  label,
  value,
  onChange,
  onSubmit,
  onCancel,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}) => (
  <div className="relative flex items-center rounded-sm border border-foreground bg-muted px-2 py-1">
    <input
      autoFocus
      type="text"
      value={value}
      aria-label={label}
      className="h-6 min-w-0 flex-1 overflow-hidden bg-transparent outline-none"
      onChange={event => onChange(event.target.value)}
      onKeyDown={event => {
        if (event.key === "Enter") {
          event.preventDefault();
          onSubmit();
        } else if (event.key === "Escape") {
          event.preventDefault();
          onCancel();
        }
      }}
    />
  </div>
);

const DesktopShelfMenu = ({ createSignal }: { createSignal: number }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const modal = useModal();
  const shelfItem = useShelfItem();
  const seenSignal = useRef(0);
  const shelves = shelfItem.shelvesRef.current;

  useEffect(() => {
    if (createSignal === seenSignal.current) return;
    seenSignal.current = createSignal;
    modal.open("CreateShelfItemDialog", {
      dialogHeader: t("workspace.navigation.createRootShelfDialog"),
      dialogDescription: t("workspace.navigation.typeRootShelfName"),
      inputPlaceholder: t("workspace.navigation.typeNewName"),
      onCancel: modal.close,
      onCreate: name => shelfItem.createRootShelf(name),
    });
  }, [createSignal, modal, shelfItem, t]);

  return (
    <SidebarMenu>
      {shelves.map(shelf => (
        <Collapsible key={shelf.id} open={shelf.open}>
          <SidebarMenuItem>
            {shelfItem.editingId === shelf.id ? (
              <NameField
                label={t("workspace.navigation.typeNewName")}
                value={shelfItem.editName}
                onChange={shelfItem.setEditName}
                onSubmit={() => void shelfItem.renameEditing()}
                onCancel={shelfItem.cancelRenaming}
              />
            ) : (
              <ContextMenu>
                <ContextMenuTrigger asChild>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      className="w-full overflow-hidden rounded-sm text-ellipsis whitespace-nowrap"
                      onClick={() => {
                        shelfItem.toggleRootShelf(shelf.id);
                        void navigate({
                          to: "/app/shelves/$rootShelfId",
                          params: { rootShelfId: shelf.id },
                        });
                      }}
                    >
                      {shelf.open ? <ChevronDownIcon /> : <ChevronRightIcon />}
                      <span>{shelf.name}</span>
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                </ContextMenuTrigger>
                <ContextMenuContent>
                  <ContextMenuLabel>{t("workspace.menu.add")}</ContextMenuLabel>
                  <ContextMenuGroup>
                    <ContextMenuItem
                      onSelect={() =>
                        modal.open("CreateShelfItemDialog", {
                          dialogHeader: t("workspace.menu.newSubShelf"),
                          dialogDescription: t(
                            "workspace.navigation.typeNewName"
                          ),
                          inputPlaceholder: t(
                            "workspace.navigation.typeNewName"
                          ),
                          onCancel: modal.close,
                          onCreate: name =>
                            shelfItem.createSubShelf(shelf.id, name),
                        })
                      }
                    >
                      <FolderPlus className="mr-2 size-4" />
                      {t("workspace.menu.subShelf")}
                    </ContextMenuItem>
                  </ContextMenuGroup>
                  <ContextMenuSeparator />
                  <ContextMenuLabel>
                    {t("workspace.menu.edit")}
                  </ContextMenuLabel>
                  <ContextMenuGroup>
                    <ContextMenuItem
                      onSelect={() =>
                        shelfItem.startRenaming(shelf.id, shelf.name)
                      }
                    >
                      <Pencil className="mr-2 size-4" />
                      {t("workspace.menu.rename")}
                    </ContextMenuItem>
                    <ContextMenuItem
                      className="text-destructive focus:text-destructive"
                      onSelect={() => void shelfItem.deleteRootShelf(shelf.id)}
                    >
                      <Trash2 className="mr-2 size-4" />
                      {t("workspace.menu.delete")}
                    </ContextMenuItem>
                  </ContextMenuGroup>
                </ContextMenuContent>
              </ContextMenu>
            )}
            <CollapsibleContent>
              <SidebarMenuSub>
                {shelf.subShelves.map(subShelf => (
                  <SidebarMenuItem key={subShelf.id}>
                    {shelfItem.editingId === subShelf.id ? (
                      <NameField
                        label={t("workspace.navigation.typeNewName")}
                        value={shelfItem.editName}
                        onChange={shelfItem.setEditName}
                        onSubmit={() => void shelfItem.renameEditing()}
                        onCancel={shelfItem.cancelRenaming}
                      />
                    ) : (
                      <ContextMenu>
                        <ContextMenuTrigger asChild>
                          <SidebarMenuButton className="w-full overflow-hidden rounded-sm text-ellipsis whitespace-nowrap">
                            <ChevronRightIcon />
                            <span>{subShelf.name}</span>
                          </SidebarMenuButton>
                        </ContextMenuTrigger>
                        <ContextMenuContent>
                          <ContextMenuLabel>
                            {t("workspace.menu.add")}
                          </ContextMenuLabel>
                          <ContextMenuGroup>
                            <ContextMenuSub>
                              <ContextMenuSubTrigger>
                                <PackagePlus className="mr-2 size-4" />
                                {t("workspace.menu.items")}
                              </ContextMenuSubTrigger>
                              <ContextMenuSubContent>
                                <ContextMenuItem
                                  onSelect={() =>
                                    modal.open("CreateShelfItemDialog", {
                                      dialogHeader: t(
                                        "workspace.menu.newMaterial"
                                      ),
                                      dialogDescription: t(
                                        "workspace.navigation.typeNewName"
                                      ),
                                      inputPlaceholder: t(
                                        "workspace.navigation.typeNewName"
                                      ),
                                      onCancel: modal.close,
                                      onCreate: name =>
                                        shelfItem.createItem(
                                          shelf.id,
                                          subShelf.id,
                                          name,
                                          ItemType.Material
                                        ),
                                    })
                                  }
                                >
                                  <MaterialIcon className="mr-2 size-4" />
                                  {t("workspace.menu.material")}
                                </ContextMenuItem>
                                <ContextMenuItem
                                  onSelect={() =>
                                    modal.open("CreateShelfItemDialog", {
                                      dialogHeader: t(
                                        "workspace.menu.newBlockPack"
                                      ),
                                      dialogDescription: t(
                                        "workspace.navigation.typeNewName"
                                      ),
                                      inputPlaceholder: t(
                                        "workspace.navigation.typeNewName"
                                      ),
                                      onCancel: modal.close,
                                      onCreate: name =>
                                        shelfItem.createItem(
                                          shelf.id,
                                          subShelf.id,
                                          name,
                                          ItemType.BlockPack
                                        ),
                                    })
                                  }
                                >
                                  <BlockPackIcon className="mr-2 size-4" />
                                  {t("workspace.menu.blockPack")}
                                </ContextMenuItem>
                              </ContextMenuSubContent>
                            </ContextMenuSub>
                          </ContextMenuGroup>
                          <ContextMenuSeparator />
                          <ContextMenuLabel>
                            {t("workspace.menu.edit")}
                          </ContextMenuLabel>
                          <ContextMenuGroup>
                            <ContextMenuItem
                              onSelect={() =>
                                shelfItem.startRenaming(
                                  subShelf.id,
                                  subShelf.name
                                )
                              }
                            >
                              <Pencil className="mr-2 size-4" />
                              {t("workspace.menu.rename")}
                            </ContextMenuItem>
                            <ContextMenuItem
                              className="text-destructive focus:text-destructive"
                              onSelect={() =>
                                void shelfItem.deleteSubShelf(
                                  shelf.id,
                                  subShelf.id
                                )
                              }
                            >
                              <Trash2 className="mr-2 size-4" />
                              {t("workspace.menu.delete")}
                            </ContextMenuItem>
                          </ContextMenuGroup>
                        </ContextMenuContent>
                      </ContextMenu>
                    )}
                    {subShelf.items.map(item => (
                      <SidebarMenuItem key={item.id}>
                        {shelfItem.editingId === item.id ? (
                          <NameField
                            label={t("workspace.navigation.typeNewName")}
                            value={shelfItem.editName}
                            onChange={shelfItem.setEditName}
                            onSubmit={() => void shelfItem.renameEditing()}
                            onCancel={shelfItem.cancelRenaming}
                          />
                        ) : (
                          <ContextMenu>
                            <ContextMenuTrigger asChild>
                              <SidebarMenuButton
                                className="w-full overflow-hidden rounded-sm text-ellipsis whitespace-nowrap"
                                onClick={() =>
                                  void navigate({
                                    to:
                                      item.type === ItemType.BlockPack
                                        ? "/app/block-packs/$blockPackId"
                                        : "/app/materials/$materialId",
                                    params:
                                      item.type === ItemType.BlockPack
                                        ? { blockPackId: item.id }
                                        : { materialId: item.id },
                                  })
                                }
                              >
                                <span>{item.name}</span>
                              </SidebarMenuButton>
                            </ContextMenuTrigger>
                            <ContextMenuContent>
                              <ContextMenuLabel>
                                {t("workspace.menu.edit")}
                              </ContextMenuLabel>
                              <ContextMenuGroup>
                                <ContextMenuItem
                                  onSelect={() =>
                                    shelfItem.startRenaming(item.id, item.name)
                                  }
                                >
                                  <Pencil className="mr-2 size-4" />
                                  {t("workspace.menu.rename")}
                                </ContextMenuItem>
                                <ContextMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onSelect={() =>
                                    void shelfItem.deleteItem(
                                      shelf.id,
                                      subShelf.id,
                                      item.id
                                    )
                                  }
                                >
                                  <Trash2 className="mr-2 size-4" />
                                  {t("workspace.menu.delete")}
                                </ContextMenuItem>
                              </ContextMenuGroup>
                            </ContextMenuContent>
                          </ContextMenu>
                        )}
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenuItem>
                ))}
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
      ))}
    </SidebarMenu>
  );
};

const DesktopStationMenu = ({ createSignal }: { createSignal: number }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const modal = useModal();
  const sidebar = useStationRoutineSidebar();
  const seenSignal = useRef(0);
  const [openStationId, setOpenStationId] = useState<string | null>(null);

  useEffect(() => {
    if (createSignal === seenSignal.current) return;
    seenSignal.current = createSignal;
    modal.open("CreateStationDialog", {});
  }, [createSignal, modal]);

  return (
    <SidebarMenu>
      {sidebar.stations.map(station => (
        <Collapsible
          key={station.id}
          open={openStationId === station.id}
          onOpenChange={open => setOpenStationId(open ? station.id : null)}
        >
          <SidebarMenuItem>
            <ContextMenu>
              <ContextMenuTrigger asChild>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    className="w-full rounded-sm pr-24"
                    onClick={() =>
                      void navigate({
                        to: "/app/stations/$stationId",
                        params: { stationId: station.id },
                      })
                    }
                  >
                    {openStationId === station.id ? (
                      <ChevronDownIcon />
                    ) : (
                      <ChevronRightIcon />
                    )}
                    {station.icon ? (
                      <span className="shrink-0 select-none text-sm">
                        {station.icon}
                      </span>
                    ) : (
                      <StationIcon size={16} />
                    )}
                    <span className="min-w-0 truncate">{station.name}</span>
                  </SidebarMenuButton>
                </CollapsibleTrigger>
              </ContextMenuTrigger>
              <ContextMenuContent className="min-w-40">
                <ContextMenuLabel>{t("workspace.menu.view")}</ContextMenuLabel>
                <ContextMenuGroup>
                  <ContextMenuItem
                    onSelect={() =>
                      void navigate({
                        to: "/app/stations/$stationId",
                        params: { stationId: station.id },
                      })
                    }
                  >
                    <StationIcon className="mr-2 size-4" />
                    {t("workspace.menu.viewInOverview")}
                  </ContextMenuItem>
                </ContextMenuGroup>
                <ContextMenuSeparator />
                <ContextMenuLabel>{t("workspace.menu.add")}</ContextMenuLabel>
                <ContextMenuGroup>
                  <ContextMenuItem
                    onSelect={() =>
                      modal.open("CreateRoutineDialog", {
                        stationId: station.id as UUID,
                        stationName: station.name,
                        onCreated: routineId =>
                          void navigate({
                            to: "/app/routines/$routineId",
                            params: { routineId },
                          }),
                      })
                    }
                  >
                    <RoutineIcon className="mr-2 size-4" />
                    {t("workspace.table.routine")}
                  </ContextMenuItem>
                </ContextMenuGroup>
                <ContextMenuSeparator />
                <ContextMenuLabel>{t("workspace.menu.edit")}</ContextMenuLabel>
                <ContextMenuGroup>
                  <ContextMenuItem
                    className="text-destructive focus:text-destructive"
                    onSelect={() => void sidebar.deleteStation(station.id)}
                  >
                    <Trash2 className="mr-2 size-4" />
                    {t("workspace.menu.delete")}
                  </ContextMenuItem>
                </ContextMenuGroup>
              </ContextMenuContent>
            </ContextMenu>
            <CollapsibleContent>
              <StationRoutines stationId={station.id} />
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
      ))}
    </SidebarMenu>
  );
};

const StationRoutines = ({ stationId }: { stationId: string }) => {
  const navigate = useNavigate();
  const routines = useGetMyRoutinesByStationId(GetMyRoutinesByStationId, {
    param: { stationId, areDeleted: false },
  });
  return (
    <SidebarMenuSub>
      {(routines.data?.data ?? []).map(routine => (
        <SidebarMenuSubItem key={routine.id}>
          <SidebarMenuSubButton
            className="cursor-pointer select-none"
            onClick={() =>
              void navigate({
                to: "/app/routines/$routineId",
                params: { routineId: routine.id },
              })
            }
          >
            {routine.isPinned ? (
              <Bookmark className="size-3.5 shrink-0 text-muted-foreground" />
            ) : null}
            <span className="min-w-0 truncate">{routine.title}</span>
          </SidebarMenuSubButton>
        </SidebarMenuSubItem>
      ))}
    </SidebarMenuSub>
  );
};

const DesktopRoutineTagMenu = ({ createSignal }: { createSignal: number }) => {
  const { t } = useTranslation();
  const modal = useModal();
  const sidebar = useStationRoutineSidebar();
  const seenSignal = useRef(0);

  useEffect(() => {
    if (createSignal === seenSignal.current) return;
    seenSignal.current = createSignal;
    modal.open("CreateRoutineTagDialog", {});
  }, [createSignal, modal]);

  return (
    <SidebarMenu>
      {sidebar.routineTags.map(tag => (
        <SidebarMenuItem key={tag.id}>
          <SidebarMenuButton className="w-full rounded-sm pr-12">
            <span
              className="size-3 shrink-0 rounded-[2px] border border-border/60"
              style={{ backgroundColor: tag.color }}
            />
            {tag.icon ? (
              <span className="shrink-0 select-none text-sm">{tag.icon}</span>
            ) : null}
            <span className="min-w-0 truncate">{tag.name}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
};

export default AppSidebar;
