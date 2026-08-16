import { NotegicFetchError } from "@shared/api/exceptions/errors/fetch.error";
import { NotegicValidationError } from "@shared/api/exceptions/errors/validation.error";
import { NotegicAPIError } from "@shared/api/exceptions";
import { FetchClientExceptions } from "@shared/api/exceptions/client/fetch.exception";
import { ValidationClientException } from "@shared/api/exceptions/client/validation.exception";
import {
  CreateRootShelf,
  CreateRootShelves,
  DeleteRootShelfPermissions,
  DeleteMyRootShelfById,
  DeleteMyRootShelvesByIds,
  GetMyRootShelfById,
  RestoreMyRootShelfById,
  RestoreMyRootShelvesByIds,
  UpdateMyRootShelfById,
  UpdateMyRootShelvesByIds,
  UpsertRootShelfPermission,
  LeaveMyRootShelf,
  TransferMyRootShelfOwnership,
} from "@shared/api/functions/rootShelf.serverFn";
import {
  type CreateRootShelfRequest,
  CreateRootShelfRequestSchema,
  type CreateRootShelfResponse,
  CreateRootShelfResponseSchema,
  type CreateRootShelvesRequest,
  CreateRootShelvesRequestSchema,
  type CreateRootShelvesResponse,
  CreateRootShelvesResponseSchema,
  type DeleteRootShelfPermissionsRequest,
  DeleteRootShelfPermissionsRequestSchema,
  type DeleteRootShelfPermissionsResponse,
  DeleteRootShelfPermissionsResponseSchema,
  type DeleteMyRootShelfByIdRequest,
  DeleteMyRootShelfByIdRequestSchema,
  type DeleteMyRootShelfByIdResponse,
  DeleteMyRootShelfByIdResponseSchema,
  type DeleteMyRootShelvesByIdsRequest,
  DeleteMyRootShelvesByIdsRequestSchema,
  type DeleteMyRootShelvesByIdsResponse,
  DeleteMyRootShelvesByIdsResponseSchema,
  type GetMyRootShelfByIdRequest,
  GetMyRootShelfByIdRequestSchema,
  type GetMyRootShelfByIdResponse,
  GetMyRootShelfByIdResponseSchema,
  type RestoreMyRootShelfByIdRequest,
  RestoreMyRootShelfByIdRequestSchema,
  type RestoreMyRootShelfByIdResponse,
  RestoreMyRootShelfByIdResponseSchema,
  type RestoreMyRootShelvesByIdsRequest,
  RestoreMyRootShelvesByIdsRequestSchema,
  type RestoreMyRootShelvesByIdsResponse,
  RestoreMyRootShelvesByIdsResponseSchema,
  type UpdateMyRootShelfByIdRequest,
  UpdateMyRootShelfByIdRequestSchema,
  type UpdateMyRootShelfByIdResponse,
  UpdateMyRootShelfByIdResponseSchema,
  type UpdateMyRootShelvesByIdsRequest,
  UpdateMyRootShelvesByIdsRequestSchema,
  type UpdateMyRootShelvesByIdsResponse,
  UpdateMyRootShelvesByIdsResponseSchema,
  type UpsertRootShelfPermissionRequest,
  UpsertRootShelfPermissionRequestSchema,
  type UpsertRootShelfPermissionResponse,
  UpsertRootShelfPermissionResponseSchema,
  type LeaveMyRootShelfRequest,
  LeaveMyRootShelfRequestSchema,
  type LeaveMyRootShelfResponse,
  LeaveMyRootShelfResponseSchema,
  type TransferMyRootShelfOwnershipRequest,
  TransferMyRootShelfOwnershipRequestSchema,
  type TransferMyRootShelfOwnershipResponse,
  TransferMyRootShelfOwnershipResponseSchema,
} from "@shared/api/interfaces/rootShelf.interface";
import { ZodError } from "zod";

export const queryFnGetMyRootShelfById = async (
  request: GetMyRootShelfByIdRequest
): Promise<GetMyRootShelfByIdResponse> => {
  try {
    const validatedRequest = GetMyRootShelfByIdRequestSchema.parse(request);
    const response = await GetMyRootShelfById({
      data: validatedRequest,
    });
    return GetMyRootShelfByIdResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in queryFnGetMyRootShelfById", error);
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
      throw new NotegicFetchError(
        FetchClientExceptions.MissingNetwork()
      ).removePresentation();
    }
    throw error;
  }
};

