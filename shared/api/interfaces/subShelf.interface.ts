import {
  NotezyRequestSchema,
  NotezyResponseSchema,
} from "@shared/api/interfaces/context.interface";
import {
  AllMaterialContentTypes,
  AllSupportedIcons,
} from "@shared/api/interfaces/enums";
import { z } from "zod";

/* ============================== GetMySubShelfById ============================== */

export const GetMySubShelfByIdRequestSchema = NotezyRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      csrfToken: z.string().optional(),
    })
    .optional(),
  param: z.object({
    subShelfId: z.uuidv4(),
    isDeleted: z.boolean().optional().default(false),
  }),
});

export type GetMySubShelfByIdRequest = z.input<
  typeof GetMySubShelfByIdRequestSchema
>;

export const GetMySubShelfByIdResponseSchema = NotezyResponseSchema.extend({
  data: z.object({
    id: z.uuidv4(),
    name: z.string(),
    rootShelfId: z.uuidv4(),
    prevSubShelfId: z.uuidv4().nullable(),
    path: z.array(z.uuidv4()),
    deletedAt: z.coerce.date().nullable(),
    updatedAt: z.coerce.date(),
    createdAt: z.coerce.date(),
  }),
  embedded: z.object({
    publicId: z.string(),
  }),
});

export type GetMySubShelfByIdResponse = z.infer<
  typeof GetMySubShelfByIdResponseSchema
>;

/* ============================== GetMySubShelvesByPrevSubShelfId ============================== */

export const GetMySubShelvesByPrevSubShelfIdRequestSchema =
  NotezyRequestSchema.extend({
    header: z
      .object({
        userAgent: z.string().min(1).optional(),
        csrfToken: z.string().optional(),
      })
      .optional(),
    param: z.object({
      prevSubShelfId: z.uuidv4(),
      areDeleted: z.boolean().optional().default(false),
    }),
  });

export type GetMySubShelvesByPrevSubShelfIdRequest = z.input<
  typeof GetMySubShelvesByPrevSubShelfIdRequestSchema
>;

export const GetMySubShelvesByPrevSubShelfIdResponseSchema =
  NotezyResponseSchema.extend({
    data: z.array(
      z.object({
        id: z.uuidv4(),
        name: z.string(),
        rootShelfId: z.uuidv4(),
        prevSubShelfId: z.uuidv4().nullable(),
        path: z.array(z.uuidv4()),
        deletedAt: z.coerce.date().nullable(),
        updatedAt: z.coerce.date(),
        createdAt: z.coerce.date(),
      })
    ),
    embedded: z.object({
      publicId: z.string(),
    }),
  });

export type GetMySubShelvesByPrevSubShelfIdResponse = z.infer<
  typeof GetMySubShelvesByPrevSubShelfIdResponseSchema
>;

/* ============================== GetAllMySubShelvesByRootShelfId ============================== */

export const GetAllMySubShelvesByRootShelfIdRequestSchema =
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

export type GetAllMySubShelvesByRootShelfIdRequest = z.input<
  typeof GetAllMySubShelvesByRootShelfIdRequestSchema
>;

export const GetAllMySubShelvesByRootShelfIdResponseSchema =
  NotezyResponseSchema.extend({
    data: z.array(
      z.object({
        id: z.uuidv4(),
        name: z.string(),
        rootShelfId: z.uuidv4(),
        prevSubShelfId: z.uuidv4().nullable(),
        path: z.array(z.uuidv4()),
        deletedAt: z.coerce.date().nullable(),
        updatedAt: z.coerce.date(),
        createdAt: z.coerce.date(),
      })
    ),
    embedded: z.object({
      publicId: z.string(),
    }),
  });

export type GetAllMySubShelvesByRootShelfIdResponse = z.infer<
  typeof GetAllMySubShelvesByRootShelfIdResponseSchema
>;

/* ============================== GetMySubShelvesAndItemsByPrevSubShelfId ============================== */

export const GetMySubShelvesAndItemsByPrevSubShelfIdRequestSchema =
  NotezyRequestSchema.extend({
    header: z
      .object({
        userAgent: z.string().min(1).optional(),
        csrfToken: z.string().optional(),
      })
      .optional(),
    param: z.object({
      prevSubShelfId: z.uuidv4(),
      areDeleted: z.boolean().optional().default(false),
    }),
  });

export type GetMySubShelvesAndItemsByPrevSubShelfIdRequest = z.input<
  typeof GetMySubShelvesAndItemsByPrevSubShelfIdRequestSchema
>;

