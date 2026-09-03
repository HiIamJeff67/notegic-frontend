import {
  NotegicRequestSchema,
  NotegicResponseSchema,
} from "@shared/api/interfaces/context.interface";
import { z } from "zod";

const RoutineTaskDependencyIdentitySchema = z.object({
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
