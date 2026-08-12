import {
  NotezyRequestSchema,
  NotezyResponseSchema,
} from "@shared/api/interfaces/context.interface";
import {
  AllItemTypes,
  AllRoutinePeriods,
  AllRoutineStatuses,
} from "@shared/api/interfaces/enums";
import { z } from "zod";
import {
  VisualizePermissionRequestSchema,
  VisualizeResponseSchema,
  VisualizeTimeBucketRequestSchema,
} from "./visualize.interface";

/* ============================== Visualize Routine Charts ============================== */

export const VisualizeMyRoutineStatusCountRequestSchema =
  VisualizePermissionRequestSchema;
export type VisualizeMyRoutineStatusCountRequest = z.infer<
  typeof VisualizeMyRoutineStatusCountRequestSchema
>;
export const VisualizeMyRoutineStatusCountResponseSchema =
  VisualizeResponseSchema;
export type VisualizeMyRoutineStatusCountResponse = z.infer<
  typeof VisualizeMyRoutineStatusCountResponseSchema
>;

export const VisualizeMyRoutinePeriodCountRequestSchema =
  VisualizePermissionRequestSchema;
export type VisualizeMyRoutinePeriodCountRequest = z.infer<
  typeof VisualizeMyRoutinePeriodCountRequestSchema
>;
export const VisualizeMyRoutinePeriodCountResponseSchema =
  VisualizeResponseSchema;
export type VisualizeMyRoutinePeriodCountResponse = z.infer<
  typeof VisualizeMyRoutinePeriodCountResponseSchema
>;

export const VisualizeMyRoutineScheduledStartAtCountRequestSchema =
  VisualizeTimeBucketRequestSchema;
export type VisualizeMyRoutineScheduledStartAtCountRequest = z.infer<
  typeof VisualizeMyRoutineScheduledStartAtCountRequestSchema
>;
export const VisualizeMyRoutineScheduledStartAtCountResponseSchema =
  VisualizeResponseSchema;
export type VisualizeMyRoutineScheduledStartAtCountResponse = z.infer<
  typeof VisualizeMyRoutineScheduledStartAtCountResponseSchema
>;

export const VisualizeMyRoutineScheduledEndAtCountRequestSchema =
  VisualizeTimeBucketRequestSchema;
export type VisualizeMyRoutineScheduledEndAtCountRequest = z.infer<
  typeof VisualizeMyRoutineScheduledEndAtCountRequestSchema
>;
export const VisualizeMyRoutineScheduledEndAtCountResponseSchema =
  VisualizeResponseSchema;
export type VisualizeMyRoutineScheduledEndAtCountResponse = z.infer<
  typeof VisualizeMyRoutineScheduledEndAtCountResponseSchema
>;

/* ============================== GetMyRoutineById ============================== */

export const GetMyRoutineByIdRequestSchema = NotezyRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      csrfToken: z.string().optional(),
    })
    .optional(),
  param: z.object({
    routineId: z.uuidv4(),
    isDeleted: z.boolean().optional().default(false),
  }),
});

export type GetMyRoutineByIdRequest = z.input<
  typeof GetMyRoutineByIdRequestSchema
>;

export const GetMyRoutineByIdResponseSchema = NotezyResponseSchema.extend({
  data: z.object({
    id: z.uuidv4(),
    stationId: z.uuidv4(),
    title: z.string(),
    description: z.string(),
    status: z.enum(AllRoutineStatuses),
    isPinned: z.boolean(),
    scheduledStartAt: z.coerce.date(),
    scheduledEndAt: z.coerce.date(),
    period: z.enum(AllRoutinePeriods).nullable(),
    timezone: z.string(),
    deletedAt: z.coerce.date().nullable(),
    updatedAt: z.coerce.date(),
    createdAt: z.coerce.date(),
    tagIds: z.array(z.uuidv4()),
    taskIds: z.array(z.uuidv4()),
    itemIds: z.array(z.uuidv4()),
  }),
  embedded: z.object({
    publicId: z.string(),
  }),
});

export type GetMyRoutineByIdResponse = z.infer<
  typeof GetMyRoutineByIdResponseSchema
