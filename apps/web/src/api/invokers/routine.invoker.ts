import { NotegicFetchError } from "@shared/api/exceptions/errors/fetch.error";
import { NotegicValidationError } from "@shared/api/exceptions/errors/validation.error";
import { NotegicAPIError } from "@shared/api/exceptions";
import { FetchClientExceptions } from "@shared/api/exceptions/client/fetch.exception";
import { ValidationClientException } from "@shared/api/exceptions/client/validation.exception";
import {
  LinkRoutineItemsByIds,
  LinkRoutineTagsByIds,
  LinkRoutineTasksByIds,
  CreateRoutineByStationId,
  CreateRoutinesByStationIds,
  DeleteMyRoutineById,
  DeleteMyRoutinesByIds,
  GetMyRoutinesByTimeRange,
  GetMyRoutineById,
  GetMyRoutinesByStationId,
  HardDeleteMyRoutineById,
  HardDeleteMyRoutinesByIds,
  LinkRoutineItemById,
  LinkRoutineTagById,
  LinkRoutineTaskById,
  RestoreMyRoutineById,
  RestoreMyRoutinesByIds,
  UpdateMyRoutineById,
  UpdateMyRoutinesByIds,
  VisualizeMyRoutinePeriodCount,
  VisualizeMyRoutineScheduledEndAtCount,
  VisualizeMyRoutineScheduledStartAtCount,
  VisualizeMyRoutineStatusCount,
} from "@/api/functions/routine.serverFn";
import {
  LinkRoutineItemsByIdsRequest,
  LinkRoutineItemsByIdsRequestSchema,
  LinkRoutineItemsByIdsResponse,
  LinkRoutineItemsByIdsResponseSchema,
  LinkRoutineTagsByIdsRequest,
  LinkRoutineTagsByIdsRequestSchema,
  LinkRoutineTagsByIdsResponse,
  LinkRoutineTagsByIdsResponseSchema,
  LinkRoutineTasksByIdsRequest,
  LinkRoutineTasksByIdsRequestSchema,
  LinkRoutineTasksByIdsResponse,
  LinkRoutineTasksByIdsResponseSchema,
  CreateRoutineByStationIdRequest,
  CreateRoutineByStationIdRequestSchema,
  CreateRoutineByStationIdResponse,
  CreateRoutineByStationIdResponseSchema,
  CreateRoutinesByStationIdsRequest,
  CreateRoutinesByStationIdsRequestSchema,
  CreateRoutinesByStationIdsResponse,
  CreateRoutinesByStationIdsResponseSchema,
  DeleteMyRoutineByIdRequest,
  DeleteMyRoutineByIdRequestSchema,
  DeleteMyRoutineByIdResponse,
  DeleteMyRoutineByIdResponseSchema,
  DeleteMyRoutinesByIdsRequest,
  DeleteMyRoutinesByIdsRequestSchema,
  DeleteMyRoutinesByIdsResponse,
  DeleteMyRoutinesByIdsResponseSchema,
  GetMyRoutinesByTimeRangeRequest,
  GetMyRoutinesByTimeRangeRequestSchema,
  GetMyRoutinesByTimeRangeResponse,
  GetMyRoutinesByTimeRangeResponseSchema,
  GetMyRoutineByIdRequest,
  GetMyRoutineByIdRequestSchema,
  GetMyRoutineByIdResponse,
  GetMyRoutineByIdResponseSchema,
  GetMyRoutinesByStationIdRequest,
  GetMyRoutinesByStationIdRequestSchema,
  GetMyRoutinesByStationIdResponse,
  GetMyRoutinesByStationIdResponseSchema,
  HardDeleteMyRoutineByIdRequest,
  HardDeleteMyRoutineByIdRequestSchema,
  HardDeleteMyRoutineByIdResponse,
  HardDeleteMyRoutineByIdResponseSchema,
  HardDeleteMyRoutinesByIdsRequest,
  HardDeleteMyRoutinesByIdsRequestSchema,
  HardDeleteMyRoutinesByIdsResponse,
  HardDeleteMyRoutinesByIdsResponseSchema,
  LinkRoutineItemByIdRequest,
  LinkRoutineItemByIdRequestSchema,
  LinkRoutineItemByIdResponse,
  LinkRoutineItemByIdResponseSchema,
  LinkRoutineTagByIdRequest,
  LinkRoutineTagByIdRequestSchema,
  LinkRoutineTagByIdResponse,
  LinkRoutineTagByIdResponseSchema,
  LinkRoutineTaskByIdRequest,
  LinkRoutineTaskByIdRequestSchema,
  LinkRoutineTaskByIdResponse,
  LinkRoutineTaskByIdResponseSchema,
  RestoreMyRoutineByIdRequest,
  RestoreMyRoutineByIdRequestSchema,
  RestoreMyRoutineByIdResponse,
  RestoreMyRoutineByIdResponseSchema,
  RestoreMyRoutinesByIdsRequest,
  RestoreMyRoutinesByIdsRequestSchema,
  RestoreMyRoutinesByIdsResponse,
  RestoreMyRoutinesByIdsResponseSchema,
  UpdateMyRoutineByIdRequest,
  UpdateMyRoutineByIdRequestSchema,
  UpdateMyRoutineByIdResponse,
  UpdateMyRoutineByIdResponseSchema,
  UpdateMyRoutinesByIdsRequest,
  UpdateMyRoutinesByIdsRequestSchema,
  UpdateMyRoutinesByIdsResponse,
  UpdateMyRoutinesByIdsResponseSchema,
  type VisualizeMyRoutinePeriodCountRequest,
  VisualizeMyRoutinePeriodCountRequestSchema,
  type VisualizeMyRoutinePeriodCountResponse,
  VisualizeMyRoutinePeriodCountResponseSchema,
  type VisualizeMyRoutineScheduledEndAtCountRequest,
  VisualizeMyRoutineScheduledEndAtCountRequestSchema,
  type VisualizeMyRoutineScheduledEndAtCountResponse,
  VisualizeMyRoutineScheduledEndAtCountResponseSchema,
  type VisualizeMyRoutineScheduledStartAtCountRequest,
  VisualizeMyRoutineScheduledStartAtCountRequestSchema,
  type VisualizeMyRoutineScheduledStartAtCountResponse,
  VisualizeMyRoutineScheduledStartAtCountResponseSchema,
  type VisualizeMyRoutineStatusCountRequest,
  VisualizeMyRoutineStatusCountRequestSchema,
  type VisualizeMyRoutineStatusCountResponse,
  VisualizeMyRoutineStatusCountResponseSchema,
} from "@shared/api/interfaces/routine.interface";
import { ZodError } from "zod";
import { invokeVisualizeQuery } from "./visualize.invoker";

