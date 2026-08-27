import { NotegicFetchError } from "@shared/api/exceptions/errors/fetch.error";
import { NotegicValidationError } from "@shared/api/exceptions/errors/validation.error";
import { NotegicAPIError } from "@shared/api/exceptions";
import { FetchClientExceptions } from "@shared/api/exceptions/client/fetch.exception";
import { ValidationClientException } from "@shared/api/exceptions/client/validation.exception";
import {
  GetAllMyRoutineTaskRecordsByRoutineTaskId,
  VisualizeMyRoutineTaskRecordActualEndedAtCount,
  VisualizeMyRoutineTaskRecordActualStartedAtCount,
  VisualizeMyRoutineTaskRecordPurposeCount,
  VisualizeMyRoutineTaskRecordScheduledAtCount,
  VisualizeMyRoutineTaskRecordStatusCount,
} from "@/api/functions/routineTaskRecord.serverFn";
import {
  type GetAllMyRoutineTaskRecordsByRoutineTaskIdRequest,
  GetAllMyRoutineTaskRecordsByRoutineTaskIdRequestSchema,
  type GetAllMyRoutineTaskRecordsByRoutineTaskIdResponse,
  GetAllMyRoutineTaskRecordsByRoutineTaskIdResponseSchema,
  type VisualizeMyRoutineTaskRecordActualEndedAtCountRequest,
  type VisualizeMyRoutineTaskRecordActualEndedAtCountResponse,
  VisualizeMyRoutineTaskRecordActualEndedAtCountResponseSchema,
  type VisualizeMyRoutineTaskRecordActualStartedAtCountRequest,
  type VisualizeMyRoutineTaskRecordActualStartedAtCountResponse,
  VisualizeMyRoutineTaskRecordActualStartedAtCountResponseSchema,
  VisualizeMyRoutineTaskRecordCountRequestSchema,
  type VisualizeMyRoutineTaskRecordPurposeCountRequest,
  type VisualizeMyRoutineTaskRecordPurposeCountResponse,
  VisualizeMyRoutineTaskRecordPurposeCountResponseSchema,
  type VisualizeMyRoutineTaskRecordScheduledAtCountRequest,
  type VisualizeMyRoutineTaskRecordScheduledAtCountResponse,
  VisualizeMyRoutineTaskRecordScheduledAtCountResponseSchema,
  type VisualizeMyRoutineTaskRecordStatusCountRequest,
  type VisualizeMyRoutineTaskRecordStatusCountResponse,
  VisualizeMyRoutineTaskRecordStatusCountResponseSchema,
  VisualizeMyRoutineTaskRecordTimeCountRequestSchema,
} from "@shared/api/interfaces/routineTaskRecord.interface";
import { ZodError } from "zod";
import { invokeVisualizeQuery } from "./visualize.invoker";

export const queryFnVisualizeMyRoutineTaskRecordStatusCount = (
  request: VisualizeMyRoutineTaskRecordStatusCountRequest
): Promise<VisualizeMyRoutineTaskRecordStatusCountResponse> =>
  invokeVisualizeQuery(
    request,
    VisualizeMyRoutineTaskRecordCountRequestSchema,
    VisualizeMyRoutineTaskRecordStatusCountResponseSchema,
    VisualizeMyRoutineTaskRecordStatusCount,
    "queryFnVisualizeMyRoutineTaskRecordStatusCount"
  );

export const queryFnVisualizeMyRoutineTaskRecordPurposeCount = (
  request: VisualizeMyRoutineTaskRecordPurposeCountRequest
): Promise<VisualizeMyRoutineTaskRecordPurposeCountResponse> =>
  invokeVisualizeQuery(
    request,
    VisualizeMyRoutineTaskRecordCountRequestSchema,
    VisualizeMyRoutineTaskRecordPurposeCountResponseSchema,
    VisualizeMyRoutineTaskRecordPurposeCount,
    "queryFnVisualizeMyRoutineTaskRecordPurposeCount"
  );

export const queryFnVisualizeMyRoutineTaskRecordScheduledAtCount = (
  request: VisualizeMyRoutineTaskRecordScheduledAtCountRequest
): Promise<VisualizeMyRoutineTaskRecordScheduledAtCountResponse> =>
  invokeVisualizeQuery(
    request,
    VisualizeMyRoutineTaskRecordTimeCountRequestSchema,
    VisualizeMyRoutineTaskRecordScheduledAtCountResponseSchema,
    VisualizeMyRoutineTaskRecordScheduledAtCount,
    "queryFnVisualizeMyRoutineTaskRecordScheduledAtCount"
  );

export const queryFnVisualizeMyRoutineTaskRecordActualStartedAtCount = (
  request: VisualizeMyRoutineTaskRecordActualStartedAtCountRequest
): Promise<VisualizeMyRoutineTaskRecordActualStartedAtCountResponse> =>
  invokeVisualizeQuery(
    request,
    VisualizeMyRoutineTaskRecordTimeCountRequestSchema,
    VisualizeMyRoutineTaskRecordActualStartedAtCountResponseSchema,
    VisualizeMyRoutineTaskRecordActualStartedAtCount,
    "queryFnVisualizeMyRoutineTaskRecordActualStartedAtCount"
  );

export const queryFnVisualizeMyRoutineTaskRecordActualEndedAtCount = (
  request: VisualizeMyRoutineTaskRecordActualEndedAtCountRequest
): Promise<VisualizeMyRoutineTaskRecordActualEndedAtCountResponse> =>
  invokeVisualizeQuery(
    request,
    VisualizeMyRoutineTaskRecordTimeCountRequestSchema,
    VisualizeMyRoutineTaskRecordActualEndedAtCountResponseSchema,
    VisualizeMyRoutineTaskRecordActualEndedAtCount,
    "queryFnVisualizeMyRoutineTaskRecordActualEndedAtCount"
  );

export const queryFnGetAllMyRoutineTaskRecordsByRoutineTaskId = async (
  request: GetAllMyRoutineTaskRecordsByRoutineTaskIdRequest
): Promise<GetAllMyRoutineTaskRecordsByRoutineTaskIdResponse> => {
  try {
    const validatedRequest =
      GetAllMyRoutineTaskRecordsByRoutineTaskIdRequestSchema.parse(request);
    const response = await GetAllMyRoutineTaskRecordsByRoutineTaskId({
      data: validatedRequest,
    });
    return GetAllMyRoutineTaskRecordsByRoutineTaskIdResponseSchema.parse(
      response
    );
  } catch (error) {
    console.error(
      "error happening in queryFnGetAllMyRoutineTaskRecordsByRoutineTaskId",
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