>;

/* ============================== GetMyRoutinesByStationId ============================== */

export const GetMyRoutinesByStationIdRequestSchema = NotezyRequestSchema.extend(
  {
    header: z
      .object({
        userAgent: z.string().min(1).optional(),
        csrfToken: z.string().optional(),
      })
      .optional(),
    param: z.object({
      stationId: z.uuidv4(),
      areDeleted: z.boolean().optional().default(false),
    }),
  }
);

export type GetMyRoutinesByStationIdRequest = z.input<
  typeof GetMyRoutinesByStationIdRequestSchema
>;

export const GetMyRoutinesByStationIdResponseSchema =
  NotezyResponseSchema.extend({
    data: z.array(
      z.object({
        id: z.uuidv4(),
        stationId: z.uuidv4(),
        title: z.string(),
        status: z.enum(AllRoutineStatuses),
        isPinned: z.boolean(),
        scheduledStartAt: z.coerce.date(),
        scheduledEndAt: z.coerce.date(),
        period: z.enum(AllRoutinePeriods).nullable(),
        timezone: z.string(),
        deletedAt: z.coerce.date().nullable(),
        updatedAt: z.coerce.date(),
        createdAt: z.coerce.date(),
        tagIds: z.array(z.uuidv4()),
        taskIds: z.array(z.uuidv4()),
        itemIds: z.array(z.uuidv4()),
      })
    ),
    embedded: z.object({
      publicId: z.string(),
    }),
  });

export type GetMyRoutinesByStationIdResponse = z.infer<
  typeof GetMyRoutinesByStationIdResponseSchema
>;

/* ============================== GetAllMyRoutinesByTimeRange ============================== */

export const GetAllMyRoutinesByTimeRangeRequestSchema =
  NotezyRequestSchema.extend({
    header: z
      .object({
        userAgent: z.string().min(1).optional(),
        csrfToken: z.string().optional(),
      })
      .optional(),
    param: z.object({
      from: z.coerce.date(),
      to: z.coerce.date(),
      stationIds: z.array(z.uuidv4()).min(1).max(1024),
      areDeleted: z.boolean().optional().default(false),
    }),
  });

export type GetAllMyRoutinesByTimeRangeRequest = z.input<
  typeof GetAllMyRoutinesByTimeRangeRequestSchema
>;

export const GetAllMyRoutinesByTimeRangeResponseSchema =
  NotezyResponseSchema.extend({
    data: z.array(
      z.object({
        id: z.uuidv4(),
        stationId: z.uuidv4(),
        title: z.string(),
        status: z.enum(AllRoutineStatuses),
        isPinned: z.boolean(),
        scheduledStartAt: z.coerce.date(),
        scheduledEndAt: z.coerce.date(),
        period: z.enum(AllRoutinePeriods).nullable(),
        timezone: z.string(),
        deletedAt: z.coerce.date().nullable(),
        updatedAt: z.coerce.date(),
        createdAt: z.coerce.date(),
        tagIds: z.array(z.uuidv4()),
        taskIds: z.array(z.uuidv4()),
        itemIds: z.array(z.uuidv4()),
      })
    ),
    embedded: z.object({
      publicId: z.string(),
    }),
  });

export type GetAllMyRoutinesByTimeRangeResponse = z.infer<
  typeof GetAllMyRoutinesByTimeRangeResponseSchema
>;

/* ============================== CreateRoutineByStationId ============================== */

export const CreateRoutineByStationIdRequestSchema = NotezyRequestSchema.extend(
  {
    header: z
      .object({
        userAgent: z.string().min(1).optional(),
        csrfToken: z.string().optional(),
      })
      .optional(),
    body: z
      .object({
        id: z.uuidv4().optional(),
        stationId: z.uuidv4(),
        title: z.string().min(1).max(128),
        description: z.string().max(1024),
        status: z.enum(AllRoutineStatuses),
        isPinned: z.boolean(),
        scheduledStartAt: z.coerce.date(),
        scheduledEndAt: z.coerce.date(),
        period: z.enum(AllRoutinePeriods).nullable(),
        timezone: z.string().max(64),
      })
      .partial({
        status: true,
        isPinned: true,
        scheduledStartAt: true,
        scheduledEndAt: true,
        period: true,
        timezone: true,
      }),
  }
);

