import {
  NotezyRequestSchema,
  NotezyResponseSchema,
} from "@shared/api/interfaces/context.interface";
import {
  AccessControlPermission,
  AllAccessControlPermissions,
} from "@shared/api/interfaces/enums/accessControlPermission.enum";
import z from "zod";

/* ============================== GetMyRootShelfById ============================== */

export const GetMyRootShelfByIdRequestSchema = NotezyRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      csrfToken: z.string().optional(),
    })
    .optional(),
  param: z.object({
    rootShelfId: z.uuidv4(),
    isDeleted: z.boolean().optional().default(false),
  }),
});

export type GetMyRootShelfByIdRequest = z.input<
  typeof GetMyRootShelfByIdRequestSchema
>;

export const GetMyRootShelfByIdResponseSchema = NotezyResponseSchema.extend({
  data: z.object({
    id: z.uuidv4(),
    name: z.string(),
    permission: z.enum(AllAccessControlPermissions),
    subShelfCount: z.int32(),
    itemCount: z.int32(),
    lastAnalyzedAt: z.coerce.date(),
    deletedAt: z.coerce.date().nullable(),
    updatedAt: z.coerce.date(),
    createdAt: z.coerce.date(),
  }),
  embedded: z.object({
    publicId: z.string(),
  }),
});

export type GetMyRootShelfByIdResponse = z.infer<
  typeof GetMyRootShelfByIdResponseSchema
>;

/* ============================== CreateRootShelf ============================== */

export const CreateRootShelfRequestSchema = NotezyRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      csrfToken: z.string().optional(),
    })
    .optional(),
  body: z.object({
    id: z.uuidv4().optional(),
    name: z.string().min(1).max(128),
  }),
});

export type CreateRootShelfRequest = z.infer<
  typeof CreateRootShelfRequestSchema
>;

export const CreateRootShelfResponseSchema = NotezyResponseSchema.extend({
  data: z.object({
    id: z.uuidv4(),
    lastAnalyzedAt: z.coerce.date(),
    createdAt: z.coerce.date(),
  }),
  embedded: z.object({
    publicId: z.string(),
  }),
});

export type CreateRootShelfResponse = z.infer<
  typeof CreateRootShelfResponseSchema
>;

/* ============================== CreateRootShelvesRequest ============================== */

export const CreateRootShelvesRequestSchema = NotezyRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      csrfToken: z.string().optional(),
    })
    .optional(),
  body: z.object({
    createdRootShelves: z
      .array(
        z.object({
          id: z.uuidv4().optional(),
          name: z.string().min(1).max(128),
        })
      )
      .min(1),
  }),
});

export type CreateRootShelvesRequest = z.infer<
  typeof CreateRootShelvesRequestSchema
>;

export const CreateRootShelvesResponseSchema = NotezyResponseSchema.extend({
  data: z.object({
    ids: z.array(z.uuid()),
    lastAnalyzedAt: z.coerce.date(),
    createdAt: z.coerce.date(),
  }),
  embedded: z.object({
    publicId: z.string(),
  }),
});

export type CreateRootShelvesResponse = z.infer<
  typeof CreateRootShelvesResponseSchema
>;

/* ============================== UpsertRootShelfPermission ============================== */

export const UpsertRootShelfPermissionRequestSchema =
  NotezyRequestSchema.extend({
    header: z
      .object({
        userAgent: z.string().min(1).optional(),
        csrfToken: z.string().optional(),
      })
      .optional(),
    param: z.object({
      rootShelfId: z.uuidv4(),
      userPublicId: z.uuidv4(),
    }),
    body: z.object({
      permission: z.enum([
        AccessControlPermission.Admin,
        AccessControlPermission.Write,
        AccessControlPermission.Read,
      ]),
    }),
  });

export type UpsertRootShelfPermissionRequest = z.infer<
  typeof UpsertRootShelfPermissionRequestSchema
>;

export const UpsertRootShelfPermissionResponseSchema =
  NotezyResponseSchema.extend({
    data: z.object({
      userPublicId: z.uuidv4(),
      permission: z.enum([
        AccessControlPermission.Admin,
        AccessControlPermission.Write,
        AccessControlPermission.Read,
      ]),
      updatedAt: z.coerce.date(),
      createdAt: z.coerce.date(),
    }),
  });

export type UpsertRootShelfPermissionResponse = z.infer<
  typeof UpsertRootShelfPermissionResponseSchema
>;

/* ============================== DeleteRootShelfPermissions ============================== */

