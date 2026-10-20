import type { SearchRoutineInput } from "@shared/api/graphql/generated/graphql";
import { searchPage } from "@shared/lib/search-page";

type RoutineSearchNode = {
  id: string;
  title: string;
  period?: string | null;
  scheduledStartAt: Date | string;
  scheduledEndAt: Date | string;
  updatedAt: Date | string;
  createdAt: Date | string;
};

export const routineSearchPage = <T extends RoutineSearchNode>(
  input: SearchRoutineInput,
  rows: T[]
) =>
  searchPage("routines", input, rows, {
    RELEVANCE: row => row.title,
    TITLE: row => row.title,
    LAST_UPDATE: row => new Date(row.updatedAt),
    CREATED_AT: row => new Date(row.createdAt),
    SCHEDULED_START_AT: row => new Date(row.scheduledStartAt),
    SCHEDULED_END_AT: row => new Date(row.scheduledEndAt),
    PERIOD: row => row.period?.replace(/^RoutinePeriod_/, "") ?? null,
  });