export type CreateRoutineByStationIdRequest = z.infer<
  typeof CreateRoutineByStationIdRequestSchema
>;

export const CreateRoutineByStationIdResponseSchema =
  NotezyResponseSchema.extend({
    data: z.object({
      id: z.uuidv4(),
      createdAt: z.coerce.date(),
    }),
    embedded: z.object({
      publicId: z.string(),
    }),
  });

export type CreateRoutineByStationIdResponse = z.infer<
  typeof CreateRoutineByStationIdResponseSchema
>;

/* ============================== CreateRoutinesByStationIds ============================== */

export const CreateRoutinesByStationIdsRequestSchema =
  NotezyRequestSchema.extend({
    header: z
      .object({
        userAgent: z.string().min(1).optional(),
        csrfToken: z.string().optional(),
      })
      .optional(),
    body: z.object({
      createdRoutines: z.array(
        z
          .object({
            id: z.uuidv4().optional(),
            stationId: z.uuidv4(),
            title: z.string().min(1).max(128),
            description: z.string().max(1024),
            status: z.enum(AllRoutineStatuses),
            isPinned: z.boolean(),
            scheduledStartAt: z.coerce.date(),
            scheduledEndAt: z.coerce.date(),
            period: z.enum(AllRoutinePeriods).nullable(),
            timezone: z.string().max(64),
          })
          .partial({
            status: true,
            isPinned: true,
            scheduledStartAt: true,
            scheduledEndAt: true,
            period: true,
            timezone: true,
          })
      ),
    }),
  });

export type CreateRoutinesByStationIdsRequest = z.infer<
  typeof CreateRoutinesByStationIdsRequestSchema
>;

export const CreateRoutinesByStationIdsResponseSchema =
  NotezyResponseSchema.extend({
    data: z.object({
      ids: z.array(z.uuidv4()),
      createdAt: z.coerce.date(),
    }),
    embedded: z.object({
      publicId: z.string(),
    }),
  });

export type CreateRoutinesByStationIdsResponse = z.infer<
  typeof CreateRoutinesByStationIdsResponseSchema
>;

/* ============================== UpdateMyRoutineById ============================== */

export const UpdateMyRoutineByIdRequestSchema = NotezyRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      csrfToken: z.string().optional(),
    })
    .optional(),
  body: z.object({
    routineId: z.uuidv4(),
    values: z
      .object({
        stationId: z.uuidv4(),
        title: z.string().min(1).max(128),
        description: z.string().max(1024),
        status: z.enum(AllRoutineStatuses),
        isPinned: z.boolean(),
        scheduledStartAt: z.coerce.date(),
        scheduledEndAt: z.coerce.date(),
        period: z.enum(AllRoutinePeriods).nullable(),
        timezone: z.string().max(64),
      })
      .partial(),
    setNull: z.record(z.string(), z.boolean()).optional(),
  }),
});

export type UpdateMyRoutineByIdRequest = z.infer<
  typeof UpdateMyRoutineByIdRequestSchema
>;

export const UpdateMyRoutineByIdResponseSchema = NotezyResponseSchema.extend({
  data: z.object({
    updatedAt: z.coerce.date(),
  }),
  embedded: z.object({
    publicId: z.string(),
  }),
});

export type UpdateMyRoutineByIdResponse = z.infer<
  typeof UpdateMyRoutineByIdResponseSchema
>;

/* ============================== UpdateMyRoutinesByIds ============================== */

export const UpdateMyRoutinesByIdsRequestSchema = NotezyRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      csrfToken: z.string().optional(),
    })
    .optional(),
  body: z.object({
    updatedRoutines: z.array(
      z.object({
        routineId: z.uuidv4(),
        values: z
          .object({
            stationId: z.uuidv4(),
            title: z.string().min(1).max(128),
            description: z.string().max(1024),
            status: z.enum(AllRoutineStatuses),
            isPinned: z.boolean(),
            scheduledStartAt: z.coerce.date(),
            scheduledEndAt: z.coerce.date(),
            period: z.enum(AllRoutinePeriods).nullable(),
            timezone: z.string().max(64),
          })
          .partial(),
        setNull: z.record(z.string(), z.boolean()).optional(),
      })
    ),
  }),
});

