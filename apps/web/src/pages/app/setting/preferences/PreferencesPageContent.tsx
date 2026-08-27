import { estimateMaterialAttachmentCache } from "@/api/local/material-attachment.cache";
import { LocalYjsDocumentStore } from "@shared/blockpack/core";
import { AllLanguageData } from "@shared/constants";
import {
  DashboardWidthFrameCountStep,
  MaxDashboardWidthFrameCount,
  MinDashboardWidthFrameCount,
} from "@shared/constants/widgetLayout.constant";
import toast from "@shared/lib/toast";
import { HardDriveIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useTheme } from "@/hooks";
import type { Density, EditorWidth } from "@/hooks/localPreferences";
import { useLocalPreferences } from "@/hooks/localPreferences";
import { useBackgroundImages } from "@/hooks/useBackgroundImages";
import { useRealtime } from "@/hooks/useRealtime";
import { useTransactionSynchronizer } from "@/hooks/useTransactionSynchronizer";
import { useUser } from "@/hooks/useUser";
import { Section, SettingRow, SwitchRow } from "./tabs/PreferenceRows";

const formatStorageSize = (bytes = 0) => {
  const mb = bytes / 1024 / 1024;

  return mb >= 1024 ? `${(mb / 1024).toFixed(1)} GB` : `${Math.round(mb)} MB`;
};

