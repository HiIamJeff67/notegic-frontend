import {
  NotegicRequestSchema,
  NotegicResponseSchema,
} from "@shared/api/interfaces/context.interface";
import { AllSupportedIcons } from "@shared/api/interfaces/enums";
import { z } from "zod";

/* ============================== GetMyRoutineTagById ============================== */

export const GetMyRoutineTagByIdRequestSchema = NotegicRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      csrfToken: z.string().optional(),
    })
    .optional(),
  param: z.object({
    routineTagId: z.uuidv4(),
    isDeleted: z.boolean().optional().default(false),
  }),
});

export type GetMyRoutineTagByIdRequest = z.input<
  typeof GetMyRoutineTagByIdRequestSchema
>;

export const GetMyRoutineTagByIdResponseSchema = NotegicResponseSchema.extend({
  data: z.object({
    id: z.uuidv4(),
    name: z.string(),
    color: z.string(),
    icon: z.enum(AllSupportedIcons).nullable(),
    updatedAt: z.coerce.date(),
    createdAt: z.coerce.date(),
  }),
  embedded: z.object({ publicId: z.string().optional() }).optional(),
});

export type GetMyRoutineTagByIdResponse = z.infer<
  typeof GetMyRoutineTagByIdResponseSchema
>;

/* ============================== GetAllMyRoutineTags ============================== */

export const GetAllMyRoutineTagsRequestSchema = NotegicRequestSchema.extend({
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

export type GetAllMyRoutineTagsRequest = z.input<
  typeof GetAllMyRoutineTagsRequestSchema
>;

export const GetAllMyRoutineTagsResponseSchema = NotegicResponseSchema.extend({
  data: z.array(
    z.object({
      id: z.uuidv4(),
      name: z.string(),
      color: z.string(),
      icon: z.enum(AllSupportedIcons).nullable(),
      updatedAt: z.coerce.date(),
      createdAt: z.coerce.date(),
    })
  ),
  embedded: z.object({ publicId: z.string().optional() }).optional(),
});

export type GetAllMyRoutineTagsResponse = z.infer<
  typeof GetAllMyRoutineTagsResponseSchema
>;

/* ============================== CreateRoutineTag ============================== */

export const CreateRoutineTagRequestSchema = NotegicRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      csrfToken: z.string().optional(),
    })
    .optional(),
  body: z.object({
    id: z.uuidv4().optional(),
    name: z.string().min(1).max(128),
    color: z.string(),
    icon: z.enum(AllSupportedIcons).nullable(),
  }),
});

export type CreateRoutineTagRequest = z.infer<
  typeof CreateRoutineTagRequestSchema
>;

export const CreateRoutineTagResponseSchema = NotegicResponseSchema.extend({
  data: z.object({
    id: z.uuidv4(),
    createdAt: z.coerce.date(),
  }),
  embedded: z.object({ publicId: z.string().optional() }).optional(),
});

export type CreateRoutineTagResponse = z.infer<
  typeof CreateRoutineTagResponseSchema
>;

/* ============================== CreateRoutineTags ============================== */

export const CreateRoutineTagsRequestSchema = NotegicRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      csrfToken: z.string().optional(),
    })
    .optional(),
  body: z.object({
    createdRoutineTags: z.array(
      z.object({
        id: z.uuidv4().optional(),
        name: z.string().min(1).max(128),
        color: z.string(),
        icon: z.enum(AllSupportedIcons).nullable(),
      })
    ),
  }),
});

export type CreateRoutineTagsRequest = z.infer<
  typeof CreateRoutineTagsRequestSchema
>;

export const CreateRoutineTagsResponseSchema = NotegicResponseSchema.extend({
  data: z.object({
    ids: z.array(z.uuidv4()),
    createdAt: z.coerce.date(),
  }),
  embedded: z.object({ publicId: z.string().optional() }).optional(),
});

export type CreateRoutineTagsResponse = z.infer<
  typeof CreateRoutineTagsResponseSchema
>;

/* ============================== UpdateMyRoutineTagById ============================== */

