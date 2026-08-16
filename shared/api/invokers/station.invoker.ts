import { NotegicFetchError } from "@shared/api/exceptions/errors/fetch.error";
import { NotegicValidationError } from "@shared/api/exceptions/errors/validation.error";
import { NotegicAPIError } from "@shared/api/exceptions";
import { FetchClientExceptions } from "@shared/api/exceptions/client/fetch.exception";
import { ValidationClientException } from "@shared/api/exceptions/client/validation.exception";
import {
  CreateStation,
  CreateStations,
  DeleteMyStationById,
  DeleteMyStationsByIds,
  GetAllMyStations,
  GetMyStationById,
  HardDeleteMyStationById,
  HardDeleteMyStationsByIds,
  RestoreMyStationById,
  RestoreMyStationsByIds,
  UpdateMyStationById,
  UpdateMyStationsByIds,
  VisualizeMyTotalCount,
  LeaveMyStation,
  TransferMyStationOwnership,
} from "@shared/api/functions/station.serverFn";
import {
  CreateStationRequest,
  CreateStationRequestSchema,
  CreateStationResponse,
  CreateStationResponseSchema,
  CreateStationsRequest,
  CreateStationsRequestSchema,
  CreateStationsResponse,
  CreateStationsResponseSchema,
  DeleteMyStationByIdRequest,
  DeleteMyStationByIdRequestSchema,
  DeleteMyStationByIdResponse,
  DeleteMyStationByIdResponseSchema,
  DeleteMyStationsByIdsRequest,
  DeleteMyStationsByIdsRequestSchema,
  DeleteMyStationsByIdsResponse,
  DeleteMyStationsByIdsResponseSchema,
  GetAllMyStationsRequest,
  GetAllMyStationsRequestSchema,
  GetAllMyStationsResponse,
  GetAllMyStationsResponseSchema,
  GetMyStationByIdRequest,
  GetMyStationByIdRequestSchema,
  GetMyStationByIdResponse,
  GetMyStationByIdResponseSchema,
  HardDeleteMyStationByIdRequest,
  HardDeleteMyStationByIdRequestSchema,
  HardDeleteMyStationByIdResponse,
  HardDeleteMyStationByIdResponseSchema,
  HardDeleteMyStationsByIdsRequest,
  HardDeleteMyStationsByIdsRequestSchema,
  HardDeleteMyStationsByIdsResponse,
  HardDeleteMyStationsByIdsResponseSchema,
  RestoreMyStationByIdRequest,
  RestoreMyStationByIdRequestSchema,
  RestoreMyStationByIdResponse,
  RestoreMyStationByIdResponseSchema,
  RestoreMyStationsByIdsRequest,
  RestoreMyStationsByIdsRequestSchema,
  RestoreMyStationsByIdsResponse,
  RestoreMyStationsByIdsResponseSchema,
  UpdateMyStationByIdRequest,
  UpdateMyStationByIdRequestSchema,
  UpdateMyStationByIdResponse,
  UpdateMyStationByIdResponseSchema,
  UpdateMyStationsByIdsRequest,
  UpdateMyStationsByIdsRequestSchema,
  UpdateMyStationsByIdsResponse,
  UpdateMyStationsByIdsResponseSchema,
  type VisualizeMyTotalCountRequest,
  VisualizeMyTotalCountRequestSchema,
  type VisualizeMyTotalCountResponse,
  VisualizeMyTotalCountResponseSchema,
  type LeaveMyStationRequest,
  LeaveMyStationRequestSchema,
  type LeaveMyStationResponse,
  LeaveMyStationResponseSchema,
  type TransferMyStationOwnershipRequest,
  TransferMyStationOwnershipRequestSchema,
  type TransferMyStationOwnershipResponse,
  TransferMyStationOwnershipResponseSchema,
} from "@shared/api/interfaces/station.interface";
import { ZodError } from "zod";
import { invokeVisualizeQuery } from "./visualize.invoker";

export const queryFnVisualizeMyTotalCount = (
  request: VisualizeMyTotalCountRequest
): Promise<VisualizeMyTotalCountResponse> =>
  invokeVisualizeQuery(
    request,
    VisualizeMyTotalCountRequestSchema,
    VisualizeMyTotalCountResponseSchema,
    VisualizeMyTotalCount,
    "queryFnVisualizeMyTotalCount"
  );

