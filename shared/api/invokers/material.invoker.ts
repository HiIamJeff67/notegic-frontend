import { NotegicAPIError } from "@shared/api/exceptions";
import { FetchClientExceptions } from "@shared/api/exceptions/client/fetch.exception";
import { ValidationClientException } from "@shared/api/exceptions/client/validation.exception";
import { NotegicFetchError } from "@shared/api/exceptions/errors/fetch.error";
import { NotegicValidationError } from "@shared/api/exceptions/errors/validation.error";
import {
  type CreateMaterialObjectTicketRequest,
  CreateMaterialObjectTicketRequestSchema,
  type CreateMaterialObjectTicketResponse,
  CreateMaterialObjectTicketResponseSchema,
  type CreateMyMaterialRequest,
  CreateMyMaterialRequestSchema,
  type CreateMyMaterialResponse,
  CreateMyMaterialResponseSchema,
  type DeleteMyMaterialByIdRequest,
  DeleteMyMaterialByIdRequestSchema,
  type DeleteMyMaterialByIdResponse,
  DeleteMyMaterialByIdResponseSchema,
  type DeleteMyMaterialsByIdsRequest,
  DeleteMyMaterialsByIdsRequestSchema,
  type DeleteMyMaterialsByIdsResponse,
  DeleteMyMaterialsByIdsResponseSchema,
  type GetMyMaterialAndItsParentByIdRequest,
  GetMyMaterialAndItsParentByIdRequestSchema,
  type GetMyMaterialAndItsParentByIdResponse,
  GetMyMaterialAndItsParentByIdResponseSchema,
  type GetMyMaterialByIdRequest,
  GetMyMaterialByIdRequestSchema,
  type GetMyMaterialByIdResponse,
  GetMyMaterialByIdResponseSchema,
  type GetMyMaterialsByParentSubShelfIdRequest,
  GetMyMaterialsByParentSubShelfIdRequestSchema,
  type GetMyMaterialsByParentSubShelfIdResponse,
  GetMyMaterialsByParentSubShelfIdResponseSchema,
  type GetMyMaterialsByRootShelfIdRequest,
  GetMyMaterialsByRootShelfIdRequestSchema,
  type GetMyMaterialsByRootShelfIdResponse,
  GetMyMaterialsByRootShelfIdResponseSchema,
  type HardDeleteMyMaterialsByIdsRequest,
  HardDeleteMyMaterialsByIdsRequestSchema,
  type HardDeleteMyMaterialsByIdsResponse,
  HardDeleteMyMaterialsByIdsResponseSchema,
  type MoveMyMaterialByIdRequest,
  MoveMyMaterialByIdRequestSchema,
  type MoveMyMaterialByIdResponse,
  MoveMyMaterialByIdResponseSchema,
  type ResolveMaterialObjectTicketRequest,
  ResolveMaterialObjectTicketRequestSchema,
  type ResolveMaterialObjectTicketResponse,
  ResolveMaterialObjectTicketResponseSchema,
  type RestoreMyMaterialByIdRequest,
  RestoreMyMaterialByIdRequestSchema,
  type RestoreMyMaterialByIdResponse,
  RestoreMyMaterialByIdResponseSchema,
  type RestoreMyMaterialsByIdsRequest,
  RestoreMyMaterialsByIdsRequestSchema,
  type RestoreMyMaterialsByIdsResponse,
  RestoreMyMaterialsByIdsResponseSchema,
  type UpdateMyMaterialByIdRequest,
  UpdateMyMaterialByIdRequestSchema,
  type UpdateMyMaterialByIdResponse,
  UpdateMyMaterialByIdResponseSchema,
} from "@shared/api/interfaces/material.interface";
import { parse } from "@shared/api/validation";
import { ZodError } from "zod";

const parseMaterialObjectTicketError = (error: unknown): never => {
  if (error instanceof ZodError) {
    throw new NotegicValidationError(
      ValidationClientException.ZodParsingFailed(error)
    );
  }
  if (error instanceof NotegicAPIError) throw error;
  if (error instanceof TypeError) {
    throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
  }
  throw error;
};