export const GetMySubShelvesAndItemsByPrevSubShelfIdResponseSchema =
  NotezyResponseSchema.extend({
    data: z.object({
      subShelves: z.array(
        z.object({
          // the response dto of GetMySubShelfById
          id: z.uuidv4(),
          name: z.string(),
          rootShelfId: z.uuidv4(),
          prevSubShelfId: z.uuidv4().nullable(),
          path: z.array(z.uuidv4()),
          deletedAt: z.coerce.date().nullable(),
          updatedAt: z.coerce.date(),
          createdAt: z.coerce.date(),
        })
      ),
      materials: z.array(
        z.object({
          // the response dto of GetMyMaterialById
          id: z.uuidv4(),
          parentSubShelfId: z.uuidv4(),
          name: z.string(),
          size: z.int64(),
          contentType: z.enum(AllMaterialContentTypes),
          parseMediaType: z.string(),
          downloadURL: z.url().nullable().optional(),
          deletedAt: z.coerce.date().nullable(),
          updatedAt: z.coerce.date(),
          createdAt: z.coerce.date(),
        })
      ),
      blockPacks: z.array(
        z.object({
          // the response dto of GetMyBlockPackById
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
    }),
    embedded: z.object({
      publicId: z.string(),
    }),
  });

export type GetMySubShelvesAndItemsByPrevSubShelfIdResponse = z.infer<
  typeof GetMySubShelvesAndItemsByPrevSubShelfIdResponseSchema
>;

/* ============================== CreateSubShelfByRootShelfId ============================== */

export const CreateSubShelfByRootShelfIdRequestSchema =
  NotezyRequestSchema.extend({
    header: z
      .object({
        userAgent: z.string().min(1).optional(),
        csrfToken: z.string().optional(),
      })
      .optional(),
    body: z.object({
      id: z.uuidv4().optional(),
      rootShelfId: z.uuidv4(),
      prevSubShelfId: z.uuidv4().nullable(),
      name: z.string().min(1).max(128),
    }),
    affected: z.object({
      rootShelfId: z.uuidv4(),
      prevSubShelfId: z.uuidv4().nullable(),
    }),
  });

export type CreateSubShelfByRootShelfIdRequest = z.infer<
  typeof CreateSubShelfByRootShelfIdRequestSchema
>;

export const CreateSubShelfByRootShelfIdResponseSchema =
  NotezyResponseSchema.extend({
    data: z.object({
      id: z.uuidv4(),
      createdAt: z.coerce.date(),
    }),
    embedded: z.object({
      publicId: z.string(),
    }),
  });

export type CreateSubShelfByRootShelfIdResponse = z.infer<
  typeof CreateSubShelfByRootShelfIdResponseSchema
>;

/* ============================== CreateSubShelvesByRootShelfIds ============================== */

export const CreateSubShelvesByRootShelfIdsRequestSchema =
  NotezyRequestSchema.extend({
    header: z
      .object({
        userAgent: z.string().min(1).optional(),
        csrfToken: z.string().optional(),
      })
      .optional(),
    body: z.object({
      createdSubShelves: z.array(
        z.object({
          id: z.uuidv4().optional(),
          rootShelfId: z.uuidv4(),
          prevSubShelfId: z.uuidv4().nullable(),
          name: z.string().min(1).max(128),
        })
      ),
    }),
    affected: z.object({
      rootShelfIds: z.array(z.uuidv4()),
      prevSubShelfIds: z.array(z.uuidv4().nullable()),
    }),
  });

export type CreateSubShelvesByRootShelfIdsRequest = z.infer<
  typeof CreateSubShelvesByRootShelfIdsRequestSchema
>;

export const CreateSubShelvesByRootShelfIdsResponseSchema =
  NotezyResponseSchema.extend({
    data: z.object({
      ids: z.array(z.uuidv4()),
      createdAt: z.coerce.date(),
    }),
    embedded: z.object({
      publicId: z.string(),
    }),
  });

export type CreateSubShelvesByRootShelfIdsResponse = z.infer<
  typeof CreateSubShelvesByRootShelfIdsResponseSchema
>;

/* ============================== UpdateMySubShelfById ============================== */

export const UpdateMySubShelfByIdRequestSchema = NotezyRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      csrfToken: z.string().optional(),
    })
    .optional(),
  body: z.object({
    subShelfId: z.uuidv4(),
    values: z
      .object({
        name: z.string().min(1).max(128),
      })
      .partial(),
    setNull: z.record(z.string(), z.boolean()).optional(),
  }),
  affected: z.object({
    rootShelfId: z.uuidv4(),
    prevSubShelfId: z.uuidv4().nullable(),
  }),
});

export type UpdateMySubShelfByIdRequest = z.infer<
  typeof UpdateMySubShelfByIdRequestSchema
>;

export const UpdateMySubShelfByIdResponseSchema = NotezyResponseSchema.extend({
  data: z.object({
    updatedAt: z.coerce.date(),
  }),
  embedded: z.object({
    publicId: z.string(),
  }),
});

