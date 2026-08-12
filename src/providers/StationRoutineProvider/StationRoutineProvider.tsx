import { RoutineStatus, RoutineTaskStatus } from "@shared/api/interfaces/enums";
import { MaxTriggerValue } from "@shared/constants/triggerLimitations.constant";
import { LRUCache } from "@shared/lib/LRUCache";
import type { RoutineNode } from "@shared/types/routineNode.type";
import type { RoutineTagNode } from "@shared/types/routineTagNode.type";
import type { RoutineTaskNode } from "@shared/types/routineTaskNode.type";
import type { StationNode } from "@shared/types/stationNode.type";
import type { UUID } from "crypto";
import React, {
  createContext,
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useUser } from "@/hooks";
import { useRoutineLogic } from "./RoutineLogic";
import { useRoutineTagLogic } from "./RoutineTagLogic";
import { useRoutineTaskLogic } from "./RoutineTaskLogic";
import { useStationLogic } from "./StationLogic";

export type StationRoutineInspectorTarget =
  | { type: "station"; id: UUID }
  | { type: "routine"; id: UUID }
  | { type: "routineTag"; id: UUID }
  | { type: "routineTask"; id: UUID };

interface StationRoutineBaseContext {
  inputRef: RefObject<HTMLInputElement | null>;
  routineTitleInputRef: RefObject<HTMLInputElement | null>;
  routineTagNameInputRef: RefObject<HTMLInputElement | null>;
  state: "idle" | "loading" | "syncing";
  viewMode: "overview" | "station";
  activeStationId: UUID | null;
  stations: StationNode[];
  routineTags: RoutineTagNode[];
  routineTasks: RoutineTaskNode[];
  routines: RoutineNode[];
  activeStation: StationNode | null;
  activeStationRoutines: RoutineNode[];
  activeStationRoutineTasks: RoutineTaskNode[];
  activeStationRoutineTags: RoutineTagNode[];
  visibleStations: StationNode[];
  visibleRoutines: RoutineNode[];
  visibleRoutineTags: RoutineTagNode[];
  visibleRoutineTasks: RoutineTaskNode[];
  unscheduledRoutines: RoutineNode[];
  presence: {
    stationIds: UUID[];
    routineTagIds: UUID[];
    showUntaggedRoutines: boolean;
    query: string;
  };
  timeWindow: { startAt: Date; endAt: Date };
  timeRailScale: "day" | "week" | "month";
  statusSummary: {
    totalStations: number;
    totalRoutineTags: number;
    totalRoutines: number;
    totalRoutineTasks: number;
    visibleRoutines: number;
    scheduledRoutines: number;
    unscheduledRoutines: number;
    overdueRoutines: number;
    activeTasks: number;
  };
  getStationById: (stationId: UUID) => StationNode | undefined;
  getRoutineById: (routineId: UUID) => RoutineNode | undefined;
  getRoutineTagById: (routineTagId: UUID) => RoutineTagNode | undefined;
  getRoutineTaskById: (routineTaskId: UUID) => RoutineTaskNode | undefined;
  inspectorTarget: StationRoutineInspectorTarget | null;
  openInspector: (target: StationRoutineInspectorTarget) => void;
  closeInspector: () => void;
  initializeStationRoutineData: () => Promise<void>;
  refresh: () => Promise<void>;
  setViewMode: (viewMode: "overview" | "station") => void;
  setActiveStationId: (stationId: UUID | null) => void;
  setPresenceQuery: (query: string) => void;
  setStationPresence: (stationIds: UUID[]) => void;
  setRoutineTagPresence: (routineTagIds: UUID[]) => void;
  toggleUntaggedRoutines: () => void;
  resetPresence: () => void;
  setTimeWindow: (timeWindow: { startAt: Date; endAt: Date }) => void;
  moveTimeWindow: (direction: "previous" | "next") => void;
  setTimeRailScale: (scale: "day" | "week" | "month") => void;
}

export type StationRoutineContextType = StationRoutineBaseContext &
  ReturnType<typeof useStationLogic> &
  ReturnType<typeof useRoutineLogic> &
  ReturnType<typeof useRoutineTagLogic> &
  ReturnType<typeof useRoutineTaskLogic>;

