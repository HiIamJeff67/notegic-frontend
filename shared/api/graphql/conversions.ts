import {
  RoutinePeriod as GraphQLRoutinePeriod,
  RoutineStatus as GraphQLRoutineStatus,
  RoutineTaskPurpose as GraphQLRoutineTaskPurpose,
  RoutineTaskStatus as GraphQLRoutineTaskStatus,
  SupportedIcon as GraphQLSupportedIcon,
  UserStatus as GraphQLUserStatus,
} from "@shared/api/graphql/generated/graphql";
import {
  RoutinePeriod,
  RoutineStatus,
  RoutineTaskPurpose,
  RoutineTaskStatus,
  SupportedIcon,
  UserStatus,
} from "@shared/api/interfaces/enums";

const routinePeriodToGraphQL: Record<RoutinePeriod, GraphQLRoutinePeriod> = {
  [RoutinePeriod.Daily]: GraphQLRoutinePeriod.RoutinePeriodDaily,
  [RoutinePeriod.Weekly]: GraphQLRoutinePeriod.RoutinePeriodWeekly,
  [RoutinePeriod.Monthly]: GraphQLRoutinePeriod.RoutinePeriodMonthly,
};

const routineStatusToGraphQL: Record<RoutineStatus, GraphQLRoutineStatus> = {
  [RoutineStatus.Scheduled]: GraphQLRoutineStatus.RoutineStatusScheduled,
  [RoutineStatus.InProgress]: GraphQLRoutineStatus.RoutineStatusInProgress,
  [RoutineStatus.Completed]: GraphQLRoutineStatus.RoutineStatusCompleted,
  [RoutineStatus.OverDue]: GraphQLRoutineStatus.RoutineStatusOverDue,
};

const routineTaskPurposeToGraphQL: Record<
  RoutineTaskPurpose,
  GraphQLRoutineTaskPurpose
> = Object.fromEntries(
  Object.values(RoutineTaskPurpose).map(purpose => [
    purpose,
    GraphQLRoutineTaskPurpose[
      `RoutineTaskPurpose${purpose}` as keyof typeof GraphQLRoutineTaskPurpose
    ],
  ])
) as Record<RoutineTaskPurpose, GraphQLRoutineTaskPurpose>;

const routineTaskStatusToGraphQL: Record<
  RoutineTaskStatus,
  GraphQLRoutineTaskStatus
> = {
  [RoutineTaskStatus.Idle]: GraphQLRoutineTaskStatus.RoutineTaskStatusIdle,
  [RoutineTaskStatus.Waiting]:
    GraphQLRoutineTaskStatus.RoutineTaskStatusWaiting,
  [RoutineTaskStatus.Running]:
    GraphQLRoutineTaskStatus.RoutineTaskStatusRunning,
  [RoutineTaskStatus.Pause]: GraphQLRoutineTaskStatus.RoutineTaskStatusPause,
};

const supportedIconToGraphQL: Record<SupportedIcon, GraphQLSupportedIcon> = {
  [SupportedIcon.Books]: GraphQLSupportedIcon.SupportedIconBooks,
  [SupportedIcon.Calendar]: GraphQLSupportedIcon.SupportedIconCalendar,
  [SupportedIcon.CheckMark]: GraphQLSupportedIcon.SupportedIconCheckMark,
  [SupportedIcon.Clock]: GraphQLSupportedIcon.SupportedIconClock,
  [SupportedIcon.Fire]: GraphQLSupportedIcon.SupportedIconFire,
  [SupportedIcon.FolderOpen]: GraphQLSupportedIcon.SupportedIconFolderOpen,
  [SupportedIcon.GrinningFace]: GraphQLSupportedIcon.SupportedIconGrinningFace,
  [SupportedIcon.Lightbulb]: GraphQLSupportedIcon.SupportedIconLightbulb,
  [SupportedIcon.Notebook]: GraphQLSupportedIcon.SupportedIconNotebook,
  [SupportedIcon.PencilPaper]: GraphQLSupportedIcon.SupportedIconPencilPaper,
  [SupportedIcon.Pin]: GraphQLSupportedIcon.SupportedIconPin,
  [SupportedIcon.RedHeart]: GraphQLSupportedIcon.SupportedIconRedHeart,
  [SupportedIcon.Rocket]: GraphQLSupportedIcon.SupportedIconRocket,
  [SupportedIcon.SmilingFaceWithSmilingEyes]:
    GraphQLSupportedIcon.SupportedIconSmilingFaceWithSmilingEyes,
  [SupportedIcon.Star]: GraphQLSupportedIcon.SupportedIconStar,
};

