import { WorkspaceSidebar } from "@shared/components/commons/WorkspaceSidebar/WorkspaceSidebar";
import toast from "@shared/components/toast/toast";
import { useTranslation } from "@shared/hooks/useTranslation";
import { tError } from "@shared/i18n/error";
import {
  LocalStorage,
  LocalStorageKey,
} from "@shared/lib/storage/localStorage";
import { WebURLPathDictionary } from "@shared/lib/url/web";
import { BookOpenIcon } from "lucide-react";
import { useEffect } from "react";
import AvatarIcon from "@/components/icons/AvatarIcon";
import RootShelfMenu from "@/components/menus/RootShelfMenu/RootShelfMenu";
import RoutineTagMenu from "@/components/menus/RoutineTagMenu/RoutineTagMenu";
import StationMenu from "@/components/menus/StationMenu/StationMenu";
import { NotificationPopover } from "@/components/popovers/NotificationPopover";
import {
  useAppRouterActions,
  useResizeSidebar,
  useSettingsDisplay,
  useShelfItem,
  useStationRoutine,
} from "@/hooks";
import { useModal } from "@/hooks/useModal";
import { useUser } from "@/hooks/useUser";
import { type SettingsPage } from "@/providers/SettingsDisplayProvider";

interface AppSidebarProps {
  disabled?: boolean;
}

export function AppSidebar({ disabled = false }: AppSidebarProps) {
  if (disabled) return <></>;

  const router = useAppRouterActions();
  const { t } = useTranslation();
  const modalManager = useModal();
  const resizableSidebarManager = useResizeSidebar();
  const stationRoutineManager = useStationRoutine();
  const userManager = useUser();
  const avatarURL =
    userManager.userInfo?.avatarURL || userManager.userData?.avatarURL || null;
  const shelfItemManager = useShelfItem();
  const settingsDisplay = useSettingsDisplay();

  const openSettings = (page: SettingsPage, section?: string) => {
    if (
      LocalStorage.getItemByKey(LocalStorageKey.settingsDisplayMode) === "sheet"
    ) {
      settingsDisplay.openSheet(page, section);
      return;
    }

    const path =
      page === "account"
        ? WebURLPathDictionary.app.setting.account
        : WebURLPathDictionary.app.setting.preferences;

    if (section && router.isSamePath(router.getCurrentPath(), path)) {
      window.location.hash = section;
      requestAnimationFrame(() => {
        document.getElementById(section)?.scrollIntoView({
          behavior: "auto",
          block: "start",
        });
      });
      return;
    }

    router.push(section ? `${path}#${section}` : path);
  };

  useEffect(() => {
    if (!userManager.userData) return;

    const initiallySearchRootShelves = async () =>
      await shelfItemManager
        .searchRootShelves()
        .catch(error => toast.error(tError(error, t)));
    initiallySearchRootShelves();
  }, [userManager.userData?.publicId]);

  const logout = async () => {
    router.push(WebURLPathDictionary.home);
    await userManager.logout();
    toast.success(t("workspace.notifications.logoutSuccess"));
  };

  return (
    <WorkspaceSidebar
      dashboardLabel={t("workspace.navigation.dashboard")}
      onDashboard={() => router.push(WebURLPathDictionary.app.dashboard._)}
      routinesLabel={t("workspace.navigation.routinesOverview")}
      onRoutines={() => router.push(WebURLPathDictionary.app.routines._)}
      shelvesLabel={t("workspace.navigation.shelves")}
      createShelfLabel={t("workspace.navigation.createRootShelf")}
      onCreateShelf={() =>
        modalManager.open("CreateShelfItemDialog", {
          dialogHeader: t("workspace.navigation.createRootShelfDialog"),
          dialogDescription: t("workspace.navigation.typeRootShelfName"),
          disableInput: false,
          inputPlaceholder: t("workspace.navigation.typeNewName"),
          onCreate: async (newRootShelfName: string) => {
            try {
              await shelfItemManager.createRootShelf(newRootShelfName);
              toast.success(
                t("workspace.notifications.created", {
                  name: newRootShelfName.trim(),
                })
              );
            } catch (error) {
              toast.error(tError(error, t));
            }
          },
          onCancel: modalManager.close,
        })
      }
      shelfMenu={<RootShelfMenu />}
      stationsLabel={t("workspace.navigation.stations")}
      createStationLabel={t("workspace.navigation.createStation")}
      onCreateStation={() => modalManager.open("CreateStationDialog", {})}
      stationMenu={<StationMenu />}
      routineTagsLabel={t("workspace.navigation.routineTags")}
      createRoutineTagLabel={t("workspace.navigation.createRoutineTag")}
      onCreateRoutineTag={() =>
        modalManager.open("CreateRoutineTagDialog", {
          onCreated: async routineTagId => {
            stationRoutineManager.selectRoutineTag(routineTagId);
          },
        })
      }
      routineTagMenu={<RoutineTagMenu />}
      documentLabel={t("workspace.navigation.document")}
      documentIcon={<BookOpenIcon />}
      onDocument={() => router.push(WebURLPathDictionary.document)}
      trashLabel={t("workspace.navigation.trash")}
      onTrash={() => router.push(WebURLPathDictionary.app.trash)}
      reportLabel={t("workspace.navigation.report")}
      onReport={() => openSettings("preferences", "feedback")}
      account={{
        name: userManager.userData?.name || t("workspace.navigation.userName"),
        status:
          userManager.userData?.status || t("workspace.navigation.offline"),
        avatar: (
          <AvatarIcon
            avatarURL={avatarURL}
            fallbackText={
              userManager.userData?.displayName ||
              userManager.userData?.name ||
              "U"
            }
            size={30}
          />
        ),
      }}
      settingsLabel={t("workspace.navigation.settings")}
      accountLabel={t("workspace.navigation.account")}
      preferencesLabel={t("workspace.navigation.preferences")}
      onAccount={() => openSettings("account")}
      onPreferences={() => openSettings("preferences")}
      logoutLabel={t("auth.logout")}
      onLogout={logout}
      notifications={mobile => <NotificationPopover mobile={mobile} />}
      resize={{
        style: resizableSidebarManager.sidebarStyle,
        width: resizableSidebarManager.width,
        onMouseDown: resizableSidebarManager.onMouseDown,
        onDoubleClick: resizableSidebarManager.onDoubleClick,
      }}
    />
  );
}

export default AppSidebar;