export const queryFnGetMyStationById = async (
  request: GetMyStationByIdRequest
): Promise<GetMyStationByIdResponse> => {
  try {
    const validatedRequest = GetMyStationByIdRequestSchema.parse(request);
    const response = await GetMyStationById({
      data: validatedRequest,
    });
    return GetMyStationByIdResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in queryFnGetMyStationById", error);
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

export const queryFnGetAllMyStations = async (
  request: GetAllMyStationsRequest
): Promise<GetAllMyStationsResponse> => {
  try {
    const validatedRequest = GetAllMyStationsRequestSchema.parse(request);
    const response = await GetAllMyStations({
      data: validatedRequest,
    });
    return GetAllMyStationsResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in queryFnGetAllMyStations", error);
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

export const mutationFnTransferMyStationOwnership = async (
  request: TransferMyStationOwnershipRequest
): Promise<TransferMyStationOwnershipResponse> => {
  try {
    const response = await TransferMyStationOwnership({
      data: TransferMyStationOwnershipRequestSchema.parse(request),
    });
    return TransferMyStationOwnershipResponseSchema.parse(response);
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

export const mutationFnLeaveMyStation = async (
  request: LeaveMyStationRequest
): Promise<LeaveMyStationResponse> => {
  try {
    const response = await LeaveMyStation({
      data: LeaveMyStationRequestSchema.parse(request),
    });
    return LeaveMyStationResponseSchema.parse(response);
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

export const mutationFnCreateStation = async (
  request: CreateStationRequest
): Promise<CreateStationResponse> => {
  try {
    const validatedRequest = CreateStationRequestSchema.parse(request);
    const response = await CreateStation({
      data: validatedRequest,
    });
    return CreateStationResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnCreateStation", error);
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

export const mutationFnCreateStations = async (
  request: CreateStationsRequest
): Promise<CreateStationsResponse> => {
  try {
    const validatedRequest = CreateStationsRequestSchema.parse(request);
    const response = await CreateStations({
      data: validatedRequest,
    });
    return CreateStationsResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnCreateStations", error);
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

export const mutationFnUpdateMyStationById = async (
  request: UpdateMyStationByIdRequest
): Promise<UpdateMyStationByIdResponse> => {
  try {
    const validatedRequest = UpdateMyStationByIdRequestSchema.parse(request);
    const response = await UpdateMyStationById({
      data: validatedRequest,
    });
    return UpdateMyStationByIdResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnUpdateMyStationById", error);
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

export const mutationFnUpdateMyStationsByIds = async (
  request: UpdateMyStationsByIdsRequest
): Promise<UpdateMyStationsByIdsResponse> => {
  try {
    const validatedRequest = UpdateMyStationsByIdsRequestSchema.parse(request);
    const response = await UpdateMyStationsByIds({
      data: validatedRequest,
    });
    return UpdateMyStationsByIdsResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnUpdateMyStationsByIds", error);
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

export const mutationFnRestoreMyStationById = async (
  request: RestoreMyStationByIdRequest
): Promise<RestoreMyStationByIdResponse> => {
  try {
    const validatedRequest = RestoreMyStationByIdRequestSchema.parse(request);
    const response = await RestoreMyStationById({
      data: validatedRequest,
    });
    return RestoreMyStationByIdResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnRestoreMyStationById", error);
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

export const mutationFnRestoreMyStationsByIds = async (
  request: RestoreMyStationsByIdsRequest
): Promise<RestoreMyStationsByIdsResponse> => {
  try {
    const validatedRequest = RestoreMyStationsByIdsRequestSchema.parse(request);
    const response = await RestoreMyStationsByIds({
      data: validatedRequest,
    });
    return RestoreMyStationsByIdsResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnRestoreMyStationsByIds", error);
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

export const mutationFnDeleteMyStationById = async (
  request: DeleteMyStationByIdRequest
): Promise<DeleteMyStationByIdResponse> => {
  try {
    const validatedRequest = DeleteMyStationByIdRequestSchema.parse(request);
    const response = await DeleteMyStationById({
      data: validatedRequest,
    });
    return DeleteMyStationByIdResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnDeleteMyStationById", error);
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

export const mutationFnDeleteMyStationsByIds = async (
  request: DeleteMyStationsByIdsRequest
): Promise<DeleteMyStationsByIdsResponse> => {
  try {
    const validatedRequest = DeleteMyStationsByIdsRequestSchema.parse(request);
    const response = await DeleteMyStationsByIds({
      data: validatedRequest,
    });
    return DeleteMyStationsByIdsResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnDeleteMyStationsByIds", error);
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

export const mutationFnHardDeleteMyStationById = async (
  request: HardDeleteMyStationByIdRequest
): Promise<HardDeleteMyStationByIdResponse> => {
  try {
    const validatedRequest =
      HardDeleteMyStationByIdRequestSchema.parse(request);
    const response = await HardDeleteMyStationById({
      data: validatedRequest,
    });
    return HardDeleteMyStationByIdResponseSchema.parse(response);
  } catch (error) {
    console.error(
      "error happening in mutationFnHardDeleteMyStationById",
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

export const mutationFnHardDeleteMyStationsByIds = async (
  request: HardDeleteMyStationsByIdsRequest
): Promise<HardDeleteMyStationsByIdsResponse> => {
  try {
    const validatedRequest =
      HardDeleteMyStationsByIdsRequestSchema.parse(request);
    const response = await HardDeleteMyStationsByIds({
      data: validatedRequest,
    });
    return HardDeleteMyStationsByIdsResponseSchema.parse(response);
  } catch (error) {
    console.error(
      "error happening in mutationFnHardDeleteMyStationsByIds",
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