export type UpdateMySubShelfByIdResponse = z.infer<
  typeof UpdateMySubShelfByIdResponseSchema
>;

/* ============================== UpdateMySubShelvesByIds ============================== */

export const UpdateMySubShelvesByIdsRequestSchema = NotezyRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      csrfToken: z.string().optional(),
    })
    .optional(),
  body: z.object({
    updatedSubShelves: z.array(
      z.object({
        subShelfId: z.uuidv4(),
        values: z
          .object({
            name: z.string().min(1).max(128),
          })
          .partial(),
        setNull: z.record(z.string(), z.boolean()).optional(),
      })
    ),
  }),
  affected: z.object({
    rootShelfIds: z.array(z.uuidv4()),
    prevSubShelfIds: z.array(z.uuidv4().nullable()),
  }),
});

export type UpdateMySubShelvesByIdsRequest = z.infer<
  typeof UpdateMySubShelvesByIdsRequestSchema
>;

export const UpdateMySubShelvesByIdsResponseSchema =
  NotezyResponseSchema.extend({
    data: z.object({
      updatedAt: z.coerce.date(),
    }),
    embedded: z.object({
      publicId: z.string(),
    }),
  });

export type UpdateMySubShelvesByIdsResponse = z.infer<
  typeof UpdateMySubShelvesByIdsResponseSchema
>;

/* ============================== MoveMySubShelf ============================== */

export const MoveMySubShelfRequestSchema = NotezyRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      csrfToken: z.string().optional(),
    })
    .optional(),
  body: z.object({
    sourceRootShelfId: z.uuidv4(),
    sourceSubShelfId: z.uuidv4(),
    destinationRootShelfId: z.uuidv4(),
    destinationSubShelfId: z.uuidv4().nullable(),
  }),
  affected: z.object({
    rootShelfId: z.uuidv4(),
    childSubShelfIds: z.array(z.uuidv4()),
  }),
});

export type MoveMySubShelfRequest = z.infer<typeof MoveMySubShelfRequestSchema>;

export const MoveMySubShelfResponseSchema = NotezyResponseSchema.extend({
  data: z.object({
    updatedAt: z.coerce.date(),
  }),
  embedded: z.object({
    publicId: z.string(),
  }),
});

export type MoveMySubShelfResponse = z.infer<
  typeof MoveMySubShelfResponseSchema
>;

/* ============================== MoveMySubShelvesByRootShelfId ============================== */

export const MoveMySubShelvesByRootShelfIdRequestSchema =
  NotezyRequestSchema.extend({
    header: z
      .object({
        userAgent: z.string().min(1).optional(),
        csrfToken: z.string().optional(),
      })
      .optional(),
    body: z.object({
      sourceRootShelfId: z.uuidv4(),
      sourceSubShelfIds: z.array(z.uuidv4()).min(1).max(128),
      destinationRootShelfId: z.uuidv4(),
      destinationSubShelfId: z.uuidv4().nullable(),
    }),
    affected: z.object({
      rootShelfIds: z.array(z.uuidv4()),
      childSubShelfIds: z.array(z.uuidv4()),
    }),
  });

export type MoveMySubShelvesByRootShelfIdRequest = z.infer<
  typeof MoveMySubShelvesByRootShelfIdRequestSchema
>;

export const MoveMySubShelvesByRootShelfIdResponseSchema =
  NotezyResponseSchema.extend({
    data: z.object({
      updatedAt: z.coerce.date(),
    }),
    embedded: z.object({
      publicId: z.string(),
    }),
  });

export type MoveMySubShelvesByRootShelfIdResponse = z.infer<
  typeof MoveMySubShelvesByRootShelfIdResponseSchema
>;

/* ============================== MoveMySubShelvesByRootShelfIds ============================== */

export const MoveMySubShelvesByRootShelfIdsRequestSchema =
  NotezyRequestSchema.extend({
    header: z
      .object({
        userAgent: z.string().min(1).optional(),
        csrfToken: z.string().optional(),
      })
      .optional(),
    body: z.object({
      moveSubShelves: z.array(
        z.object({
          sourceRootShelfId: z.uuidv4(),
          sourceSubShelfIds: z.array(z.uuidv4()).min(1).max(128),
          destinationRootShelfId: z.uuidv4(),
          destinationSubShelfId: z.uuidv4().nullable(),
        })
      ),
    }),
    affected: z.object({
      rootShelfIds: z.array(z.uuidv4()),
      childSubShelfIds: z.array(z.uuidv4()),
    }),
  });

export type MoveMySubShelvesByRootShelfIdsRequest = z.infer<
  typeof MoveMySubShelvesByRootShelfIdsRequestSchema
>;

export const MoveMySubShelvesByRootShelfIdsResponseSchema =
  NotezyResponseSchema.extend({
    data: z.object({
      updatedAt: z.coerce.date(),
    }),
    embedded: z.object({
      publicId: z.string(),
    }),
  });

