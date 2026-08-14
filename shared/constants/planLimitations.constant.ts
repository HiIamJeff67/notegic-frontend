import { UserPlan } from "@shared/api/interfaces/enums";

export type PlanLimitation = {
  maxRootShelfCount: number;
  maxBlockPackCount: number;
  maxBlockCount: number;
  maxSyncBlockCount: number;
  maxMaterialCount: number;
  maxWorkflowCount: number;
  maxAdditionalItemCount: number;
  maxSubShelfCountPerRootShelf: number;
  maxItemCountPerRootShelf: number;
  maxBlockCountPerBlockPack: number;
  maxMaterialSize: number;
  maxStationCount: number;
  maxRoutineTagCount: number;
  maxRoutineCountPerStation: number;
  maxRoutineTaskCostUnitCount: number;
  maxRoutineTaskAttempts: number;
};

export const PlanLimitations: Record<UserPlan, PlanLimitation> = {
  [UserPlan.Free]: {
    maxRootShelfCount: 10,
    maxBlockPackCount: 20,
    maxBlockCount: 1000,
    maxSyncBlockCount: 10,
    maxMaterialCount: 10,
    maxWorkflowCount: 2,
    maxAdditionalItemCount: 5,
    maxSubShelfCountPerRootShelf: 20,
    maxItemCountPerRootShelf: 20,
    maxBlockCountPerBlockPack: 100,
    maxMaterialSize: 5242880,
    maxStationCount: 10,
    maxRoutineTagCount: 5,
    maxRoutineCountPerStation: 20,
    maxRoutineTaskCostUnitCount: 100,
    maxRoutineTaskAttempts: 3,
  },
  [UserPlan.Pro]: {
    maxRootShelfCount: 50,
    maxBlockPackCount: 100,
    maxBlockCount: 5000,
    maxSyncBlockCount: 50,
    maxMaterialCount: 50,
    maxWorkflowCount: 10,
    maxAdditionalItemCount: 50,
    maxSubShelfCountPerRootShelf: 100,
    maxItemCountPerRootShelf: 100,
    maxBlockCountPerBlockPack: 200,
    maxMaterialSize: 20971520,
    maxStationCount: 20,
    maxRoutineTagCount: 25,
    maxRoutineCountPerStation: 50,
    maxRoutineTaskCostUnitCount: 300,
    maxRoutineTaskAttempts: 10,
  },
  [UserPlan.Premium]: {
    maxRootShelfCount: 150,
    maxBlockPackCount: 300,
    maxBlockCount: 15000,
    maxSyncBlockCount: 150,
    maxMaterialCount: 150,
    maxWorkflowCount: 30,
    maxAdditionalItemCount: 150,
    maxSubShelfCountPerRootShelf: 200,
    maxItemCountPerRootShelf: 200,
    maxBlockCountPerBlockPack: 500,
    maxMaterialSize: 52428800,
    maxStationCount: 50,
    maxRoutineTagCount: 50,
    maxRoutineCountPerStation: 100,
    maxRoutineTaskCostUnitCount: 600,
    maxRoutineTaskAttempts: 10,
  },
  [UserPlan.Ultimate]: {
    maxRootShelfCount: 300,
    maxBlockPackCount: 200,
    maxBlockCount: 30000,
    maxSyncBlockCount: 300,
    maxMaterialCount: 300,
    maxWorkflowCount: 60,
    maxAdditionalItemCount: 300,
    maxSubShelfCountPerRootShelf: 500,
    maxItemCountPerRootShelf: 500,
    maxBlockCountPerBlockPack: 1000,
    maxMaterialSize: 209715200,
    maxStationCount: 100,
    maxRoutineTagCount: 100,
    maxRoutineCountPerStation: 300,
    maxRoutineTaskCostUnitCount: 1200,
    maxRoutineTaskAttempts: 20,
  },
  [UserPlan.Enterprise]: {
    maxRootShelfCount: 1000,
    maxBlockPackCount: 2000,
    maxBlockCount: 100000,
    maxSyncBlockCount: 1000,
    maxMaterialCount: 1000,
    maxWorkflowCount: 100,
    maxAdditionalItemCount: 1000,
    maxSubShelfCountPerRootShelf: 1000,
    maxItemCountPerRootShelf: 1000,
    maxBlockCountPerBlockPack: 1000,
    maxMaterialSize: 524288000,
    maxStationCount: 200,
    maxRoutineTagCount: 200,
    maxRoutineCountPerStation: 500,
    maxRoutineTaskCostUnitCount: 6000,
    maxRoutineTaskAttempts: 20,
  },
};
