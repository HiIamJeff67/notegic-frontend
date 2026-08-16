import { NotegicFetchError } from "@shared/api/exceptions/errors/fetch.error";
import { NotegicValidationError } from "@shared/api/exceptions/errors/validation.error";
import { NotegicAPIError } from "@shared/api/exceptions";
import { FetchClientExceptions } from "@shared/api/exceptions/client/fetch.exception";
import { ValidationClientException } from "@shared/api/exceptions/client/validation.exception";
import {
  CreateMyMaterial,
  DeleteMyMaterialById,
  DeleteMyMaterialsByIds,
  GetAllMyMaterialsByRootShelfId,
  GetMyMaterialAndItsParentById,
  GetMyMaterialById,
  GetMyMaterialsByParentSubShelfId,
  MoveMyMaterialById,
  RestoreMyMaterialById,
  RestoreMyMaterialsByIds,
  UpdateMyMaterialById,
} from "@shared/api/functions/material.serverFn";
import {
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
  type GetAllMyMaterialsByRootShelfIdRequest,
  GetAllMyMaterialsByRootShelfIdRequestSchema,
  type GetAllMyMaterialsByRootShelfIdResponse,
  GetAllMyMaterialsByRootShelfIdResponseSchema,
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
  type MoveMyMaterialByIdRequest,
  MoveMyMaterialByIdRequestSchema,
  type MoveMyMaterialByIdResponse,
  MoveMyMaterialByIdResponseSchema,
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
import { ZodError } from "zod";

export const queryFnGetMyMaterialById = async (
  request: GetMyMaterialByIdRequest
): Promise<GetMyMaterialByIdResponse> => {
  try {
    const validatedRequest = GetMyMaterialByIdRequestSchema.parse(request);
    const response = await GetMyMaterialById({
      data: validatedRequest,
    });
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
  request: GetMyMaterialAndItsParentByIdRequest
): Promise<GetMyMaterialAndItsParentByIdResponse> => {
  try {
    const validatedRequest =
      GetMyMaterialAndItsParentByIdRequestSchema.parse(request);
    const response = await GetMyMaterialAndItsParentById({
      data: validatedRequest,
    });
    return GetMyMaterialAndItsParentByIdResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in queryFnGetMyMaterialAndItsParentById", error);
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
  request: GetMyMaterialsByParentSubShelfIdRequest
): Promise<GetMyMaterialsByParentSubShelfIdResponse> => {
  try {
    const validatedRequest =
      GetMyMaterialsByParentSubShelfIdRequestSchema.parse(request);
    const response = await GetMyMaterialsByParentSubShelfId({
      data: validatedRequest,
    });
    return GetMyMaterialsByParentSubShelfIdResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in queryFnGetMyMaterialsByParentSubShelfId", error);
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

export const queryFnGetAllMyMaterialsByRootShelfId = async (
  request: GetAllMyMaterialsByRootShelfIdRequest
): Promise<GetAllMyMaterialsByRootShelfIdResponse> => {
  try {
    const validatedRequest =
      GetAllMyMaterialsByRootShelfIdRequestSchema.parse(request);
    const response = await GetAllMyMaterialsByRootShelfId({
      data: validatedRequest,
    });
    return GetAllMyMaterialsByRootShelfIdResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in queryFnGetAllMyMaterialsByRootShelfId", error);
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
  request: CreateMyMaterialRequest
): Promise<CreateMyMaterialResponse> => {
  try {
    const validatedRequest = CreateMyMaterialRequestSchema.parse(request);
    const response = await CreateMyMaterial({
      data: validatedRequest,
    });
    return CreateMyMaterialResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnCreateMyMaterial", error);
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

export const mutationFnUpdateMyMaterialById = async (
  request: UpdateMyMaterialByIdRequest
): Promise<UpdateMyMaterialByIdResponse> => {
  try {
    const validatedRequest = UpdateMyMaterialByIdRequestSchema.parse(request);
    const response = await UpdateMyMaterialById({
      data: validatedRequest,
    });
    return UpdateMyMaterialByIdResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnUpdateMyMaterialById", error);
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

export const mutationFnMoveMyMaterialById = async (
  request: MoveMyMaterialByIdRequest
): Promise<MoveMyMaterialByIdResponse> => {
  try {
    const validatedRequest = MoveMyMaterialByIdRequestSchema.parse(request);
    const response = await MoveMyMaterialById({
      data: validatedRequest,
    });
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
  request: RestoreMyMaterialByIdRequest
): Promise<RestoreMyMaterialByIdResponse> => {
  try {
    const validatedRequest = RestoreMyMaterialByIdRequestSchema.parse(request);
    const response = await RestoreMyMaterialById({
      data: validatedRequest,
    });
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
  request: RestoreMyMaterialsByIdsRequest
): Promise<RestoreMyMaterialsByIdsResponse> => {
  try {
    const validatedRequest =
      RestoreMyMaterialsByIdsRequestSchema.parse(request);
    const response = await RestoreMyMaterialsByIds({
      data: validatedRequest,
    });
    return RestoreMyMaterialsByIdsResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnRestoreMyMaterialsByIds", error);
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
  request: DeleteMyMaterialByIdRequest
): Promise<DeleteMyMaterialByIdResponse> => {
  try {
    const validatedRequest = DeleteMyMaterialByIdRequestSchema.parse(request);
    const response = await DeleteMyMaterialById({
      data: validatedRequest,
    });
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
  request: DeleteMyMaterialsByIdsRequest
): Promise<DeleteMyMaterialsByIdsResponse> => {
  try {
    const validatedRequest = DeleteMyMaterialsByIdsRequestSchema.parse(request);
    const response = await DeleteMyMaterialsByIds({
      data: validatedRequest,
    });
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
