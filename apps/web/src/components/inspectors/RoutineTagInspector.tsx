import { getClientRequestHeaders } from "@/api/clientHeaders";
import { useGetMyRoutineTagById } from "@/api/hooks/routineTag.hook";
import type { SupportedIcon } from "@shared/api/interfaces/enums";
import toast from "@shared/lib/toast";
import type { RoutineTagNode } from "@shared/types/routineTagNode.type";
import type { UUID } from "crypto";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ColorSelector from "@/components/commons/ColorSelector/ColorSelector";
import SupportedIconTable from "@/components/commons/SupportedIconTable/SupportedIconTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import { useStationRoutine } from "@/hooks";
import { translateError } from "@shared/i18n/error";
import InspectorLoadingCover from "./InspectorLoadingCover";

interface RoutineTagInspectorProps {
  routineTagId: UUID;
  isOpen: boolean;
  onClose: () => void;
}

const RoutineTagInspector = ({
  routineTagId,
  isOpen,
  onClose,
}: RoutineTagInspectorProps) => {
  const { t } = useTranslation();
  const stationRoutineManager = useStationRoutine();
  const getRoutineTagQuerier = useGetMyRoutineTagById();

  const [isLoadingRoutineTagDetail, setIsLoadingRoutineTagDetail] =
    useState(false);
  const [values, setValues] = useState<{
    name: string;
    color: string;
    icon: SupportedIcon | null;
  }>({
    name: "",
    color: "#64748b",
    icon: null,
  });

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setValues({
      name: "",
      color: "#64748b",
      icon: null,
    });

    setIsLoadingRoutineTagDetail(true);
    getRoutineTagQuerier
      .fetch({
        header: getClientRequestHeaders(navigator.userAgent),
        param: {
          routineTagId,
        },
      })
      .then(response => {
        if (cancelled || response.success === false || !response.data) return;
        const routineTagNode: RoutineTagNode = {
          id: response.data.id as UUID,
          name: response.data.name,
          color: response.data.color,
          icon: response.data.icon,
          updatedAt: response.data.updatedAt,
          createdAt: response.data.createdAt,
          routines: [],
          routineCount: 0,
          isOpen: false,
          isExpanded: true,
        };
        stationRoutineManager.upsertRoutineTagNode(routineTagNode);
        setValues({
          name: response.data.name,
          color: response.data.color,
          icon: response.data.icon,
        });
      })
      .catch(error => {
        if (!cancelled) toast.error(translateError(error, t));
      })
      .finally(() => {
        if (!cancelled) setIsLoadingRoutineTagDetail(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, routineTagId]);

  const saveRoutineTag = async () => {
    const name = values.name.trim();
    if (name.length === 0) return;

    try {
      await stationRoutineManager.updateRoutineTag(
        routineTagId,
        {
          name,
          color: values.color,
          ...(values.icon === null ? {} : { icon: values.icon }),
        },
        {
          icon: values.icon === null,
        }
      );
      toast.success(t("workspace.routineTag.updated"));
      onClose();
    } catch (error) {
      toast.error(translateError(error, t));
    }
  };

  return (
    <Sheet
      open={isOpen}
      onOpenChange={open => {
        if (!open && !stationRoutineManager.isUpdatingRoutineTag) onClose();
      }}
    >
      <SheetContent
        overlayClassName="z-[110]"
        className="inspector-surface z-[110] flex h-full w-full flex-col gap-0 bg-sidebar p-0 sm:max-w-md"
      >
        <div className="relative flex h-full min-h-0 w-full flex-col">
          <SheetHeader className="min-w-0 shrink-0 border-b border-border px-6 py-5 pr-12">
            <SheetTitle className="flex min-w-0 items-center gap-2">
              <span className="shrink-0">
                {t("workspace.inspector.editRoutineTagOf")}
              </span>
              <span className="min-w-0 truncate text-foreground">
                "{values.name || t("workspace.scope.routineTags")}"
              </span>
            </SheetTitle>
            <SheetDescription>
              {t("workspace.inspector.routineTagDescription")}
            </SheetDescription>
          </SheetHeader>
          <form
            autoComplete="off"
            className="flex min-h-0 flex-1 flex-col"
            onSubmit={async event => {
              event.preventDefault();
              await saveRoutineTag();
            }}
          >
            <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-6 py-5">
              <div className="flex flex-col gap-2">
                <Label htmlFor="routine-tag-inspector-name">
                  {t("workspace.fields.name")}
                </Label>
                <Input
                  id="routine-tag-inspector-name"
                  value={values.name}
                  autoComplete="off"
                  maxLength={128}
                  autoFocus
                  onChange={event => {
                    const name = event.currentTarget.value;
                    setValues(current => ({
                      ...current,
                      name,
                    }));
                  }}
                />
              </div>

              <div className="flex items-end gap-4">
                <div className="flex shrink-0 flex-col gap-2">
                  <Label>{t("workspace.fields.color")}</Label>
                  <ColorSelector
                    value={values.color}
                    onValueChange={color =>
                      setValues(current => ({ ...current, color }))
                    }
                    disabled={stationRoutineManager.isUpdatingRoutineTag}
                  />
                </div>

                <div className="flex shrink-0 flex-col gap-2">
                  <Label>{t("workspace.fields.icon")}</Label>
                  <SupportedIconTable
                    value={values.icon}
                    onValueChange={icon =>
                      setValues(current => ({ ...current, icon }))
                    }
                    disabled={stationRoutineManager.isUpdatingRoutineTag}
                  />
                </div>
              </div>
            </div>

            <SheetFooter className="shrink-0 flex-col gap-2 border-t border-border px-6 py-5 sm:flex-col sm:space-x-0">
              <Button
                type="submit"
                className="w-full"
                disabled={
                  stationRoutineManager.isUpdatingRoutineTag ||
                  isLoadingRoutineTagDetail ||
                  values.name.trim().length === 0
                }
              >
                {stationRoutineManager.isUpdatingRoutineTag && <Spinner />}
                {t("common.save")}
              </Button>
              <Button
                type="button"
                variant="destructive"
                className="w-full"
                disabled={stationRoutineManager.isUpdatingRoutineTag}
                onClick={onClose}
              >
                {t("common.cancel")}
              </Button>
            </SheetFooter>
          </form>
          <InspectorLoadingCover
            label={t("common.loading")}
            show={isLoadingRoutineTagDetail}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default RoutineTagInspector;