export const mutationFnCreateRootShelf = async (
  request: CreateRootShelfRequest
): Promise<CreateRootShelfResponse> => {
  try {
    const validatedRequest = CreateRootShelfRequestSchema.parse(request);
    const response = await CreateRootShelf({ data: validatedRequest });
    return CreateRootShelfResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnCreateRootShelf", error);
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

export const mutationFnCreateRootShelves = async (
  request: CreateRootShelvesRequest
): Promise<CreateRootShelvesResponse> => {
  try {
    const validatedRequest = CreateRootShelvesRequestSchema.parse(request);
    const response = await CreateRootShelves({
      data: validatedRequest,
    });
    return CreateRootShelvesResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnCreateRootShelves", error);
    if (error instanceof ZodError) {
      throw new NotegicValidationError(
        ValidationClientException.ZodParsingFailed(error)
      );
    } else if (error instanceof NotegicAPIError) {
      switch (error.unWrap.reason) {
      }
    } else if (error instanceof TypeError) {
      throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
    }
    throw error;
  }
};

export const mutationFnUpdateMyRootShelfById = async (
  request: UpdateMyRootShelfByIdRequest
): Promise<UpdateMyRootShelfByIdResponse> => {
  try {
    const validatedRequest = UpdateMyRootShelfByIdRequestSchema.parse(request);
    const response = await UpdateMyRootShelfById({
      data: validatedRequest,
    });
    return UpdateMyRootShelfByIdResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnUpdateMyRootShelfById", error);
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

export const mutationFnUpsertRootShelfPermission = async (
  request: UpsertRootShelfPermissionRequest
): Promise<UpsertRootShelfPermissionResponse> => {
  try {
    const validatedRequest =
      UpsertRootShelfPermissionRequestSchema.parse(request);
    const response = await UpsertRootShelfPermission({
      data: validatedRequest,
    });
    return UpsertRootShelfPermissionResponseSchema.parse(response);
  } catch (error) {
    console.error(
      "error happening in mutationFnUpsertRootShelfPermission",
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

export const mutationFnDeleteRootShelfPermissions = async (
  request: DeleteRootShelfPermissionsRequest
): Promise<DeleteRootShelfPermissionsResponse> => {
  try {
    const validatedRequest =
      DeleteRootShelfPermissionsRequestSchema.parse(request);
    const response = await DeleteRootShelfPermissions({
      data: validatedRequest,
    });
    return DeleteRootShelfPermissionsResponseSchema.parse(response);
  } catch (error) {
    console.error(
      "error happening in mutationFnDeleteRootShelfPermissions",
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

export const mutationFnTransferMyRootShelfOwnership = async (
  request: TransferMyRootShelfOwnershipRequest
): Promise<TransferMyRootShelfOwnershipResponse> => {
  try {
    const response = await TransferMyRootShelfOwnership({
      data: TransferMyRootShelfOwnershipRequestSchema.parse(request),
    });
    return TransferMyRootShelfOwnershipResponseSchema.parse(response);
  } catch (error) {
    if (error instanceof ZodError)
      throw new NotegicValidationError(
        ValidationClientException.ZodParsingFailed(error)
      );
    if (error instanceof TypeError)
      throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
    throw error;
  }
};

export const mutationFnLeaveMyRootShelf = async (
  request: LeaveMyRootShelfRequest
): Promise<LeaveMyRootShelfResponse> => {
  try {
    const response = await LeaveMyRootShelf({
      data: LeaveMyRootShelfRequestSchema.parse(request),
    });
    return LeaveMyRootShelfResponseSchema.parse(response);
  } catch (error) {
    if (error instanceof ZodError)
      throw new NotegicValidationError(
        ValidationClientException.ZodParsingFailed(error)
      );
    if (error instanceof TypeError)
      throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
    throw error;
  }
};

export const mutationFnUpdateMyRootShelvesByIds = async (
  request: UpdateMyRootShelvesByIdsRequest
): Promise<UpdateMyRootShelvesByIdsResponse> => {
  try {
    const validatedRequest =
      UpdateMyRootShelvesByIdsRequestSchema.parse(request);
    const response = await UpdateMyRootShelvesByIds({
      data: validatedRequest,
    });
    return UpdateMyRootShelvesByIdsResponseSchema.parse(response);
  } catch (error) {
    console.error(
      "error happening in mutationFnUpdateMyRootShelvesByIds",
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

export const mutationFnRestoreMyRootShelfById = async (
  request: RestoreMyRootShelfByIdRequest
): Promise<RestoreMyRootShelfByIdResponse> => {
  try {
    const validatedRequest = RestoreMyRootShelfByIdRequestSchema.parse(request);
    const response = await RestoreMyRootShelfById({
      data: validatedRequest,
    });
    return RestoreMyRootShelfByIdResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnRestoreMyRootShelfById", error);
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

export const mutationFnRestoreMyRootShelvesByIds = async (
  request: RestoreMyRootShelvesByIdsRequest
): Promise<RestoreMyRootShelvesByIdsResponse> => {
  try {
    const validatedRequest =
      RestoreMyRootShelvesByIdsRequestSchema.parse(request);
    const response = await RestoreMyRootShelvesByIds({
      data: validatedRequest,
    });
    return RestoreMyRootShelvesByIdsResponseSchema.parse(response);
  } catch (error) {
    console.error(
      "error happening in mutationFnRestoreMyRootShelvesByIds",
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

export const mutationFnDeleteMyRootShelfById = async (
  request: DeleteMyRootShelfByIdRequest
): Promise<DeleteMyRootShelfByIdResponse> => {
  try {
    const validatedRequest = DeleteMyRootShelfByIdRequestSchema.parse(request);
    const response = await DeleteMyRootShelfById({
      data: validatedRequest,
    });
    return DeleteMyRootShelfByIdResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnDeleteMyRootShelfById", error);
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

export const mutationFnDeleteMyRootShelvesByIds = async (
  request: DeleteMyRootShelvesByIdsRequest
): Promise<DeleteMyRootShelvesByIdsResponse> => {
  try {
    const validatedRequest =
      DeleteMyRootShelvesByIdsRequestSchema.parse(request);
    const response = await DeleteMyRootShelvesByIds({
      data: validatedRequest,
    });
    return DeleteMyRootShelvesByIdsResponseSchema.parse(response);
  } catch (error) {
    console.error(
      "error happening in mutationFnDeleteMyRootShelvesByIds",
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