export const queryFnGetMyMaterialById = async (
  request: GetMyMaterialByIdRequest,
  func: (
    request: GetMyMaterialByIdRequest
  ) => Promise<GetMyMaterialByIdResponse>
): Promise<GetMyMaterialByIdResponse> => {
  try {
    const validatedRequest = GetMyMaterialByIdRequestSchema.parse(request);
    const response = await func(validatedRequest);
    return GetMyMaterialByIdResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in queryFnGetMyMaterialById", error);
    if (error instanceof ZodError) {
      throw new NotegicValidationError(
        ValidationClientException.ZodParsingFailed(error)
      );
    } else if (error instanceof NotegicAPIError) {
      switch (error.unWrap.reason) {
        default:
          throw error;
      }
    } else if (error instanceof TypeError) {
      throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
    }
    throw error;
  }
};

export const queryFnGetMyMaterialAndItsParentById = async (
  request: GetMyMaterialAndItsParentByIdRequest,
  func: (
    request: GetMyMaterialAndItsParentByIdRequest
  ) => Promise<GetMyMaterialAndItsParentByIdResponse>
): Promise<GetMyMaterialAndItsParentByIdResponse> => {
  try {
    const validatedRequest =
      GetMyMaterialAndItsParentByIdRequestSchema.parse(request);
    const response = await func(validatedRequest);
    return GetMyMaterialAndItsParentByIdResponseSchema.parse(response);
  } catch (error) {
    console.error(
      "error happening in queryFnGetMyMaterialAndItsParentById",
      error
    );
    if (error instanceof ZodError) {
      throw new NotegicValidationError(
        ValidationClientException.ZodParsingFailed(error)
      );
    } else if (error instanceof NotegicAPIError) {
      switch (error.unWrap.reason) {
        default:
          throw error;
      }
    } else if (error instanceof TypeError) {
      throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
    }
    throw error;
  }
};

export const queryFnGetMyMaterialsByParentSubShelfId = async (
  request: GetMyMaterialsByParentSubShelfIdRequest,
  func: (
    request: GetMyMaterialsByParentSubShelfIdRequest
  ) => Promise<GetMyMaterialsByParentSubShelfIdResponse>
): Promise<GetMyMaterialsByParentSubShelfIdResponse> => {
  try {
    const validatedRequest =
      GetMyMaterialsByParentSubShelfIdRequestSchema.parse(request);
    const response = await func(validatedRequest);
    return GetMyMaterialsByParentSubShelfIdResponseSchema.parse(response);
  } catch (error) {
    console.error(
      "error happening in queryFnGetMyMaterialsByParentSubShelfId",
      error
    );
    if (error instanceof ZodError) {
      throw new NotegicValidationError(
        ValidationClientException.ZodParsingFailed(error)
      );
    } else if (error instanceof NotegicAPIError) {
      switch (error.unWrap.reason) {
        default:
          throw error;
      }
    } else if (error instanceof TypeError) {
      throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
    }
    throw error;
  }
};

export const queryFnGetMyMaterialsByRootShelfId = async (
  request: GetMyMaterialsByRootShelfIdRequest,
  func: (
    request: GetMyMaterialsByRootShelfIdRequest
  ) => Promise<GetMyMaterialsByRootShelfIdResponse>
): Promise<GetMyMaterialsByRootShelfIdResponse> => {
  try {
    const validatedRequest =
      GetMyMaterialsByRootShelfIdRequestSchema.parse(request);
    const response = await func(validatedRequest);
    return GetMyMaterialsByRootShelfIdResponseSchema.parse(response);
  } catch (error) {
    console.error(
      "error happening in queryFnGetMyMaterialsByRootShelfId",
      error
    );
    if (error instanceof ZodError) {
      throw new NotegicValidationError(
        ValidationClientException.ZodParsingFailed(error)
      );
    } else if (error instanceof NotegicAPIError) {
      switch (error.unWrap.reason) {
        default:
          throw error;
      }
    } else if (error instanceof TypeError) {
      throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
    }
    throw error;
  }
};