export const queryFnVisualizeMyRoutineStatusCount = (
  request: VisualizeMyRoutineStatusCountRequest
): Promise<VisualizeMyRoutineStatusCountResponse> =>
  invokeVisualizeQuery(
    request,
    VisualizeMyRoutineStatusCountRequestSchema,
    VisualizeMyRoutineStatusCountResponseSchema,
    VisualizeMyRoutineStatusCount,
    "queryFnVisualizeMyRoutineStatusCount"
  );

export const queryFnVisualizeMyRoutinePeriodCount = (
  request: VisualizeMyRoutinePeriodCountRequest
): Promise<VisualizeMyRoutinePeriodCountResponse> =>
  invokeVisualizeQuery(
    request,
    VisualizeMyRoutinePeriodCountRequestSchema,
    VisualizeMyRoutinePeriodCountResponseSchema,
    VisualizeMyRoutinePeriodCount,
    "queryFnVisualizeMyRoutinePeriodCount"
  );

export const queryFnVisualizeMyRoutineScheduledStartAtCount = (
  request: VisualizeMyRoutineScheduledStartAtCountRequest
): Promise<VisualizeMyRoutineScheduledStartAtCountResponse> =>
  invokeVisualizeQuery(
    request,
    VisualizeMyRoutineScheduledStartAtCountRequestSchema,
    VisualizeMyRoutineScheduledStartAtCountResponseSchema,
    VisualizeMyRoutineScheduledStartAtCount,
    "queryFnVisualizeMyRoutineScheduledStartAtCount"
  );

export const queryFnVisualizeMyRoutineScheduledEndAtCount = (
  request: VisualizeMyRoutineScheduledEndAtCountRequest
): Promise<VisualizeMyRoutineScheduledEndAtCountResponse> =>
  invokeVisualizeQuery(
    request,
    VisualizeMyRoutineScheduledEndAtCountRequestSchema,
    VisualizeMyRoutineScheduledEndAtCountResponseSchema,
    VisualizeMyRoutineScheduledEndAtCount,
    "queryFnVisualizeMyRoutineScheduledEndAtCount"
  );