const AppearanceSettings = () => {
  const { preferences, updatePreference } = useLocalPreferences();
  const { i18n, t } = useTranslation();
  const themeManager = useTheme();

  return (
    <Section>
      <SettingRow
        title={t("settingsPage.preferences.appearance.theme")}
        description={t("settingsPage.preferences.appearance.themeDescription")}
      >
        <Select
          value={themeManager.currentTheme.id}
          onValueChange={value => void themeManager.switchCurrentTheme(value)}
        >
          <SelectTrigger className="w-48">
            <SelectValue
              placeholder={t("settingsPage.preferences.appearance.chooseTheme")}
            />
          </SelectTrigger>
          <SelectContent>
            {themeManager.availableThemes.map(theme => (
              <SelectItem key={theme.id} value={theme.id}>
                {t(theme.translationKey)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </SettingRow>

      <SettingRow
        title={t("settingsPage.preferences.appearance.language")}
        description={t(
          "settingsPage.preferences.appearance.languageDescription"
        )}
      >
        <Select
          value={i18n.resolvedLanguage}
          onValueChange={value => void i18n.changeLanguage(value)}
        >
          <SelectTrigger className="w-48">
            <SelectValue
              placeholder={t(
                "settingsPage.preferences.appearance.chooseLanguage"
              )}
            />
          </SelectTrigger>
          <SelectContent>
            {AllLanguageData.map(language => (
              <SelectItem key={language.code} value={language.code}>
                {language.nativeName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </SettingRow>

      <SettingRow
        title={t("settingsPage.preferences.appearance.density")}
        description={t(
          "settingsPage.preferences.appearance.densityDescription"
        )}
      >
        <div className="flex rounded-md border border-border bg-muted p-1">
          {[
            [
              "comfortable",
              t("settingsPage.preferences.appearance.comfortable"),
            ],
            ["balanced", t("settingsPage.preferences.appearance.balanced")],
            ["compact", t("settingsPage.preferences.appearance.compact")],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => updatePreference("density", value as Density)}
              className={`h-8 rounded-sm px-3 text-sm transition ${
                preferences.density === value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-card hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </SettingRow>

      <SwitchRow
        title={t("settingsPage.preferences.appearance.reduceMotion")}
        description={t(
          "settingsPage.preferences.appearance.reduceMotionDescription"
        )}
        checked={preferences.reduceMotion}
        onCheckedChange={checked => updatePreference("reduceMotion", checked)}
      />
      <SwitchRow
        title={t("settingsPage.preferences.appearance.tactileFeedback")}
        description={t(
          "settingsPage.preferences.appearance.tactileFeedbackDescription"
        )}
        checked={preferences.tactileFeedback}
        onCheckedChange={checked =>
          updatePreference("tactileFeedback", checked)
        }
        hideSeparator
      />
    </Section>
  );
};

const EditorSettings = () => {
  const { preferences, updatePreference } = useLocalPreferences();
  const { t } = useTranslation();

  return (
    <Section>
      <SettingRow
        title={t("settingsPage.preferences.editor.pageWidth")}
        description={t("settingsPage.preferences.editor.pageWidthDescription")}
      >
        <Select
          value={preferences.editorWidth}
          onValueChange={value =>
            updatePreference("editorWidth", value as EditorWidth)
          }
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="narrow">
              {t("settingsPage.preferences.editor.narrow")}
            </SelectItem>
            <SelectItem value="standard">
              {t("settingsPage.preferences.editor.standard")}
            </SelectItem>
            <SelectItem value="wide">
              {t("settingsPage.preferences.editor.wide")}
            </SelectItem>
          </SelectContent>
        </Select>
      </SettingRow>

      <SettingRow
        title={t("settingsPage.preferences.editor.textSize")}
        description={t("settingsPage.preferences.editor.textSizeDescription")}
      >
        <div className="flex w-52 shrink-0 items-center gap-3">
          <Slider
            value={[preferences.editorFontSize]}
            min={13}
            max={20}
            step={1}
            onValueChange={value =>
              updatePreference("editorFontSize", value[0] ?? 15)
            }
          />
          <span className="w-10 text-right text-sm font-semibold">
            {preferences.editorFontSize}px
          </span>
        </div>
      </SettingRow>

      <SwitchRow
        title={t("settingsPage.preferences.editor.lineWrap")}
        description={t("settingsPage.preferences.editor.lineWrapDescription")}
        checked={preferences.lineWrap}
        onCheckedChange={checked => updatePreference("lineWrap", checked)}
      />
      <SwitchRow
        title={t("settingsPage.preferences.editor.spellcheck")}
        description={t("settingsPage.preferences.editor.spellcheckDescription")}
        checked={preferences.spellcheck}
        onCheckedChange={checked => updatePreference("spellcheck", checked)}
      />
      <SwitchRow
        title={t("settingsPage.preferences.editor.quickInsert")}
        description={t(
          "settingsPage.preferences.editor.quickInsertDescription"
        )}
        checked={preferences.quickInsert}
        onCheckedChange={checked => updatePreference("quickInsert", checked)}
      />
      <SwitchRow
        title={t("settingsPage.preferences.editor.dragHandle")}
        description={t("settingsPage.preferences.editor.dragHandleDescription")}
        checked={preferences.blockDragHandle}
        onCheckedChange={checked =>
          updatePreference("blockDragHandle", checked)
        }
        hideSeparator
      />
    </Section>
  );
};

const DashboardSettings = () => {
  const { preferences, updatePreference } = useLocalPreferences();
  const { t } = useTranslation();

  return (
    <Section>
      <SwitchRow
        title={t("settingsPage.preferences.dashboard.manualWidth")}
        description={t(
          "settingsPage.preferences.dashboard.manualWidthDescription"
        )}
        checked={preferences.manualDashboardWidth}
        onCheckedChange={checked =>
          updatePreference("manualDashboardWidth", checked)
        }
        hideSeparator={!preferences.manualDashboardWidth}
      />
      {preferences.manualDashboardWidth && (
        <div className="border-b border-border/50 pb-[calc(var(--density-content-padding)*0.75)]">
          <div className="rounded-lg bg-muted/50 p-4">
            <div className="flex items-center gap-3">
              <Slider
                value={[preferences.dashboardWidthFrameCount]}
                min={MinDashboardWidthFrameCount}
                max={MaxDashboardWidthFrameCount}
                step={DashboardWidthFrameCountStep}
                onValueChange={value =>
                  updatePreference(
                    "dashboardWidthFrameCount",
                    value[0] ?? MinDashboardWidthFrameCount
                  )
                }
              />
              <span className="w-10 text-right text-sm font-semibold">
                {preferences.dashboardWidthFrameCount}
              </span>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              {t("settingsPage.preferences.dashboard.widthDescription")}
            </p>
          </div>
        </div>
      )}
    </Section>
  );
};

const OfflineSettings = () => {
  const {
    preferences,
    storageEstimate,
    storageUsagePercent,
    updatePreference,
  } = useLocalPreferences();
  const backgroundImages = useBackgroundImages();
  const { activeBlockPackChannelCount } = useRealtime();
  const { getTerminalTransactionCount, clearTerminalTransactions } =
    useTransactionSynchronizer();
  const { userData } = useUser();
  const { t } = useTranslation();
  const [backgroundCache, setBackgroundCache] = useState({
    totalBytes: 0,
    count: 0,
  });
  const [yjsCache, setYjsCache] = useState({ totalSize: 0, count: 0 });
  const [attachmentCache, setAttachmentCache] = useState({
    totalSize: 0,
    count: 0,
  });
  const [terminalTransactionCount, setTerminalTransactionCount] = useState(0);

  const refreshCacheUsage = useCallback(async () => {
    const [backgroundEstimate, yjsEstimate, attachmentEstimate] =
      await Promise.all([
        backgroundImages.getCacheEstimate(),
        LocalYjsDocumentStore.estimate(userData?.publicId ?? null),
        estimateMaterialAttachmentCache(),
      ]);
    setBackgroundCache({
      totalBytes: backgroundEstimate.totalBytes,
      count: backgroundEstimate.count,
    });
    setYjsCache(yjsEstimate);
    setAttachmentCache(attachmentEstimate);
    setTerminalTransactionCount(await getTerminalTransactionCount());
  }, [backgroundImages, getTerminalTransactionCount, userData?.publicId]);

  useEffect(() => {
    void refreshCacheUsage();
  }, [refreshCacheUsage]);

  return (
    <>
      <section className="mb-2 grid grid-cols-[repeat(auto-fit,minmax(min(100%,16rem),1fr))] gap-4 border-b border-border/50 pb-[var(--density-content-padding)]">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm font-medium">
            <HardDriveIcon className="size-4 text-primary" />
            {t("settingsPage.preferences.offline.storage")}
          </div>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {t("settingsPage.preferences.offline.storageDescription")}
          </p>
        </div>

        <div className="min-w-0">
          <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full bg-primary"
              style={{ width: `${storageUsagePercent}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>
              {t("settingsPage.preferences.offline.used", {
                size: formatStorageSize(storageEstimate?.usage),
              })}
            </span>
            <span>
              {t("settingsPage.preferences.offline.limit", {
                size: formatStorageSize(storageEstimate?.quota),
              })}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs">
          <div>
            <div className="text-muted-foreground">
              {t("settingsPage.preferences.offline.yjsDocuments")}
            </div>
            <div className="mt-1 font-medium">
              {formatStorageSize(yjsCache.totalSize)}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">
              {t("settingsPage.preferences.offline.backgroundImages")}
            </div>
            <div className="mt-1 font-medium">
              {formatStorageSize(backgroundCache.totalBytes)}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">
              {t("settingsPage.preferences.offline.attachmentCache")}
            </div>
            <div className="mt-1 font-medium">
              {formatStorageSize(attachmentCache.totalSize)}
            </div>
          </div>
        </div>
      </section>

      <Section>
        <SwitchRow
          title={t("settingsPage.preferences.offline.localDatabase")}
          description={t(
            "settingsPage.preferences.offline.localDatabaseDescription"
          )}
          checked={preferences.localVault}
          onCheckedChange={checked => updatePreference("localVault", checked)}
        />
        <SwitchRow
          title={t("settingsPage.preferences.offline.offlineQueue")}
          description={t(
            "settingsPage.preferences.offline.offlineQueueDescription"
          )}
          checked={preferences.offlineQueue}
          onCheckedChange={checked => updatePreference("offlineQueue", checked)}
        />
        <SwitchRow
          title={t("settingsPage.preferences.offline.attachmentCache")}
          description={t(
            "settingsPage.preferences.offline.attachmentCacheDescription"
          )}
          checked={preferences.cacheAttachments}
          onCheckedChange={checked =>
            updatePreference("cacheAttachments", checked)
          }
        />
        <SettingRow
          title={t("settingsPage.preferences.offline.cleanupPeriod")}
          description={t(
            "settingsPage.preferences.offline.cleanupPeriodDescription"
          )}
        >
          <Select
            value={String(preferences.cleanupAfterDays)}
            onValueChange={value =>
              updatePreference("cleanupAfterDays", Number(value))
            }
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[7, 30, 90, 180, 365].map(days => (
                <SelectItem key={days} value={String(days)}>
                  {t("settingsPage.preferences.offline.cleanupDays", {
                    count: days,
                  })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SettingRow>
        <SettingRow
          title={t("settingsPage.preferences.offline.yjsCache")}
          description={t(
            "settingsPage.preferences.offline.yjsCacheDescription"
          )}
        >
          <div className="flex flex-col items-end gap-2">
            <span className="text-xs text-muted-foreground">
              {t("settingsPage.preferences.offline.documents", {
                count: yjsCache.count,
              })}{" "}
              · {formatStorageSize(yjsCache.totalSize)}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 px-3 text-xs"
              disabled={activeBlockPackChannelCount > 0}
              onClick={async () => {
                if (activeBlockPackChannelCount > 0) {
                  toast.error(
                    t("settingsPage.preferences.offline.activeEditors")
                  );
                  return;
                }
                if (
                  !window.confirm(
                    t("settingsPage.preferences.offline.clearYjsConfirm")
                  )
                ) {
                  return;
                }
                await LocalYjsDocumentStore.clear(userData?.publicId ?? null);
                await refreshCacheUsage();
                toast.success(
                  t("settingsPage.preferences.offline.clearYjsSuccess")
                );
              }}
            >
              {t("settingsPage.preferences.offline.clear")}
            </Button>
          </div>
        </SettingRow>
        {terminalTransactionCount > 0 && (
          <SettingRow
            title={t("settingsPage.preferences.offline.terminalFailures")}
            description={t(
              "settingsPage.preferences.offline.terminalFailuresDescription"
            )}
          >
            <div className="flex flex-col items-end gap-2">
              <span className="text-xs text-muted-foreground">
                {t("settingsPage.preferences.offline.transactions", {
                  count: terminalTransactionCount,
                })}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 px-3 text-xs"
                onClick={async () => {
                  if (
                    !window.confirm(
                      t(
                        "settingsPage.preferences.offline.clearTerminalFailuresConfirm"
                      )
                    )
                  ) {
                    return;
                  }
                  await clearTerminalTransactions();
                  await refreshCacheUsage();
                  toast.success(
                    t(
                      "settingsPage.preferences.offline.clearTerminalFailuresSuccess"
                    )
                  );
                }}
              >
                {t("settingsPage.preferences.offline.clearTerminalFailures")}
              </Button>
            </div>
          </SettingRow>
        )}
        <SettingRow
          title={t("settingsPage.preferences.offline.backgroundCache")}
          description={t(
            "settingsPage.preferences.offline.backgroundCacheDescription"
          )}
          hideSeparator
        >
          <div className="flex flex-col items-end gap-2">
            <span className="text-xs text-muted-foreground">
              {t("settingsPage.preferences.offline.images", {
                count: backgroundCache.count,
              })}{" "}
              · {formatStorageSize(backgroundCache.totalBytes)}
            </span>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 px-3 text-xs"
                onClick={async () => {
                  await backgroundImages.clearUnused();
                  await refreshCacheUsage();
                  toast.success(
                    t("settingsPage.preferences.offline.clearUnusedSuccess")
                  );
                }}
              >
                {t("settingsPage.preferences.offline.clearUnused")}
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="h-8 px-3 text-xs"
                onClick={async () => {
                  if (
                    !window.confirm(
                      t("settingsPage.preferences.offline.clearAllConfirm")
                    )
                  ) {
                    return;
                  }
                  await backgroundImages.clearAll();
                  await refreshCacheUsage();
                  toast.success(
                    t("settingsPage.preferences.offline.clearAllSuccess")
                  );
                }}
              >
                {t("settingsPage.preferences.offline.clearAll")}
              </Button>
            </div>
          </div>
        </SettingRow>
      </Section>
    </>
  );
};

export {
  AppearanceSettings,
  DashboardSettings,
  EditorSettings,
  OfflineSettings,
};
