import type { UUID } from "crypto";

export const queryKeys = {
  user: {
    all: () => ["user"] as const,
    data: (isAsync: boolean = false) =>
      ["user", isAsync ? "dataAsync" : "data"] as const,
    me: (isAsync: boolean = false) =>
      ["user", isAsync ? "meAsync" : "me"] as const,
  },
  userInfo: {
    all: () => ["userInfo"] as const,
    my: () => ["userInfo", "my"] as const,
  },
  userAccount: {
    all: () => ["userAccount"] as const,
    my: () => ["userAccount", "my"] as const,
  },
  userSetting: {
    all: () => ["userSetting"] as const,
    my: () => ["userSetting", "my"] as const,
  },
  apiKey: {
    all: () => ["apiKey"] as const,
    my: () => ["apiKey", "my"] as const,
  },
  rootShelf: {
    all: () => ["rootShelf"] as const,
    oneById: (rootShelfId: UUID | undefined, isDeleted: boolean = false) =>
      ["rootShelf", "oneById", rootShelfId, isDeleted] as const,
    permission: (rootShelfId?: UUID) =>
      ["rootShelf", "permission", rootShelfId] as const,
  },
  subShelf: {
    all: () => ["subShelf"] as const,
    oneById: (subShelfId?: UUID, isDeleted: boolean = false) =>
      ["subShelf", "oneById", subShelfId, isDeleted] as const,
    manyByPrevSubShelfId: (
      prevSubShelfId?: UUID | null,
      areDeleted: boolean = false
    ) =>
      ["subShelf", "manyByPrevSubShelfId", prevSubShelfId, areDeleted] as const,
    manyByRootShelfId: (rootShelfId?: UUID, areDeleted: boolean = false) =>
      ["subShelf", "manyByRootShelfId", rootShelfId, areDeleted] as const,
  },
  material: {
    all: () => ["material"] as const,
    oneById: (
      id?: UUID,
      withParent: boolean = false,
      isDeleted: boolean = false
    ) =>
      withParent
        ? (["material", "oneById", id, "withParent", isDeleted] as const)
        : (["material", "oneById", id, isDeleted] as const),
    manyByParentSubShelfId: (
      parentSubShelfId?: UUID,
      areDeleted: boolean = false
    ) =>
      [
        "material",
        "manyByParentSubShelfId",
        parentSubShelfId,
        areDeleted,
      ] as const,
    manyByRootShelfId: (rootShelfId?: UUID, areDeleted: boolean = false) =>
      ["material", "manyByRootShelfId", rootShelfId, areDeleted] as const,
  },
  blockPack: {
    all: () => ["blockPack"] as const,
    oneById: (
      id?: UUID,
      withParent: boolean = false,
      isDeleted: boolean = false
    ) =>
      withParent
        ? (["blockPack", "oneById", id, "withParent", isDeleted] as const)
        : (["blockPack", "oneById", id, isDeleted] as const),
    manyByParentSubShelfId: (
      parentSubShelfId?: UUID,
      areDeleted: boolean = false
    ) =>
      [
        "blockPack",
        "manyByParentSubShelfId",
        parentSubShelfId,
        areDeleted,
      ] as const,
    manyByRootShelfId: (rootShelfId?: UUID, areDeleted: boolean = false) =>
      ["blockPack", "manyByRootShelfId", rootShelfId, areDeleted] as const,
  },
  block: {
    all: () => ["block"] as const,
    oneById: (id?: UUID) => ["block", "oneById", id] as const,
    manyByIds: (ids?: UUID[]) =>
      [
        "block",
        "manyByIds",
        ids && ids.length > 0 ? ids.slice().sort().join(",") : undefined,
      ] as const,
    manyByBlockPackId: (blockPackId?: UUID) =>
      ["block", "manyByBlockPackId", blockPackId] as const,
  },
  realtime: {
    all: () => ["realtime"] as const,
    blockPackParticipants: (blockPackId?: UUID) =>
      ["realtime", "blockPackParticipants", blockPackId] as const,
  },
  notification: {
    all: () => ["notification"] as const,
    list: () => ["notification", "list"] as const,
    unreadCount: () => ["notification", "unreadCount"] as const,
  },
  station: {
    all: () => ["station"] as const,
    visualizeMyTotalCount: (permission?: string) =>
      ["station", "visualizeMyTotalCount", permission] as const,
    myAll: (areDeleted: boolean = false) =>
      ["station", "myAll", areDeleted] as const,
    oneById: (routineId?: UUID, isDeleted: boolean = false) =>
      ["station", "oneById", routineId, isDeleted] as const,
    permission: (stationId?: UUID) =>
      ["station", "permission", stationId] as const,
  },
  routine: {
    all: () => ["routine"] as const,
    visualizeMyStatusCount: (permission?: string) =>
      ["routine", "visualizeMyStatusCount", permission] as const,
    visualizeMyPeriodCount: (permission?: string) =>
      ["routine", "visualizeMyPeriodCount", permission] as const,
    visualizeMyScheduledStartAtCount: (
      permission?: string,
      timeHourUnit?: number,
      startedAt?: Date,
      endedAt?: Date
    ) =>
      [
        "routine",
        "visualizeMyScheduledStartAtCount",
        permission,
        timeHourUnit,
        startedAt?.getTime(),
        endedAt?.getTime(),
      ] as const,
    visualizeMyScheduledEndAtCount: (
      permission?: string,
      timeHourUnit?: number,
      startedAt?: Date,
      endedAt?: Date
    ) =>
      [
        "routine",
        "visualizeMyScheduledEndAtCount",
        permission,
        timeHourUnit,
        startedAt?.getTime(),
        endedAt?.getTime(),
      ] as const,
    oneById: (routineId?: UUID, isDeleted: boolean = false) =>
      ["routine", "oneById", routineId, isDeleted] as const,
    manyByStationId: (stationId?: UUID, areDeleted: boolean = false) =>
      ["routine", "manyByStationId", stationId, areDeleted] as const,
    manyByTimeRange: (
      from?: Date,
      to?: Date,
      routineIds?: UUID[],
      areDeleted: boolean = false
    ) =>
      [
        "routine",
        "manyByTimeRange",
        from?.getTime(),
        to?.getTime(),
        routineIds && routineIds.length > 0
          ? routineIds.slice().sort().join(",")
          : undefined,
        areDeleted,
      ] as const,
  },
  routineTag: {
    all: () => ["routineTag"] as const,
    myAll: (areDeleted: boolean = false) =>
      ["routineTag", "myAll", areDeleted] as const,
    oneById: (routineTagId?: UUID, isDeleted: boolean = false) =>
      ["routineTag", "oneById", routineTagId, isDeleted] as const,
  },
  routineTask: {
    all: () => ["routineTask"] as const,
    visualizeMyStatusCount: (permission?: string) =>
      ["routineTask", "visualizeMyStatusCount", permission] as const,
    visualizeMyPurposeCount: (permission?: string) =>
      ["routineTask", "visualizeMyPurposeCount", permission] as const,
    visualizeMyScheduledAtCount: (
      permission?: string,
      timeHourUnit?: number,
      startedAt?: Date,
      endedAt?: Date
    ) =>
      [
        "routineTask",
        "visualizeMyScheduledAtCount",
        permission,
        timeHourUnit,
        startedAt?.getTime(),
        endedAt?.getTime(),
      ] as const,
    visualizeMyActualStartedAtCount: (
      permission?: string,
      timeHourUnit?: number,
      startedAt?: Date,
      endedAt?: Date
    ) =>
      [
        "routineTask",
        "visualizeMyActualStartedAtCount",
        permission,
        timeHourUnit,
        startedAt?.getTime(),
        endedAt?.getTime(),
      ] as const,
    visualizeMyActualEndedAtCount: (
      permission?: string,
      timeHourUnit?: number,
      startedAt?: Date,
      endedAt?: Date
    ) =>
      [
        "routineTask",
        "visualizeMyActualEndedAtCount",
        permission,
        timeHourUnit,
        startedAt?.getTime(),
        endedAt?.getTime(),
      ] as const,
    myAll: (areDeleted: boolean = false) =>
      ["routineTask", "myAll", areDeleted] as const,
    oneById: (routineTaskId?: UUID, isDeleted: boolean = false) =>
      ["routineTask", "oneById", routineTaskId, isDeleted] as const,
    manyByRoutineId: (routineId?: UUID, areDeleted: boolean = false) =>
      ["routineTask", "manyByRoutineId", routineId, areDeleted] as const,
    manyByRoutineIds: (routineIds?: UUID[], areDeleted: boolean = false) =>
      [
        "routineTask",
        "manyByRoutineIds",
        routineIds && routineIds.length > 0
          ? routineIds.slice().sort().join(",")
          : undefined,
        areDeleted,
      ] as const,
  },
  routineTaskRecord: {
    all: () => ["routineTaskRecord"] as const,
    recentByRoutineTaskId: (routineTaskId?: UUID, limit?: number) =>
      [
        "routineTaskRecord",
        "recentByRoutineTaskId",
        routineTaskId,
        limit,
      ] as const,
    visualizeMyStatusCount: (permission?: string, routineTaskIds?: UUID[]) =>
      [
        "routineTaskRecord",
        "visualizeMyStatusCount",
        permission,
        routineTaskIds && routineTaskIds.length > 0
          ? routineTaskIds.slice().sort().join(",")
          : undefined,
      ] as const,
    visualizeMyPurposeCount: (permission?: string, routineTaskIds?: UUID[]) =>
      [
        "routineTaskRecord",
        "visualizeMyPurposeCount",
        permission,
        routineTaskIds && routineTaskIds.length > 0
          ? routineTaskIds.slice().sort().join(",")
          : undefined,
      ] as const,
    visualizeMyScheduledAtCount: (
      permission?: string,
      timeHourUnit?: number,
      startedAt?: Date,
      endedAt?: Date,
      routineTaskIds?: UUID[]
    ) =>
      [
        "routineTaskRecord",
        "visualizeMyScheduledAtCount",
        permission,
        timeHourUnit,
        startedAt?.getTime(),
        endedAt?.getTime(),
        routineTaskIds && routineTaskIds.length > 0
          ? routineTaskIds.slice().sort().join(",")
          : undefined,
      ] as const,
    visualizeMyActualStartedAtCount: (
      permission?: string,
      timeHourUnit?: number,
      startedAt?: Date,
      endedAt?: Date,
      routineTaskIds?: UUID[]
    ) =>
      [
        "routineTaskRecord",
        "visualizeMyActualStartedAtCount",
        permission,
        timeHourUnit,
        startedAt?.getTime(),
        endedAt?.getTime(),
        routineTaskIds && routineTaskIds.length > 0
          ? routineTaskIds.slice().sort().join(",")
          : undefined,
      ] as const,
    visualizeMyActualEndedAtCount: (
      permission?: string,
      timeHourUnit?: number,
      startedAt?: Date,
      endedAt?: Date,
      routineTaskIds?: UUID[]
    ) =>
      [
        "routineTaskRecord",
        "visualizeMyActualEndedAtCount",
        permission,
        timeHourUnit,
        startedAt?.getTime(),
        endedAt?.getTime(),
        routineTaskIds && routineTaskIds.length > 0
          ? routineTaskIds.slice().sort().join(",")
          : undefined,
      ] as const,
  },
};
