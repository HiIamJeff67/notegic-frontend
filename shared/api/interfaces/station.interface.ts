import {
  NotegicRequestSchema,
  NotegicResponseSchema,
} from "@shared/api/interfaces/context.interface";
import {
  AllAccessControlPermissions,
  AllSupportedIcons,
} from "@shared/api/interfaces/enums";
import { z } from "zod";
import {
  VisualizePermissionRequestSchema,
  VisualizeResponseSchema,
} from "./visualize.interface";

/* ============================== VisualizeMyTotalCount ============================== */

export const VisualizeMyTotalCountRequestSchema =
  VisualizePermissionRequestSchema;

export type VisualizeMyTotalCountRequest = z.infer<
  typeof VisualizeMyTotalCountRequestSchema
>;

export const VisualizeMyTotalCountResponseSchema = VisualizeResponseSchema;

export type VisualizeMyTotalCountResponse = z.infer<
  typeof VisualizeMyTotalCountResponseSchema
>;

/* ============================== GetMyStationById ============================== */

export const GetMyStationByIdRequestSchema = NotegicRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      csrfToken: z.string().optional(),
    })
    .optional(),
  param: z.object({
    stationId: z.uuidv4(),
    isDeleted: z.boolean().optional().default(false),
  }),
});

export type GetMyStationByIdRequest = z.input<
  typeof GetMyStationByIdRequestSchema
>;

export const GetMyStationByIdResponseSchema = NotegicResponseSchema.extend({
  data: z.object({
    id: z.uuidv4(),
    name: z.string(),
    description: z.string(),
    icon: z.enum(AllSupportedIcons).nullable(),
    headerBackgroundURL: z.url().nullable(),
    permission: z.enum(AllAccessControlPermissions),
    routineCount: z.int32(),
    deletedAt: z.coerce.date().nullable(),
    updatedAt: z.coerce.date(),
    createdAt: z.coerce.date(),
  }),
  embedded: z.object({
    publicId: z.string(),
  }),
});

export type GetMyStationByIdResponse = z.infer<
  typeof GetMyStationByIdResponseSchema
>;

/* ============================== GetAllMyStations ============================== */

export const GetAllMyStationsRequestSchema = NotegicRequestSchema.extend({
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

export type GetAllMyStationsRequest = z.input<
  typeof GetAllMyStationsRequestSchema
>;

export const GetAllMyStationsResponseSchema = NotegicResponseSchema.extend({
  data: z.array(
    z.object({
      id: z.uuidv4(),
      name: z.string(),
      icon: z.enum(AllSupportedIcons).nullable(),
      headerBackgroundURL: z.url().nullable(),
      permission: z.enum(AllAccessControlPermissions),
      routineCount: z.int32(),
      deletedAt: z.coerce.date().nullable(),
      updatedAt: z.coerce.date(),
      createdAt: z.coerce.date(),
    })
  ),
  embedded: z.object({
    publicId: z.string(),
  }),
});

export type GetAllMyStationsResponse = z.infer<
  typeof GetAllMyStationsResponseSchema
>;

/* ============================== CreateStation ============================== */

export const CreateStationRequestSchema = NotegicRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      csrfToken: z.string().optional(),
    })
    .optional(),
  body: z.object({
    id: z.uuidv4().optional(),
    name: z.string().min(1).max(128),
    description: z.string().max(1024),
    icon: z.enum(AllSupportedIcons).nullable(),
    headerBackgroundURL: z.url().nullable(),
  }),
});

export type CreateStationRequest = z.infer<typeof CreateStationRequestSchema>;

export const CreateStationResponseSchema = NotegicResponseSchema.extend({
  data: z.object({
    id: z.uuidv4(),
    createdAt: z.coerce.date(),
  }),
  embedded: z.object({
    publicId: z.string(),
  }),
});

export type CreateStationResponse = z.infer<typeof CreateStationResponseSchema>;

/* ============================== CreateStations ============================== */

export const CreateStationsRequestSchema = NotegicRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      csrfToken: z.string().optional(),
    })
    .optional(),
  body: z.object({
    createdStations: z.array(
      z.object({
        id: z.uuidv4().optional(),
        name: z.string().min(1).max(128),
        description: z.string().max(1024),
        icon: z.enum(AllSupportedIcons).nullable(),
        headerBackgroundURL: z.url().nullable(),
      })
    ),
  }),
});

export type CreateStationsRequest = z.infer<typeof CreateStationsRequestSchema>;

export const CreateStationsResponseSchema = NotegicResponseSchema.extend({
  data: z.object({
    ids: z.array(z.uuidv4()),
    createdAt: z.coerce.date(),
  }),
  embedded: z.object({
    publicId: z.string(),
  }),
});

