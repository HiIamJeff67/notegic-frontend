import {
  NotegicRequestSchema,
  NotegicResponseSchema,
} from "@shared/api/interfaces/context.interface";
import { AllRoutineTaskPurposes } from "@shared/api/interfaces/enums";
import { parseRequest } from "@shared/api/validation";
import { z } from "zod";
import {
  RoutineTaskPayloadSchema,
  RoutineTaskPayloadSizeSchema,
} from "./routineTaskPayload.interface";
import {
  VisualizePermissionRequestSchema,
  VisualizeResponseSchema,
} from "./visualize.interface";
import { ItemNameSchema } from "./workspaceInput.schema";

export const RoutineTaskPrioritySchema = z
  .int32({ error: "validation.priority" })
  .min(0, { error: "validation.priority" })
  .max(100, { error: "validation.priority" });
export const RoutineTaskMaxAttemptsSchema = z
  .int32({ error: "validation.maxAttempts" })
  .min(1, { error: "validation.maxAttempts" })
  .max(20, { error: "validation.maxAttempts" });

export const RoutineTaskKinds = ["Start", "Action"] as const;
export type RoutineTaskKind = (typeof RoutineTaskKinds)[number];

const StartingNodePayloadSchema = z
  .object({
    schemaVersion: z.literal(1).optional(),
    description: z
      .string({ error: "validation.startDescription" })
      .max(1024, { error: "validation.startDescription" })
      .optional(),
    isActive: z.boolean().optional(),
  })
  .strict();

export const RoutineTaskEditablePayloadSchema =
  RoutineTaskPayloadSizeSchema.pipe(
    z.record(z.string(), z.unknown(), { error: "validation.payloadObject" })
  ).superRefine((payload, ctx) => {
    const result =
      payload?.purpose === undefined
        ? StartingNodePayloadSchema.safeParse(payload)
        : RoutineTaskPayloadSchema.safeParse({
            purpose: payload.purpose,
            payload,
          });
    if (!result.success) {
      for (const issue of result.error.issues) {
        ctx.addIssue({
          code: "custom",
          path: issue.path[0] === "payload" ? issue.path.slice(1) : issue.path,
          message: issue.message,
        });
      }
    }
  });

