import {
  RoutineRecordStatus,
  RoutineTaskPurpose,
  RoutineTaskRecordStatus,
  SearchRoutineRecordSortBy,
  SearchRoutineTaskRecordSortBy,
  SearchSortOrder,
} from "@shared/api/graphql/generated/graphql";
import type {
  RoutineRecordStatus as RecordStatus,
  RoutineTaskPurpose as TaskPurpose,
  RoutineTaskRecordStatus as TaskStatus,
} from "@shared/api/interfaces/enums";
import { routineRecordStatusTKeys } from "@shared/i18n/enums/routineRecordStatus.tKey";
import { routineTaskPurposeTKeys } from "@shared/i18n/enums/routineTaskPurpose.tKey";
import { routineTaskRecordStatusTKeys } from "@shared/i18n/enums/routineTaskRecordStatus.tKey";
import { useTranslation } from "@shared/i18n/useTranslation";
import { ListFilter } from "lucide-react";
import { useId } from "react";
import DatePicker from "@/components/commons/DatePicker/DatePicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import RoutineSearchOrder from "../RoutineSearchOrder/RoutineSearchOrder";

export interface RoutineRecordFiltersValue {
  query: string;
  status?: RoutineRecordStatus | RoutineTaskRecordStatus;
  purpose?: RoutineTaskPurpose;
  actualStartedAtFrom?: Date;
  actualStartedAtBefore?: Date;
  sortBy: SearchRoutineRecordSortBy | SearchRoutineTaskRecordSortBy;
  sortOrder: SearchSortOrder;
}

export const defaultRoutineRecordFilters: RoutineRecordFiltersValue = {
  query: "",
  sortBy: SearchRoutineRecordSortBy.ActualStartedAt,
  sortOrder: SearchSortOrder.Desc,
};

interface RoutineRecordFiltersProps {
  task?: boolean;
  value: RoutineRecordFiltersValue;
  onChange: (value: RoutineRecordFiltersValue) => void;
}