export type UpdateMyRoutinesByIdsRequest = z.infer<
  typeof UpdateMyRoutinesByIdsRequestSchema
>;

export const UpdateMyRoutinesByIdsResponseSchema = NotezyResponseSchema.extend({
  data: z.object({
    updatedAt: z.coerce.date(),
  }),
  embedded: z.object({
    publicId: z.string(),
  }),
});
export type UpdateMyRoutinesByIdsResponse = z.infer<
  typeof UpdateMyRoutinesByIdsResponseSchema
>;

/* ============================== LinkRoutineTagById ============================== */

export const LinkRoutineTagByIdRequestSchema = NotezyRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      csrfToken: z.string().optional(),
    })
    .optional(),
  body: z.object({
    routineId: z.uuidv4(),
    routineTagId: z.uuidv4(),
    isUnlink: z.boolean(),
  }),
});

export type LinkRoutineTagByIdRequest = z.infer<
  typeof LinkRoutineTagByIdRequestSchema
>;

export const LinkRoutineTagByIdResponseSchema = NotezyResponseSchema.extend({
  data: z.object({
    updatedAt: z.coerce.date(),
  }),
  embedded: z.object({ publicId: z.string().optional() }).optional(),
});

export type LinkRoutineTagByIdResponse = z.infer<
  typeof LinkRoutineTagByIdResponseSchema
>;

/* ============================== LinkRoutineTagsByIds ============================== */

export const LinkRoutineTagsByIdsRequestSchema = NotezyRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      csrfToken: z.string().optional(),
    })
    .optional(),
  body: z.object({
    linkedRoutinesAndTags: z.array(
      z.object({
        routineId: z.uuidv4(),
        routineTagId: z.uuidv4(),
      })
    ),
    isUnlink: z.boolean(),
  }),
});

export type LinkRoutineTagsByIdsRequest = z.infer<
  typeof LinkRoutineTagsByIdsRequestSchema
>;

export const LinkRoutineTagsByIdsResponseSchema = NotezyResponseSchema.extend({
  data: z.object({
    updatedAt: z.coerce.date(),
  }),
  embedded: z.object({ publicId: z.string().optional() }).optional(),
});

export type LinkRoutineTagsByIdsResponse = z.infer<
  typeof LinkRoutineTagsByIdsResponseSchema
>;

/* ============================== LinkRoutineTaskById ============================== */

export const LinkRoutineTaskByIdRequestSchema = NotezyRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      csrfToken: z.string().optional(),
    })
    .optional(),
  body: z.object({
    routineId: z.uuidv4(),
    routineTaskId: z.uuidv4(),
    isUnlink: z.boolean(),
  }),
});

export type LinkRoutineTaskByIdRequest = z.infer<
  typeof LinkRoutineTaskByIdRequestSchema
>;

export const LinkRoutineTaskByIdResponseSchema = NotezyResponseSchema.extend({
  data: z.object({
    updatedAt: z.coerce.date(),
  }),
  embedded: z.object({
    publicId: z.string(),
  }),
});

export type LinkRoutineTaskByIdResponse = z.infer<
  typeof LinkRoutineTaskByIdResponseSchema
>;

/* ============================== LinkRoutineTasksByIds ============================== */

export const LinkRoutineTasksByIdsRequestSchema = NotezyRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      csrfToken: z.string().optional(),
    })
    .optional(),
  body: z.object({
    linkedRoutinesAndTasks: z.array(
      z.object({
        routineId: z.uuidv4(),
        routineTaskId: z.uuidv4(),
      })
    ),
    isUnlink: z.boolean(),
  }),
});

export type LinkRoutineTasksByIdsRequest = z.infer<
  typeof LinkRoutineTasksByIdsRequestSchema