const userStatusToGraphQL: Record<UserStatus, GraphQLUserStatus> = {
  [UserStatus.Online]: GraphQLUserStatus.Online,
  [UserStatus.AFK]: GraphQLUserStatus.Afk,
  [UserStatus.DoNotDisturb]: GraphQLUserStatus.DoNotDisturb,
  [UserStatus.Offline]: GraphQLUserStatus.Offline,
};

const graphQLUserStatusToLocal: Record<GraphQLUserStatus, UserStatus> = {
  [GraphQLUserStatus.Online]: UserStatus.Online,
  [GraphQLUserStatus.Afk]: UserStatus.AFK,
  [GraphQLUserStatus.DoNotDisturb]: UserStatus.DoNotDisturb,
  [GraphQLUserStatus.Offline]: UserStatus.Offline,
};

const graphQLRoutinePeriodToLocal: Record<GraphQLRoutinePeriod, RoutinePeriod> =
  Object.fromEntries(
    Object.entries(routinePeriodToGraphQL).map(([period, graphqlPeriod]) => [
      graphqlPeriod,
      period,
    ])
  ) as Record<GraphQLRoutinePeriod, RoutinePeriod>;

const graphQLRoutineStatusToLocal: Record<GraphQLRoutineStatus, RoutineStatus> =
  Object.fromEntries(
    Object.entries(routineStatusToGraphQL).map(([status, graphqlStatus]) => [
      graphqlStatus,
      status,
    ])
  ) as Record<GraphQLRoutineStatus, RoutineStatus>;

const graphQLRoutineTaskPurposeToLocal: Record<
  GraphQLRoutineTaskPurpose,
  RoutineTaskPurpose
> = Object.fromEntries(
  Object.entries(routineTaskPurposeToGraphQL).map(
    ([purpose, graphqlPurpose]) => [graphqlPurpose, purpose]
  )
) as Record<GraphQLRoutineTaskPurpose, RoutineTaskPurpose>;

const graphQLRoutineTaskStatusToLocal: Record<
  GraphQLRoutineTaskStatus,
  RoutineTaskStatus
> = Object.fromEntries(
  Object.entries(routineTaskStatusToGraphQL).map(([status, graphqlStatus]) => [
    graphqlStatus,
    status,
  ])
) as Record<GraphQLRoutineTaskStatus, RoutineTaskStatus>;

const graphQLSupportedIconToLocal: Record<GraphQLSupportedIcon, SupportedIcon> =
  Object.fromEntries(
    Object.entries(supportedIconToGraphQL).map(([icon, graphqlIcon]) => [
      graphqlIcon,
      icon,
    ])
  ) as Record<GraphQLSupportedIcon, SupportedIcon>;

export const toGraphQLRoutinePeriod = (
  period?: RoutinePeriod | string | null
) => (period ? routinePeriodToGraphQL[period as RoutinePeriod] : null);

export const fromGraphQLRoutinePeriod = (
  period?: GraphQLRoutinePeriod | null
) => (period ? graphQLRoutinePeriodToLocal[period] : null);

export const toGraphQLRoutineStatus = (
  status?: RoutineStatus | string | null
) =>
  status
    ? routineStatusToGraphQL[status as RoutineStatus]
    : GraphQLRoutineStatus.RoutineStatusScheduled;

export const fromGraphQLRoutineStatus = (status: GraphQLRoutineStatus) =>
  graphQLRoutineStatusToLocal[status];

export const toGraphQLRoutineTaskPurpose = (
  purpose?: RoutineTaskPurpose | string | null
) =>
  purpose
    ? routineTaskPurposeToGraphQL[purpose as RoutineTaskPurpose]
    : GraphQLRoutineTaskPurpose.RoutineTaskPurposeCreateBlockPack;

export const fromGraphQLRoutineTaskPurpose = (
  purpose: GraphQLRoutineTaskPurpose
) => graphQLRoutineTaskPurposeToLocal[purpose];

export const toGraphQLRoutineTaskStatus = (
  status?: RoutineTaskStatus | string | null
) =>
  status
    ? routineTaskStatusToGraphQL[status as RoutineTaskStatus]
    : GraphQLRoutineTaskStatus.RoutineTaskStatusIdle;

export const fromGraphQLRoutineTaskStatus = (
  status: GraphQLRoutineTaskStatus
) => graphQLRoutineTaskStatusToLocal[status];

export const toGraphQLSupportedIcon = (icon?: SupportedIcon | null) =>
  icon ? supportedIconToGraphQL[icon] : null;

export const fromGraphQLSupportedIcon = (icon?: GraphQLSupportedIcon | null) =>
  icon ? graphQLSupportedIconToLocal[icon] : null;

export const toGraphQLUserStatus = (status: UserStatus | string) =>
  userStatusToGraphQL[status as UserStatus];

export const fromGraphQLUserStatus = (status: GraphQLUserStatus) =>
  graphQLUserStatusToLocal[status];