export const mutationFnCreateMyMaterial = async (
  request: CreateMyMaterialRequest,
  func: (request: CreateMyMaterialRequest) => Promise<CreateMyMaterialResponse>
): Promise<CreateMyMaterialResponse> => {
  const validatedRequest = parse(CreateMyMaterialRequestSchema, request);
  try {
    const response = await func(validatedRequest);
    return CreateMyMaterialResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnCreateMyMaterial", error);
    if (error instanceof ZodError) {
      throw new NotegicValidationError(
        ValidationClientException.ZodParsingFailed(error)
      ).setPresentation("validation.invalidResponse");
    } else if (error instanceof NotegicAPIError) {
      switch (error.unWrap.reason) {
        default:
          throw error;
      }
    } else if (error instanceof TypeError) {
      throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
    }
    throw error;
  }
};

export const mutationFnUpdateMyMaterialById = async (
  request: UpdateMyMaterialByIdRequest,
  func: (
    request: UpdateMyMaterialByIdRequest
  ) => Promise<UpdateMyMaterialByIdResponse>
): Promise<UpdateMyMaterialByIdResponse> => {
  const validatedRequest = parse(UpdateMyMaterialByIdRequestSchema, request);
  try {
    const response = await func(validatedRequest);
    return UpdateMyMaterialByIdResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnUpdateMyMaterialById", error);
    if (error instanceof ZodError) {
      throw new NotegicValidationError(
        ValidationClientException.ZodParsingFailed(error)
      ).setPresentation("validation.invalidResponse");
    } else if (error instanceof NotegicAPIError) {
      switch (error.unWrap.reason) {
        default:
          throw error;
      }
    } else if (error instanceof TypeError) {
      throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
    }
    throw error;
  }
};

export const mutationFnMoveMyMaterialById = async (
  request: MoveMyMaterialByIdRequest,
  func: (
    request: MoveMyMaterialByIdRequest
  ) => Promise<MoveMyMaterialByIdResponse>
): Promise<MoveMyMaterialByIdResponse> => {
  try {
    const validatedRequest = MoveMyMaterialByIdRequestSchema.parse(request);
    const response = await func(validatedRequest);
    return MoveMyMaterialByIdResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnMoveMyMaterialById", error);
    if (error instanceof ZodError) {
      throw new NotegicValidationError(
        ValidationClientException.ZodParsingFailed(error)
      );
    } else if (error instanceof NotegicAPIError) {
      switch (error.unWrap.reason) {
        default:
          throw error;
      }
    } else if (error instanceof TypeError) {
      throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
    }
    throw error;
  }
};

export const mutationFnRestoreMyMaterialById = async (
  request: RestoreMyMaterialByIdRequest,
  func: (
    request: RestoreMyMaterialByIdRequest
  ) => Promise<RestoreMyMaterialByIdResponse>
): Promise<RestoreMyMaterialByIdResponse> => {
  try {
    const validatedRequest = RestoreMyMaterialByIdRequestSchema.parse(request);
    const response = await func(validatedRequest);
    return RestoreMyMaterialByIdResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnRestoreMyMaterialById", error);
    if (error instanceof ZodError) {
      throw new NotegicValidationError(
        ValidationClientException.ZodParsingFailed(error)
      );
    } else if (error instanceof NotegicAPIError) {
      switch (error.unWrap.reason) {
        default:
          throw error;
      }
    } else if (error instanceof TypeError) {
      throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
    }
    throw error;
  }
};

export const mutationFnRestoreMyMaterialsByIds = async (
  request: RestoreMyMaterialsByIdsRequest,
  func: (
    request: RestoreMyMaterialsByIdsRequest
  ) => Promise<RestoreMyMaterialsByIdsResponse>
): Promise<RestoreMyMaterialsByIdsResponse> => {
  try {
    const validatedRequest =
      RestoreMyMaterialsByIdsRequestSchema.parse(request);
    const response = await func(validatedRequest);
    return RestoreMyMaterialsByIdsResponseSchema.parse(response);
  } catch (error) {
    console.error(
      "error happening in mutationFnRestoreMyMaterialsByIds",
      error
    );
    if (error instanceof ZodError) {
      throw new NotegicValidationError(
        ValidationClientException.ZodParsingFailed(error)
      );
    } else if (error instanceof NotegicAPIError) {
      switch (error.unWrap.reason) {
        default:
          throw error;
      }
    } else if (error instanceof TypeError) {
      throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
    }
    throw error;
  }
};