>;

export const LinkRoutineTasksByIdsResponseSchema = NotezyResponseSchema.extend({
  data: z.object({
    updatedAt: z.coerce.date(),
  }),
  embedded: z.object({
    publicId: z.string(),
  }),
});

export type LinkRoutineTasksByIdsResponse = z.infer<
  typeof LinkRoutineTasksByIdsResponseSchema
>;

/* ============================== LinkRoutineItemById ============================== */

export const LinkRoutineItemByIdRequestSchema = NotezyRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      csrfToken: z.string().optional(),
    })
    .optional(),
  body: z.object({
    routineId: z.uuidv4(),
    itemId: z.uuidv4(),
    itemType: z.enum(AllItemTypes),
    isUnlink: z.boolean(),
  }),
});

export type LinkRoutineItemByIdRequest = z.infer<
  typeof LinkRoutineItemByIdRequestSchema
>;

export const LinkRoutineItemByIdResponseSchema = NotezyResponseSchema.extend({
  data: z.object({
    updatedAt: z.coerce.date(),
  }),
  embedded: z.object({
    publicId: z.string(),
  }),
});

export type LinkRoutineItemByIdResponse = z.infer<
  typeof LinkRoutineItemByIdResponseSchema
>;

/* ============================== LinkRoutineItemsByIds ============================== */

export const LinkRoutineItemsByIdsRequestSchema = NotezyRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      csrfToken: z.string().optional(),
    })
    .optional(),
  body: z.object({
    linkedRoutinesAndItems: z.array(
      z.object({
        routineId: z.uuidv4(),
        itemId: z.uuidv4(),
        itemType: z.enum(AllItemTypes),
      })
    ),
    isUnlink: z.boolean(),
  }),
});

export type LinkRoutineItemsByIdsRequest = z.infer<
  typeof LinkRoutineItemsByIdsRequestSchema
>;

export const LinkRoutineItemsByIdsResponseSchema = NotezyResponseSchema.extend({
  data: z.object({
    updatedAt: z.coerce.date(),
  }),
  embedded: z.object({
    publicId: z.string(),
  }),
});

export type LinkRoutineItemsByIdsResponse = z.infer<
  typeof LinkRoutineItemsByIdsResponseSchema
>;

/* ============================== RestoreMyRoutineById ============================== */

export const RestoreMyRoutineByIdRequestSchema = NotezyRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      csrfToken: z.string().optional(),
    })
    .optional(),
  body: z.object({
    routineId: z.uuidv4(),
  }),
});

export type RestoreMyRoutineByIdRequest = z.infer<
  typeof RestoreMyRoutineByIdRequestSchema
>;

export const RestoreMyRoutineByIdResponseSchema = NotezyResponseSchema.extend({
  data: z.object({
    id: z.uuidv4(),
    stationId: z.uuidv4(),
    title: z.string(),
    description: z.string(),
    status: z.enum(AllRoutineStatuses),
    isPinned: z.boolean(),
    scheduledStartAt: z.coerce.date(),
    scheduledEndAt: z.coerce.date(),
    period: z.enum(AllRoutinePeriods).nullable(),
    timezone: z.string(),
    deletedAt: z.coerce.date().nullable(),
    updatedAt: z.coerce.date(),
    createdAt: z.coerce.date(),
  }),
  embedded: z.object({
    publicId: z.string(),
  }),
});

export type RestoreMyRoutineByIdResponse = z.infer<
  typeof RestoreMyRoutineByIdResponseSchema
>;

/* ============================== RestoreMyRoutinesByIds ============================== */

export const RestoreMyRoutinesByIdsRequestSchema = NotezyRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      csrfToken: z.string().optional(),
    })
    .optional(),
  body: z.object({
    routineIds: z.array(z.uuidv4()),
  }),
});

export type RestoreMyRoutinesByIdsRequest = z.infer<
  typeof RestoreMyRoutinesByIdsRequestSchema
>;

