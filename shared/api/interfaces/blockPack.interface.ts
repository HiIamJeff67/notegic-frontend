import {
  NotegicRequestSchema,
  NotegicResponseSchema,
} from "@shared/api/interfaces/context.interface";
import {
  AllAccessControlPermissions,
  AllSupportedIcons,
} from "@shared/api/interfaces/enums";
import { z } from "zod";

/* ============================== GetMyBlockPackById ============================== */

export const GetMyBlockPackByIdRequestSchema = NotegicRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      csrfToken: z.string().optional(),
    })
    .optional(),
  param: z.object({
    blockPackId: z.uuidv4(),
    isDeleted: z.boolean().optional().default(false),
  }),
});

export type GetMyBlockPackByIdRequest = z.input<
  typeof GetMyBlockPackByIdRequestSchema
>;

export const GetMyBlockPackByIdResponseSchema = NotegicResponseSchema.extend({
  data: z.object({
    id: z.uuidv4(),
    parentSubShelfId: z.uuidv4(),
    name: z.string(),
    icon: z.enum(AllSupportedIcons).nullable(),
    headerBackgroundURL: z.url().nullable(),
    blockCount: z.int32(),
    deletedAt: z.coerce.date().nullable(),
    updatedAt: z.coerce.date(),
    createdAt: z.coerce.date(),
  }),
  embedded: z.object({
    publicId: z.string(),
  }),
});

export type GetMyBlockPackByIdResponse = z.infer<
  typeof GetMyBlockPackByIdResponseSchema
>;

/* ============================== GetMyBlockPackAndItsParentById ============================== */

export const GetMyBlockPackAndItsParentByIdRequestSchema =
  NotegicRequestSchema.extend({
    header: z
      .object({
        userAgent: z.string().min(1).optional(),
        csrfToken: z.string().optional(),
      })
      .optional(),
    param: z.object({
      blockPackId: z.uuidv4(),
      isDeleted: z.boolean().optional().default(false),
    }),
  });

export type GetMyBlockPackAndItsParentByIdRequest = z.input<
  typeof GetMyBlockPackAndItsParentByIdRequestSchema
>;

export const GetMyBlockPackAndItsParentByIdResponseSchema =
  NotegicResponseSchema.extend({
    data: z.object({
      id: z.uuidv4(),
      name: z.string(),
      icon: z.enum(AllSupportedIcons).nullable(),
      headerBackgroundURL: z.url().nullable(),
      blockCount: z.int32(),
      deletedAt: z.coerce.date().nullable(),
      updatedAt: z.coerce.date(),
      createdAt: z.coerce.date(),
      rootShelfId: z.uuidv4(),
      permission: z.enum(AllAccessControlPermissions),
      parentSubShelfId: z.uuidv4(),
      parentSubShelfPrevSubShelfId: z.uuidv4().nullable(),
      parentSubShelfName: z.string(),
      parentSubShelfPath: z.array(z.uuidv4()),
      parentSubShelfDeletedAt: z.coerce.date().nullable(),
      parentSubShelfUpdatedAt: z.coerce.date(),
      parentSubShelfCreatedAt: z.coerce.date(),
    }),
    embedded: z.object({
      publicId: z.string(),
    }),
  });

export type GetMyBlockPackAndItsParentByIdResponse = z.infer<
  typeof GetMyBlockPackAndItsParentByIdResponseSchema
>;

/* ============================== GetMyBlockPacksByParentSubShelfId ============================== */

export const GetMyBlockPacksByParentSubShelfIdRequestSchema =
  NotegicRequestSchema.extend({
    header: z
      .object({
        userAgent: z.string().min(1).optional(),
        csrfToken: z.string().optional(),
      })
      .optional(),
    param: z.object({
      parentSubShelfId: z.uuidv4(),
      areDeleted: z.boolean().optional().default(false),
    }),
  });

export type GetMyBlockPacksByParentSubShelfIdRequest = z.input<
  typeof GetMyBlockPacksByParentSubShelfIdRequestSchema
>;

export const GetMyBlockPacksByParentSubShelfIdResponseSchema =
  NotegicResponseSchema.extend({
    data: z.array(
      z.object({
        id: z.uuidv4(),
        parentSubShelfId: z.uuidv4(),
        name: z.string(),
        icon: z.enum(AllSupportedIcons).nullable(),
        headerBackgroundURL: z.url().nullable(),
        blockCount: z.int32(),
        deletedAt: z.coerce.date().nullable(),
        updatedAt: z.coerce.date(),
        createdAt: z.coerce.date(),
      })
    ),
    embedded: z.object({
      publicId: z.string(),
    }),
  });

export type GetMyBlockPacksByParentSubShelfIdResponse = z.infer<
  typeof GetMyBlockPacksByParentSubShelfIdResponseSchema
