import TruncatedText from "@shared/components/commons/TruncatedText/TruncatedText";
import { Button } from "@shared/components/shadcn/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@shared/components/shadcn/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@shared/components/shadcn/dropdown-menu";
import {
  Menubar,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@shared/components/shadcn/menubar";
import {
  Sidebar,
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
} from "@shared/components/shadcn/sidebar";
import {
  BookOpenIcon,
  ChevronDown,
  ChevronRight,
  LayoutDashboardIcon,
  LogOutIcon,
  MessageSquareWarningIcon,
  PlusIcon,
  SettingsIcon,
  SlidersHorizontalIcon,
  Trash2Icon,
  UserRoundIcon,
} from "lucide-react";
import type {
  CSSProperties,
  MouseEvent as ReactMouseEvent,
  ReactNode,
} from "react";
import {
  RootShelfIcon,
  RoutineIcon,
  RoutineTagIcon,
  StationIcon,
} from "../../icons/WorkspaceEntityIcons";

export type WorkspaceSidebarAccount = {
  name: string;
  status: string;
  avatar: ReactNode;
};

export type WorkspaceSidebarProps = {
  dashboardLabel: string;
  onDashboard: () => void;
  routinesLabel?: string;
  onRoutines?: () => void;
  shelvesLabel: string;
  createShelfLabel: string;
  onCreateShelf?: () => void;
  shelfMenu: ReactNode;
  stationsLabel: string;
  createStationLabel: string;
  onCreateStation?: () => void;
  stationMenu: ReactNode;
  routineTagsLabel?: string;
  createRoutineTagLabel?: string;
  onCreateRoutineTag?: () => void;
  routineTagMenu?: ReactNode;
  documentLabel?: string;
  documentIcon?: ReactNode;
  onDocument?: () => void;
  trashLabel?: string;
  onTrash?: () => void;
  reportLabel?: string;
  onReport?: () => void;
  account?: WorkspaceSidebarAccount;
  settingsLabel: string;
  accountLabel: string;
  preferencesLabel: string;
  onAccount?: () => void;
  onPreferences?: () => void;
  logoutLabel: string;
  onLogout?: () => void;
  signedOut?: ReactNode;
  notifications?: (mobile: boolean) => ReactNode;
  resize?: {
    style: CSSProperties;
    width: number;
    onMouseDown: (event: ReactMouseEvent) => void;
    onDoubleClick: () => void;
  };
};

const NavButton = ({
  expanded,
  label,
  onClick,
  icon,
}: {
  expanded: boolean;
  label: string;
  onClick: () => void;
  icon: ReactNode;
}) => (
  <SidebarMenuButton
    className={`flex w-full items-center select-none hover:bg-primary ${
      expanded ? "justify-start" : "justify-center"
    }`}
    onClick={onClick}
  >
    {icon}
    {expanded && <span className="truncate">{label}</span>}
  </SidebarMenuButton>
);

export const WorkspaceSidebar = ({
  dashboardLabel,
  onDashboard,
  routinesLabel,
  onRoutines,
  shelvesLabel,
  createShelfLabel,
  onCreateShelf,
  shelfMenu,
  stationsLabel,
  createStationLabel,
  onCreateStation,
  stationMenu,
  routineTagsLabel,
  createRoutineTagLabel,
  onCreateRoutineTag,
  routineTagMenu,
  documentLabel,
  documentIcon,
  onDocument,
  trashLabel,
  onTrash,
  reportLabel,
  onReport,
  account,
  settingsLabel,
  accountLabel,
  preferencesLabel,
  onAccount,
  onPreferences,
  logoutLabel,
  onLogout,
  signedOut,
  notifications,
  resize,
}: WorkspaceSidebarProps) => {
  const sidebarManager = useSidebar();
  const expanded = sidebarManager.open || sidebarManager.isMobile;
  const showSettings = Boolean(onAccount || onPreferences || onLogout);

  return (
    <Sidebar
      variant="sidebar"
      collapsible="icon"
      className="m-0 overflow-hidden border-sidebar-border p-0"
      style={resize?.style}
    >
      <div className="relative flex h-full flex-col">
        <SidebarHeader className="flex min-h-[calc(var(--app-navigation-height)-1px)] flex-col items-center justify-center p-0">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem
                  className={`${
                    expanded ? "flex-row pr-1" : "flex-col-reverse"
                  } flex items-center justify-between gap-1 rounded-sm hover:bg-accent`}
                >
                  <SidebarMenuButton
                    className="flex w-19/20 items-center justify-start bg-transparent select-none hover:bg-primary"
                    onClick={onDashboard}
                  >
                    <LayoutDashboardIcon />
                    {expanded && (
                      <span className="truncate">{dashboardLabel}</span>
                    )}
                  </SidebarMenuButton>
                  <SidebarTrigger
                    variant="default"
                    className="bg-transparent text-foreground select-none hover:bg-primary"
                  />
                </SidebarMenuItem>
                {onRoutines && routinesLabel ? (
                  <SidebarMenuItem className="rounded-sm">
                    <NavButton
                      expanded={expanded}
                      label={routinesLabel}
                      onClick={onRoutines}
                      icon={<RoutineIcon />}
                    />
                  </SidebarMenuItem>
                ) : null}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarHeader>
        <SidebarSeparator className="m-0 w-full p-0" />
        <SidebarContent>
          <SidebarGroup className="mb-0 pb-0">
            <Collapsible defaultOpen className="group/collapsible">
              <CollapsibleTrigger asChild>
                <SidebarGroupLabel className="gap-2 [&[data-state=closed]:hover_.group-label-chevron-right]:block [&[data-state=open]:hover_.group-label-chevron-down]:block">
                  <RootShelfIcon size={16} />
                  <span>{shelvesLabel}</span>
                  <ChevronRight className="group-label-chevron-right hidden size-3" />
                  <ChevronDown className="group-label-chevron-down hidden size-3" />
                </SidebarGroupLabel>
              </CollapsibleTrigger>
              {onCreateShelf ? (
                <SidebarGroupAction
                  className="sidebar-group-label-action text-muted-foreground opacity-0 transition-opacity"
                  aria-label={createShelfLabel}
                  title={createShelfLabel}
                  onClick={onCreateShelf}
                >
                  <PlusIcon />
                </SidebarGroupAction>
              ) : null}
              <CollapsibleContent className="sidebar-group-collapsible-content overflow-hidden">
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuSub className="w-full pr-4">
                        <SidebarMenuSubItem className="w-full">
                          {shelfMenu}
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
                  <span>{stationsLabel}</span>
                  <ChevronRight className="group-label-chevron-right hidden size-3" />
                  <ChevronDown className="group-label-chevron-down hidden size-3" />
                </SidebarGroupLabel>
              </CollapsibleTrigger>
              {onCreateStation ? (
                <SidebarGroupAction
                  className="sidebar-group-label-action text-muted-foreground opacity-0 transition-opacity"
                  aria-label={createStationLabel}
                  title={createStationLabel}
                  onClick={onCreateStation}
                >
                  <PlusIcon />
                </SidebarGroupAction>
              ) : null}
              <CollapsibleContent className="sidebar-group-collapsible-content overflow-hidden">
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuSub className="w-full pr-4">
                        <SidebarMenuSubItem className="w-full">
                          {stationMenu}
                          {routineTagMenu ? (
                            <div className="my-2 flex flex-col gap-1 border-t border-sidebar-border pt-2">
                              <div className="group/routine-tags-label flex h-7 items-center justify-between px-2 text-xs text-muted-foreground">
                                <div className="flex min-w-0 items-center gap-2">
                                  <RoutineTagIcon className="size-3.5 shrink-0" />
                                  <span className="truncate">
                                    {routineTagsLabel}
                                  </span>
                                </div>
                                {onCreateRoutineTag ? (
                                  <button
                                    type="button"
                                    className="flex size-5 shrink-0 items-center justify-center rounded-sm opacity-0 transition-opacity hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-hover/routine-tags-label:opacity-100 focus-visible:opacity-100"
                                    aria-label={createRoutineTagLabel}
                                    title={createRoutineTagLabel}
                                    onClick={onCreateRoutineTag}
                                  >
                                    <PlusIcon className="size-3.5" />
                                  </button>
                                ) : null}
                              </div>
                              {routineTagMenu}
                            </div>
                          ) : null}
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </Collapsible>
          </SidebarGroup>
        </SidebarContent>
        <SidebarGroup
          className={
            expanded
              ? "mx-2 mb-0 w-auto rounded-t-md border border-b-0 border-sidebar-border bg-sidebar-accent/20 px-1 py-1"
              : "m-0 mb-0 w-full rounded-none border-none bg-transparent p-0"
          }
        >
          <SidebarGroupContent>
            <SidebarMenu className={expanded ? undefined : "items-center"}>
              {onDocument && documentLabel ? (
                <SidebarMenuItem className="rounded-sm">
                  <NavButton
                    expanded={expanded}
                    label={documentLabel}
                    onClick={onDocument}
                    icon={documentIcon ?? <BookOpenIcon />}
                  />
                </SidebarMenuItem>
              ) : null}
              {onTrash && trashLabel ? (
                <SidebarMenuItem className="rounded-sm">
                  <NavButton
                    expanded={expanded}
                    label={trashLabel}
                    onClick={onTrash}
                    icon={<Trash2Icon />}
                  />
                </SidebarMenuItem>
              ) : null}
              {onReport && reportLabel ? (
                <SidebarMenuItem className="rounded-sm">
                  <NavButton
                    expanded={expanded}
                    label={reportLabel}
                    onClick={onReport}
                    icon={<MessageSquareWarningIcon />}
                  />
                </SidebarMenuItem>
              ) : null}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarSeparator className="m-0 w-full p-0" />
        {account ? (
          <SidebarFooter className="m-0 w-full p-0">
            {sidebarManager.isMobile ? (
              <div className="flex w-full items-center gap-1 px-1 py-1">
                <div className="flex min-w-0 flex-1 items-center gap-2 px-2 py-1">
                  {account.avatar}
                  <div className="flex min-w-0 flex-1 flex-col text-start">
                    <TruncatedText
                      className="text-xs font-semibold text-foreground"
                      width="100%"
                    >
                      {account.name}
                    </TruncatedText>
                    <TruncatedText
                      className="text-xs font-light text-foreground"
                      width="100%"
                    >
                      {account.status}
                    </TruncatedText>
                  </div>
                </div>
                {showSettings ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="shrink-0 [&_svg]:size-5"
                        aria-label={settingsLabel}
                        title={settingsLabel}
                      >
                        <SettingsIcon size={20} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      side="top"
                      className="w-64"
                    >
                      {onAccount || onPreferences ? (
                        <DropdownMenuGroup>
                          <DropdownMenuLabel>{settingsLabel}</DropdownMenuLabel>
                          {onAccount ? (
                            <DropdownMenuItem onSelect={onAccount}>
                              <UserRoundIcon />
                              <span>{accountLabel}</span>
                            </DropdownMenuItem>
                          ) : null}
                          {onPreferences ? (
                            <DropdownMenuItem onSelect={onPreferences}>
                              <SlidersHorizontalIcon />
                              <span>{preferencesLabel}</span>
                            </DropdownMenuItem>
                          ) : null}
                        </DropdownMenuGroup>
                      ) : null}
                      {onLogout ? (
                        <>
                          {onAccount || onPreferences ? (
                            <DropdownMenuSeparator />
                          ) : null}
                          <DropdownMenuGroup>
                            <DropdownMenuLabel>
                              {accountLabel}
                            </DropdownMenuLabel>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onSelect={onLogout}
                            >
                              <LogOutIcon />
                              <span>{logoutLabel}</span>
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                        </>
                      ) : null}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : null}
                {notifications?.(true)}
              </div>
            ) : (
              <Menubar
                className={`flex h-full w-full flex-row items-center rounded-none border-none bg-transparent ${
                  expanded ? "justify-start" : "justify-center"
                }`}
              >
                <MenubarMenu>
                  <MenubarTrigger
                    className={`my-1 flex h-full min-w-0 flex-row bg-transparent hover:bg-transparent ${
                      expanded
                        ? "flex-1 justify-start gap-2"
                        : "w-full justify-center px-0"
                    }`}
                  >
                    {account.avatar}
                    {expanded && (
                      <div className="flex min-w-0 flex-1 flex-col text-start">
                        <TruncatedText
                          className="text-xs font-semibold text-foreground transition-all"
                          width={resize ? `${resize.width - 120}px` : "100%"}
                        >
                          {account.name}
                        </TruncatedText>
                        <TruncatedText
                          className="text-xs font-light text-foreground transition-all"
                          width={resize ? `${resize.width - 120}px` : "100%"}
                        >
                          {account.status}
                        </TruncatedText>
                      </div>
                    )}
                  </MenubarTrigger>
                </MenubarMenu>
                {expanded && showSettings ? (
                  <MenubarMenu>
                    <MenubarTrigger
                      className="flex items-center justify-center px-2 py-2"
                      aria-label={settingsLabel}
                      title={settingsLabel}
                    >
                      <SettingsIcon size={20} />
                    </MenubarTrigger>
                    <MenubarContent className="w-64 border-border bg-popover">
                      {onAccount || onPreferences ? (
                        <MenubarGroup>
                          <MenubarLabel className="px-2 pt-2 pb-1 text-xs font-medium text-muted-foreground">
                            {settingsLabel}
                          </MenubarLabel>
                          {onAccount ? (
                            <MenubarItem
                              className="cursor-pointer"
                              onSelect={onAccount}
                            >
                              <UserRoundIcon />
                              <span>{accountLabel}</span>
                            </MenubarItem>
                          ) : null}
                          {onPreferences ? (
                            <MenubarItem
                              className="cursor-pointer"
                              onSelect={onPreferences}
                            >
                              <SlidersHorizontalIcon />
                              <span>{preferencesLabel}</span>
                            </MenubarItem>
                          ) : null}
                        </MenubarGroup>
                      ) : null}
                      {onLogout ? (
                        <>
                          {onAccount || onPreferences ? (
                            <MenubarSeparator />
                          ) : null}
                          <MenubarGroup>
                            <MenubarLabel className="px-2 pt-2 pb-1 text-xs font-medium text-muted-foreground">
                              {accountLabel}
                            </MenubarLabel>
                            <MenubarItem
                              className="cursor-pointer text-destructive focus:text-destructive"
                              onSelect={() => void onLogout()}
                            >
                              <LogOutIcon />
                              <span>{logoutLabel}</span>
                            </MenubarItem>
                          </MenubarGroup>
                        </>
                      ) : null}
                    </MenubarContent>
                  </MenubarMenu>
                ) : null}
                {expanded ? notifications?.(false) : null}
              </Menubar>
            )}
          </SidebarFooter>
        ) : signedOut ? (
          <SidebarFooter className="m-0 w-full p-0">{signedOut}</SidebarFooter>
        ) : null}
        {sidebarManager.open && !sidebarManager.isMobile && resize ? (
          <div
            role="separator"
            aria-orientation="vertical"
            className="absolute top-0 right-0 bottom-0 w-1 cursor-col-resize bg-muted opacity-0 transition-opacity hover:opacity-50"
            onMouseDown={resize.onMouseDown}
            onDoubleClick={resize.onDoubleClick}
          />
        ) : null}
      </div>
    </Sidebar>
  );
};
