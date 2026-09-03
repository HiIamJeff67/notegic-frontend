import { RoutineTaskPurpose } from "@shared/api/interfaces/enums";
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import RoutineRecordTable from "@/components/core/RoutineOverviewer/RoutineRecordTable/RoutineRecordTable";
import RoutineTaskInspector from "@/components/inspectors/RoutineTaskInspector";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    i18n: { resolvedLanguage: "en" },
    t: (key: string) => key,
  }),
}));

jest.mock("@/api/graphql/hooks/useSearchRoutineRecords", () => ({
  useSearchRoutineRecordsLazyQuery: () => [jest.fn(), { fetchMore: jest.fn() }],
}));

jest.mock("@/api/hooks/routineTask.hook", () => ({
  useGetMyRoutineTaskById: () => ({ fetch: jest.fn() }),
}));

jest.mock("@/hooks", () => ({
  useModal: () => ({ open: jest.fn() }),
  useStationRoutine: () => ({
    getRoutineById: () => ({
      id: "11111111-1111-4111-8111-111111111111",
      stationId: "22222222-2222-4222-8222-222222222222",
      routineTasks: [
        {
          id: "33333333-3333-4333-8333-333333333333",
          routineId: "11111111-1111-4111-8111-111111111111",
          routineTaskIds: [],
          title: "Previous task",
          purpose: RoutineTaskPurpose.CreateSubShelf,
          previousRoutineTaskIds: [],
        },
      ],
    }),
    getRoutineTaskById: () => ({
      id: "44444444-4444-4444-8444-444444444444",
      routineId: "11111111-1111-4111-8111-111111111111",
    }),
    isUpdatingRoutineTask: false,
    updateRoutineTask: jest.fn(),
    visibleRoutines: [],
    upsertRoutineTaskNode: jest.fn(),
  }),
  useUser: () => ({
    userAccount: { routineTaskCostUnitCount: 0 },
    userData: { plan: "Free" },
    fetchUserAccount: jest.fn(),
  }),
}));

jest.mock("@/components/ui/sheet", () => {
  const Passthrough = ({ children }: { children?: ReactNode }) => (
    <div>{children}</div>
  );

  return {
    Sheet: Passthrough,
    SheetContent: Passthrough,
    SheetDescription: Passthrough,
    SheetFooter: Passthrough,
    SheetHeader: Passthrough,
    SheetTitle: Passthrough,
  };
});

describe("Routine execution UI contracts", () => {
  test("renders the RoutineRecord overview empty state", () => {
    const markup = renderToStaticMarkup(<RoutineRecordTable />);

    expect(markup).toContain("workspace.records.noRoutineRecords");
  });

  test("does not render legacy dependency choices inside the RoutineTask inspector", () => {
    const markup = renderToStaticMarkup(
      <RoutineTaskInspector
        routineTaskId={"44444444-4444-4444-8444-444444444444"}
        isOpen
        onClose={jest.fn()}
      />
    );

    expect(markup).not.toContain("Previous task");
    expect(markup).not.toContain("workspace.table.routineTasks");
  });
});