export const RestoreMyRoutinesByIdsResponseSchema = NotezyResponseSchema.extend(
  {
    data: z.array(
      z.object({
        id: z.uuidv4(),
        stationId: z.uuidv4(),
        title: z.string(),
        description: z.string(),
        status: z.enum(AllRoutineStatuses),
        isPinned: z.boolean(),
        scheduledStartAt: z.coerce.date(),
        scheduledEndAt: z.coerce.date(),
        period: z.enum(AllRoutinePeriods).nullable(),
        timezone: z.string(),
        deletedAt: z.coerce.date().nullable(),
        updatedAt: z.coerce.date(),
        createdAt: z.coerce.date(),
      })
    ),
    embedded: z.object({
      publicId: z.string(),
    }),
  }
);
export type RestoreMyRoutinesByIdsResponse = z.infer<
  typeof RestoreMyRoutinesByIdsResponseSchema
>;

/* ============================== DeleteMyRoutineById ============================== */

export const DeleteMyRoutineByIdRequestSchema = NotezyRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      csrfToken: z.string().optional(),
    })
    .optional(),
  body: z.object({
    routineId: z.uuidv4(),
  }),
});

export type DeleteMyRoutineByIdRequest = z.infer<
  typeof DeleteMyRoutineByIdRequestSchema
>;

export const DeleteMyRoutineByIdResponseSchema = NotezyResponseSchema.extend({
  data: z.object({
    deletedAt: z.coerce.date(),
  }),
  embedded: z.object({
    publicId: z.string(),
  }),
});

export type DeleteMyRoutineByIdResponse = z.infer<
  typeof DeleteMyRoutineByIdResponseSchema
>;

/* ============================== DeleteMyRoutinesByIds ============================== */

export const DeleteMyRoutinesByIdsRequestSchema = NotezyRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      csrfToken: z.string().optional(),
    })
    .optional(),
  body: z.object({
    routineIds: z.array(z.uuidv4()),
  }),
});

export type DeleteMyRoutinesByIdsRequest = z.infer<
  typeof DeleteMyRoutinesByIdsRequestSchema
>;

export const DeleteMyRoutinesByIdsResponseSchema = NotezyResponseSchema.extend({
  data: z.object({
    deletedAt: z.coerce.date(),
  }),
  embedded: z.object({
    publicId: z.string(),
  }),
});

export type DeleteMyRoutinesByIdsResponse = z.infer<
  typeof DeleteMyRoutinesByIdsResponseSchema
>;

/* ============================== HardDeleteMyRoutineById ============================== */

export const HardDeleteMyRoutineByIdRequestSchema = NotezyRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      csrfToken: z.string().optional(),
    })
    .optional(),
  body: z.object({
    routineId: z.uuidv4(),
  }),
});

export type HardDeleteMyRoutineByIdRequest = z.infer<
  typeof HardDeleteMyRoutineByIdRequestSchema
>;

export const HardDeleteMyRoutineByIdResponseSchema =
  NotezyResponseSchema.extend({
    data: z.object({
      deletedAt: z.coerce.date(),
    }),
    embedded: z.object({
      publicId: z.string(),
    }),
  });

export type HardDeleteMyRoutineByIdResponse = z.infer<
  typeof HardDeleteMyRoutineByIdResponseSchema
>;

/* ============================== HardDeleteMyRoutinesByIds ============================== */

export const HardDeleteMyRoutinesByIdsRequestSchema =
  NotezyRequestSchema.extend({
    header: z
      .object({
        userAgent: z.string().min(1).optional(),
        csrfToken: z.string().optional(),
      })
      .optional(),
    body: z.object({
      routineIds: z.array(z.uuidv4()),
    }),
  });

export type HardDeleteMyRoutinesByIdsRequest = z.infer<
  typeof HardDeleteMyRoutinesByIdsRequestSchema
>;

export const HardDeleteMyRoutinesByIdsResponseSchema =
  NotezyResponseSchema.extend({
    data: z.object({
      deletedAt: z.coerce.date(),
    }),
    embedded: z.object({
      publicId: z.string(),
    }),
  });

export type HardDeleteMyRoutinesByIdsResponse = z.infer<
  typeof HardDeleteMyRoutinesByIdsResponseSchema
>;