>;

/* ============================== GetAllMyBlockPacksByRootShelfId ============================== */

export const GetAllMyBlockPacksByRootShelfIdRequestSchema =
  NotegicRequestSchema.extend({
    header: z
      .object({
        userAgent: z.string().min(1).optional(),
        csrfToken: z.string().optional(),
      })
      .optional(),
    param: z.object({
      rootShelfId: z.uuidv4(),
      areDeleted: z.boolean().optional().default(false),
    }),
  });

export type GetAllMyBlockPacksByRootShelfIdRequest = z.input<
  typeof GetAllMyBlockPacksByRootShelfIdRequestSchema
>;

export const GetAllMyBlockPacksByRootShelfIdResponseSchema =
  NotegicResponseSchema.extend({
    data: z.array(
      z.object({
        id: z.uuidv4(),
        parentSubShelfId: z.uuidv4(),
        name: z.string(),
        icon: z.enum(AllSupportedIcons).nullable(),
        headerBackgroundURL: z.url().nullable(),
        blockCount: z.int32(),
        deletedAt: z.coerce.date().nullable(),
        updatedAt: z.coerce.date(),
        createdAt: z.coerce.date(),
      })
    ),
    embedded: z.object({
      publicId: z.string(),
    }),
  });

export type GetAllMyBlockPacksByRootShelfIdResponse = z.infer<
  typeof GetAllMyBlockPacksByRootShelfIdResponseSchema
>;

/* ============================== CreateBlockPack ============================== */

export const CreateBlockPackRequestSchema = NotegicRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      csrfToken: z.string().optional(),
    })
    .optional(),
  body: z.object({
    id: z.uuidv4().optional(),
    parentSubShelfId: z.uuidv4(),
    name: z.string().min(1).max(128),
    icon: z.enum(AllSupportedIcons).nullable(),
    headerBackgroundURL: z.url().nullable(),
  }),
  affected: z.object({
    rootShelfId: z.uuidv4(),
    parentSubShelfId: z.uuidv4(),
  }),
});

export type CreateBlockPackRequest = z.infer<
  typeof CreateBlockPackRequestSchema
>;

export const CreateBlockPackResponseSchema = NotegicResponseSchema.extend({
  data: z.object({
    id: z.uuidv4(),
    createdAt: z.coerce.date(),
  }),
  embedded: z.object({
    publicId: z.string(),
  }),
});

export type CreateBlockPackResponse = z.infer<
  typeof CreateBlockPackResponseSchema
>;

/* ============================== CreateBlockPacks ============================== */

export const CreateBlockPacksRequestSchema = NotegicRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      csrfToken: z.string().optional(),
    })
    .optional(),
  body: z.object({
    createdBlockPacks: z.array(
      z.object({
        id: z.uuidv4().optional(),
        parentSubShelfId: z.uuidv4(),
        name: z.string().min(1).max(128),
        icon: z.enum(AllSupportedIcons).nullable(),
        headerBackgroundURL: z.url().nullable(),
      })
    ),
  }),
  affected: z.object({
    rootShelfIds: z.array(z.uuidv4().optional()),
    parentSubShelfIds: z.array(z.uuidv4()),
  }),
});

export type CreateBlockPacksRequest = z.infer<
  typeof CreateBlockPacksRequestSchema
>;

export const CreateBlockPacksResponseSchema = NotegicResponseSchema.extend({
  data: z.object({
    ids: z.array(z.uuidv4()),
    createdAt: z.coerce.date(),
  }),
  embedded: z.object({
    publicId: z.string(),
  }),
});

export type CreateBlockPacksResponse = z.infer<
  typeof CreateBlockPacksResponseSchema
>;

/* ============================== UpdateMyBlockPackById ============================== */

export const UpdateMyBlockPackByIdRequestSchema = NotegicRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      csrfToken: z.string().optional(),
    })
    .optional(),
  body: z.object({
    blockPackId: z.uuidv4(),
    values: z
      .object({
        name: z.string().min(1).max(128),
        icon: z.enum(AllSupportedIcons),
        headerBackgroundURL: z.url(),
      })
      .partial(),
    setNull: z.record(z.string(), z.boolean()).optional(),
  }),
  affected: z.object({
    rootShelfId: z.uuidv4().optional(),
    parentSubShelfId: z.uuidv4(),
  }),
});

export type UpdateMyBlockPackByIdRequest = z.infer<
  typeof UpdateMyBlockPackByIdRequestSchema
>;

export const UpdateMyBlockPackByIdResponseSchema = NotegicResponseSchema.extend({
  data: z.object({
    updatedAt: z.coerce.date(),
  }),
  embedded: z.object({
    publicId: z.string(),
  }),
});

export type UpdateMyBlockPackByIdResponse = z.infer<
  typeof UpdateMyBlockPackByIdResponseSchema