export const DeleteRootShelfPermissionsRequestSchema =
  NotezyRequestSchema.extend({
    header: z
      .object({
        userAgent: z.string().min(1).optional(),
        csrfToken: z.string().optional(),
      })
      .optional(),
    param: z.object({
      rootShelfId: z.uuidv4(),
    }),
    body: z.object({
      userPublicIds: z.array(z.uuidv4()).min(1).max(1024),
    }),
  });

export type DeleteRootShelfPermissionsRequest = z.infer<
  typeof DeleteRootShelfPermissionsRequestSchema
>;

export const DeleteRootShelfPermissionsResponseSchema =
  NotezyResponseSchema.extend({
    data: z.null(),
  });

export type DeleteRootShelfPermissionsResponse = z.infer<
  typeof DeleteRootShelfPermissionsResponseSchema
>;

/* ============================== Ownership and membership ============================== */

export const TransferMyRootShelfOwnershipRequestSchema =
  NotezyRequestSchema.extend({
    header: z
      .object({
        userAgent: z.string().min(1).optional(),
        csrfToken: z.string().optional(),
      })
      .optional(),
    param: z.object({ rootShelfId: z.uuidv4() }),
    body: z.object({ targetUserPublicId: z.uuidv4() }),
  });
export type TransferMyRootShelfOwnershipRequest = z.infer<
  typeof TransferMyRootShelfOwnershipRequestSchema
>;
export const TransferMyRootShelfOwnershipResponseSchema =
  NotezyResponseSchema.extend({
    data: z.object({
      rootShelfId: z.uuidv4(),
      previousOwnerUserPublicId: z.uuidv4(),
      newOwnerUserPublicId: z.uuidv4(),
      updatedAt: z.coerce.date(),
    }),
  });
export type TransferMyRootShelfOwnershipResponse = z.infer<
  typeof TransferMyRootShelfOwnershipResponseSchema
>;

export const LeaveMyRootShelfRequestSchema = NotezyRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      csrfToken: z.string().optional(),
    })
    .optional(),
  param: z.object({ rootShelfId: z.uuidv4() }),
  body: z
    .object({ targetUserPublicId: z.uuidv4().optional() })
    .optional()
    .default({}),
});
export type LeaveMyRootShelfRequest = z.infer<
  typeof LeaveMyRootShelfRequestSchema
>;
export const LeaveMyRootShelfResponseSchema = NotezyResponseSchema.extend({
  data: z.null(),
});
export type LeaveMyRootShelfResponse = z.infer<
  typeof LeaveMyRootShelfResponseSchema
>;

/* ============================== UpdateMyRootShelfById ============================== */

export const UpdateMyRootShelfByIdRequestSchema = NotezyRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      csrfToken: z.string().optional(),
    })
    .optional(),
  body: z.object({
    rootShelfId: z.uuidv4(),
    values: z
      .object({
        name: z.string().min(1).max(128),
      })
      .partial(),
    setNull: z.record(z.string(), z.boolean()).optional(),
  }),
});

export type UpdateMyRootShelfByIdRequest = z.infer<
  typeof UpdateMyRootShelfByIdRequestSchema
>;

export const UpdateMyRootShelfByIdResponseSchema = NotezyResponseSchema.extend({
  data: z.object({
    updatedAt: z.coerce.date(),
  }),
  embedded: z.object({
    publicId: z.string(),
  }),
});

export type UpdateMyRootShelfByIdResponse = z.infer<
  typeof UpdateMyRootShelfByIdResponseSchema
>;

/* ============================== UpdateMyRootShelvesByIds ============================== */

export const UpdateMyRootShelvesByIdsRequestSchema = NotezyRequestSchema.extend(
  {
    header: z
      .object({
        userAgent: z.string().min(1).optional(),
        csrfToken: z.string().optional(),
      })
      .optional(),
    body: z.object({
      updatedRootShelves: z.array(
        z.object({
          rootShelfId: z.uuidv4(),
          values: z
            .object({
              name: z.string().min(1).max(128),
            })
            .partial(),
          setNull: z.record(z.string(), z.boolean()).optional(),
        })
      ),
    }),
  }
);

export type UpdateMyRootShelvesByIdsRequest = z.infer<
  typeof UpdateMyRootShelvesByIdsRequestSchema
>;

export const UpdateMyRootShelvesByIdsResponseSchema =
  NotezyResponseSchema.extend({
    data: z.object({
      updatedAt: z.coerce.date(),
    }),
    embedded: z.object({
      publicId: z.string(),
    }),
  });

