import { SearchSortOrder } from "@shared/api/graphql/generated/graphql";
import { useTranslation } from "@shared/i18n/useTranslation";
import { ArrowDownUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface RoutineSearchOrderProps<SortBy extends string> {
  label: string;
  value: { sortBy: SortBy; sortOrder: SearchSortOrder };
  defaultValue: { sortBy: SortBy; sortOrder: SearchSortOrder };
  options: Array<{ value: SortBy; label: string }>;
  onChange: (value: { sortBy: SortBy; sortOrder: SearchSortOrder }) => void;
}

const RoutineSearchOrder = <SortBy extends string>({
  label,
  value,
  defaultValue,
  options,
  onChange,
}: RoutineSearchOrderProps<SortBy>) => {
  const { t } = useTranslation();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          size="icon"
          variant={
            value.sortBy !== defaultValue.sortBy ||
            value.sortOrder !== defaultValue.sortOrder
              ? "secondary"
              : "outline"
          }
          className="size-8 shrink-0 rounded-sm"
          aria-label={label}
          title={label}
        >
          <ArrowDownUp className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        aria-label={label}
        className="h-80 w-60 max-h-[min(20rem,var(--radix-dropdown-menu-content-available-height))] overflow-y-auto overscroll-contain"
      >
        <DropdownMenuLabel>{t("workspace.records.sortBy")}</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={value.sortBy}
          onValueChange={sortBy =>
            onChange({ ...value, sortBy: sortBy as SortBy })
          }
        >
          {options.map(option => (
            <DropdownMenuRadioItem
              key={option.value}
              value={option.value}
              onSelect={event => event.preventDefault()}
            >
              {option.label}
            </DropdownMenuRadioItem>
          ))}
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
  );
};

export default RoutineSearchOrder;