export const StationRoutineContext = createContext<
  StationRoutineContextType | undefined
>(undefined);

export const StationRoutineProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const userManager = useUser();

  const initialStartAt = new Date();
  initialStartAt.setHours(0, 0, 0, 0);
  initialStartAt.setDate(initialStartAt.getDate() - 15);
  const initialEndAt = new Date(initialStartAt);
  initialEndAt.setDate(initialEndAt.getDate() + 31);

  const inputRef = useRef<HTMLInputElement>(null);
  const routineTitleInputRef = useRef<HTMLInputElement>(null);
  const routineTagNameInputRef = useRef<HTMLInputElement>(null);
  const stationsRef = useRef(
    new LRUCache<UUID, StationNode>(Number.MAX_SAFE_INTEGER)
  );
  const routineTagsRef = useRef(
    new LRUCache<UUID, RoutineTagNode>(Number.MAX_SAFE_INTEGER)
  );
  const knownStationIdsRef = useRef<Set<UUID>>(new Set());
  const knownRoutineTagIdsRef = useRef<Set<UUID>>(new Set());
  const initializedUserPublicIdRef = useRef<string | null>(null);
  const failedUserPublicIdRef = useRef<string | null>(null);
  const initializationPromiseRef = useRef<Promise<void> | null>(null);
  const presenceRef = useRef<{
    stationIds: UUID[];
    routineTagIds: UUID[];
    showUntaggedRoutines: boolean;
    query: string;
  }>({
    stationIds: [],
    routineTagIds: [],
    showUntaggedRoutines: true,
    query: "",
  });

  const [_, setUpdateTrigger] = useState<number>(0);
  const [state, setState] = useState<"idle" | "loading" | "syncing">("idle");
  const [viewMode, setViewMode] = useState<"overview" | "station">("overview");
  const [activeStationId, setActiveStationId] = useState<UUID | null>(null);
  const [inspectorTarget, setInspectorTarget] =
    useState<StationRoutineInspectorTarget | null>(null);
  const [timeWindow, setTimeWindow] = useState<{ startAt: Date; endAt: Date }>({
    startAt: initialStartAt,
    endAt: initialEndAt,
  });
  const [timeRailScale, setTimeRailScale] = useState<"day" | "week" | "month">(
    "week"
  );

  const forceUpdate = useCallback(() => {
    setUpdateTrigger(prev => (prev + 1) % MaxTriggerValue);
  }, []);

  const routineTaskLogic = useRoutineTaskLogic({
    stationsRef,
    forceUpdate,
  });
  const routineLogic = useRoutineLogic({
    inputRef: routineTitleInputRef,
    stationsRef,
    routineTagsRef,
    forceUpdate,
    getAllRoutineTasksByRoutineIds:
      routineTaskLogic.getAllRoutineTasksByRoutineIds,
  });
  const stationLogic = useStationLogic({
    inputRef,
    stationsRef,
    routineTagsRef,
    forceUpdate,
    expandRoutinesByStationId: routineLogic.expandRoutinesByStationId,
    getAllRoutineTasksByRoutineIds:
      routineTaskLogic.getAllRoutineTasksByRoutineIds,
    selectedRoutineId: routineLogic.selectedRoutineId,
    selectRoutine: routineLogic.selectRoutine,
  });
  const routineTagLogic = useRoutineTagLogic({
    inputRef: routineTagNameInputRef,
    stationsRef,
    routineTagsRef,
    forceUpdate,
    expandRoutinesByTagId: routineLogic.expandRoutinesByTagId,
  });
  const initializeStationRoutineData = useCallback(async (): Promise<void> => {
    const userData = userManager.userData;
    if (!userData) {
      initializedUserPublicIdRef.current = null;
      failedUserPublicIdRef.current = null;
      return;
    }
    if (initializedUserPublicIdRef.current === userData.publicId) return;
    if (failedUserPublicIdRef.current === userData.publicId) return;
    if (initializationPromiseRef.current) {
      await initializationPromiseRef.current;
      return;
    }

    setState("loading");
    initializationPromiseRef.current = Promise.all([
      stationLogic.searchStations(""),
      routineTagLogic.searchRoutineTags(),
    ])
      .then(() => {
        initializedUserPublicIdRef.current = userData.publicId;
      })
      .catch(error => {
        initializedUserPublicIdRef.current = null;
        failedUserPublicIdRef.current = userData.publicId;
        console.error("failed to search station routine data", error);
        throw error;
      })
      .finally(() => {
        initializationPromiseRef.current = null;
        setState("idle");
      });

    await initializationPromiseRef.current;
  }, [
    routineTagLogic.searchRoutineTags,
    stationLogic.searchStations,
    userManager.userData?.publicId,
  ]);

  useEffect(() => {
    void initializeStationRoutineData().catch(() => {});
  }, [initializeStationRoutineData]);

  const stations = stationsRef.current.values();
  const routineTags = routineTagsRef.current.values();
  const stationIdsSignature = stations.map(station => station.id).join(",");
  const routineTagIdsSignature = routineTags
    .map(routineTag => routineTag.id)
    .join(",");

  useEffect(() => {
    const currentStationIds = stationsRef.current.keys() as UUID[];
    const currentRoutineTagIds = routineTagsRef.current.keys() as UUID[];
    const newStationIds = currentStationIds.filter(
      stationId => !knownStationIdsRef.current.has(stationId)
    );
    const newRoutineTagIds = currentRoutineTagIds.filter(
      routineTagId => !knownRoutineTagIdsRef.current.has(routineTagId)
    );
    const currentStationIdSet = new Set(currentStationIds);
    const currentRoutineTagIdSet = new Set(currentRoutineTagIds);

    presenceRef.current = {
      ...presenceRef.current,
      stationIds: [
        ...presenceRef.current.stationIds.filter(stationId =>
          currentStationIdSet.has(stationId)
        ),
        ...newStationIds,
      ],
      routineTagIds: [
        ...presenceRef.current.routineTagIds.filter(routineTagId =>
          currentRoutineTagIdSet.has(routineTagId)
        ),
        ...newRoutineTagIds,
      ],
    };
    knownStationIdsRef.current = currentStationIdSet;
    knownRoutineTagIdsRef.current = currentRoutineTagIdSet;
    if (newStationIds.length > 0 || newRoutineTagIds.length > 0) forceUpdate();
  }, [forceUpdate, routineTagIdsSignature, stationIdsSignature]);

  const refresh = useCallback(async () => {
    const userPublicId = userManager.userData?.publicId;
    if (!userPublicId) return;

    initializedUserPublicIdRef.current = null;
    failedUserPublicIdRef.current = null;
    setState("syncing");
    try {
      stationsRef.current.clear();
      routineTagsRef.current.clear();
      knownStationIdsRef.current.clear();
      knownRoutineTagIdsRef.current.clear();
      presenceRef.current = {
        stationIds: [],
        routineTagIds: [],
        showUntaggedRoutines: true,
        query: presenceRef.current.query,
      };
      forceUpdate();
      await Promise.all([
        stationLogic.searchStations(""),
        routineTagLogic.searchRoutineTags(),
      ]);
      initializedUserPublicIdRef.current = userPublicId;
    } catch (error) {
      failedUserPublicIdRef.current = userPublicId;
      throw error;
    } finally {
      setState("idle");
    }
  }, [
    forceUpdate,
    routineTagLogic.searchRoutineTags,
    stationLogic.searchStations,
    userManager.userData?.publicId,
  ]);

  const setPresenceQuery = useCallback(
    (query: string) => {
      presenceRef.current = { ...presenceRef.current, query };
      forceUpdate();
    },
    [forceUpdate]
  );

  const setStationPresence = useCallback(
    (stationIds: UUID[]) => {
      presenceRef.current = { ...presenceRef.current, stationIds };
      forceUpdate();
    },
    [forceUpdate]
  );

  const setRoutineTagPresence = useCallback(
    (routineTagIds: UUID[]) => {
      presenceRef.current = { ...presenceRef.current, routineTagIds };
      forceUpdate();
    },
    [forceUpdate]
  );

  const toggleUntaggedRoutines = useCallback(() => {
    presenceRef.current = {
      ...presenceRef.current,
      showUntaggedRoutines: !presenceRef.current.showUntaggedRoutines,
    };
    forceUpdate();
  }, [forceUpdate]);

  const resetPresence = useCallback(() => {
    presenceRef.current = {
      stationIds: stationsRef.current.keys() as UUID[],
      routineTagIds: routineTagsRef.current.keys() as UUID[],
      showUntaggedRoutines: true,
      query: "",
    };
    forceUpdate();
  }, [forceUpdate]);

  const moveTimeWindow = useCallback(
    (direction: "previous" | "next") => {
      const multiplier = direction === "previous" ? -1 : 1;
      const nextStartAt = new Date(timeWindow.startAt);
      const nextEndAt = new Date(timeWindow.endAt);

      if (timeRailScale === "day") {
        nextStartAt.setDate(nextStartAt.getDate() + multiplier);
        nextEndAt.setDate(nextEndAt.getDate() + multiplier);
      }
      if (timeRailScale === "week") {
        nextStartAt.setDate(nextStartAt.getDate() + multiplier * 7);
        nextEndAt.setDate(nextEndAt.getDate() + multiplier * 7);
      }
      if (timeRailScale === "month") {
        nextStartAt.setMonth(nextStartAt.getMonth() + multiplier);
        nextEndAt.setMonth(nextEndAt.getMonth() + multiplier);
      }

      setTimeWindow({ startAt: nextStartAt, endAt: nextEndAt });
    },
    [timeRailScale, timeWindow]
  );

  const routines: RoutineNode[] = [];
  const seenRoutineIds = new Set<UUID>();
  for (const station of stations) {
    for (const routine of station.routines) {
      if (seenRoutineIds.has(routine.id)) continue;
      seenRoutineIds.add(routine.id);
      routines.push(routine);
    }
  }
  for (const routineTag of routineTags) {
    for (const routine of routineTag.routines) {
      if (seenRoutineIds.has(routine.id)) continue;
      seenRoutineIds.add(routine.id);
      routines.push(routine);
    }
  }

  const routineTasksMap = new Map<UUID, RoutineTaskNode>();
  for (const station of stations) {
    for (const routineTask of station.routineTasks) {
      routineTasksMap.set(routineTask.id, routineTask);
    }
    for (const routine of station.routines) {
      for (const routineTask of routine.routineTasks) {
        if (!routineTasksMap.has(routineTask.id)) {
          routineTasksMap.set(routineTask.id, routineTask);
        }
      }
    }
  }
  const routineTasks = Array.from(routineTasksMap.values());

  const activeStation =
    stations.find(station => station.id === activeStationId) ?? null;
  const activeStationRoutines = activeStation?.routines ?? [];
  const activeStationRoutineTasks = activeStation?.routineTasks ?? [];
  const activeStationRoutineTagIds = new Set(
    activeStationRoutines.flatMap(routine => routine.routineTagIds)
  );
  const activeStationRoutineTags = routineTags.filter(routineTag =>
    activeStationRoutineTagIds.has(routineTag.id)
  );
  const visibleRoutineTags = routineTags.filter(routineTag =>
    presenceRef.current.routineTagIds.includes(routineTag.id)
  );
  const query = presenceRef.current.query.trim().toLowerCase();
  const selectedStationIds = new Set(
    viewMode === "station" && activeStationId
      ? [activeStationId]
      : presenceRef.current.stationIds
  );
  const visibleStations = stations.filter(station =>
    selectedStationIds.has(station.id)
  );
  const visibleRoutineTasks = routineTasks.filter(routineTask =>
    selectedStationIds.has(routineTask.stationId)
  );
  const selectedRoutineTagIds = new Set(presenceRef.current.routineTagIds);
  const isAllRoutineTagsVisible =
    routineTags.length === selectedRoutineTagIds.size;
  const visibleRoutines = routines.filter(routine => {
    if (!selectedStationIds.has(routine.stationId)) return false;
    if (query.length > 0) {
      const searchableText = routine.title.toLowerCase();
      if (!searchableText.includes(query)) return false;
    }
    if (routine.routineTagIds.length === 0) {
      return presenceRef.current.showUntaggedRoutines;
    }
    if (isAllRoutineTagsVisible) return true;
    return routine.routineTagIds.some(routineTagId =>
      selectedRoutineTagIds.has(routineTagId)
    );
  });

  const unscheduledRoutines = visibleRoutines.filter(routine => {
    return !(
      routine.scheduledStartAt instanceof Date &&
      routine.scheduledEndAt instanceof Date &&
      !Number.isNaN(routine.scheduledStartAt.getTime()) &&
      !Number.isNaN(routine.scheduledEndAt.getTime())
    );
  });

  const statusSummary = {
    totalStations: stations.length,
    totalRoutineTags: routineTags.length,
    totalRoutines: routines.length,
    totalRoutineTasks: routineTasks.length,
    visibleRoutines: visibleRoutines.length,
    scheduledRoutines: visibleRoutines.length - unscheduledRoutines.length,
    unscheduledRoutines: unscheduledRoutines.length,
    overdueRoutines: visibleRoutines.filter(
      routine => routine.status === RoutineStatus.OverDue
    ).length,
    activeTasks: routineTasks.filter(routineTask =>
      [
        RoutineTaskStatus.Idle,
        RoutineTaskStatus.Waiting,
        RoutineTaskStatus.Running,
      ].includes(routineTask.status)
    ).length,
  };

  const getStationById = useCallback(
    (stationId: UUID) => stationsRef.current.get(stationId),
    []
  );
  const getRoutineById = useCallback((routineId: UUID) => {
    for (const station of stationsRef.current.values()) {
      const routine = station.routines.find(
        routine => routine.id === routineId
      );
      if (routine) return routine;
    }
    for (const routineTag of routineTagsRef.current.values()) {
      const routine = routineTag.routines.find(
        routine => routine.id === routineId
      );
      if (routine) return routine;
    }
    return undefined;
  }, []);
  const getRoutineTagById = useCallback(
    (routineTagId: UUID) => routineTagsRef.current.get(routineTagId),
    []
  );
  const getRoutineTaskById = useCallback(
    (routineTaskId: UUID) => routineTasksMap.get(routineTaskId),
    [routineTasksMap]
  );
  const openInspector = useCallback((target: StationRoutineInspectorTarget) => {
    window.setTimeout(() => {
      setInspectorTarget(target);
    }, 0);
  }, []);
  const closeInspector = useCallback(() => {
    setInspectorTarget(null);
  }, []);

  const contextValue: StationRoutineContextType = {
    inputRef,
    routineTitleInputRef,
    routineTagNameInputRef,
    state,
    viewMode,
    activeStationId,
    stations,
    routineTags,
    routineTasks,
    routines,
    activeStation,
    activeStationRoutines,
    activeStationRoutineTasks,
    activeStationRoutineTags,
    visibleStations,
    visibleRoutines,
    visibleRoutineTags,
    visibleRoutineTasks,
    unscheduledRoutines,
    presence: presenceRef.current,
    timeWindow,
    timeRailScale,
    statusSummary,
    getStationById,
    getRoutineById,
    getRoutineTagById,
    getRoutineTaskById,
    inspectorTarget,
    openInspector,
    closeInspector,
    initializeStationRoutineData,
    refresh,
    setViewMode,
    setActiveStationId,
    setPresenceQuery,
    setStationPresence,
    setRoutineTagPresence,
    toggleUntaggedRoutines,
    resetPresence,
    setTimeWindow,
    moveTimeWindow,
    setTimeRailScale,
    ...stationLogic,
    ...routineLogic,
    ...routineTagLogic,
    ...routineTaskLogic,
  };

  return (
    <StationRoutineContext value={contextValue}>
      {children}
    </StationRoutineContext>
  );
};