export type CreateStationsResponse = z.infer<
  typeof CreateStationsResponseSchema
>;

/* ============================== Ownership and membership ============================== */

export const TransferMyStationOwnershipRequestSchema =
  NotegicRequestSchema.extend({
    header: z
      .object({
        userAgent: z.string().min(1).optional(),
        csrfToken: z.string().optional(),
      })
      .optional(),
    param: z.object({ stationId: z.uuidv4() }),
    body: z.object({ targetUserPublicId: z.uuidv4() }),
  });
export type TransferMyStationOwnershipRequest = z.infer<
  typeof TransferMyStationOwnershipRequestSchema
>;
export const TransferMyStationOwnershipResponseSchema =
  NotegicResponseSchema.extend({
    data: z.object({
      stationId: z.uuidv4(),
      previousOwnerUserPublicId: z.uuidv4(),
      newOwnerUserPublicId: z.uuidv4(),
      updatedAt: z.coerce.date(),
    }),
  });
export type TransferMyStationOwnershipResponse = z.infer<
  typeof TransferMyStationOwnershipResponseSchema
>;

export const LeaveMyStationRequestSchema = NotegicRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      csrfToken: z.string().optional(),
    })
    .optional(),
  param: z.object({ stationId: z.uuidv4() }),
  body: z
    .object({ targetUserPublicId: z.uuidv4().optional() })
    .optional()
    .default({}),
});
export type LeaveMyStationRequest = z.infer<typeof LeaveMyStationRequestSchema>;
export const LeaveMyStationResponseSchema = NotegicResponseSchema.extend({
  data: z.null(),
});
export type LeaveMyStationResponse = z.infer<
  typeof LeaveMyStationResponseSchema
>;

/* ============================== UpdateMyStationById ============================== */

export const UpdateMyStationByIdRequestSchema = NotegicRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      csrfToken: z.string().optional(),
    })
    .optional(),
  body: z.object({
    stationId: z.uuidv4(),
    values: z
      .object({
        name: z.string().min(1).max(128),
        description: z.string().max(1024),
        icon: z.enum(AllSupportedIcons).nullable(),
        headerBackgroundURL: z.url().nullable(),
      })
      .partial(),
    setNull: z.record(z.string(), z.boolean()).optional(),
  }),
});

export type UpdateMyStationByIdRequest = z.infer<
  typeof UpdateMyStationByIdRequestSchema
>;

export const UpdateMyStationByIdResponseSchema = NotegicResponseSchema.extend({
  data: z.object({
    updatedAt: z.coerce.date(),
  }),
  embedded: z.object({
    publicId: z.string(),
  }),
});

export type UpdateMyStationByIdResponse = z.infer<
  typeof UpdateMyStationByIdResponseSchema
>;

/* ============================== UpdateMyStationsByIds ============================== */

export const UpdateMyStationsByIdsRequestSchema = NotegicRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      csrfToken: z.string().optional(),
    })
    .optional(),
  body: z.object({
    updatedStations: z.array(
      z.object({
        stationId: z.uuidv4(),
        values: z
          .object({
            name: z.string().min(1).max(128),
            description: z.string().max(1024),
            icon: z.enum(AllSupportedIcons).nullable(),
            headerBackgroundURL: z.url().nullable(),
          })
          .partial(),
        setNull: z.record(z.string(), z.boolean()).optional(),
      })
    ),
  }),
});

export type UpdateMyStationsByIdsRequest = z.infer<
  typeof UpdateMyStationsByIdsRequestSchema
>;

export const UpdateMyStationsByIdsResponseSchema = NotegicResponseSchema.extend(
  {
    data: z.object({
      updatedAt: z.coerce.date(),
    }),
    embedded: z.object({
      publicId: z.string(),
    }),
  }
);

export type UpdateMyStationsByIdsResponse = z.infer<
  typeof UpdateMyStationsByIdsResponseSchema
>;

/* ============================== RestoreMyStationById ============================== */

export const RestoreMyStationByIdRequestSchema = NotegicRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      csrfToken: z.string().optional(),
    })
    .optional(),
  body: z.object({
    stationId: z.uuidv4(),
  }),
});

export type RestoreMyStationByIdRequest = z.infer<
  typeof RestoreMyStationByIdRequestSchema
>;

export const RestoreMyStationByIdResponseSchema = NotegicResponseSchema.extend({
  data: z.object({
    id: z.uuidv4(),
    name: z.string(),
    description: z.string(),
    icon: z.enum(AllSupportedIcons).nullable(),
    headerBackgroundURL: z.url().nullable(),
    permission: z.enum(AllAccessControlPermissions),
    routineCount: z.int32(),
    deletedAt: z.coerce.date().nullable(),
    updatedAt: z.coerce.date(),
    createdAt: z.coerce.date(),
  }),
  embedded: z.object({
    publicId: z.string(),
  }),
});