export const CreateRoutineTaskBodySchema = z
  .object({
    id: z.uuidv4().optional(),
    routineId: z.uuidv4(),
    kind: z.enum(RoutineTaskKinds).optional().default("Action"),
    x: z.number().finite().min(-1000000).max(1000000).optional().default(0),
    y: z.number().finite().min(-1000000).max(1000000).optional().default(0),
    expectedDefinitionVersion: z.number().int().positive().optional(),
    title: ItemNameSchema,
    purpose: z
      .enum(AllRoutineTaskPurposes, { error: "validation.payloadPurpose" })
      .optional(),
    payload: RoutineTaskPayloadSizeSchema,
    priority: RoutineTaskPrioritySchema,
    maxAttempts: RoutineTaskMaxAttemptsSchema,
  })
  .partial({
    priority: true,
    maxAttempts: true,
  })
  .superRefine((body, ctx) => {
    if (body.kind === "Start") {
      const result = StartingNodePayloadSchema.safeParse(body.payload);
      if (!result.success || body.purpose !== undefined)
        ctx.addIssue({
          code: "custom",
          message: result.success
            ? "validation.invalidInput"
            : (result.error.issues[0]?.message ?? "validation.invalidInput"),
          path: ["payload"],
        });
      return;
    }
    const result = RoutineTaskPayloadSchema.safeParse({
      purpose:
        body.purpose ?? (body.payload as Record<string, unknown>)?.purpose,
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

export const parseRoutineTaskDefinition = (
  input: z.input<typeof CreateRoutineTaskBodySchema>
) => {
  const body = parseRequest(CreateRoutineTaskBodySchema, input);
  const { purpose: compatibilityPurpose, ...definition } = body;
  const purpose =
    body.kind === "Start"
      ? undefined
      : (compatibilityPurpose ?? body.payload.purpose);
  const payload =
    body.kind === "Start"
      ? {
          ...body.payload,
          schemaVersion: 1,
          isActive: body.payload.isActive ?? true,
        }
      : { ...body.payload, schemaVersion: 1, purpose };
  return { ...definition, payload };
};

export const RoutineTaskDefinitionSchema = z.object({
  id: z.uuidv4(),
  routineId: z.uuidv4(),
  kind: z.enum(RoutineTaskKinds).default("Action"),
  x: z.number().finite().default(0),
  y: z.number().finite().default(0),
  title: z.string(),
  payload: z.any(),
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

/* ============================== GetMyRoutineTasksByRoutineId ============================== */

export const GetMyRoutineTasksByRoutineIdRequestSchema =
  NotegicRequestSchema.extend({
    header: z
      .object({
        userAgent: z.string().min(1).optional(),
        csrfToken: z.string().optional(),
      })
      .optional(),
    param: z.object({
      routineId: z.uuidv4(),
      areDeleted: z.boolean().optional().default(false),
    }),
  });

export type GetMyRoutineTasksByRoutineIdRequest = z.input<
  typeof GetMyRoutineTasksByRoutineIdRequestSchema
>;

export const GetMyRoutineTasksByRoutineIdResponseSchema =
  NotegicResponseSchema.extend({
    data: z.array(RoutineTaskDefinitionSchema),
    embedded: z.object({
      publicId: z.string(),
    }),
  });

export type GetMyRoutineTasksByRoutineIdResponse = z.infer<
  typeof GetMyRoutineTasksByRoutineIdResponseSchema
>;

/* ============================== GetMyRoutineTasksByRoutineIds ============================== */

export const GetMyRoutineTasksByRoutineIdsRequestSchema =
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

export type GetMyRoutineTasksByRoutineIdsRequest = z.input<
  typeof GetMyRoutineTasksByRoutineIdsRequestSchema
>;

export const GetMyRoutineTasksByRoutineIdsResponseSchema =
  NotegicResponseSchema.extend({
    data: z.array(RoutineTaskDefinitionSchema),
    embedded: z.object({
      publicId: z.string(),
    }),
  });

export type GetMyRoutineTasksByRoutineIdsResponse = z.infer<
  typeof GetMyRoutineTasksByRoutineIdsResponseSchema
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

export type CreateRoutineTaskByRoutineIdRequest = z.input<
  typeof CreateRoutineTaskByRoutineIdRequestSchema
>;

export const CreateRoutineTaskByRoutineIdResponseSchema =
  NotegicResponseSchema.extend({
    data: z.object({
      id: z.uuidv4(),
      definitionVersion: z.number().int().positive().optional(),
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
      expectedDefinitionVersion: z.number().int().positive().optional(),
      values: z
        .object({
          x: z.number().finite().min(-1000000).max(1000000),
          y: z.number().finite().min(-1000000).max(1000000),
          routineId: z.uuidv4(),
          title: ItemNameSchema,
          purpose: z.enum(AllRoutineTaskPurposes, {
            error: "validation.payloadPurpose",
          }),
          payload: RoutineTaskPayloadSizeSchema,
          priority: RoutineTaskPrioritySchema,
          maxAttempts: RoutineTaskMaxAttemptsSchema,
        })
        .partial()
        .superRefine((values, ctx) => {
          if (values.payload === undefined) return;
          const result =
            values.purpose === undefined
              ? RoutineTaskEditablePayloadSchema.safeParse(values.payload)
              : RoutineTaskPayloadSchema.safeParse({
                  purpose: values.purpose,
                  payload: values.payload,
                });
          if (!result.success) {
            for (const issue of result.error.issues) {
              ctx.addIssue({
                code: "custom",
                path:
                  values.purpose === undefined
                    ? ["payload", ...issue.path]
                    : issue.path,
                message: issue.message,
              });
            }
          }
        }),
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
      definitionVersion: z.number().int().positive().optional(),
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
      expectedDefinitionVersion: z.number().int().positive().optional(),
    }),
  });

export type HardDeleteMyRoutineTaskByIdRequest = z.infer<
  typeof HardDeleteMyRoutineTaskByIdRequestSchema
>;

export const HardDeleteMyRoutineTaskByIdResponseSchema =
  NotegicResponseSchema.extend({
    data: z.object({
      deletedAt: z.coerce.date(),
      definitionVersion: z.number().int().positive().optional(),
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
