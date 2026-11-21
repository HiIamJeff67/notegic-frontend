import { useShelfItem } from "@shared/api/hooks/react/useShelfItem";
import { ItemType } from "@shared/api/interfaces/enums/itemType.enum";
import { type Client, connectDefaultClient } from "@shared/api/local/client";
import { Button } from "@shared/components/shadcn/button";
import { Input } from "@shared/components/shadcn/input";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@shared/components/shadcn/sidebar";
import { useTranslation as useSharedTranslation } from "@shared/hooks/useTranslation";
import { useNavigate } from "@tanstack/react-router";
import { listen } from "@tauri-apps/api/event";
import {
  ChevronDown,
  ChevronRight,
  FolderPlus,
  LayoutDashboardIcon,
  LogIn,
  PlusIcon,
  Trash2,
  UserRoundPlus,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { GetMe } from "../../../../api/functions/user.function";
import { sidecarDriver } from "../../../../api/local/driver";
import { setAccessToken } from "../../../../api/tokens/accessToken";
import {
  logoutNative,
  startNativeLogin,
  startNativeRegister,
} from "../../../../invocations/nativeAuth.invocation";
import { sidecarSession } from "../../../../invocations/sidecar.invocation";
import { ShelfItemProvider } from "../../../../providers/ShelfItemProvider";

export function AppSidebar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const sidebarManager = useSidebar();
  const isSidebarExpanded = sidebarManager.open || sidebarManager.isMobile;
  const loginLabel = t("auth.login");
  const registerLabel = t("auth.register");
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    const subscription = listen<{ accessToken: string; displayName: string }>(
      "native-session",
      event => {
        setAccessToken(event.payload.accessToken);
        setDisplayName(event.payload.displayName);
      }
    );
    return () => {
      void subscription.then(unlisten => unlisten());
    };
  }, []);

  const openLogin = () => {
    void startNativeLogin();
  };

  return (
    <Sidebar
      variant="sidebar"
      collapsible="icon"
      className="m-0 h-auto overflow-hidden border-sidebar-border p-0"
    >
      <div className="relative flex h-full min-h-0 flex-col">
        <SidebarHeader className="flex flex-col items-center justify-center p-0">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem
                  className={`${
                    isSidebarExpanded ? "flex-row pr-1" : "flex-col-reverse"
                  } flex items-center justify-between gap-1 rounded-sm hover:bg-accent`}
                >
                  <SidebarMenuButton
                    className="flex w-19/20 items-center justify-start bg-transparent select-none hover:bg-primary"
                    onClick={() => navigate({ to: "/app/dashboard" })}
                  >
                    <LayoutDashboardIcon />
                    {isSidebarExpanded && (
                      <span className="truncate">
                        {t("workspace.navigation.dashboard")}
                      </span>
                    )}
                  </SidebarMenuButton>
                  <SidebarTrigger
                    variant="default"
                    className="bg-transparent text-foreground select-none hover:bg-primary"
                  />
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarHeader>
        <SidebarContent className="min-w-0">
          {isSidebarExpanded && displayName !== "" && <ShelfSection />}
        </SidebarContent>
        <SidebarFooter className="m-0 w-full">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                className={`flex w-full items-center select-none hover:bg-primary ${
                  isSidebarExpanded ? "justify-start" : "justify-center"
                }`}
                aria-label={displayName || loginLabel}
                title={displayName || loginLabel}
                onClick={() => {
                  if (displayName)
                    void logoutNative().then(() => {
                      setAccessToken("");
                      setDisplayName("");
                    });
                  else openLogin();
                }}
              >
                <LogIn />
                {isSidebarExpanded && (
                  <span className="truncate">{displayName || loginLabel}</span>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
            {displayName === "" && (
              <SidebarMenuItem>
                <SidebarMenuButton
                  className={`flex w-full items-center select-none hover:bg-primary ${
                    isSidebarExpanded ? "justify-start" : "justify-center"
                  }`}
                  aria-label={registerLabel}
                  title={registerLabel}
                  onClick={() => {
                    void startNativeRegister();
                  }}
                >
                  <UserRoundPlus />
                  {isSidebarExpanded && (
                    <span className="truncate">{registerLabel}</span>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </SidebarFooter>
      </div>
    </Sidebar>
  );
}

const ShelfSection = () => {
  const { t } = useSharedTranslation();
  const [draft, setDraft] = useState("");
  const [subDrafts, setSubDrafts] = useState<Record<string, string>>({});
  const [itemDrafts, setItemDrafts] = useState<Record<string, string>>({});
  const [connection, setConnection] = useState<
    | {
        client: Client;
        owner: {
          publicId: string;
          name: string;
          displayName: string;
          email: string;
        };
      }
    | undefined
  >();

  useEffect(() => {
    let cancelled = false;
    const connect = async () => {
      const session = await sidecarSession();
      const me = await GetMe({});
      if (me.success === false || cancelled) return;
      setConnection({
        client: connectDefaultClient(sidecarDriver(session)),
        owner: {
          publicId: me.data.publicId,
          name: me.data.name,
          displayName: me.data.displayName,
          email: me.data.email,
        },
      });
    };
    void connect().catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  if (connection === undefined) return null;

  return (
    <ShelfItemProvider client={connection.client} owner={connection.owner}>
      <ShelfTree
        draft={draft}
        setDraft={setDraft}
        subDrafts={subDrafts}
        setSubDrafts={setSubDrafts}
        itemDrafts={itemDrafts}
        setItemDrafts={setItemDrafts}
        label={t}
      />
    </ShelfItemProvider>
  );
};

const ShelfTree = ({
  draft,
  setDraft,
  subDrafts,
  setSubDrafts,
  itemDrafts,
  setItemDrafts,
  label,
}: {
  draft: string;
  setDraft: (value: string) => void;
  subDrafts: Record<string, string>;
  setSubDrafts: (value: Record<string, string>) => void;
  itemDrafts: Record<string, string>;
  setItemDrafts: (value: Record<string, string>) => void;
  label: ReturnType<typeof useSharedTranslation>["t"];
}) => {
  const shelfItem = useShelfItem();
  return (
    <section className="min-w-0 px-2 py-2">
      <h2 className="truncate px-2 text-sm font-medium">
        {label("workspace.navigation.shelves")}
      </h2>
      <form
        className="mt-2 flex min-w-0 gap-2"
        onSubmit={event => {
          event.preventDefault();
          const name = draft.trim();
          if (name === "") return;
          void shelfItem.createRootShelf(name).then(() => setDraft(""));
        }}
      >
        <Input
          value={draft}
          className="min-w-0"
          placeholder={label("workspace.navigation.shelfNamePlaceholder")}
          aria-label={label("workspace.navigation.createRootShelf")}
          onChange={event => setDraft(event.target.value)}
        />
        <Button
          type="submit"
          size="icon"
          aria-label={label("workspace.navigation.createRootShelf")}
        >
          <PlusIcon />
        </Button>
      </form>
      <ul className="mt-2 flex min-w-0 flex-col gap-1">
        {shelfItem.shelvesRef.current.map(shelf => (
          <li key={shelf.id} className="min-w-0">
            <div className="flex min-w-0 items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                aria-label={shelf.name}
                onClick={() => shelfItem.toggleRootShelf(shelf.id)}
              >
                {shelf.open ? <ChevronDown /> : <ChevronRight />}
              </Button>
              {shelfItem.editingId === shelf.id ? (
                <Input
                  value={shelfItem.editName}
                  className="min-w-0"
                  aria-label={label("workspace.navigation.typeNewName")}
                  onChange={event => shelfItem.setEditName(event.target.value)}
                  onBlur={() => void shelfItem.renameEditing()}
                  onKeyDown={event => {
                    if (event.key !== "Enter") return;
                    event.preventDefault();
                    void shelfItem.renameEditing();
                  }}
                />
              ) : (
                <Button
                  variant="ghost"
                  className="min-w-0 flex-1 justify-start"
                  onClick={() => shelfItem.startRenaming(shelf.id, shelf.name)}
                >
                  <span className="truncate">{shelf.name}</span>
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                aria-label={label("workspace.navigation.trash")}
                onClick={() => void shelfItem.deleteRootShelf(shelf.id)}
              >
                <Trash2 />
              </Button>
            </div>
            {shelf.open && (
              <div className="ml-4 min-w-0">
                <form
                  className="flex min-w-0 gap-2 py-1"
                  onSubmit={event => {
                    event.preventDefault();
                    const name = (subDrafts[shelf.id] ?? "").trim();
                    if (name === "") return;
                    void shelfItem
                      .createSubShelf(shelf.id, name)
                      .then(() =>
                        setSubDrafts({ ...subDrafts, [shelf.id]: "" })
                      );
                  }}
                >
                  <Input
                    value={subDrafts[shelf.id] ?? ""}
                    className="min-w-0"
                    placeholder={label("workspace.navigation.typeNewName")}
                    aria-label={label("workspace.navigation.shelves")}
                    onChange={event =>
                      setSubDrafts({
                        ...subDrafts,
                        [shelf.id]: event.target.value,
                      })
                    }
                  />
                  <Button
                    type="submit"
                    size="icon"
                    aria-label={label("workspace.navigation.createRootShelf")}
                  >
                    <FolderPlus />
                  </Button>
                </form>
                <ul className="flex min-w-0 flex-col gap-1">
                  {shelf.subShelves.map(subShelf => (
                    <li key={subShelf.id} className="min-w-0">
                      <div className="flex min-w-0 items-center gap-1">
                        {shelfItem.editingId === subShelf.id ? (
                          <Input
                            value={shelfItem.editName}
                            className="min-w-0 flex-1"
                            aria-label={label(
                              "workspace.navigation.typeNewName"
                            )}
                            onChange={event =>
                              shelfItem.setEditName(event.target.value)
                            }
                            onBlur={() => void shelfItem.renameEditing()}
                            onKeyDown={event => {
                              if (event.key !== "Enter") return;
                              event.preventDefault();
                              void shelfItem.renameEditing();
                            }}
                          />
                        ) : (
                          <Button
                            variant="ghost"
                            className="min-w-0 flex-1 justify-start"
                            onClick={() =>
                              shelfItem.startRenaming(
                                subShelf.id,
                                subShelf.name
                              )
                            }
                          >
                            <span className="truncate">{subShelf.name}</span>
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={label("workspace.navigation.trash")}
                          onClick={() =>
                            void shelfItem.deleteSubShelf(shelf.id, subShelf.id)
                          }
                        >
                          <Trash2 />
                        </Button>
                      </div>
                      <form
                        className="flex min-w-0 gap-2 py-1"
                        onSubmit={event => {
                          event.preventDefault();
                          const name = (itemDrafts[subShelf.id] ?? "").trim();
                          if (name === "") return;
                          void shelfItem
                            .createItem(
                              shelf.id,
                              subShelf.id,
                              name,
                              ItemType.Material
                            )
                            .then(() =>
                              setItemDrafts({
                                ...itemDrafts,
                                [subShelf.id]: "",
                              })
                            );
                        }}
                      >
                        <Input
                          value={itemDrafts[subShelf.id] ?? ""}
                          className="min-w-0"
                          placeholder={label(
                            "workspace.navigation.typeNewName"
                          )}
                          aria-label={label("workspace.navigation.typeNewName")}
                          onChange={event =>
                            setItemDrafts({
                              ...itemDrafts,
                              [subShelf.id]: event.target.value,
                            })
                          }
                        />
                        <Button
                          type="submit"
                          size="icon"
                          aria-label={label(
                            "workspace.navigation.createRootShelf"
                          )}
                        >
                          <PlusIcon />
                        </Button>
                      </form>
                      <ul className="ml-4 min-w-0">
                        {subShelf.items.map(item => (
                          <li
                            key={item.id}
                            className="flex min-w-0 items-center gap-1"
                          >
                            {shelfItem.editingId === item.id ? (
                              <Input
                                value={shelfItem.editName}
                                className="min-w-0 flex-1"
                                aria-label={label(
                                  "workspace.navigation.typeNewName"
                                )}
                                onChange={event =>
                                  shelfItem.setEditName(event.target.value)
                                }
                                onBlur={() => void shelfItem.renameEditing()}
                                onKeyDown={event => {
                                  if (event.key !== "Enter") return;
                                  event.preventDefault();
                                  void shelfItem.renameEditing();
                                }}
                              />
                            ) : (
                              <Button
                                variant="ghost"
                                className="min-w-0 flex-1 justify-start"
                                onClick={() =>
                                  shelfItem.startRenaming(item.id, item.name)
                                }
                              >
                                <span className="truncate">{item.name}</span>
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={label("workspace.navigation.trash")}
                              onClick={() =>
                                void shelfItem.deleteItem(
                                  shelf.id,
                                  subShelf.id,
                                  item.id
                                )
                              }
                            >
                              <Trash2 />
                            </Button>
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
};

export default AppSidebar;