>;

/* ============================== UpdateMyBlockPacksByIds ============================== */

export const UpdateMyBlockPacksByIdsRequestSchema = NotegicRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      csrfToken: z.string().optional(),
    })
    .optional(),
  body: z.object({
    updatedBlockPacks: z.array(
      z.object({
        blockPackId: z.uuidv4(),
        values: z
          .object({
            name: z.string().min(1).max(128),
            icon: z.enum(AllSupportedIcons),
            headerBackgroundURL: z.url(),
          })
          .partial(),
        setNull: z.record(z.string(), z.boolean()).optional(),
      })
    ),
  }),
  affected: z.object({
    rootShelfIds: z.array(z.uuidv4()),
    parentSubShelfIds: z.array(z.uuidv4()),
  }),
});

export type UpdateMyBlockPacksByIdsRequest = z.infer<
  typeof UpdateMyBlockPacksByIdsRequestSchema
>;

export const UpdateMyBlockPacksByIdsResponseSchema =
  NotegicResponseSchema.extend({
    data: z.object({
      updatedAt: z.coerce.date(),
    }),
    embedded: z.object({
      publicId: z.string(),
    }),
  });

export type UpdateMyBlockPacksByIdsResponse = z.infer<
  typeof UpdateMyBlockPacksByIdsResponseSchema
>;

/* ============================== MoveMyBlockPackById ============================== */

export const MoveMyBlockPackByIdRequestSchema = NotegicRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      csrfToken: z.string().optional(),
    })
    .optional(),
  body: z.object({
    blockPackId: z.uuidv4(),
    destinationParentSubShelfId: z.uuidv4(),
  }),
  affected: z.object({
    rootShelfId: z.uuidv4(),
    sourceParentSubShelfId: z.uuidv4(),
  }),
});

export type MoveMyBlockPackByIdRequest = z.infer<
  typeof MoveMyBlockPackByIdRequestSchema
>;

export const MoveMyBlockPackByIdResponseSchema = NotegicResponseSchema.extend({
  data: z.object({
    updatedAt: z.coerce.date(),
  }),
  embedded: z.object({
    publicId: z.string(),
  }),
});

export type MoveMyBlockPackByIdResponse = z.infer<
  typeof MoveMyBlockPackByIdResponseSchema
>;

/* ============================== MoveMyBlockPacksByParentSubShelfId ============================== */

export const MoveMyBlockPacksByParentSubShelfIdRequestSchema =
  NotegicRequestSchema.extend({
    header: z
      .object({
        userAgent: z.string().min(1).optional(),
        csrfToken: z.string().optional(),
      })
      .optional(),
    body: z.object({
      blockPackIds: z.array(z.uuidv4()),
      destinationParentSubShelfId: z.uuidv4(),
    }),
    affected: z.object({
      rootShelfId: z.uuidv4(),
      sourceParentSubShelfIds: z.array(z.uuidv4()),
    }),
  });

export type MoveMyBlockPacksByParentSubShelfIdRequest = z.infer<
  typeof MoveMyBlockPacksByParentSubShelfIdRequestSchema
>;

export const MoveMyBlockPacksByParentSubShelfIdResponseSchema =
  NotegicResponseSchema.extend({
    data: z.object({
      updatedAt: z.coerce.date(),
    }),
    embedded: z.object({
      publicId: z.string(),
    }),
  });

export type MoveMyBlockPacksByParentSubShelfIdResponse = z.infer<
  typeof MoveMyBlockPacksByParentSubShelfIdResponseSchema
>;

/* ============================== MoveMyBlockPacksByParentSubShelfIds ============================== */

export const MoveMyBlockPacksByParentSubShelfIdsRequestSchema =
  NotegicRequestSchema.extend({
    header: z
      .object({
        userAgent: z.string().min(1).optional(),
        csrfToken: z.string().optional(),
      })
      .optional(),
    body: z.object({
      movedBlockPacks: z.array(
        z.object({
          blockPackIds: z.array(z.uuidv4()),
          destinationParentSubShelfId: z.uuidv4(),
        })
      ),
    }),
    affected: z.object({
      rootShelfIds: z.array(z.uuidv4()),
      sourceParentSubShelfIds: z.array(z.uuidv4()),
    }),
  });

export type MoveMyBlockPacksByParentSubShelfIdsRequest = z.infer<
  typeof MoveMyBlockPacksByParentSubShelfIdsRequestSchema
>;

export const MoveMyBlockPacksByParentSubShelfIdsResponseSchema =
  NotegicResponseSchema.extend({
    data: z.object({
      updatedAt: z.coerce.date(),
    }),
    embedded: z.object({
      publicId: z.string(),
    }),
  });

