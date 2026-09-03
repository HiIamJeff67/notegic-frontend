import { NotegicAPIError } from "./exceptions";
import { RealtimeError } from "./exceptions/client/realtime.exception";

const API_VERSION = "v1";

export const CurrentAPIBaseURL = `api/development/${API_VERSION}`;
export const CurrentRealtimeBaseURL = `realtime/development/${API_VERSION}`;

export const withoutPathParams = <T extends Record<string, unknown>>(
  body: T,
  ...keys: PropertyKey[]
): Partial<T> => {
  const payload = { ...body };
  for (const key of keys) delete (payload as Record<PropertyKey, unknown>)[key];
  return payload;
};

export const APIURLPathDictionary = {
  auth: {
    register: "auth/register",
    registerViaGoogle: "auth/register-via-google",
    login: "auth/login",
    loginViaGoogle: "auth/login-via-google",
    logout: "auth/logout",
    sendAuthCode: "auth/send-auth-code",
    validateEmail: "auth/validate-email",
    resetEmail: "auth/reset-email",
    forgetPassword: "auth/forget-password",
    resetMe: "auth/reset-me",
    deleteMe: "auth/delete-me",
  },
  user: {
    getUserData: "users/data",
    getMe: "users/me",
    updateMe: "users/me",
  },
  userInfo: {
    getMyInfo: "me/info",
    updateMyInfo: "me/info",
  },
  userSetting: {
    getMySetting: "me/settings/",
    updateMySetting: "me/settings/",
  },
  userAccount: {
    getMyAccount: "me/account",
    updatedMyAccount: "me/account",
    bindGoogleAccount: "me/account/google",
    unbindGoogleAccount: "me/account/google",
  },
  apiKey: {
    create: "me/api-keys/create",
    list: "me/api-keys/",
    revoke: (publicId: string) => `me/api-keys/${publicId}`,
  },
  rootShelf: {
    getMyRootShelfById: (rootShelfId: string) => `root-shelves/${rootShelfId}`,
    createRootShelf: "root-shelves",
    createRootShelves: "root-shelves/batch",
    upsertRootShelfPermission: (rootShelfId: string, userPublicId: string) =>
      `root-shelves/${rootShelfId}/permissions/${userPublicId}`,
    deleteRootShelfPermissions: (rootShelfId: string) =>
      `root-shelves/${rootShelfId}/permissions`,
    transferOwnership: (rootShelfId: string) =>
      `root-shelves/${rootShelfId}/ownership`,
    leave: (rootShelfId: string) =>
      `root-shelves/${rootShelfId}/memberships/me`,
    updateMyRootShelfById: (rootShelfId: string) =>
      `root-shelves/${rootShelfId}`,
    updateMyRootShelvesByIds: "root-shelves/batch",
    restoreMyRootShelfById: (rootShelfId: string) =>
      `root-shelves/${rootShelfId}/restore`,
    restoreMyRootShelvesByIds: "root-shelves/batch/restore",
    deleteMyRootShelfById: (rootShelfId: string) =>
      `root-shelves/${rootShelfId}`,
    deleteMyRootShelvesByIds: "root-shelves/batch",
  },
  subShelf: {
    getMySubShelfById: (subShelfId: string) => `sub-shelves/${subShelfId}`,
    getMySubShelvesByPrevSubShelfId: (prevSubShelfId: string) =>
      `sub-shelves/prev-sub-shelf/${prevSubShelfId}`,
    getAllMySubShelvesByRootShelfId: (rootShelfId: string) =>
      `sub-shelves/root-shelf/${rootShelfId}`,
    getMySubShelvesAndItemsByPrevSubShelfId: (prevSubShelfId: string) =>
      `sub-shelves/prev-sub-shelf/${prevSubShelfId}/items`,
    createSubShelfByRootShelfId: (rootShelfId: string) =>
      `sub-shelves/root-shelf/${rootShelfId}`,
    createSubShelvesByRootShelfIds: "sub-shelves/batch",
    updateMySubShelfById: (subShelfId: string) => `sub-shelves/${subShelfId}`,
    updateMySubShelvesByIds: "sub-shelves/batch",
    moveMySubShelf: (subShelfId: string) =>
      `sub-shelves/${subShelfId}/position`,
    moveMySubShelvesByRootShelfId: "sub-shelves/position",
    moveMySubShelvesByRootShelfIds: "sub-shelves/batch/position",
    restoreMySubShelfById: (subShelfId: string) =>
      `sub-shelves/${subShelfId}/restore`,
    restoreMySubShelvesByIds: "sub-shelves/batch/restore",
    deleteMySubShelfById: (subShelfId: string) => `sub-shelves/${subShelfId}`,
    deleteMySubShelvesByIds: "sub-shelves/batch",
  },
  material: {
    getMyMaterialById: (materialId: string) => `materials/${materialId}`,
    getMyMaterialAndItsParentById: (materialId: string) =>
      `materials/${materialId}/parent`,
    getMyMaterialsByParentSubShelfId: (parentSubShelfId: string) =>
      `materials/sub-shelf/${parentSubShelfId}`,
    getAllMyMaterialsByRootShelfId: (rootShelfId: string) =>
      `materials/root-shelf/${rootShelfId}`,
    createMyMaterial: (parentSubShelfId: string) =>
      `materials/sub-shelf/${parentSubShelfId}`,
    updateMyMaterialById: (materialId: string) => `materials/${materialId}`,
    saveMyMaterialById: (materialId: string) =>
      `materials/${materialId}/content`,
    moveMyMaterialById: (materialId: string) =>
      `materials/${materialId}/parent`,
    moveMyMaterialsByIds: "materials/batch/parent",
    restoreMyMaterialById: (materialId: string) =>
      `materials/${materialId}/restore`,
    restoreMyMaterialsByIds: "materials/batch/restore",
    deleteMyMaterialById: (materialId: string) => `materials/${materialId}`,
    deleteMyMaterialsByIds: "materials/batch",
  },
  blockPack: {
    getMyBlockPackById: (blockPackId: string) => `block-packs/${blockPackId}`,
    getMyBlockPackAndItsParentById: (blockPackId: string) =>
      `block-packs/${blockPackId}/parent`,
    getMyBlockPacksByParentSubShelfId: (parentSubShelfId: string) =>
      `block-packs/sub-shelf/${parentSubShelfId}`,
    getAllMyBlockPacksByRootShelfId: (rootShelfId: string) =>
      `block-packs/root-shelf/${rootShelfId}`,
    createBlockPack: (parentSubShelfId: string) =>
      `block-packs/sub-shelf/${parentSubShelfId}`,
    createBlockPacks: "block-packs/batch",
    updateMyBlockPackById: (blockPackId: string) =>
      `block-packs/${blockPackId}`,
    updateMyBlockPacksByIds: "block-packs/batch",
    moveMyBlockPackById: (blockPackId: string) =>
      `block-packs/${blockPackId}/position`,
    moveMyBlockPacksByParentSubShelfId: "block-packs/position",
    moveMyBlockPacksByParentSubShelfIds: "block-packs/batch/position",
    restoreMyBlockPackById: (blockPackId: string) =>
      `block-packs/${blockPackId}/restore`,
    restoreMyBlockPacksByIds: "block-packs/batch/restore",
    deleteMyBlockPackById: (blockPackId: string) =>
      `block-packs/${blockPackId}`,
    deleteMyBlockPacksByIds: "block-packs/batch",
  },
  block: {
    getMyBlockById: (blockId: string) => `blocks/${blockId}`,
    getMyBlocksByIds: "blocks/batch",
    getMyBlocksByBlockPackId: (blockPackId: string) =>
      `blocks/block-pack/${blockPackId}`,
  },
  realtime: {
    createMyRealtimeConnectionTicket: "realtime/connection/ticket",
    createMyBlockPackChannelTicket: "realtime/channel/block-pack/ticket",
    getBlockPackParticipants: (blockPackId: string) =>
      `block-pack/${blockPackId}/participants`,
  },
  notification: {
    list: "notifications/",
    unreadCount: "notifications/unread-count",
    read: "notifications/read",
    delete: "notifications/",
  },
  station: {
    visualizeMyTotalCount: "stations/visualizations/total-count",
    getMyStationById: (stationId: string) => `stations/${stationId}`,
    getAllMyStations: "stations",
    createStation: "stations",
    createStations: "stations/batch",
    updateMyStationById: (stationId: string) => `stations/${stationId}`,
    updateMyStationsByIds: "stations/batch",
    restoreMyStationById: (stationId: string) =>
      `stations/${stationId}/restore`,
    restoreMyStationsByIds: "stations/batch/restore",
    deleteMyStationById: (stationId: string) => `stations/${stationId}`,
    deleteMyStationsByIds: "stations/batch",
    hardDeleteMyStationById: (stationId: string) =>
      `stations/${stationId}/permanently`,
    hardDeleteMyStationsByIds: "stations/batch/permanently",
    transferOwnership: (stationId: string) => `stations/${stationId}/ownership`,
    leave: (stationId: string) => `stations/${stationId}/memberships/me`,
  },
  routine: {
    visualizeMyRoutineStatusCount: "routines/visualizations/status-count",
    visualizeMyRoutinePeriodCount: "routines/visualizations/period-count",
    visualizeMyRoutineScheduledStartAtCount:
      "routines/visualizations/scheduled-start-at-count",
    visualizeMyRoutineScheduledEndAtCount:
      "routines/visualizations/scheduled-end-at-count",
    getMyRoutineById: (routineId: string) => `routines/${routineId}`,
    getMyRoutinesByStationId: (stationId: string) =>
      `routines/station/${stationId}`,
    getAllMyRoutinesByTimeRange: "routines",
    createRoutineByStationId: (stationId: string) =>
      `routines/station/${stationId}`,
    createRoutinesByStationIds: "routines/batch",
    updateMyRoutineById: (routineId: string) => `routines/${routineId}`,
    updateMyRoutinesByIds: "routines/batch",
    linkRoutineTagById: (routineId: string, routineTagId: string) =>
      `routines/${routineId}/tags/${routineTagId}`,
    linkRoutineTagsByIds: "routines/tags",
    linkRoutineTaskById: (routineId: string, routineTaskId: string) =>
      `routines/${routineId}/tasks/${routineTaskId}`,
    linkRoutineTasksByIds: "routines/tasks",
    linkRoutineItemById: (routineId: string, itemId: string) =>
      `routines/${routineId}/items/${itemId}`,
    linkRoutineItemsByIds: "routines/items",
    restoreMyRoutineById: (routineId: string) =>
      `routines/${routineId}/restore`,
    restoreMyRoutinesByIds: "routines/batch/restore",
    deleteMyRoutineById: (routineId: string) => `routines/${routineId}`,
    deleteMyRoutinesByIds: "routines/batch",
    hardDeleteMyRoutineById: (routineId: string) =>
      `routines/${routineId}/permanently`,
    hardDeleteMyRoutinesByIds: "routines/batch/permanently",
  },
  routineTag: {
    getMyRoutineTagById: (routineTagId: string) =>
      `routine-tags/${routineTagId}`,
    getAllMyRoutineTags: "routine-tags",
    createRoutineTag: "routine-tags",
    createRoutineTags: "routine-tags/batch",
    updateMyRoutineTagById: (routineTagId: string) =>
      `routine-tags/${routineTagId}`,
    updateMyRoutineTagsByIds: "routine-tags/batch",
    hardDeleteMyRoutineTagById: (routineTagId: string) =>
      `routine-tags/${routineTagId}/permanently`,
    hardDeleteMyRoutineTagsByIds: "routine-tags/batch/permanently",
  },
  routineTask: {
    visualizeMyRoutineTaskPurposeCount:
      "routine-tasks/visualizations/purpose-count",
    getMyRoutineTaskById: (routineTaskId: string) =>
      `routine-tasks/${routineTaskId}`,
    getAllMyRoutineTasksByRoutineIds: "routine-tasks/routines",
    getAllMyRoutineTasks: "routine-tasks",
    createRoutineTaskByRoutineId: (routineId: string) =>
      `routine-tasks/routine/${routineId}`,
    updateMyRoutineTaskById: (routineTaskId: string) =>
      `routine-tasks/${routineTaskId}`,
    hardDeleteMyRoutineTaskById: (routineTaskId: string) =>
      `routine-tasks/${routineTaskId}/permanently`,
    hardDeleteMyRoutineTasksByIds: "routine-tasks/batch/permanently",
  },
  routineTaskDependency: {
    getByRoutineId: (routineId: string) =>
      `routine-task-dependencies/routine/${routineId}`,
    createByRoutineId: (routineId: string) =>
      `routine-task-dependencies/routine/${routineId}`,
    updateByRoutineId: (routineId: string) =>
      `routine-task-dependencies/routine/${routineId}`,
    deleteByRoutineId: (routineId: string) =>
      `routine-task-dependencies/routine/${routineId}`,
  },
  routineTaskRecord: {
    visualizeMyRoutineTaskRecordStatusCount:
      "routine-task-records/visualizations/status-count",
    visualizeMyRoutineTaskRecordPurposeCount:
      "routine-task-records/visualizations/purpose-count",
    visualizeMyRoutineTaskRecordScheduledAtCount:
      "routine-task-records/visualizations/scheduled-at-count",
    visualizeMyRoutineTaskRecordActualStartedAtCount:
      "routine-task-records/visualizations/actual-started-at-count",
    visualizeMyRoutineTaskRecordActualEndedAtCount:
      "routine-task-records/visualizations/actual-ended-at-count",
    getAllMyRoutineTaskRecordsByRoutineTaskId: (routineTaskId: string) =>
      `routine-task-records/routine-task/${routineTaskId}`,
  },
};

export const getRealtimeWebSocketURL = (endpoint?: string): string => {
  const url = import.meta.env.VITE_REALTIME_WEBSOCKET_URL;
  if (!url) throw new NotegicAPIError(RealtimeError.MissingWebSocketURL());
  const basePath = endpoint ?? CurrentRealtimeBaseURL;
  return `${url.replace(/\/+$/, "")}/${basePath.replace(/^\/+/, "")}`;
};
