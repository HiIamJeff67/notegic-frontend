import { MaxTriggerValue } from "@shared/constants";
import { tError } from "@shared/i18n/error";
import { useTranslation } from "@shared/i18n/useTranslation";
import {
  LocalStorage,
  LocalStorageKey,
} from "@shared/lib/storage/localStorage";
import toast from "@shared/lib/toast/toast";
import { createContext, useCallback, useEffect, useRef, useState } from "react";
import { DashboardPreviewWidgets } from "@/components/widgets/basic/basic";
import { toWidget, Widget } from "@/components/widgets/widget";
import { useUser } from "@/hooks";

interface WidgetContextType {
  hasChanged: boolean;
  getWidgets: () => Widget[];
  getWidgetsLength: () => number;
  append: (widget: Widget) => void;
  replace: (index: number, widget: Widget) => void;
  update: (
    index: number,
    field: keyof Widget,
    newValue: Widget[keyof Widget]
  ) => void;
  updateByWidget: (
    widget: Widget,
    field: keyof Widget,
    newValue: Widget[keyof Widget]
  ) => void;
  remove: (index: number) => void;
  reset: (newWidgets: Widget[]) => void;
  sync: (syncWidgets?: Widget[]) => void;
}

export const WidgetContext = createContext<WidgetContextType | undefined>(
  undefined
);

interface WidgetProviderProps {
  children: React.ReactNode;
}

export const WidgetProvider = ({ children }: WidgetProviderProps) => {
  const { t } = useTranslation();
  const userManager = useUser();

  const [_, setUpdateTrigger] = useState<number>(0);
  const widgetsRef = useRef<Widget[]>([]);
  const hasChangedRef = useRef<boolean>(false);

  const forceUpdate = useCallback(() => {
    setUpdateTrigger(prev => (prev + 1) % MaxTriggerValue);
  }, []);

  // Retained t stays current; a language change must not reload unsaved widgets.
  useEffect(() => {
    const initializeWidgets = async () => {
      if (userManager.userData === null) return;
      const widgetsEncoded = LocalStorage.getItemByKey(
        LocalStorageKey.dashboardWidgets,
        userManager.userData?.publicId
      );
      if (widgetsEncoded !== null) {
        try {
          widgetsRef.current = (JSON.parse(widgetsEncoded) as any[])
            .map(widget => {
              const previewWidget = DashboardPreviewWidgets[widget.name];
              if (
                widget.layoutMode === "full-width" &&
                (widget.name === "guide" || widget.name === "videoGuide")
              ) {
                const { data, setting } = widget;
                Object.assign(widget, previewWidget, {
                  data,
                  setting,
                  layoutMode: undefined,
                  position: {
                    leftFrameCount: widget.name === "videoGuide" ? 2 : 0,
                    topFrameCount: 0,
                  },
                });
              }

              return {
                ...widget,
                component: previewWidget?.component,
              };
            })
            .filter((widget: Widget) => widget.component !== undefined);
          forceUpdate();
        } catch (error) {
          toast.error(tError(error, t));
        }
        return;
      }

      widgetsRef.current = [
        toWidget(DashboardPreviewWidgets.guide, {
          leftFrameCount: 0,
          topFrameCount: 0,
        }),
        toWidget(DashboardPreviewWidgets.videoGuide, {
          leftFrameCount: 2,
          topFrameCount: 0,
        }),
      ];
      LocalStorage.setItem(
        LocalStorageKey.dashboardWidgets,
        JSON.stringify(widgetsRef.current),
        userManager.userData.publicId
      );
      forceUpdate();
    };

    initializeWidgets();
  }, [userManager.userData, forceUpdate]);

  const getWidgets = useCallback(() => widgetsRef.current, []);

  const getWidgetsLength = useCallback(() => widgetsRef.current.length, []);

  const append = useCallback(
    (widget: Widget) => {
      widgetsRef.current.push(widget);
      hasChangedRef.current = true;
      forceUpdate();
    },
    [forceUpdate]
  );

  const replace = useCallback(
    (index: number, widget: Widget) => {
      if (index < 0 || index >= widgetsRef.current.length) return;
      widgetsRef.current[index] = widget;
      hasChangedRef.current = true;
      forceUpdate();
    },
    [forceUpdate]
  );

  const update = useCallback(
    (index: number, field: keyof Widget, newValue: Widget[keyof Widget]) => {
      if (index < 0 || index >= widgetsRef.current.length) return;
      widgetsRef.current[index] = {
        ...widgetsRef.current[index],
        [field]: newValue,
      };
      hasChangedRef.current = true;
      forceUpdate();
    },
    [forceUpdate]
  );

  const updateByWidget = useCallback(
    (widget: Widget, field: keyof Widget, newValue: Widget[keyof Widget]) => {
      const targetIndex = widgetsRef.current.findIndex(w => w.id === widget.id);

      if (targetIndex !== -1) {
        widgetsRef.current[targetIndex] = {
          ...widgetsRef.current[targetIndex],
          [field]: newValue,
        };
        hasChangedRef.current = true;
        forceUpdate();
      }
    },
    [forceUpdate]
  );

  const remove = useCallback(
    (index: number) => {
      widgetsRef.current = widgetsRef.current.filter((_, i) => i !== index);
      hasChangedRef.current = true;
      forceUpdate();
    },
    [forceUpdate]
  );

  const reset = useCallback(
    (newWidgets: Widget[]) => {
      widgetsRef.current = newWidgets;
      hasChangedRef.current = true;
      forceUpdate();
    },
    [forceUpdate]
  );

  const sync = useCallback(
    (syncWidgets?: Widget[]) => {
      const targetWidgets =
        syncWidgets !== undefined ? syncWidgets : widgetsRef.current;

      const sortedWidgets = targetWidgets.sort((a: Widget, b: Widget) =>
        a.position.topFrameCount === b.position.topFrameCount
          ? a.position.leftFrameCount - b.position.leftFrameCount
          : a.position.topFrameCount - b.position.topFrameCount
      );

      widgetsRef.current = sortedWidgets;

      LocalStorage.setItem(
        LocalStorageKey.dashboardWidgets,
        JSON.stringify(sortedWidgets),
        userManager.userData?.publicId
      );

      if (hasChangedRef.current) {
        toast.success(t("workspace.notifications.widgetsSaved"));
      }

      hasChangedRef.current = false;
      forceUpdate();
    },
    [userManager.userData, forceUpdate]
  );

  return (
    <WidgetContext.Provider
      value={{
        hasChanged: hasChangedRef.current,
        getWidgets,
        getWidgetsLength,
        append,
        replace,
        update,
        updateByWidget,
        remove,
        reset,
        sync,
      }}
    >
      {children}
    </WidgetContext.Provider>
  );
};
