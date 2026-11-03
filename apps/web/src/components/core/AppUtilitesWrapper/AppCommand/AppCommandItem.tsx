import {
  BookOpenIcon,
  ChevronDownIcon,
  HistoryIcon,
  LayoutDashboardIcon,
  MessageSquareWarningIcon,
  Pencil,
  PlusIcon,
  SlidersHorizontalIcon,
  SquarePen,
  Trash2Icon,
  UserRoundIcon,
  Workflow,
} from "lucide-react";
import type { ReactNode } from "react";
import {
  BlockPackIcon,
  MaterialIcon,
  RootShelfIcon,
  RoutineIcon,
  RoutineTagIcon,
  RoutineTaskIcon,
  StationIcon,
  SubShelfIcon,
} from "@/components/icons/WorkspaceEntityIcons";
import { CommandItem } from "@/components/ui/command";
import { useTranslation } from "@/hooks/useTranslation";
import type {
  AppCommandHint,
  AppCommandIcon,
} from "@/providers/AppCommandProvider";

const AppCommandGlyph = ({ name }: { name: AppCommandIcon }) => {
  const className = "size-5 shrink-0 text-muted-foreground";
  const glyph: Record<AppCommandIcon, ReactNode> = {
    dashboard: <LayoutDashboardIcon className={className} />,
    routines: <RoutineIcon className={className} />,
    trash: <Trash2Icon className={className} />,
    document: <BookOpenIcon className={className} />,
    preferences: <SlidersHorizontalIcon className={className} />,
    shelves: <RootShelfIcon size={20} className={className} />,
    station: <StationIcon size={20} className={className} />,
    routineTag: <RoutineTagIcon className={className} />,
    rootShelf: <RootShelfIcon size={20} className={className} />,
    subShelf: <SubShelfIcon className={className} />,
    material: <MaterialIcon className={className} />,
    blockPack: <BlockPackIcon className={className} />,
    routine: <RoutineIcon className={className} />,
    routineTask: <RoutineTaskIcon className={className} />,
    orchestrate: <Workflow className={className} />,
    records: <HistoryIcon className={className} />,
    more: <ChevronDownIcon className={className} />,
    report: <MessageSquareWarningIcon className={className} />,
    create: <PlusIcon className={className} />,
    rename: <Pencil className={className} />,
    inspector: <SquarePen className={className} />,
    account: <UserRoundIcon className={className} />,
  };
  return glyph[name];
};

const AppCommandItem = ({
  id,
  label,
  hint,
  icon,
  onSelect,
}: {
  id: string;
  label: string;
  hint: AppCommandHint;
  icon: AppCommandIcon;
  onSelect: () => void;
}) => {
  const { t } = useTranslation();
  const hintLabel =
    hint === "command"
      ? t("common.commandKindCommand")
      : hint === "domain"
        ? t("common.commandKindDomain")
        : hint === "setting"
          ? t("common.commandKindSetting")
          : hint === "rootShelf"
            ? t("workspace.trash.rootShelf")
            : hint === "subShelf"
              ? t("workspace.menu.subShelf")
              : hint === "material"
                ? t("workspace.menu.material")
                : hint === "blockPack"
                  ? t("workspace.menu.blockPack")
                  : hint === "station"
                    ? t("workspace.table.station")
                    : hint === "routine"
                      ? t("workspace.table.routine")
                      : hint === "routineTask"
                        ? t("workspace.table.routineTasks")
                        : hint === "routineTag"
                          ? t("workspace.navigation.routineTags")
                          : t("common.commandKindOperation");
  return (
    <CommandItem
      className="px-3 py-2.5 text-base"
      value={id}
      keywords={[label]}
      onSelect={onSelect}
    >
      <AppCommandGlyph name={icon} />
      <span className="min-w-0 truncate">{label}</span>
      <span className="ml-auto shrink-0 pl-4 text-right text-sm text-muted-foreground">
        {hintLabel}
      </span>
    </CommandItem>
  );
};

export default AppCommandItem;