export const queryFnGetMyRoutineById = async (
  request: GetMyRoutineByIdRequest
): Promise<GetMyRoutineByIdResponse> => {
  try {
    const validatedRequest = GetMyRoutineByIdRequestSchema.parse(request);
    const response = await GetMyRoutineById({
      data: validatedRequest,
    });
    return GetMyRoutineByIdResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in queryFnGetMyRoutineById", error);
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

export const queryFnGetMyRoutinesByStationId = async (
  request: GetMyRoutinesByStationIdRequest
): Promise<GetMyRoutinesByStationIdResponse> => {
  try {
    const validatedRequest =
      GetMyRoutinesByStationIdRequestSchema.parse(request);
    const response = await GetMyRoutinesByStationId({
      data: validatedRequest,
    });
    return GetMyRoutinesByStationIdResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in queryFnGetMyRoutinesByStationId", error);
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

export const queryFnGetMyRoutinesByTimeRange = async (
  request: GetMyRoutinesByTimeRangeRequest
): Promise<GetMyRoutinesByTimeRangeResponse> => {
  try {
    const validatedRequest =
      GetMyRoutinesByTimeRangeRequestSchema.parse(request);
    const response = await GetMyRoutinesByTimeRange({
      data: validatedRequest,
    });
    return GetMyRoutinesByTimeRangeResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in queryFnGetMyRoutinesByTimeRange", error);
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

export const mutationFnCreateRoutineByStationId = async (
  request: CreateRoutineByStationIdRequest
): Promise<CreateRoutineByStationIdResponse> => {
  try {
    const validatedRequest =
      CreateRoutineByStationIdRequestSchema.parse(request);
    const response = await CreateRoutineByStationId({
      data: validatedRequest,
    });
    return CreateRoutineByStationIdResponseSchema.parse(response);
  } catch (error) {
    console.error(
      "error happening in mutationFnCreateRoutineByStationId",
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

export const mutationFnCreateRoutinesByStationIds = async (
  request: CreateRoutinesByStationIdsRequest
): Promise<CreateRoutinesByStationIdsResponse> => {
  try {
    const validatedRequest =
      CreateRoutinesByStationIdsRequestSchema.parse(request);
    const response = await CreateRoutinesByStationIds({
      data: validatedRequest,
    });
    return CreateRoutinesByStationIdsResponseSchema.parse(response);
  } catch (error) {
    console.error(
      "error happening in mutationFnCreateRoutinesByStationIds",
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

export const mutationFnUpdateMyRoutineById = async (
  request: UpdateMyRoutineByIdRequest
): Promise<UpdateMyRoutineByIdResponse> => {
  try {
    const validatedRequest = UpdateMyRoutineByIdRequestSchema.parse(request);
    const response = await UpdateMyRoutineById({
      data: validatedRequest,
    });
    return UpdateMyRoutineByIdResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnUpdateMyRoutineById", error);
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

export const mutationFnUpdateMyRoutinesByIds = async (
  request: UpdateMyRoutinesByIdsRequest
): Promise<UpdateMyRoutinesByIdsResponse> => {
  try {
    const validatedRequest = UpdateMyRoutinesByIdsRequestSchema.parse(request);
    const response = await UpdateMyRoutinesByIds({
      data: validatedRequest,
    });
    return UpdateMyRoutinesByIdsResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnUpdateMyRoutinesByIds", error);
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

export const mutationFnLinkRoutineTagById = async (
  request: LinkRoutineTagByIdRequest
): Promise<LinkRoutineTagByIdResponse> => {
  try {
    const validatedRequest = LinkRoutineTagByIdRequestSchema.parse(request);
    const response = await LinkRoutineTagById({
      data: validatedRequest,
    });
    return LinkRoutineTagByIdResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnLinkRoutineTagById", error);
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

export const mutationFnLinkRoutineTagsByIds = async (
  request: LinkRoutineTagsByIdsRequest
): Promise<LinkRoutineTagsByIdsResponse> => {
  try {
    const validatedRequest = LinkRoutineTagsByIdsRequestSchema.parse(request);
    const response = await LinkRoutineTagsByIds({
      data: validatedRequest,
    });
    return LinkRoutineTagsByIdsResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnLinkRoutineTagsByIds", error);
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

export const mutationFnLinkRoutineTaskById = async (
  request: LinkRoutineTaskByIdRequest
): Promise<LinkRoutineTaskByIdResponse> => {
  try {
    const validatedRequest = LinkRoutineTaskByIdRequestSchema.parse(request);
    const response = await LinkRoutineTaskById({
      data: validatedRequest,
    });
    return LinkRoutineTaskByIdResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnLinkRoutineTaskById", error);
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

export const mutationFnLinkRoutineTasksByIds = async (
  request: LinkRoutineTasksByIdsRequest
): Promise<LinkRoutineTasksByIdsResponse> => {
  try {
    const validatedRequest = LinkRoutineTasksByIdsRequestSchema.parse(request);
    const response = await LinkRoutineTasksByIds({
      data: validatedRequest,
    });
    return LinkRoutineTasksByIdsResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnLinkRoutineTasksByIds", error);
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

export const mutationFnLinkRoutineItemById = async (
  request: LinkRoutineItemByIdRequest
): Promise<LinkRoutineItemByIdResponse> => {
  try {
    const validatedRequest = LinkRoutineItemByIdRequestSchema.parse(request);
    const response = await LinkRoutineItemById({
      data: validatedRequest,
    });
    return LinkRoutineItemByIdResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnLinkRoutineItemById", error);
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

export const mutationFnLinkRoutineItemsByIds = async (
  request: LinkRoutineItemsByIdsRequest
): Promise<LinkRoutineItemsByIdsResponse> => {
  try {
    const validatedRequest = LinkRoutineItemsByIdsRequestSchema.parse(request);
    const response = await LinkRoutineItemsByIds({
      data: validatedRequest,
    });
    return LinkRoutineItemsByIdsResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnLinkRoutineItemsByIds", error);
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

export const mutationFnRestoreMyRoutineById = async (
  request: RestoreMyRoutineByIdRequest
): Promise<RestoreMyRoutineByIdResponse> => {
  try {
    const validatedRequest = RestoreMyRoutineByIdRequestSchema.parse(request);
    const response = await RestoreMyRoutineById({
      data: validatedRequest,
    });
    return RestoreMyRoutineByIdResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnRestoreMyRoutineById", error);
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

export const mutationFnRestoreMyRoutinesByIds = async (
  request: RestoreMyRoutinesByIdsRequest
): Promise<RestoreMyRoutinesByIdsResponse> => {
  try {
    const validatedRequest = RestoreMyRoutinesByIdsRequestSchema.parse(request);
    const response = await RestoreMyRoutinesByIds({
      data: validatedRequest,
    });
    return RestoreMyRoutinesByIdsResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnRestoreMyRoutinesByIds", error);
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

export const mutationFnDeleteMyRoutineById = async (
  request: DeleteMyRoutineByIdRequest
): Promise<DeleteMyRoutineByIdResponse> => {
  try {
    const validatedRequest = DeleteMyRoutineByIdRequestSchema.parse(request);
    const response = await DeleteMyRoutineById({
      data: validatedRequest,
    });
    return DeleteMyRoutineByIdResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnDeleteMyRoutineById", error);
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

export const mutationFnDeleteMyRoutinesByIds = async (
  request: DeleteMyRoutinesByIdsRequest
): Promise<DeleteMyRoutinesByIdsResponse> => {
  try {
    const validatedRequest = DeleteMyRoutinesByIdsRequestSchema.parse(request);
    const response = await DeleteMyRoutinesByIds({
      data: validatedRequest,
    });
    return DeleteMyRoutinesByIdsResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnDeleteMyRoutinesByIds", error);
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

export const mutationFnHardDeleteMyRoutineById = async (
  request: HardDeleteMyRoutineByIdRequest
): Promise<HardDeleteMyRoutineByIdResponse> => {
  try {
    const validatedRequest =
      HardDeleteMyRoutineByIdRequestSchema.parse(request);
    const response = await HardDeleteMyRoutineById({
      data: validatedRequest,
    });
    return HardDeleteMyRoutineByIdResponseSchema.parse(response);
  } catch (error) {
    console.error(
      "error happening in mutationFnHardDeleteMyRoutineById",
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

export const mutationFnHardDeleteMyRoutinesByIds = async (
  request: HardDeleteMyRoutinesByIdsRequest
): Promise<HardDeleteMyRoutinesByIdsResponse> => {
  try {
    const validatedRequest =
      HardDeleteMyRoutinesByIdsRequestSchema.parse(request);
    const response = await HardDeleteMyRoutinesByIds({
      data: validatedRequest,
    });
    return HardDeleteMyRoutinesByIdsResponseSchema.parse(response);
  } catch (error) {
    console.error(
      "error happening in mutationFnHardDeleteMyRoutinesByIds",
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
