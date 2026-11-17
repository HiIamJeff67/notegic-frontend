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
import { useNavigate } from "@tanstack/react-router";
import { LayoutDashboardIcon, LogIn } from "lucide-react";
import { useTranslation } from "react-i18next";

export function AppSidebar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const sidebarManager = useSidebar();
  const isSidebarExpanded = sidebarManager.open || sidebarManager.isMobile;
  const loginLabel = t("auth.login");

  // Browser sign-in returns through a later desktop session handoff.
  const openLogin = () => undefined;

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
        <SidebarContent />
        <SidebarFooter className="m-0 w-full">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                className={`flex w-full items-center select-none hover:bg-primary ${
                  isSidebarExpanded ? "justify-start" : "justify-center"
                }`}
                aria-label={loginLabel}
                title={loginLabel}
                onClick={openLogin}
              >
                <LogIn />
                {isSidebarExpanded && (
                  <span className="truncate">{loginLabel}</span>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </div>
    </Sidebar>
  );
}

export default AppSidebar;