export const UpdateMyRoutineTagByIdRequestSchema = NotegicRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      csrfToken: z.string().optional(),
    })
    .optional(),
  body: z.object({
    routineTagId: z.uuidv4(),
    values: z
      .object({
        name: z.string().min(1).max(128),
        color: z.string(),
        icon: z.enum(AllSupportedIcons).nullable(),
      })
      .partial(),
    setNull: z.record(z.string(), z.boolean()).optional(),
  }),
});

export type UpdateMyRoutineTagByIdRequest = z.infer<
  typeof UpdateMyRoutineTagByIdRequestSchema
>;

export const UpdateMyRoutineTagByIdResponseSchema = NotegicResponseSchema.extend(
  {
    data: z.object({
      updatedAt: z.coerce.date(),
    }),
    embedded: z.object({ publicId: z.string().optional() }).optional(),
  }
);

export type UpdateMyRoutineTagByIdResponse = z.infer<
  typeof UpdateMyRoutineTagByIdResponseSchema
>;

/* ============================== UpdateMyRoutineTagsByIds ============================== */

export const UpdateMyRoutineTagsByIdsRequestSchema = NotegicRequestSchema.extend(
  {
    header: z
      .object({
        userAgent: z.string().min(1).optional(),
        csrfToken: z.string().optional(),
      })
      .optional(),
    body: z.object({
      updatedRoutineTags: z.array(
        z.object({
          routineTagId: z.uuidv4(),
          values: z
            .object({
              name: z.string().min(1).max(128),
              color: z.string(),
              icon: z.enum(AllSupportedIcons).nullable(),
            })
            .partial(),
          setNull: z.record(z.string(), z.boolean()).optional(),
        })
      ),
    }),
  }
);

export type UpdateMyRoutineTagsByIdsRequest = z.infer<
  typeof UpdateMyRoutineTagsByIdsRequestSchema
>;

export const UpdateMyRoutineTagsByIdsResponseSchema =
  NotegicResponseSchema.extend({
    data: z.object({
      updatedAt: z.coerce.date(),
    }),
    embedded: z.object({ publicId: z.string().optional() }).optional(),
  });

export type UpdateMyRoutineTagsByIdsResponse = z.infer<
  typeof UpdateMyRoutineTagsByIdsResponseSchema
>;

/* ============================== HardDeleteMyRoutineTagById ============================== */

export const HardDeleteMyRoutineTagByIdRequestSchema =
  NotegicRequestSchema.extend({
    header: z
      .object({
        userAgent: z.string().min(1).optional(),
        csrfToken: z.string().optional(),
      })
      .optional(),
    body: z.object({
      routineTagId: z.uuidv4(),
    }),
  });

export type HardDeleteMyRoutineTagByIdRequest = z.infer<
  typeof HardDeleteMyRoutineTagByIdRequestSchema
>;

export const HardDeleteMyRoutineTagByIdResponseSchema =
  NotegicResponseSchema.extend({
    data: z.object({
      deletedAt: z.coerce.date(),
    }),
    embedded: z.object({ publicId: z.string().optional() }).optional(),
  });

export type HardDeleteMyRoutineTagByIdResponse = z.infer<
  typeof HardDeleteMyRoutineTagByIdResponseSchema
>;

/* ============================== HardDeleteMyRoutineTagsByIds ============================== */

export const HardDeleteMyRoutineTagsByIdsRequestSchema =
  NotegicRequestSchema.extend({
    header: z
      .object({
        userAgent: z.string().min(1).optional(),
        csrfToken: z.string().optional(),
      })
      .optional(),
    body: z.object({
      routineTagIds: z.array(z.uuidv4()),
    }),
  });

export type HardDeleteMyRoutineTagsByIdsRequest = z.infer<
  typeof HardDeleteMyRoutineTagsByIdsRequestSchema
>;

export const HardDeleteMyRoutineTagsByIdsResponseSchema =
  NotegicResponseSchema.extend({
    data: z.object({
      deletedAt: z.coerce.date(),
    }),
    embedded: z.object({ publicId: z.string().optional() }).optional(),
  });

export type HardDeleteMyRoutineTagsByIdsResponse = z.infer<
  typeof HardDeleteMyRoutineTagsByIdsResponseSchema
>;
