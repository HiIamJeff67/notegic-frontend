import {
  NotezyRequestSchema,
  NotezyResponseSchema,
} from "@shared/api/interfaces/context.interface";
import { AllMaterialContentTypes } from "@shared/api/interfaces/enums";
import z from "zod";

/* ============================== GetMyMaterialById ============================== */

export const GetMyMaterialByIdRequestSchema = NotezyRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      csrfToken: z.string().optional(),
    })
    .optional(),
  param: z.object({
    materialId: z.uuidv4(),
    isDeleted: z.boolean().optional().default(false),
  }),
});

export type GetMyMaterialByIdRequest = z.input<
  typeof GetMyMaterialByIdRequestSchema
>;

export const GetMyMaterialByIdResponseSchema = NotezyResponseSchema.extend({
  data: z.object({
    id: z.uuidv4(),
    parentSubShelfId: z.uuidv4(),
    name: z.string(),
    size: z.number(),
    contentType: z.enum(AllMaterialContentTypes),
    parseMediaType: z.string(),
    downloadURL: z.url().nullable().optional(),
    deletedAt: z.coerce.date().nullable(),
    updatedAt: z.coerce.date(),
    createdAt: z.coerce.date(),
  }),
  embedded: z.object({
    publicId: z.string(),
  }),
});

export type GetMyMaterialByIdResponse = z.infer<
  typeof GetMyMaterialByIdResponseSchema
>;

/* ============================== GetMyMaterialAndItsParentById ============================== */

export const GetMyMaterialAndItsParentByIdRequestSchema =
  NotezyRequestSchema.extend({
    header: z
      .object({
        userAgent: z.string().min(1).optional(),
        csrfToken: z.string().optional(),
      })
      .optional(),
    param: z.object({
      materialId: z.uuidv4(),
      isDeleted: z.boolean().optional().default(false),
    }),
  });

export type GetMyMaterialAndItsParentByIdRequest = z.input<
  typeof GetMyMaterialAndItsParentByIdRequestSchema
>;

export const GetMyMaterialAndItsParentByIdResponseSchema =
  NotezyResponseSchema.extend({
    data: z.object({
      id: z.uuidv4(),
      name: z.string(),
      size: z.number(),
      contentType: z.enum(AllMaterialContentTypes),
      parseMediaType: z.string(),
      downloadURL: z.url().nullable().optional(),
      deletedAt: z.coerce.date().nullable(),
      updatedAt: z.coerce.date(),
      createdAt: z.coerce.date(),
      rootShelfId: z.uuidv4(),
      parentSubShelfId: z.uuidv4(),
      parentSubShelfName: z.string(),
      parentSubShelfPrevSubShelfId: z.uuidv4().nullable(),
      parentSubShelfPath: z.array(z.uuidv4()),
      parentSubShelfDeletedAt: z.coerce.date().nullable(),
      parentSubShelfUpdatedAt: z.coerce.date(),
      parentSubShelfCreatedAt: z.coerce.date(),
    }),
    embedded: z.object({
      publicId: z.string(),
    }),
  });

export type GetMyMaterialAndItsParentByIdResponse = z.infer<
  typeof GetMyMaterialAndItsParentByIdResponseSchema
>;

/* ============================== GetMyMaterialsByParentSubShelfId ============================== */

export const GetMyMaterialsByParentSubShelfIdRequestSchema =
  NotezyRequestSchema.extend({
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

export type GetMyMaterialsByParentSubShelfIdRequest = z.input<
  typeof GetMyMaterialsByParentSubShelfIdRequestSchema
>;

export const GetMyMaterialsByParentSubShelfIdResponseSchema =
  NotezyResponseSchema.extend({
    data: z.array(
      z.object({
        id: z.uuidv4(),
        parentSubShelfId: z.uuidv4(),
        name: z.string(),
        size: z.number(),
        contentType: z.enum(AllMaterialContentTypes),
        parseMediaType: z.string(),
        downloadURL: z.url().nullable().optional(),
        deletedAt: z.coerce.date().nullable(),
        updatedAt: z.coerce.date(),
        createdAt: z.coerce.date(),
      })
    ),
    embedded: z.object({
      publicId: z.string(),
    }),
  });

export type GetMyMaterialsByParentSubShelfIdResponse = z.infer<
  typeof GetMyMaterialsByParentSubShelfIdResponseSchema
>;

/* ============================== GetAllMyMaterialsByRootShelfId ============================== */

export const GetAllMyMaterialsByRootShelfIdRequestSchema =
  NotezyRequestSchema.extend({
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

export type GetAllMyMaterialsByRootShelfIdRequest = z.input<
  typeof GetAllMyMaterialsByRootShelfIdRequestSchema
>;

export const GetAllMyMaterialsByRootShelfIdResponseSchema =
  NotezyResponseSchema.extend({
    data: z.array(
      z.object({
        id: z.uuidv4(),
        parentSubShelfId: z.uuidv4(),
        name: z.string(),
        size: z.number(),
        contentType: z.enum(AllMaterialContentTypes),
        parseMediaType: z.string(),
        downloadURL: z.url().nullable().optional(),
        deletedAt: z.coerce.date().nullable(),
        updatedAt: z.coerce.date(),
        createdAt: z.coerce.date(),
      })
    ),
    embedded: z.object({
      publicId: z.string(),
    }),
  });

export type GetAllMyMaterialsByRootShelfIdResponse = z.infer<
  typeof GetAllMyMaterialsByRootShelfIdResponseSchema
>;

/* ============================== CreateMyMaterial ============================== */

export const CreateMyMaterialRequestSchema = NotezyRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      csrfToken: z.string().optional(),
    })
    .optional(),
  body: z.object({
    parentSubShelfId: z.uuidv4(),
    name: z.string().min(1).max(128),
  }),
  affected: z.object({
    rootShelfId: z.uuidv4(),
    parentSubShelfId: z.uuidv4(),
  }),
});

