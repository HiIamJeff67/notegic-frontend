import { useStationRoutineSidebar } from "@shared/api/hooks/react/StationRoutineSidebarProvider";
import { useShelfItem } from "@shared/api/hooks/react/useShelfItem";
import { ItemType } from "@shared/api/interfaces/enums/itemType.enum";
import { WorkspaceSidebar } from "@shared/components/commons/WorkspaceSidebar/WorkspaceSidebar";
import AvatarIcon from "@shared/components/icons/AvatarIcon";
import {
  BlockPackIcon,
  MaterialIcon,
  RootShelfIcon,
  RoutineTagIcon,
  StationIcon,
  SubShelfIcon,
} from "@shared/components/icons/WorkspaceEntityIcons";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@shared/components/shadcn/collapsible";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@shared/components/shadcn/context-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  useSidebar,
} from "@shared/components/shadcn/sidebar";
import { useTranslation } from "@shared/hooks/useTranslation";
import { useNavigate } from "@tanstack/react-router";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  FolderPlus,
  LogIn,
  Trash2,
  UserRoundPlus,
} from "lucide-react";
import { useState } from "react";
import { setAccessToken } from "../../../../api/tokens/accessToken";
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
  const [creatingShelf, setCreatingShelf] = useState(false);
  const [creatingStation, setCreatingStation] = useState(false);
  const [creatingTag, setCreatingTag] = useState(false);

  return (
    <WorkspaceSidebar
      dashboardLabel={t("workspace.navigation.dashboard")}
      onDashboard={() => void navigate({ to: "/app/dashboard" })}
      shelvesLabel={t("workspace.navigation.shelves")}
      createShelfLabel={t("workspace.navigation.createRootShelf")}
      onCreateShelf={account ? () => setCreatingShelf(true) : undefined}
      shelfMenu={
        account ? (
          <DesktopShelfMenu
            creating={creatingShelf}
            onFinishCreate={() => setCreatingShelf(false)}
          />
        ) : null
      }
      stationsLabel={t("workspace.navigation.stations")}
      createStationLabel={t("workspace.navigation.createStation")}
      onCreateStation={account ? () => setCreatingStation(true) : undefined}
      stationMenu={
        account ? (
          <DesktopStationMenu
            creating={creatingStation}
            onFinishCreate={() => setCreatingStation(false)}
          />
        ) : null
      }
      routineTagsLabel={t("workspace.navigation.routineTags")}
      createRoutineTagLabel={t("workspace.navigation.createRoutineTag")}
      onCreateRoutineTag={account ? () => setCreatingTag(true) : undefined}
      routineTagMenu={
        account ? (
          <DesktopRoutineTagMenu
            creating={creatingTag}
            onFinishCreate={() => setCreatingTag(false)}
          />
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

const DesktopShelfMenu = ({
  creating,
  onFinishCreate,
}: {
  creating: boolean;
  onFinishCreate: () => void;
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const shelfItem = useShelfItem();
  const [draft, setDraft] = useState("");
  const [creatingSubId, setCreatingSubId] = useState<string | null>(null);
  const [creatingItemId, setCreatingItemId] = useState<string | null>(null);
  const shelves = shelfItem.shelvesRef.current;

  const submitRoot = () => {
    const name = draft.trim();
    if (name === "") {
      onFinishCreate();
      return;
    }
    void shelfItem.createRootShelf(name).then(() => {
      setDraft("");
      onFinishCreate();
    });
  };

  return (
    <SidebarMenu>
      {creating ? (
        <NameField
          label={t("workspace.navigation.createRootShelf")}
          value={draft}
          onChange={setDraft}
          onSubmit={submitRoot}
          onCancel={() => {
            setDraft("");
            onFinishCreate();
          }}
        />
      ) : null}
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
                      <RootShelfIcon size={16} />
                      <span className="min-w-0 truncate">{shelf.name}</span>
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                </ContextMenuTrigger>
                <ContextMenuContent>
                  <ContextMenuItem onSelect={() => setCreatingSubId(shelf.id)}>
                    <FolderPlus />
                    <span>{t("workspace.menu.newSubShelf")}</span>
                  </ContextMenuItem>
                  <ContextMenuItem
                    onSelect={() =>
                      shelfItem.startRenaming(shelf.id, shelf.name)
                    }
                  >
                    <span>{t("workspace.menu.rename")}</span>
                  </ContextMenuItem>
                  <ContextMenuItem
                    onSelect={() => void shelfItem.deleteRootShelf(shelf.id)}
                  >
                    <Trash2 />
                    <span>{t("workspace.menu.delete")}</span>
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            )}
            <CollapsibleContent>
              <SidebarMenuSub>
                {creatingSubId === shelf.id ? (
                  <ShelfDraft
                    label={t("workspace.menu.newSubShelf")}
                    onCancel={() => setCreatingSubId(null)}
                    onSubmit={name =>
                      void shelfItem
                        .createSubShelf(shelf.id, name)
                        .then(() => setCreatingSubId(null))
                    }
                  />
                ) : null}
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
                            <SubShelfIcon size={16} />
                            <span className="min-w-0 truncate">
                              {subShelf.name}
                            </span>
                          </SidebarMenuButton>
                        </ContextMenuTrigger>
                        <ContextMenuContent>
                          <ContextMenuItem
                            onSelect={() => setCreatingItemId(subShelf.id)}
                          >
                            <span>{t("workspace.menu.newMaterial")}</span>
                          </ContextMenuItem>
                          <ContextMenuItem
                            onSelect={() =>
                              shelfItem.startRenaming(
                                subShelf.id,
                                subShelf.name
                              )
                            }
                          >
                            <span>{t("workspace.menu.rename")}</span>
                          </ContextMenuItem>
                          <ContextMenuItem
                            onSelect={() =>
                              void shelfItem.deleteSubShelf(
                                shelf.id,
                                subShelf.id
                              )
                            }
                          >
                            <Trash2 />
                            <span>{t("workspace.menu.delete")}</span>
                          </ContextMenuItem>
                        </ContextMenuContent>
                      </ContextMenu>
                    )}
                    {creatingItemId === subShelf.id ? (
                      <ShelfDraft
                        label={t("workspace.menu.newMaterial")}
                        onCancel={() => setCreatingItemId(null)}
                        onSubmit={name =>
                          void shelfItem
                            .createItem(
                              shelf.id,
                              subShelf.id,
                              name,
                              ItemType.Material
                            )
                            .then(() => setCreatingItemId(null))
                        }
                      />
                    ) : null}
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
                                {item.type === ItemType.BlockPack ? (
                                  <BlockPackIcon className="size-4" />
                                ) : (
                                  <MaterialIcon className="size-4" />
                                )}
                                <span className="min-w-0 truncate">
                                  {item.name}
                                </span>
                              </SidebarMenuButton>
                            </ContextMenuTrigger>
                            <ContextMenuContent>
                              <ContextMenuItem
                                onSelect={() =>
                                  shelfItem.startRenaming(item.id, item.name)
                                }
                              >
                                <span>{t("workspace.menu.rename")}</span>
                              </ContextMenuItem>
                              <ContextMenuItem
                                onSelect={() =>
                                  void shelfItem.deleteItem(
                                    shelf.id,
                                    subShelf.id,
                                    item.id
                                  )
                                }
                              >
                                <Trash2 />
                                <span>{t("workspace.menu.delete")}</span>
                              </ContextMenuItem>
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

const ShelfDraft = ({
  label,
  onSubmit,
  onCancel,
}: {
  label: string;
  onSubmit: (name: string) => void;
  onCancel: () => void;
}) => {
  const [draft, setDraft] = useState("");
  return (
    <NameField
      label={label}
      value={draft}
      onChange={setDraft}
      onCancel={onCancel}
      onSubmit={() => {
        const name = draft.trim();
        if (name === "") {
          onCancel();
          return;
        }
        onSubmit(name);
      }}
    />
  );
};

const DesktopStationMenu = ({
  creating,
  onFinishCreate,
}: {
  creating: boolean;
  onFinishCreate: () => void;
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const sidebar = useStationRoutineSidebar();
  const [draft, setDraft] = useState("");
  return (
    <SidebarMenu>
      {creating ? (
        <NameField
          label={t("workspace.navigation.createStation")}
          value={draft}
          onChange={setDraft}
          onCancel={() => {
            setDraft("");
            onFinishCreate();
          }}
          onSubmit={() => {
            const name = draft.trim();
            if (name === "") {
              onFinishCreate();
              return;
            }
            void sidebar.createStation(name).then(() => {
              setDraft("");
              onFinishCreate();
            });
          }}
        />
      ) : null}
      {sidebar.stations.map(station => (
        <SidebarMenuItem key={station.id}>
          <ContextMenu>
            <ContextMenuTrigger asChild>
              <SidebarMenuButton
                className="w-full overflow-hidden rounded-sm text-ellipsis whitespace-nowrap"
                onClick={() =>
                  void navigate({
                    to: "/app/stations/$stationId",
                    params: { stationId: station.id },
                  })
                }
              >
                <StationIcon size={16} />
                <span className="min-w-0 truncate">{station.name}</span>
              </SidebarMenuButton>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem
                onSelect={() => void sidebar.deleteStation(station.id)}
              >
                <Trash2 />
                <span>{t("workspace.menu.delete")}</span>
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
};

const DesktopRoutineTagMenu = ({
  creating,
  onFinishCreate,
}: {
  creating: boolean;
  onFinishCreate: () => void;
}) => {
  const { t } = useTranslation();
  const sidebar = useStationRoutineSidebar();
  const [draft, setDraft] = useState("");
  return (
    <SidebarMenu>
      {creating ? (
        <NameField
          label={t("workspace.navigation.createRoutineTag")}
          value={draft}
          onChange={setDraft}
          onCancel={() => {
            setDraft("");
            onFinishCreate();
          }}
          onSubmit={() => {
            const name = draft.trim();
            if (name === "") {
              onFinishCreate();
              return;
            }
            void sidebar.createRoutineTag(name).then(() => {
              setDraft("");
              onFinishCreate();
            });
          }}
        />
      ) : null}
      {sidebar.routineTags.map(tag => (
        <SidebarMenuItem key={tag.id}>
          <SidebarMenuButton className="w-full overflow-hidden rounded-sm text-ellipsis whitespace-nowrap">
            <RoutineTagIcon className="size-4" />
            <span className="min-w-0 truncate">{tag.name}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
};

export default AppSidebar;