export type RestoreMyStationByIdResponse = z.infer<
  typeof RestoreMyStationByIdResponseSchema
>;

/* ============================== RestoreMyStationsByIds ============================== */

export const RestoreMyStationsByIdsRequestSchema = NotegicRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      csrfToken: z.string().optional(),
    })
    .optional(),
  body: z.object({
    stationIds: z.array(z.uuidv4()),
  }),
});

export type RestoreMyStationsByIdsRequest = z.infer<
  typeof RestoreMyStationsByIdsRequestSchema
>;

export const RestoreMyStationsByIdsResponseSchema =
  NotegicResponseSchema.extend({
    data: z.array(
      z.object({
        id: z.uuidv4(),
        name: z.string(),
        description: z.string(),
        icon: z.enum(AllSupportedIcons).nullable(),
        headerBackgroundURL: z.url().nullable(),
        permission: z.enum(AllAccessControlPermissions),
        routineCount: z.int32(),
        deletedAt: z.coerce.date().nullable(),
        updatedAt: z.coerce.date(),
        createdAt: z.coerce.date(),
      })
    ),
    embedded: z.object({
      publicId: z.string(),
    }),
  });

export type RestoreMyStationsByIdsResponse = z.infer<
  typeof RestoreMyStationsByIdsResponseSchema
>;

/* ============================== DeleteMyStationById ============================== */

export const DeleteMyStationByIdRequestSchema = NotegicRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      csrfToken: z.string().optional(),
    })
    .optional(),
  body: z.object({
    stationId: z.uuidv4(),
  }),
});

export type DeleteMyStationByIdRequest = z.infer<
  typeof DeleteMyStationByIdRequestSchema
>;

export const DeleteMyStationByIdResponseSchema = NotegicResponseSchema.extend({
  data: z.object({
    deletedAt: z.coerce.date(),
  }),
  embedded: z.object({
    publicId: z.string(),
  }),
});

export type DeleteMyStationByIdResponse = z.infer<
  typeof DeleteMyStationByIdResponseSchema
>;

/* ============================== DeleteMyStationsByIds ============================== */

export const DeleteMyStationsByIdsRequestSchema = NotegicRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      csrfToken: z.string().optional(),
    })
    .optional(),
  body: z.object({
    stationIds: z.array(z.uuidv4()),
  }),
});

export type DeleteMyStationsByIdsRequest = z.infer<
  typeof DeleteMyStationsByIdsRequestSchema
>;

export const DeleteMyStationsByIdsResponseSchema = NotegicResponseSchema.extend(
  {
    data: z.object({
      deletedAt: z.coerce.date(),
    }),
    embedded: z.object({
      publicId: z.string(),
    }),
  }
);

export type DeleteMyStationsByIdsResponse = z.infer<
  typeof DeleteMyStationsByIdsResponseSchema
>;

/* ============================== HardDeleteMyStationById ============================== */

export const HardDeleteMyStationByIdRequestSchema = NotegicRequestSchema.extend(
  {
    header: z
      .object({
        userAgent: z.string().min(1).optional(),
        csrfToken: z.string().optional(),
      })
      .optional(),
    body: z.object({
      stationId: z.uuidv4(),
    }),
  }
);

export type HardDeleteMyStationByIdRequest = z.infer<
  typeof HardDeleteMyStationByIdRequestSchema
>;

export const HardDeleteMyStationByIdResponseSchema =
  NotegicResponseSchema.extend({
    data: z.object({
      deletedAt: z.coerce.date(),
    }),
    embedded: z.object({
      publicId: z.string(),
    }),
  });

export type HardDeleteMyStationByIdResponse = z.infer<
  typeof HardDeleteMyStationByIdResponseSchema
>;

/* ============================== HardDeleteMyStationsByIds ============================== */

export const HardDeleteMyStationsByIdsRequestSchema =
  NotegicRequestSchema.extend({
    header: z
      .object({
        userAgent: z.string().min(1).optional(),
        csrfToken: z.string().optional(),
      })
      .optional(),
    body: z.object({
      stationIds: z.array(z.uuidv4()),
    }),
  });

export type HardDeleteMyStationsByIdsRequest = z.infer<
  typeof HardDeleteMyStationsByIdsRequestSchema
>;

export const HardDeleteMyStationsByIdsResponseSchema =
  NotegicResponseSchema.extend({
    data: z.object({
      deletedAt: z.coerce.date(),
    }),
    embedded: z.object({
      publicId: z.string(),
    }),
  });

export type HardDeleteMyStationsByIdsResponse = z.infer<
  typeof HardDeleteMyStationsByIdsResponseSchema
>;