export type UpdateMyRootShelvesByIdsResponse = z.infer<
  typeof UpdateMyRootShelvesByIdsResponseSchema
>;

/* ============================== RestoreMyRootShelfById ============================== */

export const RestoreMyRootShelfByIdRequestSchema = NotezyRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      csrfToken: z.string().optional(),
    })
    .optional(),
  body: z.object({
    rootShelfId: z.uuidv4(),
  }),
});

export type RestoreMyRootShelfByIdRequest = z.infer<
  typeof RestoreMyRootShelfByIdRequestSchema
>;

export const RestoreMyRootShelfByIdResponseSchema = NotezyResponseSchema.extend(
  {
    data: z.object({
      id: z.uuidv4(),
      name: z.string(),
      subShelfCount: z.int32(),
      itemCount: z.int32(),
      lastAnalyzedAt: z.coerce.date(),
      deletedAt: z.coerce.date().nullable(),
      updatedAt: z.coerce.date(),
      createdAt: z.coerce.date(),
    }),
    embedded: z.object({
      publicId: z.string(),
    }),
  }
);

export type RestoreMyRootShelfByIdResponse = z.infer<
  typeof RestoreMyRootShelfByIdResponseSchema
>;

/* ============================== RestoreMyRootShelvesByIds ============================== */

export const RestoreMyRootShelvesByIdsRequestSchema =
  NotezyRequestSchema.extend({
    header: z
      .object({
        userAgent: z.string().min(1).optional(),
        csrfToken: z.string().optional(),
      })
      .optional(),
    body: z.object({
      rootShelfIds: z.array(z.uuidv4()).min(1).max(128),
    }),
  });

export type RestoreMyRootShelvesByIdsRequest = z.infer<
  typeof RestoreMyRootShelvesByIdsRequestSchema
>;

export const RestoreMyRootShelvesByIdsResponseSchema =
  NotezyResponseSchema.extend({
    data: z.array(
      z.object({
        id: z.uuidv4(),
        name: z.string(),
        subShelfCount: z.int32(),
        itemCount: z.int32(),
        lastAnalyzedAt: z.coerce.date(),
        deletedAt: z.coerce.date().nullable(),
        updatedAt: z.coerce.date(),
        createdAt: z.coerce.date(),
      })
    ),
    embedded: z.object({
      publicId: z.string(),
    }),
  });

export type RestoreMyRootShelvesByIdsResponse = z.infer<
  typeof RestoreMyRootShelvesByIdsResponseSchema
>;

/* ============================== DeleteMyRootShelfById ============================== */

export const DeleteMyRootShelfByIdRequestSchema = NotezyRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      csrfToken: z.string().optional(),
    })
    .optional(),
  body: z.object({
    rootShelfId: z.uuidv4(),
  }),
  affected: z.object({
    subShelfIds: z.array(z.uuidv4()),
    materialIds: z.array(z.uuidv4()),
  }),
});

export type DeleteMyRootShelfByIdRequest = z.infer<
  typeof DeleteMyRootShelfByIdRequestSchema
>;

export const DeleteMyRootShelfByIdResponseSchema = NotezyResponseSchema.extend({
  data: z.object({
    deletedAt: z.coerce.date(),
  }),
  embedded: z.object({
    publicId: z.string(),
  }),
});

export type DeleteMyRootShelfByIdResponse = z.infer<
  typeof DeleteMyRootShelfByIdResponseSchema
>;

/* ============================== DeleteMyRootShelvesByIds ============================== */

export const DeleteMyRootShelvesByIdsRequestSchema = NotezyRequestSchema.extend(
  {
    header: z
      .object({
        userAgent: z.string().min(1).optional(),
        csrfToken: z.string().optional(),
      })
      .optional(),
    body: z.object({
      rootShelfIds: z.array(z.uuidv4()).min(1).max(128),
    }),
    affected: z.object({
      subShelfIds: z.array(z.uuidv4()),
      materialIds: z.array(z.uuidv4()),
    }),
  }
);

export type DeleteMyRootShelvesByIdsRequest = z.infer<
  typeof DeleteMyRootShelvesByIdsRequestSchema
>;

export const DeleteMyRootShelvesByIdsResponseSchema =
  NotezyResponseSchema.extend({
    data: z.object({
      deletedAt: z.coerce.date(),
    }),
    embedded: z.object({
      publicId: z.string(),
    }),
  });

export type DeleteMyRootShelvesByIdsResponse = z.infer<
  typeof DeleteMyRootShelvesByIdsResponseSchema
>;