export type MoveMyBlockPacksByParentSubShelfIdsResponse = z.infer<
  typeof MoveMyBlockPacksByParentSubShelfIdsResponseSchema
>;

/* ============================== RestoreMyBlockPackById ============================== */

export const RestoreMyBlockPackByIdRequestSchema = NotegicRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      csrfToken: z.string().optional(),
    })
    .optional(),
  body: z.object({
    blockPackId: z.uuidv4(),
  }),
  affected: z.object({
    rootShelfId: z.uuidv4(),
    parentSubShelfId: z.uuidv4(),
  }),
});

export type RestoreMyBlockPackByIdRequest = z.infer<
  typeof RestoreMyBlockPackByIdRequestSchema
>;

export const RestoreMyBlockPackByIdResponseSchema = NotegicResponseSchema.extend(
  {
    data: z.object({
      id: z.uuidv4(),
      parentSubShelfId: z.uuidv4(),
      name: z.string(),
      icon: z.enum(AllSupportedIcons).nullable(),
      headerBackgroundURL: z.url().nullable(),
      blockCount: z.int32(),
      deletedAt: z.coerce.date().nullable(),
      updatedAt: z.coerce.date(),
      createdAt: z.coerce.date(),
    }),
    embedded: z.object({
      publicId: z.string(),
    }),
  }
);

export type RestoreMyBlockPackByIdResponse = z.infer<
  typeof RestoreMyBlockPackByIdResponseSchema
>;

/* ============================== RestoreMyBlockPacksByIds ============================== */

export const RestoreMyBlockPacksByIdsRequestSchema = NotegicRequestSchema.extend(
  {
    header: z
      .object({
        userAgent: z.string().min(1).optional(),
        csrfToken: z.string().optional(),
      })
      .optional(),
    body: z.object({
      blockPackIds: z.array(z.uuidv4()),
    }),
    affected: z.object({
      rootShelfIds: z.array(z.uuidv4()),
      parentSubShelfIds: z.array(z.uuidv4()),
    }),
  }
);

export type RestoreMyBlockPacksByIdsRequest = z.infer<
  typeof RestoreMyBlockPacksByIdsRequestSchema
>;

export const RestoreMyBlockPacksByIdsResponseSchema =
  NotegicResponseSchema.extend({
    data: z.array(
      z.object({
        id: z.uuidv4(),
        parentSubShelfId: z.uuidv4(),
        name: z.string(),
        icon: z.enum(AllSupportedIcons).nullable(),
        headerBackgroundURL: z.url().nullable(),
        blockCount: z.int32(),
        deletedAt: z.coerce.date().nullable(),
        updatedAt: z.coerce.date(),
        createdAt: z.coerce.date(),
      })
    ),
    embedded: z.object({
      publicId: z.string(),
    }),
  });

export type RestoreMyBlockPacksByIdsResponse = z.infer<
  typeof RestoreMyBlockPacksByIdsResponseSchema
>;

/* ============================== DeleteMyBlockPackById ============================== */

export const DeleteMyBlockPackByIdRequestSchema = NotegicRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      csrfToken: z.string().optional(),
    })
    .optional(),
  body: z.object({
    blockPackId: z.uuidv4(),
  }),
  affected: z.object({
    rootShelfId: z.uuidv4(),
    parentSubShelfId: z.uuidv4(),
  }),
});

export type DeleteMyBlockPackByIdRequest = z.infer<
  typeof DeleteMyBlockPackByIdRequestSchema
>;

export const DeleteMyBlockPackByIdResponseSchema = NotegicResponseSchema.extend({
  data: z.object({
    deletedAt: z.coerce.date(),
  }),
  embedded: z.object({
    publicId: z.string(),
  }),
});

export type DeleteMyBlockPackByIdResponse = z.infer<
  typeof DeleteMyBlockPackByIdResponseSchema
>;

/* ============================== DeleteMyBlockPacksByIds ============================== */

export const DeleteMyBlockPacksByIdsRequestSchema = NotegicRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      csrfToken: z.string().optional(),
    })
    .optional(),
  body: z.object({
    blockPackIds: z.array(z.uuidv4()),
  }),
  affected: z.object({
    rootShelfIds: z.array(z.uuidv4()),
    parentSubShelfIds: z.array(z.uuidv4()),
  }),
});

export type DeleteMyBlockPacksByIdsRequest = z.infer<
  typeof DeleteMyBlockPacksByIdsRequestSchema
>;

export const DeleteMyBlockPacksByIdsResponseSchema =
  NotegicResponseSchema.extend({
    data: z.object({
      deletedAt: z.coerce.date(),
    }),
    embedded: z.object({
      publicId: z.string(),
    }),
  });

export type DeleteMyBlockPacksByIdsResponse = z.infer<
  typeof DeleteMyBlockPacksByIdsResponseSchema
>;
