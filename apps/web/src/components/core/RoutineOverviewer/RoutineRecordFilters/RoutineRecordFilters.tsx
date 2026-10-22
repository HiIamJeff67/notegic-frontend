import {
  RoutineRecordStatus,
  RoutineTaskRecordStatus,
  RoutineTaskPurpose,
  SearchRoutineRecordSortBy,
  SearchRoutineTaskRecordSortBy,
  SearchSortOrder,
} from "@shared/api/graphql/generated/graphql";
import type {
  RoutineRecordStatus as RecordStatus,
  RoutineTaskRecordStatus as TaskStatus,
  RoutineTaskPurpose as TaskPurpose,
} from "@shared/api/interfaces/enums";
import { routineRecordStatusTKeys } from "@shared/i18n/enums/routineRecordStatus.tKey";
import { routineTaskRecordStatusTKeys } from "@shared/i18n/enums/routineTaskRecordStatus.tKey";
import { routineTaskPurposeTKeys } from "@shared/i18n/enums/routineTaskPurpose.tKey";
import { useTranslation } from "@shared/i18n/useTranslation";
import { ArrowDownUp, ListFilter } from "lucide-react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
    <div className="flex min-w-0 items-center gap-2">
      <Input
        aria-label={t("workspace.records.search")}
        placeholder={t("workspace.records.search")}
        value={value.query}
        onChange={event => onChange({ ...value, query: event.target.value })}
        className="h-8 w-40 min-w-0 text-xs"
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
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            size="icon"
            variant={
              value.sortBy !== defaultRoutineRecordFilters.sortBy ||
              value.sortOrder !== defaultRoutineRecordFilters.sortOrder
                ? "secondary"
                : "outline"
            }
            className="size-8 shrink-0 rounded-sm"
            aria-label={t("workspace.records.sort")}
            title={t("workspace.records.sort")}
          >
            <ArrowDownUp className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          aria-label={t("workspace.records.sort")}
          className="h-80 w-60 max-h-[min(20rem,var(--radix-dropdown-menu-content-available-height))] overflow-y-auto overscroll-contain"
        >
          <DropdownMenuLabel>{t("workspace.records.sortBy")}</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={value.sortBy}
            onValueChange={sortBy =>
              onChange({
                ...value,
                sortBy: sortBy as RoutineRecordFiltersValue["sortBy"],
              })
            }
          >
            <DropdownMenuRadioItem
              value="ACTUAL_STARTED_AT"
              onSelect={event => event.preventDefault()}
            >
              {t("workspace.table.started")}
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem
              value="ACTUAL_ENDED_AT"
              onSelect={event => event.preventDefault()}
            >
              {t("workspace.table.ended")}
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem
              value="SCHEDULED_AT"
              onSelect={event => event.preventDefault()}
            >
              {t("workspace.table.scheduled")}
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem
              value="CREATED_AT"
              onSelect={event => event.preventDefault()}
            >
              {t("workspace.records.createdAt")}
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem
              value="LAST_UPDATE"
              onSelect={event => event.preventDefault()}
            >
              {t("workspace.records.updatedAt")}
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem
              value="STATUS"
              onSelect={event => event.preventDefault()}
            >
              {t("workspace.table.status")}
            </DropdownMenuRadioItem>
            {task && (
              <DropdownMenuRadioItem
                value="PURPOSE"
                onSelect={event => event.preventDefault()}
              >
                {t("workspace.table.purpose")}
              </DropdownMenuRadioItem>
            )}
            {task && (
              <DropdownMenuRadioItem
                value="ATTEMPTS"
                onSelect={event => event.preventDefault()}
              >
                {t("workspace.table.attempts")}
              </DropdownMenuRadioItem>
            )}
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>
            {t("workspace.records.sortOrder")}
          </DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={value.sortOrder}
            onValueChange={sortOrder =>
              onChange({ ...value, sortOrder: sortOrder as SearchSortOrder })
            }
          >
            <DropdownMenuRadioItem
              value="DESC"
              onSelect={event => event.preventDefault()}
            >
              {t("workspace.records.descending")}
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem
              value="ASC"
              onSelect={event => event.preventDefault()}
            >
              {t("workspace.records.ascending")}
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default RoutineRecordFilters;