export type CreateMyMaterialRequest = z.infer<
  typeof CreateMyMaterialRequestSchema
>;

export const CreateMyMaterialResponseSchema = NotezyResponseSchema.extend({
  data: z.object({
    id: z.uuidv4(),
    createdAt: z.coerce.date(),
  }),
  embedded: z.object({
    publicId: z.string(),
  }),
});

export type CreateMyMaterialResponse = z.infer<
  typeof CreateMyMaterialResponseSchema
>;

/* ============================== UpdateMyMaterialById ============================== */

export const UpdateMyMaterialByIdRequestSchema = NotezyRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      csrfToken: z.string().optional(),
    })
    .optional(),
  body: z.object({
    materialId: z.uuidv4(),
    values: z
      .object({
        name: z.string().min(1).max(128),
      })
      .partial(),
    setNull: z.record(z.string(), z.boolean()).optional(),
  }),
  affected: z.object({
    rootShelfId: z.uuidv4().optional(),
    parentSubShelfId: z.uuidv4(),
  }),
});

export type UpdateMyMaterialByIdRequest = z.infer<
  typeof UpdateMyMaterialByIdRequestSchema
>;

export const UpdateMyMaterialByIdResponseSchema = NotezyResponseSchema.extend({
  data: z.object({
    updatedAt: z.coerce.date(),
  }),
  embedded: z.object({
    publicId: z.string(),
  }),
});

export type UpdateMyMaterialByIdResponse = z.infer<
  typeof UpdateMyMaterialByIdResponseSchema
>;

/* ============================== SaveMyMaterialById ============================== */

export const SaveMyMaterialByIdRequestSchema = NotezyRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      csrfToken: z.string().optional(),
    })
    .optional(),
  body: z.object({
    materialId: z.uuidv4(),
    contentFile: z.file(),
  }),
  affected: z.object({
    parentSubShelfId: z.uuidv4(),
  }),
});

export type SaveMyMaterialByIdRequest = z.infer<
  typeof SaveMyMaterialByIdRequestSchema
>;

export const SaveMyMaterialByIdResponseSchema = NotezyResponseSchema.extend({
  data: z.object({
    updatedAt: z.coerce.date(),
  }),
  embedded: z.object({
    publicId: z.string(),
  }),
});

export type SaveMyMaterialByIdResponse = z.infer<
  typeof SaveMyMaterialByIdResponseSchema
>;

/* ============================== MoveMyMaterialById ============================== */

export const MoveMyMaterialByIdRequestSchema = NotezyRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      csrfToken: z.string().optional(),
    })
    .optional(),
  body: z.object({
    materialId: z.uuidv4(),
    destinationParentSubShelfId: z.uuidv4(),
  }),
  affected: z.object({
    rootShelfId: z.uuidv4(),
    sourceParentSubShelfId: z.uuidv4(),
  }),
});

export type MoveMyMaterialByIdRequest = z.infer<
  typeof MoveMyMaterialByIdRequestSchema
>;

export const MoveMyMaterialByIdResponseSchema = NotezyResponseSchema.extend({
  data: z.object({
    updatedAt: z.coerce.date(),
  }),
  embedded: z.object({
    publicId: z.string(),
  }),
});

export type MoveMyMaterialByIdResponse = z.infer<
  typeof MoveMyMaterialByIdResponseSchema
>;

/* ============================== MoveMyMaterialsByIds ============================== */

export const MoveMyMaterialsByIdsRequestSchema = NotezyRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      csrfToken: z.string().optional(),
    })
    .optional(),
  body: z.object({
    materialIds: z.array(z.uuidv4()).min(1).max(128),
    destinationParentSubShelfId: z.uuidv4(),
  }),
  affected: z.object({
    rootShelfIds: z.array(z.uuidv4()),
    sourceParentSubShelfIds: z.array(z.uuidv4()),
  }),
});

export type MoveMyMaterialsByIdsRequest = z.infer<
  typeof MoveMyMaterialsByIdsRequestSchema
