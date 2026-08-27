import { NotegicFetchError } from "@shared/api/exceptions/errors/fetch.error";
import { NotegicValidationError } from "@shared/api/exceptions/errors/validation.error";
import { NotegicAPIError } from "@shared/api/exceptions";
import { FetchClientExceptions } from "@shared/api/exceptions/client/fetch.exception";
import { ValidationClientException } from "@shared/api/exceptions/client/validation.exception";
import {
  DeleteNotifications,
  GetUnreadNotificationCount,
  ListNotifications,
  MarkNotificationsRead,
} from "@/api/functions/notification.serverFn";
import {
  DeleteNotificationsRequestSchema,
  DeleteNotificationsResponseSchema,
  GetUnreadNotificationCountRequestSchema,
  GetUnreadNotificationCountResponseSchema,
  ListNotificationsRequestSchema,
  ListNotificationsResponseSchema,
  MarkNotificationsReadRequestSchema,
  MarkNotificationsReadResponseSchema,
  type DeleteNotificationsRequest,
  type DeleteNotificationsResponse,
  type GetUnreadNotificationCountRequest,
  type GetUnreadNotificationCountResponse,
  type ListNotificationsRequest,
  type ListNotificationsResponse,
  type MarkNotificationsReadRequest,
  type MarkNotificationsReadResponse,
} from "@shared/api/interfaces/notification.interface";
import { ZodError } from "zod";

const rethrowNotificationError = (error: unknown): never => {
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

export const queryFnListNotifications = async (
  request: ListNotificationsRequest
): Promise<ListNotificationsResponse> => {
  try {
    return ListNotificationsResponseSchema.parse(
      await ListNotifications({
        data: ListNotificationsRequestSchema.parse(request),
      })
    );
  } catch (error) {
    return rethrowNotificationError(error);
  }
};

export const queryFnGetUnreadNotificationCount = async (
  request: GetUnreadNotificationCountRequest
): Promise<GetUnreadNotificationCountResponse> => {
  try {
    return GetUnreadNotificationCountResponseSchema.parse(
      await GetUnreadNotificationCount({
        data: GetUnreadNotificationCountRequestSchema.parse(request),
      })
    );
  } catch (error) {
    return rethrowNotificationError(error);
  }
};

export const mutationFnMarkNotificationsRead = async (
  request: MarkNotificationsReadRequest
): Promise<MarkNotificationsReadResponse> => {
  try {
    return MarkNotificationsReadResponseSchema.parse(
      await MarkNotificationsRead({
        data: MarkNotificationsReadRequestSchema.parse(request),
      })
    );
  } catch (error) {
    return rethrowNotificationError(error);
  }
};

export const mutationFnDeleteNotifications = async (
  request: DeleteNotificationsRequest
): Promise<DeleteNotificationsResponse> => {
  try {
    return DeleteNotificationsResponseSchema.parse(
      await DeleteNotifications({
        data: DeleteNotificationsRequestSchema.parse(request),
      })
    );
  } catch (error) {
    return rethrowNotificationError(error);
  }
};
