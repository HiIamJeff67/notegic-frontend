import {
  NotegicRequestSchema,
  NotegicResponseSchema,
} from "@shared/api/interfaces/context.interface";
import { z } from "zod";
import {
  CreateRoutineTaskBodySchema,
  RoutineTaskDefinitionSchema,
} from "./routineTask.interface";

const RoutineTaskDependencyIdentitySchema = z.object({
  expectedDefinitionVersion: z.number().int().positive().optional(),
  routineTaskId: z.uuidv4(),
  previousRoutineTaskId: z.uuidv4(),
});

const RoutineTaskDependencySchema = RoutineTaskDependencyIdentitySchema.extend({
  description: z.string().max(128),
  progress: z.int32().min(0).max(100),
  updatedAt: z.coerce.date(),
  createdAt: z.coerce.date(),
});

export type RoutineTaskDependency = z.infer<typeof RoutineTaskDependencySchema>;

const RoutineTaskDependencyRequestHeaderSchema = z
  .object({
    userAgent: z.string().min(1).optional(),
    csrfToken: z.string().optional(),
  })
  .optional();

export const GetRoutineTaskDependenciesByRoutineIdRequestSchema =
  NotegicRequestSchema.extend({
    header: RoutineTaskDependencyRequestHeaderSchema,
    param: z.object({
      routineId: z.uuidv4(),
    }),
  });

export type GetRoutineTaskDependenciesByRoutineIdRequest = z.input<
  typeof GetRoutineTaskDependenciesByRoutineIdRequestSchema
>;

export const GetRoutineTaskDependenciesByRoutineIdResponseSchema =
  NotegicResponseSchema.extend({
    data: z.array(RoutineTaskDependencySchema),
  });

export type GetRoutineTaskDependenciesByRoutineIdResponse = z.infer<
  typeof GetRoutineTaskDependenciesByRoutineIdResponseSchema
>;

const CreatableRoutineTaskDependencySchema =
  RoutineTaskDependencyIdentitySchema.extend({
    description: z.string().max(128).optional(),
    progress: z.int32().min(0).max(100).optional(),
  });

const UpdatableRoutineTaskDependencySchema =
  RoutineTaskDependencyIdentitySchema.extend({
    description: z.string().max(128).nullable().optional(),
    progress: z.int32().min(0).max(100).nullable().optional(),
  });

const DeletableRoutineTaskDependencySchema =
  RoutineTaskDependencyIdentitySchema;

export const CreateRoutineTaskDependencyByRoutineIdRequestSchema =
  NotegicRequestSchema.extend({
    header: RoutineTaskDependencyRequestHeaderSchema,
    body: CreatableRoutineTaskDependencySchema,
    param: z.object({
      routineId: z.uuidv4(),
    }),
  });

export type CreateRoutineTaskDependencyByRoutineIdRequest = z.input<
  typeof CreateRoutineTaskDependencyByRoutineIdRequestSchema
>;

export const CreateRoutineTaskDependencyByRoutineIdResponseSchema =
  NotegicResponseSchema.extend({
    data: RoutineTaskDependencySchema,
  });

export type CreateRoutineTaskDependencyByRoutineIdResponse = z.infer<
  typeof CreateRoutineTaskDependencyByRoutineIdResponseSchema
>;

export const UpdateRoutineTaskDependencyByRoutineIdRequestSchema =
  NotegicRequestSchema.extend({
    header: RoutineTaskDependencyRequestHeaderSchema,
    body: UpdatableRoutineTaskDependencySchema,
    param: z.object({
      routineId: z.uuidv4(),
    }),
  });

export type UpdateRoutineTaskDependencyByRoutineIdRequest = z.input<
  typeof UpdateRoutineTaskDependencyByRoutineIdRequestSchema
>;

export const UpdateRoutineTaskDependencyByRoutineIdResponseSchema =
  NotegicResponseSchema.extend({
    data: RoutineTaskDependencySchema,
  });

export type UpdateRoutineTaskDependencyByRoutineIdResponse = z.infer<
  typeof UpdateRoutineTaskDependencyByRoutineIdResponseSchema
>;

export const DeleteRoutineTaskDependencyByRoutineIdRequestSchema =
  NotegicRequestSchema.extend({
    header: RoutineTaskDependencyRequestHeaderSchema,
    body: DeletableRoutineTaskDependencySchema,
    param: z.object({
      routineId: z.uuidv4(),
    }),
  });

export type DeleteRoutineTaskDependencyByRoutineIdRequest = z.input<
  typeof DeleteRoutineTaskDependencyByRoutineIdRequestSchema
>;

export const DeleteRoutineTaskDependencyByRoutineIdResponseSchema =
  NotegicResponseSchema.extend({
    data: z.object({
      deletedCount: z.number().int().nonnegative(),
    }),
  });

export type DeleteRoutineTaskDependencyByRoutineIdResponse = z.infer<
  typeof DeleteRoutineTaskDependencyByRoutineIdResponseSchema
>;

export const UpdateRoutineTaskGraphByRoutineIdRequestSchema =
  NotegicRequestSchema.extend({
    header: RoutineTaskDependencyRequestHeaderSchema,
    param: z.object({ routineId: z.uuidv4() }),
    body: z.object({
      expectedDefinitionVersion: z.number().int().positive(),
      tasks: z.object({
        creates: z
          .array(CreateRoutineTaskBodySchema.safeExtend({ id: z.uuidv4() }))
          .max(1024),
        updates: z
          .array(
            z.object({
              routineTaskId: z.uuidv4(),
              values: z.object({
                title: z.string().min(1).max(128).optional(),
                payload: z.record(z.string(), z.unknown()).optional(),
                x: z.number().finite().min(-1000000).max(1000000).optional(),
                y: z.number().finite().min(-1000000).max(1000000).optional(),
                priority: z.int32().min(0).max(100).optional(),
                maxAttempts: z.int32().min(1).max(20).optional(),
              }),
            })
          )
          .max(1024),
        deletes: z.array(z.uuidv4()).max(1024),
      }),
      dependencies: z.object({
        creates: z.array(CreatableRoutineTaskDependencySchema).max(1024),
        updates: z.array(UpdatableRoutineTaskDependencySchema).max(1024),
        deletes: z.array(DeletableRoutineTaskDependencySchema).max(1024),
      }),
    }),
  });

export type UpdateRoutineTaskGraphByRoutineIdRequest = z.input<
  typeof UpdateRoutineTaskGraphByRoutineIdRequestSchema
>;

export const UpdateRoutineTaskGraphByRoutineIdResponseSchema =
  NotegicResponseSchema.extend({
    data: z.object({
      definitionVersion: z.number().int().positive(),
      tasks: z.array(RoutineTaskDefinitionSchema),
      dependencies: z.array(RoutineTaskDependencySchema),
      updatedAt: z.coerce.date(),
    }),
  });
export type UpdateRoutineTaskGraphByRoutineIdResponse = z.infer<
  typeof UpdateRoutineTaskGraphByRoutineIdResponseSchema
>;
