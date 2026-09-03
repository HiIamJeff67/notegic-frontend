import {
  NotegicRequestSchema,
  NotegicResponseSchema,
} from "@shared/api/interfaces/context.interface";
import { AllRoutineTaskPurposes } from "@shared/api/interfaces/enums";
import { z } from "zod";
import {
  RoutineTaskPayloadSchema,
  RoutineTaskPayloadSizeSchema,
} from "./routineTaskPayload.interface";
import {
  VisualizePermissionRequestSchema,
  VisualizeResponseSchema,
} from "./visualize.interface";

const CreateRoutineTaskBodySchema = z
  .object({
    routineId: z.uuidv4(),
    title: z.string().min(1).max(128),
    purpose: z.enum(AllRoutineTaskPurposes),
    payload: RoutineTaskPayloadSizeSchema,
    priority: z.int32().min(0).max(100),
    maxAttempts: z.int32().min(1).max(20),
  })
  .partial({
    priority: true,
    maxAttempts: true,
  })
  .superRefine((body, ctx) => {
    const result = RoutineTaskPayloadSchema.safeParse({
      purpose: body.purpose,
      payload: body.payload,
    });
    if (!result.success) {
      for (const issue of result.error.issues) {
        ctx.addIssue({
          code: "custom",
          path: issue.path,
          message: issue.message,
        });
      }
    }
  });

const RoutineTaskDefinitionSchema = z.object({
  id: z.uuidv4(),
  routineId: z.uuidv4(),
  title: z.string(),
  purpose: z.enum(AllRoutineTaskPurposes),
  payload: z.any(),
  costUnit: z.number(),
  priority: z.int32(),
  maxAttempts: z.int32(),
  previousRoutineTaskIds: z.array(z.uuidv4()),
  updatedAt: z.coerce.date(),
  createdAt: z.coerce.date(),
});

/* ============================== Visualize Routine Task Charts ============================== */

export const VisualizeMyRoutineTaskPurposeCountRequestSchema =
  VisualizePermissionRequestSchema;
export type VisualizeMyRoutineTaskPurposeCountRequest = z.infer<
  typeof VisualizeMyRoutineTaskPurposeCountRequestSchema
>;
export const VisualizeMyRoutineTaskPurposeCountResponseSchema =
  VisualizeResponseSchema;
export type VisualizeMyRoutineTaskPurposeCountResponse = z.infer<
  typeof VisualizeMyRoutineTaskPurposeCountResponseSchema
>;

/* ============================== GetMyRoutineTaskById ============================== */

export const GetMyRoutineTaskByIdRequestSchema = NotegicRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      csrfToken: z.string().optional(),
    })
    .optional(),
  param: z.object({
    routineTaskId: z.uuidv4(),
    isDeleted: z.boolean().optional().default(false),
  }),
});

export type GetMyRoutineTaskByIdRequest = z.input<
  typeof GetMyRoutineTaskByIdRequestSchema
>;

export const GetMyRoutineTaskByIdResponseSchema = NotegicResponseSchema.extend({
  data: RoutineTaskDefinitionSchema,
  embedded: z.object({
    publicId: z.string(),
  }),
});

export type GetMyRoutineTaskByIdResponse = z.infer<
  typeof GetMyRoutineTaskByIdResponseSchema
>;

/* ============================== GetAllMyRoutineTasksByRoutineIds ============================== */

export const GetAllMyRoutineTasksByRoutineIdsRequestSchema =
  NotegicRequestSchema.extend({
    header: z
      .object({
        userAgent: z.string().min(1).optional(),
        csrfToken: z.string().optional(),
      })
      .optional(),
    param: z.object({
      routineIds: z.array(z.uuidv4()).min(1).max(1024),
      areDeleted: z.boolean().optional().default(false),
    }),
  });

export type GetAllMyRoutineTasksByRoutineIdsRequest = z.input<
  typeof GetAllMyRoutineTasksByRoutineIdsRequestSchema
>;

export const GetAllMyRoutineTasksByRoutineIdsResponseSchema =
  NotegicResponseSchema.extend({
    data: z.array(RoutineTaskDefinitionSchema),
    embedded: z.object({
      publicId: z.string(),
    }),
  });

export type GetAllMyRoutineTasksByRoutineIdsResponse = z.infer<
  typeof GetAllMyRoutineTasksByRoutineIdsResponseSchema
>;

/* ============================== GetAllMyRoutineTasks ============================== */

export const GetAllMyRoutineTasksRequestSchema = NotegicRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      csrfToken: z.string().optional(),
    })
    .optional(),
  param: z
    .object({
      areDeleted: z.boolean().optional().default(false),
    })
    .optional()
    .default({ areDeleted: false }),
});

export type GetAllMyRoutineTasksRequest = z.input<
  typeof GetAllMyRoutineTasksRequestSchema
