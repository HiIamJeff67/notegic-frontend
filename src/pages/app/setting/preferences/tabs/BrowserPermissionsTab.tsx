import { RefreshCwIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Section, SettingRow } from "./PreferenceRows";

type PermissionDisplayState =
  | PermissionState
  | "unsupported"
  | "unavailable"
  | "checking";

type PermissionItem = {
  name: PermissionName;
  labelKey: string;
  descriptionKey: string;
  requestLabelKey?: string;
  request?: () => Promise<PermissionDisplayState | void>;
};

const permissionItems: PermissionItem[] = [
  {
    name: "notifications" as PermissionName,
    labelKey: "notifications",
    descriptionKey: "notificationsDescription",
    requestLabelKey: "requestPermission",
    request: async () => {
      if (typeof Notification !== "undefined") {
        await Notification.requestPermission();
      }
    },
  },
  {
    name: "clipboard-read" as PermissionName,
    labelKey: "clipboardRead",
    descriptionKey: "clipboardReadDescription",
  },
  {
    name: "clipboard-write" as PermissionName,
    labelKey: "clipboardWrite",
    descriptionKey: "clipboardWriteDescription",
  },
  {
    name: "persistent-storage" as PermissionName,
    labelKey: "persistentStorage",
    descriptionKey: "persistentStorageDescription",
    requestLabelKey: "requestStorage",
    request: async () => {
      if (!navigator.storage?.persist) return "unavailable";
      return (await navigator.storage.persist()) ? "granted" : "prompt";
    },
  },
  {
    name: "geolocation" as PermissionName,
    labelKey: "geolocation",
    descriptionKey: "geolocationDescription",
    requestLabelKey: "requestPermission",
    request: async () => {
      if (!navigator.geolocation) return;
      await new Promise<void>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          () => resolve(),
          error => reject(error),
          { maximumAge: 60_000, timeout: 10_000 }
        );
      }).catch(() => undefined);
    },
  },
];

const queryPermission = async (
  name: PermissionName
): Promise<PermissionDisplayState> => {
  if (name === "notifications" && typeof Notification !== "undefined") {
    return Notification.permission === "default"
      ? "prompt"
      : Notification.permission;
  }

  if (name === ("persistent-storage" as PermissionName)) {
    if (typeof navigator === "undefined" || !navigator.storage?.persisted) {
      return "unavailable";
    }
    if (await navigator.storage.persisted()) return "granted";
  }

  if (typeof navigator === "undefined" || !navigator.permissions?.query) {
    return "unavailable";
  }

  try {
    const status = await navigator.permissions.query({ name });
    return status.state;
  } catch {
    return "unsupported";
  }
};

interface BrowserPermissionsTabProps {
  layout?: "panel" | "article";
}

const BrowserPermissionsTab = ({
  layout = "panel",
}: BrowserPermissionsTabProps) => {
  const { t } = useTranslation();
  const [states, setStates] = useState<
    Record<PermissionName, PermissionDisplayState>
  >(
    () =>
      Object.fromEntries(
        permissionItems.map(item => [item.name, "checking"])
      ) as Record<PermissionName, PermissionDisplayState>
  );
  const [pendingPermission, setPendingPermission] =
    useState<PermissionName | null>(null);
  const [actionMessages, setActionMessages] = useState<
    Partial<Record<PermissionName, string>>
  >({});

  const refreshPermissions = useCallback(async (clearMessages = true) => {
    setStates(
      Object.fromEntries(
        permissionItems.map(item => [item.name, "checking"])
      ) as Record<PermissionName, PermissionDisplayState>
    );
    if (clearMessages) setActionMessages({});
    const entries = await Promise.all(
      permissionItems.map(
        async item => [item.name, await queryPermission(item.name)] as const
      )
    );
    setStates(
      Object.fromEntries(entries) as Record<
        PermissionName,
        PermissionDisplayState
      >
    );
  }, []);

  const requestPermission = async (item: PermissionItem) => {
    if (!item.request) return;

    setPendingPermission(item.name);
    try {
      const requestedState = await item.request();
      await refreshPermissions(false);
      if (
        requestedState &&
        item.name === ("persistent-storage" as PermissionName)
      ) {
        setActionMessages(current => ({
          ...current,
          [item.name]:
            requestedState === "granted"
              ? t(
                  "settingsPage.preferences.browserPermissions.persistentStorageGranted"
                )
              : t(
                  "settingsPage.preferences.browserPermissions.persistentStorageDenied"
                ),
        }));
      }
    } finally {
      setPendingPermission(null);
    }
  };

  useEffect(() => {
    void refreshPermissions();
  }, [refreshPermissions]);

  return (
    <div>
      <Section article={layout === "article"}>
        <div className="border-b border-border/50 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm font-medium">
                {t("settingsPage.preferences.browserPermissions.status")}
              </div>
              <div className="mt-1 text-sm leading-5 text-muted-foreground">
                {t(
                  "settingsPage.preferences.browserPermissions.statusDescription"
                )}
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void refreshPermissions()}
            >
              <RefreshCwIcon className="size-4" />
              {t("settingsPage.preferences.browserPermissions.refresh")}
            </Button>
          </div>
        </div>

        <div className={layout === "article" ? "space-y-8" : ""}>
          {permissionItems.map((item, index) => (
            <SettingRow
              key={item.name}
              title={t(
                `settingsPage.preferences.browserPermissions.${item.labelKey}` as never
              )}
              description={
                <>
                  {t(
                    `settingsPage.preferences.browserPermissions.${item.descriptionKey}` as never
                  )}
                  {actionMessages[item.name] && (
                    <span className="mt-1 block text-xs">
                      {actionMessages[item.name]}
                    </span>
                  )}
                </>
              }
              hideSeparator={index === permissionItems.length - 1}
            >
              <>
                <span className="rounded-sm border border-border bg-card px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                  {t(
                    `settingsPage.preferences.browserPermissions.states.${states[item.name] ?? "checking"}` as never
                  )}
                </span>
                {states[item.name] === "granted" ? (
                  <Button type="button" variant="outline" size="sm" disabled>
                    {t(
                      "settingsPage.preferences.browserPermissions.revokeInBrowser"
                    )}
                  </Button>
                ) : states[item.name] === "prompt" && item.request ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={pendingPermission === item.name}
                    onClick={() => void requestPermission(item)}
                  >
                    {pendingPermission === item.name
                      ? t(
                          "settingsPage.preferences.browserPermissions.requesting"
                        )
                      : t(
                          `settingsPage.preferences.browserPermissions.${item.requestLabelKey ?? "requestPermission"}` as never
                        )}
                  </Button>
                ) : states[item.name] === "denied" ? (
                  <Button type="button" variant="outline" size="sm" disabled>
                    {t(
                      "settingsPage.preferences.browserPermissions.states.denied"
                    )}
                  </Button>
                ) : (
                  <Button type="button" variant="outline" size="sm" disabled>
                    {t(
                      "settingsPage.preferences.browserPermissions.browserControlled"
                    )}
                  </Button>
                )}
              </>
            </SettingRow>
          ))}
        </div>
      </Section>
    </div>
  );
};

export default BrowserPermissionsTab;