const RoutineRecordFilters = ({
  task = false,
  value,
  onChange,
}: RoutineRecordFiltersProps) => {
  const { t } = useTranslation();
  const id = useId();
  const hasFilters = Boolean(
    value.query ||
      value.status ||
      value.purpose ||
      value.actualStartedAtFrom ||
      value.actualStartedAtBefore
  );
  const invalidRange = Boolean(
    value.actualStartedAtFrom &&
      value.actualStartedAtBefore &&
      value.actualStartedAtFrom >= value.actualStartedAtBefore
  );

  return (
    <div className="flex w-full min-w-0 items-center gap-2 sm:w-auto">
      <Input
        aria-label={t("workspace.records.search")}
        placeholder={t("workspace.records.search")}
        value={value.query}
        onChange={event => onChange({ ...value, query: event.target.value })}
        className="h-8 w-40 min-w-0 flex-1 text-xs sm:flex-none"
      />
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            size="icon"
            variant={hasFilters ? "secondary" : "outline"}
            className="size-8 shrink-0 rounded-sm"
            aria-label={t("workspace.records.filters")}
            title={t("workspace.records.filters")}
          >
            <ListFilter className="size-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          aria-label={t("workspace.records.filters")}
          className="z-[120] h-80 w-[min(24rem,calc(100vw-2rem))] max-h-[min(20rem,var(--radix-popover-content-available-height))] overflow-y-auto overscroll-contain p-3"
        >
          <p className="mb-4 text-sm font-medium">
            {t("workspace.records.filters")}
          </p>
          <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] items-center gap-x-3 gap-y-3">
            <Label htmlFor={`${id}-status`} className="text-xs leading-normal">
              {t("workspace.table.status")}
            </Label>
            <Select
              value={value.status ?? "All"}
              onValueChange={status =>
                onChange({
                  ...value,
                  status:
                    status === "All"
                      ? undefined
                      : (status as RoutineRecordFiltersValue["status"]),
                })
              }
            >
              <SelectTrigger
                id={`${id}-status`}
                aria-label={t("workspace.table.status")}
                className="h-8 w-full min-w-0 rounded-sm text-xs"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-[130] max-h-[min(16rem,var(--radix-select-content-available-height))]">
                <SelectItem value="All">
                  {t("workspace.table.allStatus")}
                </SelectItem>
                {Object.values(
                  task ? RoutineTaskRecordStatus : RoutineRecordStatus
                ).map(status => (
                  <SelectItem key={status} value={status}>
                    {task
                      ? t(
                          routineTaskRecordStatusTKeys[
                            status.replace(
                              "RoutineTaskRecordStatus_",
                              ""
                            ) as TaskStatus
                          ]
                        )
                      : t(
                          routineRecordStatusTKeys[
                            status.replace(
                              "RoutineRecordStatus_",
                              ""
                            ) as RecordStatus
                          ]
                        )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {task && (
              <>
                <Label
                  htmlFor={`${id}-purpose`}
                  className="text-xs leading-normal"
                >
                  {t("workspace.table.purpose")}
                </Label>
                <Select
                  value={value.purpose ?? "All"}
                  onValueChange={purpose =>
                    onChange({
                      ...value,
                      purpose:
                        purpose === "All"
                          ? undefined
                          : (purpose as RoutineTaskPurpose),
                    })
                  }
                >
                  <SelectTrigger
                    id={`${id}-purpose`}
                    aria-label={t("workspace.table.purpose")}
                    className="h-8 w-full min-w-0 rounded-sm text-xs"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-[130] max-h-[min(16rem,var(--radix-select-content-available-height))]">
                    <SelectItem value="All">
                      {t("workspace.table.allPurpose")}
                    </SelectItem>
                    {Object.values(RoutineTaskPurpose).map(purpose => {
                      const taskPurpose = purpose.replace(
                        "RoutineTaskPurpose_",
                        ""
                      ) as TaskPurpose;
                      return (
                        <SelectItem key={purpose} value={purpose}>
                          {t(routineTaskPurposeTKeys[taskPurpose].action)} ·{" "}
                          {t(routineTaskPurposeTKeys[taskPurpose].target)}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </>
            )}
            <Label htmlFor={`${id}-from`} className="text-xs leading-normal">
              {t("workspace.records.startedFrom")}
            </Label>
            <DatePicker
              id={`${id}-from`}
              value={value.actualStartedAtFrom}
              onValueChange={actualStartedAtFrom =>
                onChange({ ...value, actualStartedAtFrom })
              }
              placeholder={t("workspace.records.startedFrom")}
              isInvalid={invalidRange}
              className="h-8 w-full min-w-0 text-xs"
              contentClassName="max-h-[min(20rem,var(--radix-popover-content-available-height))] overflow-y-auto"
            />
            <Label htmlFor={`${id}-before`} className="text-xs leading-normal">
              {t("workspace.records.startedBefore")}
            </Label>
            <DatePicker
              id={`${id}-before`}
              value={value.actualStartedAtBefore}
              onValueChange={actualStartedAtBefore =>
                onChange({ ...value, actualStartedAtBefore })
              }
              placeholder={t("workspace.records.startedBefore")}
              isInvalid={invalidRange}
              className="h-8 w-full min-w-0 text-xs"
              contentClassName="max-h-[min(20rem,var(--radix-popover-content-available-height))] overflow-y-auto"
            />
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="col-span-2 justify-self-end"
              onClick={() =>
                onChange({
                  ...defaultRoutineRecordFilters,
                  sortBy: value.sortBy,
                  sortOrder: value.sortOrder,
                })
              }
            >
              {t("workspace.records.resetFilters")}
            </Button>
            {invalidRange && (
              <p role="alert" className="col-span-2 text-xs text-destructive">
                {t("workspace.records.invalidRange")}
              </p>
            )}
          </div>
        </PopoverContent>
      </Popover>
      <RoutineSearchOrder
        label={t("workspace.records.sort")}
        value={value}
        defaultValue={defaultRoutineRecordFilters}
        onChange={order => onChange({ ...value, ...order })}
        options={[
          {
            value: SearchRoutineRecordSortBy.ActualStartedAt,
            label: t("workspace.table.started"),
          },
          {
            value: SearchRoutineRecordSortBy.ActualEndedAt,
            label: t("workspace.table.ended"),
          },
          {
            value: SearchRoutineRecordSortBy.ScheduledAt,
            label: t("workspace.table.scheduled"),
          },
          {
            value: SearchRoutineRecordSortBy.CreatedAt,
            label: t("workspace.records.createdAt"),
          },
          {
            value: SearchRoutineRecordSortBy.LastUpdate,
            label: t("workspace.records.updatedAt"),
          },
          {
            value: SearchRoutineRecordSortBy.Status,
            label: t("workspace.table.status"),
          },
          ...(task
            ? [
                {
                  value: SearchRoutineTaskRecordSortBy.Purpose,
                  label: t("workspace.table.purpose"),
                },
                {
                  value: SearchRoutineTaskRecordSortBy.Attempts,
                  label: t("workspace.table.attempts"),
                },
              ]
            : []),
        ]}
      />
    </div>
  );
};

export default RoutineRecordFilters;