export const mutationFnDeleteMyMaterialById = async (
  request: DeleteMyMaterialByIdRequest,
  func: (
    request: DeleteMyMaterialByIdRequest
  ) => Promise<DeleteMyMaterialByIdResponse>
): Promise<DeleteMyMaterialByIdResponse> => {
  try {
    const validatedRequest = DeleteMyMaterialByIdRequestSchema.parse(request);
    const response = await func(validatedRequest);
    return DeleteMyMaterialByIdResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnDeleteMyMaterialById", error);
    if (error instanceof ZodError) {
      throw new NotegicValidationError(
        ValidationClientException.ZodParsingFailed(error)
      );
    } else if (error instanceof NotegicAPIError) {
      switch (error.unWrap.reason) {
        default:
          throw error;
      }
    } else if (error instanceof TypeError) {
      throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
    }
    throw error;
  }
};

export const mutationFnDeleteMyMaterialsByIds = async (
  request: DeleteMyMaterialsByIdsRequest,
  func: (
    request: DeleteMyMaterialsByIdsRequest
  ) => Promise<DeleteMyMaterialsByIdsResponse>
): Promise<DeleteMyMaterialsByIdsResponse> => {
  try {
    const validatedRequest = DeleteMyMaterialsByIdsRequestSchema.parse(request);
    const response = await func(validatedRequest);
    return DeleteMyMaterialsByIdsResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnDeleteMyMaterialsByIds", error);
    if (error instanceof ZodError) {
      throw new NotegicValidationError(
        ValidationClientException.ZodParsingFailed(error)
      );
    } else if (error instanceof NotegicAPIError) {
      switch (error.unWrap.reason) {
        default:
          throw error;
      }
    } else if (error instanceof TypeError) {
      throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
    }
    throw error;
  }
};

export const mutationFnCreateMaterialObjectTicket = async (
  request: CreateMaterialObjectTicketRequest,
  func: (
    request: CreateMaterialObjectTicketRequest
  ) => Promise<CreateMaterialObjectTicketResponse>
): Promise<CreateMaterialObjectTicketResponse> => {
  try {
    const response = await func(
      CreateMaterialObjectTicketRequestSchema.parse(request)
    );
    return CreateMaterialObjectTicketResponseSchema.parse(response);
  } catch (error) {
    return parseMaterialObjectTicketError(error);
  }
};

export const queryFnResolveMaterialObjectTicket = async (
  request: ResolveMaterialObjectTicketRequest,
  func: (
    request: ResolveMaterialObjectTicketRequest
  ) => Promise<ResolveMaterialObjectTicketResponse>
): Promise<ResolveMaterialObjectTicketResponse> => {
  try {
    const response = await func(
      ResolveMaterialObjectTicketRequestSchema.parse(request)
    );
    return ResolveMaterialObjectTicketResponseSchema.parse(response);
  } catch (error) {
    return parseMaterialObjectTicketError(error);
  }
};

export const mutationFnHardDeleteMyMaterialsByIds = async (
  request: HardDeleteMyMaterialsByIdsRequest,
  func: (
    request: HardDeleteMyMaterialsByIdsRequest
  ) => Promise<HardDeleteMyMaterialsByIdsResponse>
): Promise<HardDeleteMyMaterialsByIdsResponse> => {
  try {
    const validatedRequest =
      HardDeleteMyMaterialsByIdsRequestSchema.parse(request);
    const response = await func(validatedRequest);
    return HardDeleteMyMaterialsByIdsResponseSchema.parse(response);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new NotegicValidationError(
        ValidationClientException.ZodParsingFailed(error)
      );
    }
    if (error instanceof TypeError) {
      throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
    }
    throw error;
  }
};
