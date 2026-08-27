import {
  NotegicRequestSchema,
  NotegicResponseSchema,
} from "@shared/api/interfaces/context.interface";
import { z } from "zod";

export const PrivateBlockSchema = z.object({
  id: z.uuidv4(),
  blockPackId: z.uuidv4(),
  parentBlockId: z.uuidv4().nullable(),
  prevBlockId: z.uuidv4().nullable(),
  nextBlockId: z.uuidv4().nullable(),
  type: z.string(),
  props: z.any(),
  content: z.any(),
  updatedAt: z.coerce.date(),
  createdAt: z.coerce.date(),
});

export type PrivateBlock = z.infer<typeof PrivateBlockSchema>;

/* ============================== GetMyBlockById ============================== */

export const GetMyBlockByIdRequestSchema = NotegicRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      csrfToken: z.string().optional(),
    })
    .optional(),
  param: z.object({
    blockId: z.uuidv4(),
  }),
});

export type GetMyBlockByIdRequest = z.infer<typeof GetMyBlockByIdRequestSchema>;

export const GetMyBlockByIdResponseSchema = NotegicResponseSchema.extend({
  data: PrivateBlockSchema,
  embedded: z.object({
    publicId: z.string(),
  }),
});

export type GetMyBlockByIdResponse = z.infer<
  typeof GetMyBlockByIdResponseSchema
>;

/* ============================== GetMyBlocksByIds ============================== */

export const GetMyBlocksByIdsRequestSchema = NotegicRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      csrfToken: z.string().optional(),
    })
    .optional(),
  param: z.object({
    blockIds: z.array(z.uuidv4()),
  }),
});

export type GetMyBlocksByIdsRequest = z.infer<
  typeof GetMyBlocksByIdsRequestSchema
>;

export const GetMyBlocksByIdsResponseSchema = NotegicResponseSchema.extend({
  data: z.array(PrivateBlockSchema),
  embedded: z.object({
    publicId: z.string(),
  }),
});

export type GetMyBlocksByIdsResponse = z.infer<
  typeof GetMyBlocksByIdsResponseSchema
>;

/* ============================== GetMyBlocksByBlockPackId ============================== */

export const GetMyBlocksByBlockPackIdRequestSchema =
  NotegicRequestSchema.extend({
    header: z
      .object({
        userAgent: z.string().min(1).optional(),
        csrfToken: z.string().optional(),
      })
      .optional(),
    param: z.object({
      blockPackId: z.uuidv4(),
    }),
  });

export type GetMyBlocksByBlockPackIdRequest = z.infer<
  typeof GetMyBlocksByBlockPackIdRequestSchema
>;

export const GetMyBlocksByBlockPackIdResponseSchema =
  NotegicResponseSchema.extend({
    data: z.array(PrivateBlockSchema),
    embedded: z.object({
      publicId: z.string(),
    }),
  });

export type GetMyBlocksByBlockPackIdResponse = z.infer<
  typeof GetMyBlocksByBlockPackIdResponseSchema
>;
