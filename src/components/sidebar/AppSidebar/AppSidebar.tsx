import { WebURLPathDictionary } from "@shared/constants";
import { LocalStorageManipulator } from "@shared/lib/localStorageManipulator";
import toast from "@shared/lib/toast";
import { LocalStorageKey } from "@shared/types/localStorage.type";
import {
  BookOpenIcon,
  ChevronDown,
  ChevronRight,
  FileTextIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  MessageSquareIcon,
  PlusIcon,
  Repeat2Icon,
  SettingsIcon,
  SlidersHorizontalIcon,
  TagIcon,
  Trash2Icon,
  UserRoundIcon,
} from "lucide-react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import TruncatedText from "@/components/commons/TruncatedText/TruncatedText";
import AvatarIcon from "@/components/icons/AvatarIcon";
import ShelfCaseIcon from "@/components/icons/ShelfCaseIcon";
import {
  RoutineIcon,
  StationIcon,
} from "@/components/icons/WorkspaceEntityIcons";
import RootShelfMenu from "@/components/menus/RootShelfMenu/RootShelfMenu";
import RoutineTagMenu from "@/components/menus/RoutineTagMenu/RoutineTagMenu";
import StationMenu from "@/components/menus/StationMenu/StationMenu";
import { NotificationPopover } from "@/components/popovers/NotificationPopover";
import ResizableSidebar from "@/components/sidebar/ResizableSidebar/ResizableSidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Menubar,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/menubar";
import {
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  useAppRouterActions,
  useResizeSidebar,
  useSettingsDisplay,
  useShelfItem,
  useStationRoutine,
} from "@/hooks";
import { useModal } from "@/hooks/useModal";
import { useUser } from "@/hooks/useUser";
import { translateError } from "@/i18n/error";
import { type SettingsPage } from "@/providers/SettingsDisplayProvider";

interface AppSidebarProps {
  disabled?: boolean;
}