export type MoveMySubShelvesByRootShelfIdsResponse = z.infer<
  typeof MoveMySubShelvesByRootShelfIdsResponseSchema
>;

/* ============================== RestoreMySubShelfById ============================== */

export const RestoreMySubShelfByIdRequestSchema = NotezyRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      csrfToken: z.string().optional(),
    })
    .optional(),
  body: z.object({
    subShelfId: z.uuidv4(),
  }),
  affected: z.object({
    rootShelfId: z.uuidv4(),
    prevSubShelfId: z.uuidv4().nullable(),
  }),
});

export type RestoreMySubShelfByIdRequest = z.infer<
  typeof RestoreMySubShelfByIdRequestSchema
>;

export const RestoreMySubShelfByIdResponseSchema = NotezyResponseSchema.extend({
  data: z.object({
    id: z.uuidv4(),
    name: z.string(),
    rootShelfId: z.uuidv4(),
    prevSubShelfId: z.uuidv4().nullable(),
    path: z.array(z.uuidv4()),
    deletedAt: z.coerce.date().nullable(),
    updatedAt: z.coerce.date(),
    createdAt: z.coerce.date(),
  }),
  embedded: z.object({
    publicId: z.string(),
  }),
});

export type RestoreMySubShelfByIdResponse = z.infer<
  typeof RestoreMySubShelfByIdResponseSchema
>;

/* ============================== RestoreMySubShelvesByIds ============================== */

export const RestoreMySubShelvesByIdsRequestSchema = NotezyRequestSchema.extend(
  {
    header: z
      .object({
        userAgent: z.string().min(1).optional(),
        csrfToken: z.string().optional(),
      })
      .optional(),
    body: z.object({
      subShelfIds: z.array(z.uuidv4()).min(1).max(128),
    }),
    affected: z.object({
      rootShelfIds: z.array(z.uuidv4()),
      prevSubShelfIds: z.array(z.uuidv4()),
    }),
  }
);

export type RestoreMySubShelvesByIdsRequest = z.infer<
  typeof RestoreMySubShelvesByIdsRequestSchema
>;

export const RestoreMySubShelvesByIdsResponseSchema =
  NotezyResponseSchema.extend({
    data: z.array(
      z.object({
        id: z.uuidv4(),
        name: z.string(),
        rootShelfId: z.uuidv4(),
        prevSubShelfId: z.uuidv4().nullable(),
        path: z.array(z.uuidv4()),
        deletedAt: z.coerce.date().nullable(),
        updatedAt: z.coerce.date(),
        createdAt: z.coerce.date(),
      })
    ),
    embedded: z.object({
      publicId: z.string(),
    }),
  });

export type RestoreMySubShelvesByIdsResponse = z.infer<
  typeof RestoreMySubShelvesByIdsResponseSchema
>;

/* ============================== DeleteMySubShelfById ============================== */

export const DeleteMySubShelfByIdRequestSchema = NotezyRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      csrfToken: z.string().optional(),
    })
    .optional(),
  body: z.object({
    subShelfId: z.uuidv4(),
  }),
  affected: z.object({
    rootShelfId: z.uuidv4(),
    prevSubShelfId: z.uuidv4().nullable(),
  }),
});

export type DeleteMySubShelfByIdRequest = z.infer<
  typeof DeleteMySubShelfByIdRequestSchema
>;

export const DeleteMySubShelfByIdResponseSchema = NotezyResponseSchema.extend({
  data: z.object({
    deletedAt: z.coerce.date(),
  }),
  embedded: z.object({
    publicId: z.string(),
  }),
});

export type DeleteMySubShelfByIdResponse = z.infer<
  typeof DeleteMySubShelfByIdResponseSchema
>;

/* ============================== DeleteMySubShelvesByIds ============================== */

export const DeleteMySubShelvesByIdsRequestSchema = NotezyRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      csrfToken: z.string().optional(),
    })
    .optional(),
  body: z.object({
    subShelfIds: z.array(z.uuidv4()).min(1).max(128),
  }),
  affected: z.object({
    rootShelfIds: z.array(z.uuidv4()),
    prevSubShelfIds: z.array(z.uuidv4()),
  }),
});

export type DeleteMySubShelvesByIdsRequest = z.infer<
  typeof DeleteMySubShelvesByIdsRequestSchema
>;

export const DeleteMySubShelvesByIdsResponseSchema =
  NotezyResponseSchema.extend({
    data: z.object({
      deletedAt: z.coerce.date(),
    }),
    embedded: z.object({
      publicId: z.string(),
    }),
  });

export type DeleteMySubShelvesByIdsResponse = z.infer<
  typeof DeleteMySubShelvesByIdsResponseSchema
>;