>;

export const GetAllMyRoutineTasksResponseSchema = NotegicResponseSchema.extend({
  data: z.array(RoutineTaskDefinitionSchema),
  embedded: z.object({
    publicId: z.string(),
  }),
});

export type GetAllMyRoutineTasksResponse = z.infer<
  typeof GetAllMyRoutineTasksResponseSchema
>;

/* ============================== CreateRoutineTaskByRoutineId ============================== */

export const CreateRoutineTaskByRoutineIdRequestSchema =
  NotegicRequestSchema.extend({
    header: z
      .object({
        userAgent: z.string().min(1).optional(),
        csrfToken: z.string().optional(),
      })
      .optional(),
    body: CreateRoutineTaskBodySchema,
  });

export type CreateRoutineTaskByRoutineIdRequest = z.infer<
  typeof CreateRoutineTaskByRoutineIdRequestSchema
>;

export const CreateRoutineTaskByRoutineIdResponseSchema =
  NotegicResponseSchema.extend({
    data: z.object({
      id: z.uuidv4(),
      createdAt: z.coerce.date(),
    }),
    embedded: z.object({
      publicId: z.string(),
    }),
  });

export type CreateRoutineTaskByRoutineIdResponse = z.infer<
  typeof CreateRoutineTaskByRoutineIdResponseSchema
>;

/* ============================== UpdateMyRoutineTaskById ============================== */

export const UpdateMyRoutineTaskByIdRequestSchema = NotegicRequestSchema.extend(
  {
    header: z
      .object({
        userAgent: z.string().min(1).optional(),
        csrfToken: z.string().optional(),
      })
      .optional(),
    body: z.object({
      routineTaskId: z.uuidv4(),
      values: z
        .object({
          routineId: z.uuidv4(),
          title: z.string().min(1).max(128),
          purpose: z.enum(AllRoutineTaskPurposes),
          payload: z.any().refine(value => {
            try {
              return (
                new TextEncoder().encode(JSON.stringify(value ?? {})).length <=
                16_777_216
              );
            } catch {
              return false;
            }
          }, "Payload must be smaller than 16 MiB."),
          priority: z.int32().min(0),
          maxAttempts: z.int32().min(1).max(20),
        })
        .partial(),
      setNull: z.record(z.string(), z.boolean()).optional(),
    }),
  }
);

export type UpdateMyRoutineTaskByIdRequest = z.infer<
  typeof UpdateMyRoutineTaskByIdRequestSchema
>;

export const UpdateMyRoutineTaskByIdResponseSchema =
  NotegicResponseSchema.extend({
    data: z.object({
      updatedAt: z.coerce.date(),
    }),
    embedded: z.object({
      publicId: z.string(),
    }),
  });

export type UpdateMyRoutineTaskByIdResponse = z.infer<
  typeof UpdateMyRoutineTaskByIdResponseSchema
>;

/* ============================== HardDeleteMyRoutineTaskById ============================== */

export const HardDeleteMyRoutineTaskByIdRequestSchema =
  NotegicRequestSchema.extend({
    header: z
      .object({
        userAgent: z.string().min(1).optional(),
        csrfToken: z.string().optional(),
      })
      .optional(),
    body: z.object({
      routineTaskId: z.uuidv4(),
    }),
  });

export type HardDeleteMyRoutineTaskByIdRequest = z.infer<
  typeof HardDeleteMyRoutineTaskByIdRequestSchema
>;

export const HardDeleteMyRoutineTaskByIdResponseSchema =
  NotegicResponseSchema.extend({
    data: z.object({
      deletedAt: z.coerce.date(),
    }),
    embedded: z.object({
      publicId: z.string(),
    }),
  });

export type HardDeleteMyRoutineTaskByIdResponse = z.infer<
  typeof HardDeleteMyRoutineTaskByIdResponseSchema
>;

/* ============================== HardDeleteMyRoutineTasksByIds ============================== */

export const HardDeleteMyRoutineTasksByIdsRequestSchema =
  NotegicRequestSchema.extend({
    header: z
      .object({
        userAgent: z.string().min(1).optional(),
        csrfToken: z.string().optional(),
      })
      .optional(),
    body: z.object({
      routineTaskIds: z.array(z.uuidv4()),
    }),
  });

export type HardDeleteMyRoutineTasksByIdsRequest = z.infer<
  typeof HardDeleteMyRoutineTasksByIdsRequestSchema
>;

export const HardDeleteMyRoutineTasksByIdsResponseSchema =
  NotegicResponseSchema.extend({
    data: z.object({
      deletedAt: z.coerce.date(),
    }),
    embedded: z.object({
      publicId: z.string(),
    }),
  });

export type HardDeleteMyRoutineTasksByIdsResponse = z.infer<
  typeof HardDeleteMyRoutineTasksByIdsResponseSchema
>;