>;

export const MoveMyMaterialsByIdsResponseSchema = NotezyResponseSchema.extend({
  data: z.object({
    updatedAt: z.coerce.date(),
  }),
  embedded: z.object({
    publicId: z.string(),
  }),
});

export type MoveMyMaterialsByIdsResponse = z.infer<
  typeof MoveMyMaterialsByIdsResponseSchema
>;

/* ============================== RestoreMyMaterialById ============================== */

export const RestoreMyMaterialByIdRequestSchema = NotezyRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      csrfToken: z.string().optional(),
    })
    .optional(),
  body: z.object({
    materialId: z.uuidv4(),
  }),
  affected: z.object({
    rootShelfId: z.uuidv4(),
    parentSubShelfId: z.uuidv4(),
  }),
});

export type RestoreMyMaterialByIdRequest = z.infer<
  typeof RestoreMyMaterialByIdRequestSchema
>;

export const RestoreMyMaterialByIdResponseSchema = NotezyResponseSchema.extend({
  data: z.object({
    id: z.uuidv4(),
    parentSubShelfId: z.uuidv4(),
    name: z.string(),
    size: z.number(),
    contentType: z.enum(AllMaterialContentTypes),
    parseMediaType: z.string(),
    downloadURL: z.url().nullable().optional(),
    deletedAt: z.coerce.date().nullable(),
    updatedAt: z.coerce.date(),
    createdAt: z.coerce.date(),
  }),
  embedded: z.object({
    publicId: z.string(),
  }),
});

export type RestoreMyMaterialByIdResponse = z.infer<
  typeof RestoreMyMaterialByIdResponseSchema
>;

/* ============================== RestoreMyMaterialsByIds ============================== */

export const RestoreMyMaterialsByIdsRequestSchema = NotezyRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      csrfToken: z.string().optional(),
    })
    .optional(),
  body: z.object({
    materialIds: z.array(z.uuidv4()).min(1).max(128),
  }),
  affected: z.object({
    rootShelfIds: z.array(z.uuidv4()),
    parentSubShelfIds: z.array(z.uuidv4()),
  }),
});

export type RestoreMyMaterialsByIdsRequest = z.infer<
  typeof RestoreMyMaterialsByIdsRequestSchema
>;

export const RestoreMyMaterialsByIdsResponseSchema =
  NotezyResponseSchema.extend({
    data: z.array(
      z.object({
        id: z.uuidv4(),
        parentSubShelfId: z.uuidv4(),
        name: z.string(),
        size: z.number(),
        contentType: z.enum(AllMaterialContentTypes),
        parseMediaType: z.string(),
        downloadURL: z.url().nullable().optional(),
        deletedAt: z.coerce.date().nullable(),
        updatedAt: z.coerce.date(),
        createdAt: z.coerce.date(),
      })
    ),
    embedded: z.object({
      publicId: z.string(),
    }),
  });

export type RestoreMyMaterialsByIdsResponse = z.infer<
  typeof RestoreMyMaterialsByIdsResponseSchema
>;

/* ============================== DeleteMyMaterialById ============================== */

export const DeleteMyMaterialByIdRequestSchema = NotezyRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      csrfToken: z.string().optional(),
    })
    .optional(),
  body: z.object({
    materialId: z.uuidv4(),
  }),
  affected: z.object({
    rootShelfId: z.uuidv4(),
    parentSubShelfId: z.uuidv4(),
  }),
});

export type DeleteMyMaterialByIdRequest = z.infer<
  typeof DeleteMyMaterialByIdRequestSchema
>;

export const DeleteMyMaterialByIdResponseSchema = NotezyResponseSchema.extend({
  data: z.object({
    deletedAt: z.coerce.date(),
  }),
  embedded: z.object({
    publicId: z.string(),
  }),
});

export type DeleteMyMaterialByIdResponse = z.infer<
  typeof DeleteMyMaterialByIdResponseSchema
>;

/* ============================== DeleteMyMaterialsByIds ============================== */

export const DeleteMyMaterialsByIdsRequestSchema = NotezyRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      csrfToken: z.string().optional(),
    })
    .optional(),
  body: z.object({
    materialIds: z.array(z.uuidv4()).min(1).max(128),
  }),
  affected: z.object({
    rootShelfIds: z.array(z.uuidv4()),
    parentSubShelfIds: z.array(z.uuidv4()),
  }),
});

export type DeleteMyMaterialsByIdsRequest = z.infer<
  typeof DeleteMyMaterialsByIdsRequestSchema
>;

export const DeleteMyMaterialsByIdsResponseSchema = NotezyResponseSchema.extend(
  {
    data: z.object({
      deletedAt: z.coerce.date(),
    }),
    embedded: z.object({
      publicId: z.string(),
    }),
  }
);

export type DeleteMyMaterialsByIdsResponse = z.infer<
  typeof DeleteMyMaterialsByIdsResponseSchema
>;
