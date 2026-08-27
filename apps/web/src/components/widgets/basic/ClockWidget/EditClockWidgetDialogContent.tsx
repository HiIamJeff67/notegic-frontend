import { ClockStyles } from "@widgets/basic/ClockWidget/data/clockStyles";
import { TimeZones } from "@widgets/basic/ClockWidget/data/timeZones";
import { Dispatch, SetStateAction } from "react";
import { useTranslation } from "react-i18next";
import {
  EditWidgetDialogContent,
  EditWidgetDialogOption,
  EditWidgetDialogSeparator,
} from "@/components/dialogs/WidgetDialog/EditWidgetDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { ClockSetting } from "@/components/widgets/basic/ClockWidget/setting/clockSetting";
import { formatTimezoneDisplayName } from "@shared/i18n/workspace";

interface EditClockWidgetDialogContentProps {
  setting: ClockSetting;
  setSetting: Dispatch<SetStateAction<ClockSetting>>;
}

const EditClockWidgetDialogContent = ({
  setting,
  setSetting,
}: EditClockWidgetDialogContentProps) => {
  const { i18n, t } = useTranslation();
  const styleLabel = (name: "classic" | "minimal" | "modern") =>
    name === "classic"
      ? t("workspace.widgets.classic")
      : name === "minimal"
        ? t("workspace.widgets.minimal")
        : t("workspace.widgets.modern");
  return (
    <EditWidgetDialogContent title={t("workspace.widgets.editClock")}>
      <EditWidgetDialogOption
        title={t("workspace.widgets.timezone")}
        description={t("workspace.widgets.timezoneDescription")}
      >
        <Select
          value={setting.selectedTimeZone.locale}
          onValueChange={newLocale =>
            setSetting(prev => ({
              ...prev,
              selectedTimeZone:
                TimeZones.find(tz => tz.locale === newLocale) ??
                prev.selectedTimeZone,
            }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder={t("workspace.widgets.timezone")} />
          </SelectTrigger>
          <SelectContent>
            {TimeZones.map(tz => (
              <SelectItem key={tz.index} value={tz.locale}>
                {formatTimezoneDisplayName(tz.locale, i18n.resolvedLanguage)}{" "}
                (UTC
                {tz.offset >= 0 ? "+" : ""}
                {tz.offset})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </EditWidgetDialogOption>
      <EditWidgetDialogSeparator />
      <EditWidgetDialogOption
        title={t("workspace.widgets.clockStyle")}
        description={t("workspace.widgets.clockStyleDescription")}
      >
        <Select
          value={setting.selectedClockStyle.index.toString()}
          onValueChange={indexString =>
            setSetting(prev => ({
              ...prev,
              selectedClockStyle: ClockStyles[parseInt(indexString)],
            }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder={t("workspace.widgets.selectStyle")} />
          </SelectTrigger>
          <SelectContent>
            {ClockStyles.map(clockStyle => (
              <SelectItem
                key={clockStyle.index}
                value={clockStyle.index.toString()}
              >
                {styleLabel(clockStyle.name)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </EditWidgetDialogOption>
      <EditWidgetDialogSeparator />
      <EditWidgetDialogOption
        title={t("workspace.widgets.showTime")}
        description={t("workspace.widgets.showTimeDescription")}
      >
        <Switch
          checked={setting.enableTimer}
          onCheckedChange={checked =>
            setSetting(prev => ({
              ...prev,
              enableTimer: checked,
            }))
          }
        />
      </EditWidgetDialogOption>
      <EditWidgetDialogSeparator />
      <EditWidgetDialogOption
        title={t("workspace.widgets.showRegion")}
        description={t("workspace.widgets.showRegionDescription")}
      >
        <Switch
          checked={setting.enableLocale}
          onCheckedChange={checked =>
            setSetting(prev => ({
              ...prev,
              enableLocale: checked,
            }))
          }
        />
      </EditWidgetDialogOption>
      <EditWidgetDialogSeparator />
      <EditWidgetDialogOption
        title={t("workspace.widgets.timeFontSize")}
        alignment="vertical"
        currentValue={setting.timerFontSize.toString()}
      >
        <Slider
          max={16}
          min={6}
          step={0.1}
          defaultValue={[setting.timerFontSize]}
          onValueChange={value =>
            setSetting(prev => ({ ...prev, timerFontSize: value[0] }))
          }
        />
      </EditWidgetDialogOption>
      <EditWidgetDialogSeparator />
      <EditWidgetDialogOption
        title={t("workspace.widgets.regionFontSize")}
        alignment="vertical"
        currentValue={setting.localeFontSize.toString()}
      >
        <Slider
          max={16}
          min={6}
          step={0.1}
          defaultValue={[setting.localeFontSize]}
          onValueChange={value =>
            setSetting(prev => ({ ...prev, localeFontSize: value[0] }))
          }
        />
      </EditWidgetDialogOption>
    </EditWidgetDialogContent>
  );
};

export default EditClockWidgetDialogContent;