export function AppSidebar({ disabled = false }: AppSidebarProps) {
  if (disabled) return <></>;

  const router = useAppRouterActions();
  const { t } = useTranslation();
  const modalManager = useModal();
  const sidebarManager = useSidebar();
  const resizableSidebarManager = useResizeSidebar();
  const stationRoutineManager = useStationRoutine();
  const userManager = useUser();
  const shelfItemManager = useShelfItem();
  const settingsDisplay = useSettingsDisplay();

  const openSettings = (page: SettingsPage) => {
    if (
      LocalStorageManipulator.getItemByKey(
        LocalStorageKey.settingsDisplayMode
      ) === "sheet"
    ) {
      settingsDisplay.openSheet(page);
      return;
    }

    router.push(
      page === "account"
        ? WebURLPathDictionary.app.setting.account
        : WebURLPathDictionary.app.setting.preferences
    );
  };

  useEffect(() => {
    if (!userManager.userData) return;

    const initiallySearchRootShelves = async () =>
      await shelfItemManager
        .searchRootShelves()
        .catch(error => toast.error(translateError(error, t)));
    initiallySearchRootShelves();
  }, [userManager.userData?.publicId]);

  return (
    <ResizableSidebar
      variant="sidebar"
      collapsible="icon"
      className="p-0 m-0 overflow-hidden"
    >
      <SidebarHeader className="flex flex-col justify-center items-center p-0">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem
                className={`${
                  sidebarManager.open ? "flex-row pr-1" : "flex-col-reverse"
                } flex justify-between items-center gap-1 hover:bg-accent rounded-sm`}
              >
                <SidebarMenuButton
                  className="w-19/20 bg-transparent hover:bg-primary flex justify-start items-center select-none"
                  onClick={() =>
                    router.push(WebURLPathDictionary.app.dashboard._)
                  }
                >
                  <LayoutDashboardIcon />
                  {sidebarManager.open && (
                    <span className="truncate">
                      {t("workspace.navigation.dashboard")}
                    </span>
                  )}
                </SidebarMenuButton>
                <SidebarTrigger
                  variant={"default"}
                  className="select-none bg-transparent text-foreground hover:bg-primary"
                />
              </SidebarMenuItem>
              <SidebarMenuItem className="rounded-sm">
                <SidebarMenuButton
                  className={`w-full flex ${
                    sidebarManager.open ? "justify-start" : "justify-center"
                  } items-center select-none hover:bg-primary`}
                  onClick={() =>
                    router.push(WebURLPathDictionary.app.routines._)
                  }
                >
                  <RoutineIcon />
                  {sidebarManager.open && (
                    <span className="truncate">
                      {t("workspace.navigation.routines")}
                    </span>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem className="rounded-sm">
                <SidebarMenuButton
                  className={`w-full flex ${
                    sidebarManager.open ? "justify-start" : "justify-center"
                  } items-center select-none hover:bg-primary`}
                >
                  <MessageSquareIcon />
                  {sidebarManager.open && (
                    <span className="truncate">
                      {t("workspace.navigation.community")}
                    </span>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarHeader>
      <SidebarSeparator className="w-full m-0 p-0" />
      <SidebarContent>
        <SidebarGroup className="mb-0 pb-0">
          <Collapsible defaultOpen className="group/collapsible">
            <CollapsibleTrigger asChild>
              <SidebarGroupLabel className="gap-2 [&[data-state=closed]:hover_.group-label-chevron-right]:block [&[data-state=open]:hover_.group-label-chevron-down]:block">
                <ShelfCaseIcon size={16} />
                <span>{t("workspace.navigation.shelves")}</span>
                <ChevronRight className="group-label-chevron-right hidden size-3" />
                <ChevronDown className="group-label-chevron-down hidden size-3" />
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <SidebarGroupAction
              className="sidebar-group-label-action opacity-0 transition-opacity text-muted-foreground"
              aria-label={t("workspace.navigation.createRootShelf")}
              title={t("workspace.navigation.createRootShelf")}
              onClick={() =>
                modalManager.open("CreateShelfItemDialog", {
                  dialogHeader: t("workspace.navigation.createRootShelfDialog"),
                  dialogDescription: t(
                    "workspace.navigation.typeRootShelfName"
                  ),
                  disableInput: false,
                  inputPlaceholder: t("workspace.navigation.typeNewName"),
                  onCreate: async (newRootShelfName: string) => {
                    await shelfItemManager
                      .createRootShelf(newRootShelfName)
                      .catch(error => toast.error(translateError(error, t)));
                  },
                  onCancel: modalManager.close,
                })
              }
            >
              <PlusIcon />
            </SidebarGroupAction>
            <CollapsibleContent className="sidebar-group-collapsible-content overflow-hidden">
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuSub className="w-full pr-4">
                      <SidebarMenuSubItem className="w-full">
                        <RootShelfMenu />
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>
        <SidebarGroup className="my-0 pb-0">
          <Collapsible defaultOpen className="group/collapsible">
            <CollapsibleTrigger asChild>
              <SidebarGroupLabel className="gap-2 [&[data-state=closed]:hover_.group-label-chevron-right]:block [&[data-state=open]:hover_.group-label-chevron-down]:block">
                <StationIcon size={16} />
                <span>{t("workspace.navigation.stations")}</span>
                <ChevronRight className="group-label-chevron-right hidden size-3" />
                <ChevronDown className="group-label-chevron-down hidden size-3" />
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <SidebarGroupAction
              className="sidebar-group-label-action opacity-0 transition-opacity text-muted-foreground"
              aria-label={t("workspace.navigation.createStation")}
              title={t("workspace.navigation.createStation")}
              onClick={() => modalManager.open("CreateStationDialog", {})}
            >
              <PlusIcon />
            </SidebarGroupAction>
            <CollapsibleContent className="sidebar-group-collapsible-content overflow-hidden">
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuSub className="w-full pr-4">
                      <SidebarMenuSubItem className="w-full">
                        <StationMenu />
                        <div className="my-2 flex flex-col gap-1 border-t border-sidebar-border pt-2">
                          <div className="group/routine-tags-label flex h-7 items-center justify-between px-2 text-xs text-muted-foreground">
                            <div className="flex min-w-0 items-center gap-2">
                              <TagIcon className="size-3.5 shrink-0" />
                              <span className="truncate">
                                {t("workspace.navigation.routineTags")}
                              </span>
                            </div>
                            <button
                              type="button"
                              className="flex size-5 shrink-0 items-center justify-center rounded-sm opacity-0 transition-opacity hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-hover/routine-tags-label:opacity-100 focus-visible:opacity-100"
                              aria-label={t(
                                "workspace.navigation.createRoutineTag"
                              )}
                              title={t("workspace.navigation.createRoutineTag")}
                              onClick={() =>
                                modalManager.open("CreateRoutineTagDialog", {
                                  onCreated: async routineTagId => {
                                    stationRoutineManager.selectRoutineTag(
                                      routineTagId
                                    );
                                  },
                                })
                              }
                            >
                              <PlusIcon className="size-3.5" />
                            </button>
                          </div>
                          <RoutineTagMenu />
                        </div>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>
      </SidebarContent>
      <SidebarGroup className="mx-2 mb-0 w-auto rounded-t-md border border-b-0 border-sidebar-border bg-sidebar-accent/20 px-1 py-1">
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem className="rounded-sm">
              <SidebarMenuButton
                className={`w-full flex ${
                  sidebarManager.open ? "justify-start" : "justify-center"
                } items-center select-none hover:bg-primary`}
                onClick={() => router.push(WebURLPathDictionary.document)}
              >
                <FileTextIcon />
                {sidebarManager.open && (
                  <span className="truncate">
                    {t("workspace.navigation.document")}
                  </span>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem className="rounded-sm">
              <SidebarMenuButton
                className={`w-full flex ${
                  sidebarManager.open ? "justify-start" : "justify-center"
                } items-center select-none hover:bg-primary`}
                onClick={() => router.push(WebURLPathDictionary.tutorial)}
              >
                <BookOpenIcon />
                {sidebarManager.open && (
                  <span className="truncate">
                    {t("workspace.navigation.tutorial")}
                  </span>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem className="rounded-sm">
              <SidebarMenuButton
                className={`w-full flex ${
                  sidebarManager.open ? "justify-start" : "justify-center"
                } items-center select-none hover:bg-primary`}
                onClick={() => router.push(WebURLPathDictionary.app.trash)}
              >
                <Trash2Icon />
                {sidebarManager.open && (
                  <span className="truncate">
                    {t("workspace.navigation.trash")}
                  </span>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
      <SidebarSeparator className="w-full m-0 p-0" />
      <SidebarFooter className="w-full p-0 m-0">
        <Menubar className="w-full h-full flex flex-row justify-start items-center rounded-none bg-transparent border-none">
          <MenubarMenu>
            <MenubarTrigger className="h-full my-1 flex flex-1 flex-row min-w-0 gap-2 bg-transparent hover:bg-transparent">
              <AvatarIcon avatarURL="" size={30} />
              <div className="flex min-w-0 flex-1 flex-col text-start">
                <TruncatedText
                  className="text-xs font-semibold text-foreground transition-all"
                  width={`${resizableSidebarManager.width - 120}px`}
                >
                  {userManager.userData?.name ||
                    t("workspace.navigation.userName")}
                </TruncatedText>
                <TruncatedText
                  className="text-xs font-light text-foreground transition-all"
                  width={`${resizableSidebarManager.width - 120}px`}
                >
                  {userManager.userData?.status ||
                    t("workspace.navigation.offline")}
                </TruncatedText>
              </div>
            </MenubarTrigger>
          </MenubarMenu>
          {sidebarManager.open && (
            <MenubarMenu>
              <MenubarTrigger
                className="px-2 py-2 flex items-center justify-center"
                aria-label={t("workspace.navigation.settings")}
                title={t("workspace.navigation.settings")}
              >
                <SettingsIcon size={20} />
              </MenubarTrigger>
              <MenubarContent className="w-64 bg-popover border-border">
                <MenubarGroup>
                  <MenubarLabel className="px-2 pt-2 pb-1 text-xs font-medium text-muted-foreground">
                    {t("workspace.navigation.settings")}
                  </MenubarLabel>
                  <MenubarItem
                    className="cursor-pointer"
                    onSelect={() => openSettings("account")}
                  >
                    <UserRoundIcon />
                    <span>{t("workspace.navigation.account")}</span>
                  </MenubarItem>
                  <MenubarItem
                    className="cursor-pointer"
                    onSelect={() => openSettings("preferences")}
                  >
                    <SlidersHorizontalIcon />
                    <span>{t("workspace.navigation.preferences")}</span>
                  </MenubarItem>
                </MenubarGroup>
                <MenubarSeparator />
                <MenubarGroup>
                  <MenubarLabel className="px-2 pt-2 pb-1 text-xs font-medium text-muted-foreground">
                    {t("workspace.navigation.account")}
                  </MenubarLabel>
                  <MenubarItem className="cursor-pointer">
                    <Repeat2Icon />
                    <span>{t("auth.switchAccount")}</span>
                  </MenubarItem>
                  <MenubarItem
                    className="cursor-pointer text-destructive focus:text-destructive"
                    onSelect={async () => {
                      router.push(WebURLPathDictionary.home);
                      await userManager.logout();
                      toast.success(t("workspace.notifications.logoutSuccess"));
                    }}
                  >
                    <LogOutIcon />
                    <span>{t("auth.logout")}</span>
                  </MenubarItem>
                </MenubarGroup>
              </MenubarContent>
            </MenubarMenu>
          )}
          {sidebarManager.open && <NotificationPopover />}
        </Menubar>
      </SidebarFooter>
    </ResizableSidebar>
  );
}
