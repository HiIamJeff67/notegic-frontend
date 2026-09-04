/* eslint-disable */
import type { UUID } from 'crypto';
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  Base64Bytes: { input: string; output: string; }
  DatatypeJSON: { input: Record<string, unknown>; output: Record<string, unknown>; }
  Int32: { input: number; output: number; }
  Int64: { input: number; output: number; }
  RawJSON: { input: Record<string, unknown>; output: Record<string, unknown>; }
  Time: { input: Date; output: Date; }
  UUID: { input: UUID; output: UUID; }
};

export enum AccessControlPermission {
  Admin = 'Admin',
  Owner = 'Owner',
  Read = 'Read',
  Write = 'Write'
}

export enum BadgeType {
  Bronze = 'Bronze',
  Diamond = 'Diamond',
  Golden = 'Golden',
  Silver = 'Silver',
  Steel = 'Steel'
}

export enum BlockType {
  BlockTypeAudio = 'BlockType_Audio',
  BlockTypeBulletListItem = 'BlockType_BulletListItem',
  BlockTypeCheckListItem = 'BlockType_CheckListItem',
  BlockTypeCodeBlock = 'BlockType_CodeBlock',
  BlockTypeFile = 'BlockType_File',
  BlockTypeHeading = 'BlockType_Heading',
  BlockTypeImage = 'BlockType_Image',
  BlockTypeNumberedListItem = 'BlockType_NumberedListItem',
  BlockTypeParagraph = 'BlockType_Paragraph',
  BlockTypeQuote = 'BlockType_Quote',
  BlockTypeTable = 'BlockType_Table',
  BlockTypeToggleListItem = 'BlockType_ToggleListItem',
  BlockTypeVideo = 'BlockType_Video'
}

export enum Country {
  Australia = 'Australia',
  Canada = 'Canada',
  China = 'China',
  Japan = 'Japan',
  Malaysia = 'Malaysia',
  Singapore = 'Singapore',
  Taiwan = 'Taiwan',
  UnitedKingdom = 'UnitedKingdom',
  UnitedStatesOfAmerica = 'UnitedStatesOfAmerica'
}

export enum CountryCode {
  CountryCode_1 = 'COUNTRY_CODE_1',
  CountryCode_44 = 'COUNTRY_CODE_44',
  CountryCode_60 = 'COUNTRY_CODE_60',
  CountryCode_61 = 'COUNTRY_CODE_61',
  CountryCode_65 = 'COUNTRY_CODE_65',
  CountryCode_81 = 'COUNTRY_CODE_81',
  CountryCode_86 = 'COUNTRY_CODE_86',
  CountryCode_886 = 'COUNTRY_CODE_886'
}

export enum ItemType {
  ItemTypeBlockPack = 'ItemType_BlockPack',
  ItemTypeMaterial = 'ItemType_Material'
}

export enum Language {
  English = 'English',
  Japanese = 'Japanese',
  Korean = 'Korean',
  SimpleChinese = 'SimpleChinese',
  TraditionalChinese = 'TraditionalChinese'
}

export enum MaterialContentType {
  ApplicationJson = 'Application_JSON',
  ApplicationPdf = 'Application_PDF',
  AudioMpeg = 'Audio_Mpeg',
  ImageGif = 'Image_GIF',
  ImageJpeg = 'Image_JPEG',
  ImageJpg = 'Image_JPG',
  ImagePng = 'Image_PNG',
  ImageSvg = 'Image_SVG',
  ImageWebP = 'Image_WebP',
  None = 'None',
  TextHtml = 'Text_HTML',
  TextMarkdown = 'Text_Markdown',
  TextPlain = 'Text_Plain',
  VideoMp4 = 'Video_MP4',
  VideoWebM = 'Video_WebM'
}

export type PrivateBlock = {
  __typename?: 'PrivateBlock';
  blockPackId: Scalars['UUID']['output'];
  childrenIds: Array<Scalars['UUID']['output']>;
  content: Scalars['DatatypeJSON']['output'];
  createdAt: Scalars['Time']['output'];
  id: Scalars['UUID']['output'];
  nextBlockId?: Maybe<Scalars['UUID']['output']>;
  parentBlockId?: Maybe<Scalars['UUID']['output']>;
  prevBlockId?: Maybe<Scalars['UUID']['output']>;
  props: Scalars['DatatypeJSON']['output'];
  type: BlockType;
  updatedAt: Scalars['Time']['output'];
};

export type PrivateBlockPack = {
  __typename?: 'PrivateBlockPack';
  blockCount: Scalars['Int64']['output'];
  blockIds: Array<Scalars['UUID']['output']>;
  createdAt: Scalars['Time']['output'];
  deletedAt?: Maybe<Scalars['Time']['output']>;
  headerBackgroundURL?: Maybe<Scalars['String']['output']>;
  icon?: Maybe<SupportedIcon>;
  id: Scalars['UUID']['output'];
  name: Scalars['String']['output'];
  parentSubShelfId: Scalars['UUID']['output'];
  updatedAt: Scalars['Time']['output'];
};

export type PrivateItem = {
  __typename?: 'PrivateItem';
  createdAt: Scalars['Time']['output'];
  deletedAt?: Maybe<Scalars['Time']['output']>;
  id: Scalars['UUID']['output'];
  parentSubShelfId: Scalars['UUID']['output'];
  rootShelfId: Scalars['UUID']['output'];
  routineIds: Array<Scalars['UUID']['output']>;
  type: ItemType;
  updatedAt: Scalars['Time']['output'];
};

export type PrivateMaterial = {
  __typename?: 'PrivateMaterial';
  contentType: MaterialContentType;
  createdAt: Scalars['Time']['output'];
  deletedAt?: Maybe<Scalars['Time']['output']>;
  id: Scalars['UUID']['output'];
  name: Scalars['String']['output'];
  parentSubShelfId: Scalars['UUID']['output'];
  parseMediaType: Scalars['String']['output'];
  size: Scalars['Int64']['output'];
  updatedAt: Scalars['Time']['output'];
};

export type PrivateRootShelf = {
  __typename?: 'PrivateRootShelf';
  createdAt: Scalars['Time']['output'];
  deletedAt?: Maybe<Scalars['Time']['output']>;
  id: Scalars['UUID']['output'];
  itemCount: Scalars['Int64']['output'];
  itemIds: Array<Scalars['UUID']['output']>;
  lastAnalyzedAt: Scalars['Time']['output'];
  name: Scalars['String']['output'];
  owner: PublicUser;
  permission: AccessControlPermission;
  sharers: Array<PublicUser>;
  subShelfCount: Scalars['Int64']['output'];
  updatedAt: Scalars['Time']['output'];
};

export type PrivateRoutine = {
  __typename?: 'PrivateRoutine';
  createdAt: Scalars['Time']['output'];
  deletedAt?: Maybe<Scalars['Time']['output']>;
  description: Scalars['String']['output'];
  id: Scalars['UUID']['output'];
  isPinned: Scalars['Boolean']['output'];
  itemIds: Array<Scalars['UUID']['output']>;
  period?: Maybe<RoutinePeriod>;
  phase?: Maybe<RoutinePhase>;
  scheduledEndAt: Scalars['Time']['output'];
  scheduledStartAt: Scalars['Time']['output'];
  stationId: Scalars['UUID']['output'];
  status: RoutineStatus;
  tagIds: Array<Scalars['UUID']['output']>;
  taskIds: Array<Scalars['UUID']['output']>;
  timezone: Scalars['String']['output'];
  title: Scalars['String']['output'];
  updatedAt: Scalars['Time']['output'];
};

export type PrivateRoutineRecord = {
  __typename?: 'PrivateRoutineRecord';
  actualEndedAt?: Maybe<Scalars['Time']['output']>;
  actualStartedAt?: Maybe<Scalars['Time']['output']>;
  blockedTaskCount: Scalars['Int']['output'];
  createdAt: Scalars['Time']['output'];
  failedTaskCount: Scalars['Int']['output'];
  id: Scalars['UUID']['output'];
  routineId: Scalars['UUID']['output'];
  runningTaskCount: Scalars['Int']['output'];
  scheduledAt: Scalars['Time']['output'];
  snapshot: Scalars['RawJSON']['output'];
  status: RoutineRecordStatus;
  successTaskCount: Scalars['Int']['output'];
  totalTaskCount: Scalars['Int']['output'];
  updatedAt: Scalars['Time']['output'];
  waitingTaskCount: Scalars['Int']['output'];
};

export type PrivateRoutineTag = {
  __typename?: 'PrivateRoutineTag';
  color: Scalars['String']['output'];
  createdAt: Scalars['Time']['output'];
  icon?: Maybe<SupportedIcon>;
  id: Scalars['UUID']['output'];
  name: Scalars['String']['output'];
  updatedAt: Scalars['Time']['output'];
};

export type PrivateRoutineTask = {
  __typename?: 'PrivateRoutineTask';
  costUnit: Scalars['Int64']['output'];
  createdAt: Scalars['Time']['output'];
  id: Scalars['UUID']['output'];
  maxAttempts: Scalars['Int32']['output'];
  payload: Scalars['RawJSON']['output'];
  phase?: Maybe<RoutinePhase>;
  previousRoutineTaskIds: Array<Scalars['UUID']['output']>;
  priority: Scalars['Int32']['output'];
  purpose: RoutineTaskPurpose;
  routineId: Scalars['UUID']['output'];
  title: Scalars['String']['output'];
  updatedAt: Scalars['Time']['output'];
};

export type PrivateRoutineTaskRecord = {
  __typename?: 'PrivateRoutineTaskRecord';
  actualEndedAt?: Maybe<Scalars['Time']['output']>;
  actualStartedAt?: Maybe<Scalars['Time']['output']>;
  attempts: Scalars['Int32']['output'];
  costUnit: Scalars['Int64']['output'];
  createdAt: Scalars['Time']['output'];
  errorCode?: Maybe<RoutineTaskRecordErrorCode>;
  errorReason?: Maybe<Scalars['String']['output']>;
  id: Scalars['UUID']['output'];
  payloadSnapshot: Scalars['RawJSON']['output'];
  purpose: RoutineTaskPurpose;
  resultSnapshot: Scalars['RawJSON']['output'];
  routineRecordId: Scalars['UUID']['output'];
  routineTaskId: Scalars['UUID']['output'];
  status: RoutineTaskRecordStatus;
  updatedAt: Scalars['Time']['output'];
};

export type PrivateSearchableRoutine = {
  __typename?: 'PrivateSearchableRoutine';
  createdAt: Scalars['Time']['output'];
  deletedAt?: Maybe<Scalars['Time']['output']>;
  id: Scalars['UUID']['output'];
  isPinned: Scalars['Boolean']['output'];
  itemIds: Array<Scalars['UUID']['output']>;
  period?: Maybe<RoutinePeriod>;
  phase?: Maybe<RoutinePhase>;
  scheduledEndAt: Scalars['Time']['output'];
  scheduledStartAt: Scalars['Time']['output'];
  stationId: Scalars['UUID']['output'];
  status: RoutineStatus;
  tagIds: Array<Scalars['UUID']['output']>;
  taskIds: Array<Scalars['UUID']['output']>;
  timezone: Scalars['String']['output'];
  title: Scalars['String']['output'];
  updatedAt: Scalars['Time']['output'];
};

export type PrivateSearchableStation = {
  __typename?: 'PrivateSearchableStation';
  createdAt: Scalars['Time']['output'];
  deletedAt?: Maybe<Scalars['Time']['output']>;
  headerBackgroundURL?: Maybe<Scalars['String']['output']>;
  icon?: Maybe<SupportedIcon>;
  id: Scalars['UUID']['output'];
  name: Scalars['String']['output'];
  permission: AccessControlPermission;
  routineCount: Scalars['Int64']['output'];
  updatedAt: Scalars['Time']['output'];
};

export type PrivateStation = {
  __typename?: 'PrivateStation';
  createdAt: Scalars['Time']['output'];
  deletedAt?: Maybe<Scalars['Time']['output']>;
  description: Scalars['String']['output'];
  headerBackgroundURL?: Maybe<Scalars['String']['output']>;
  icon?: Maybe<SupportedIcon>;
  id: Scalars['UUID']['output'];
  name: Scalars['String']['output'];
  permission: AccessControlPermission;
  routineCount: Scalars['Int64']['output'];
  updatedAt: Scalars['Time']['output'];
};

export type PrivateSubShelf = {
  __typename?: 'PrivateSubShelf';
  createdAt: Scalars['Time']['output'];
  deletedAt?: Maybe<Scalars['Time']['output']>;
  id: Scalars['UUID']['output'];
  itemIds: Array<Scalars['UUID']['output']>;
  name: Scalars['String']['output'];
  nextSubShelfIds: Array<Scalars['UUID']['output']>;
  path: Array<Scalars['UUID']['output']>;
  prevSubShelfId?: Maybe<Scalars['UUID']['output']>;
  rootShelfId: Scalars['UUID']['output'];
  updatedAt: Scalars['Time']['output'];
};

export type PublicBadge = {
  __typename?: 'PublicBadge';
  createdAt: Scalars['Time']['output'];
  description: Scalars['String']['output'];
  imageURL?: Maybe<Scalars['String']['output']>;
  publicId: Scalars['UUID']['output'];
  title: Scalars['String']['output'];
  type: BadgeType;
};

export type PublicTheme = {
  __typename?: 'PublicTheme';
  authorId: Scalars['UUID']['output'];
  createdAt: Scalars['Time']['output'];
  downloadCount: Scalars['Int64']['output'];
  downloadURL?: Maybe<Scalars['String']['output']>;
  isDark: Scalars['Boolean']['output'];
  isDefault: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  publicId: Scalars['UUID']['output'];
  updatedAt: Scalars['Time']['output'];
  version: Scalars['String']['output'];
};

export type PublicUser = {
  __typename?: 'PublicUser';
  createdAt: Scalars['Time']['output'];
  displayName: Scalars['String']['output'];
  info?: Maybe<PublicUserInfo>;
  name: Scalars['String']['output'];
  plan: UserPlan;
  publicId: Scalars['UUID']['output'];
  role: UserRole;
  status: UserStatus;
};

export type PublicUserInfo = {
  __typename?: 'PublicUserInfo';
  avatarURL?: Maybe<Scalars['String']['output']>;
  birthDate: Scalars['Time']['output'];
  country?: Maybe<Country>;
  coverBackgroundURL?: Maybe<Scalars['String']['output']>;
  gender: UserGender;
  header?: Maybe<Scalars['String']['output']>;
  introduction?: Maybe<Scalars['String']['output']>;
};

export type Query = {
  __typename?: 'Query';
  searchBlockPacks: SearchBlockPackConnection;
  searchBlocks: SearchBlockConnection;
  searchItems: SearchItemConnection;
  searchMaterials: SearchMaterialConnection;
  searchRootShelves: SearchRootShelfConnection;
  searchRoutineRecords: SearchRoutineRecordConnection;
  searchRoutineTags: SearchRoutineTagConnection;
  searchRoutineTaskRecords: SearchRoutineTaskRecordConnection;
  searchRoutineTasks: SearchRoutineTaskConnection;
  searchRoutines: SearchRoutineConnection;
  searchStations: SearchStationConnection;
  searchSubShelves: SearchSubShelfConnection;
  searchThemes: SearchThemeConnection;
  searchUsers: SearchUserConnection;
};


export type QuerySearchBlockPacksArgs = {
  input: SearchBlockPackInput;
};


export type QuerySearchBlocksArgs = {
  input: SearchBlockInput;
};


export type QuerySearchItemsArgs = {
  input: SearchItemInput;
};


export type QuerySearchMaterialsArgs = {
  input: SearchMaterialInput;
};


export type QuerySearchRootShelvesArgs = {
  input: SearchRootShelfInput;
};


export type QuerySearchRoutineRecordsArgs = {
  input: SearchRoutineRecordInput;
};


export type QuerySearchRoutineTagsArgs = {
  input: SearchRoutineTagInput;
};


export type QuerySearchRoutineTaskRecordsArgs = {
  input: SearchRoutineTaskRecordInput;
};


export type QuerySearchRoutineTasksArgs = {
  input: SearchRoutineTaskInput;
};


export type QuerySearchRoutinesArgs = {
  input: SearchRoutineInput;
};


export type QuerySearchStationsArgs = {
  input: SearchStationInput;
};


export type QuerySearchSubShelvesArgs = {
  input: SearchSubShelfInput;
};


export type QuerySearchThemesArgs = {
  input: SearchThemeInput;
};


export type QuerySearchUsersArgs = {
  input: SearchUserInput;
};

export enum RoutinePeriod {
  RoutinePeriodDaily = 'RoutinePeriod_Daily',
  RoutinePeriodMonthly = 'RoutinePeriod_Monthly',
  RoutinePeriodWeekly = 'RoutinePeriod_Weekly'
}

export enum RoutinePhase {
  RoutinePhaseAnalysis = 'RoutinePhase_Analysis',
  RoutinePhaseClaimed = 'RoutinePhase_Claimed',
  RoutinePhaseExecution = 'RoutinePhase_Execution',
  RoutinePhasePlan = 'RoutinePhase_Plan',
  RoutinePhaseRecovery = 'RoutinePhase_Recovery'
}

export enum RoutineRecordStatus {
  RoutineRecordStatusBlocked = 'RoutineRecordStatus_Blocked',
  RoutineRecordStatusCanceled = 'RoutineRecordStatus_Canceled',
  RoutineRecordStatusFailed = 'RoutineRecordStatus_Failed',
  RoutineRecordStatusPending = 'RoutineRecordStatus_Pending',
  RoutineRecordStatusRunning = 'RoutineRecordStatus_Running',
  RoutineRecordStatusSuccess = 'RoutineRecordStatus_Success'
}

export enum RoutineStatus {
  RoutineStatusCompleted = 'RoutineStatus_Completed',
  RoutineStatusInProgress = 'RoutineStatus_InProgress',
  RoutineStatusOverDue = 'RoutineStatus_OverDue',
  RoutineStatusScheduled = 'RoutineStatus_Scheduled'
}

export enum RoutineTaskPurpose {
  RoutineTaskPurposeCreateBlockPack = 'RoutineTaskPurpose_CreateBlockPack',
  RoutineTaskPurposeCreateMaterial = 'RoutineTaskPurpose_CreateMaterial',
  RoutineTaskPurposeCreateRoutine = 'RoutineTaskPurpose_CreateRoutine',
  RoutineTaskPurposeCreateSubShelf = 'RoutineTaskPurpose_CreateSubShelf',
  RoutineTaskPurposeDeleteBlockPack = 'RoutineTaskPurpose_DeleteBlockPack',
  RoutineTaskPurposeDeleteMaterial = 'RoutineTaskPurpose_DeleteMaterial',
  RoutineTaskPurposeDeleteRoutine = 'RoutineTaskPurpose_DeleteRoutine',
  RoutineTaskPurposeDeleteSubShelf = 'RoutineTaskPurpose_DeleteSubShelf',
  RoutineTaskPurposeGetBlockPack = 'RoutineTaskPurpose_GetBlockPack',
  RoutineTaskPurposeGetMaterial = 'RoutineTaskPurpose_GetMaterial',
  RoutineTaskPurposeGetRoutine = 'RoutineTaskPurpose_GetRoutine',
  RoutineTaskPurposeGetSubShelf = 'RoutineTaskPurpose_GetSubShelf',
  RoutineTaskPurposeUpdateBlockPack = 'RoutineTaskPurpose_UpdateBlockPack',
  RoutineTaskPurposeUpdateMaterial = 'RoutineTaskPurpose_UpdateMaterial',
  RoutineTaskPurposeUpdateRoutine = 'RoutineTaskPurpose_UpdateRoutine',
  RoutineTaskPurposeUpdateSubShelf = 'RoutineTaskPurpose_UpdateSubShelf'
}

export enum RoutineTaskRecordErrorCode {
  RoutineTaskRecordErrorCodeCanceled = 'RoutineTaskRecordErrorCode_Canceled',
  RoutineTaskRecordErrorCodeDatabaseError = 'RoutineTaskRecordErrorCode_DatabaseError',
  RoutineTaskRecordErrorCodeHandlerFailed = 'RoutineTaskRecordErrorCode_HandlerFailed',
  RoutineTaskRecordErrorCodePayloadInvalid = 'RoutineTaskRecordErrorCode_PayloadInvalid',
  RoutineTaskRecordErrorCodePermissionDenied = 'RoutineTaskRecordErrorCode_PermissionDenied',
  RoutineTaskRecordErrorCodePlanLimitExceeded = 'RoutineTaskRecordErrorCode_PlanLimitExceeded',
  RoutineTaskRecordErrorCodeTargetNotFound = 'RoutineTaskRecordErrorCode_TargetNotFound',
  RoutineTaskRecordErrorCodeTimeout = 'RoutineTaskRecordErrorCode_Timeout',
  RoutineTaskRecordErrorCodeUnknown = 'RoutineTaskRecordErrorCode_Unknown'
}

export enum RoutineTaskRecordStatus {
  RoutineTaskRecordStatusBlocked = 'RoutineTaskRecordStatus_Blocked',
  RoutineTaskRecordStatusCancel = 'RoutineTaskRecordStatus_Cancel',
  RoutineTaskRecordStatusFailed = 'RoutineTaskRecordStatus_Failed',
  RoutineTaskRecordStatusReady = 'RoutineTaskRecordStatus_Ready',
  RoutineTaskRecordStatusRunning = 'RoutineTaskRecordStatus_Running',
  RoutineTaskRecordStatusSuccess = 'RoutineTaskRecordStatus_Success',
  RoutineTaskRecordStatusWaiting = 'RoutineTaskRecordStatus_Waiting'
}

export type SearchBadgeConnection = SearchConnection & {
  __typename?: 'SearchBadgeConnection';
  searchEdges: Array<SearchBadgeEdge>;
  searchPageInfo: SearchPageInfo;
  searchTime: Scalars['Float']['output'];
  totalCount: Scalars['Int']['output'];
};

export type SearchBadgeCursorFields = {
  publicId: Scalars['UUID']['input'];
};

export type SearchBadgeEdge = SearchEdge & {
  __typename?: 'SearchBadgeEdge';
  encodedSearchCursor: Scalars['String']['output'];
  node: PublicBadge;
};

export type SearchBadgeFilters = {
  type?: InputMaybe<BadgeType>;
};

export type SearchBadgeInput = {
  after?: InputMaybe<Scalars['String']['input']>;
  filters?: InputMaybe<SearchBadgeFilters>;
  first?: InputMaybe<Scalars['Int']['input']>;
  query: Scalars['String']['input'];
  sortBy?: InputMaybe<SearchBadgeSortBy>;
  sortOrder?: InputMaybe<SearchSortOrder>;
};

export enum SearchBadgeSortBy {
  CreatedAt = 'CREATED_AT',
  Relevance = 'RELEVANCE',
  Title = 'TITLE'
}

export type SearchBlockConnection = SearchConnection & {
  __typename?: 'SearchBlockConnection';
  searchEdges: Array<SearchBlockEdge>;
  searchPageInfo: SearchPageInfo;
  searchTime: Scalars['Float']['output'];
  totalCount: Scalars['Int']['output'];
};

export type SearchBlockCursorFields = {
  id: Scalars['UUID']['input'];
};

export type SearchBlockEdge = SearchEdge & {
  __typename?: 'SearchBlockEdge';
  encodedSearchCursor: Scalars['String']['output'];
  node: PrivateBlock;
};

export type SearchBlockInput = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  query: Scalars['String']['input'];
  sortBy?: InputMaybe<SearchBlockSortBy>;
  sortOrder?: InputMaybe<SearchSortOrder>;
};

export type SearchBlockPackConnection = SearchConnection & {
  __typename?: 'SearchBlockPackConnection';
  searchEdges: Array<SearchBlockPackEdge>;
  searchPageInfo: SearchPageInfo;
  searchTime: Scalars['Float']['output'];
  totalCount: Scalars['Int']['output'];
};

export type SearchBlockPackCursorFields = {
  id: Scalars['UUID']['input'];
};

export type SearchBlockPackEdge = SearchEdge & {
  __typename?: 'SearchBlockPackEdge';
  encodedSearchCursor: Scalars['String']['output'];
  node: PrivateBlockPack;
};

export type SearchBlockPackInput = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  isDeletedAt?: InputMaybe<Scalars['Boolean']['input']>;
  parentSubShelfId?: InputMaybe<Scalars['UUID']['input']>;
  query: Scalars['String']['input'];
  rootShelfId?: InputMaybe<Scalars['UUID']['input']>;
  sortBy?: InputMaybe<SearchBlockPackSortBy>;
  sortOrder?: InputMaybe<SearchSortOrder>;
};

export enum SearchBlockPackSortBy {
  BlockCount = 'BLOCK_COUNT',
  CreatedAt = 'CREATED_AT',
  LastUpdate = 'LAST_UPDATE',
  Name = 'NAME',
  Relevance = 'RELEVANCE'
}

export enum SearchBlockSortBy {
  CreatedAt = 'CREATED_AT',
  LastUpdate = 'LAST_UPDATE',
  Relevance = 'RELEVANCE',
  Type = 'TYPE'
}

export type SearchConnection = {
  searchPageInfo: SearchPageInfo;
  searchTime: Scalars['Float']['output'];
  totalCount: Scalars['Int']['output'];
};

export type SearchEdge = {
  encodedSearchCursor: Scalars['String']['output'];
};

export type SearchItemConnection = SearchConnection & {
  __typename?: 'SearchItemConnection';
  searchEdges: Array<SearchItemEdge>;
  searchPageInfo: SearchPageInfo;
  searchTime: Scalars['Float']['output'];
  totalCount: Scalars['Int']['output'];
};

export type SearchItemCursorFields = {
  id: Scalars['UUID']['input'];
};

export type SearchItemEdge = SearchEdge & {
  __typename?: 'SearchItemEdge';
  encodedSearchCursor: Scalars['String']['output'];
  node: PrivateItem;
};

export type SearchItemInput = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  isDeletedAt?: InputMaybe<Scalars['Boolean']['input']>;
  parentSubShelfId?: InputMaybe<Scalars['UUID']['input']>;
  query: Scalars['String']['input'];
  rootShelfId?: InputMaybe<Scalars['UUID']['input']>;
  sortBy?: InputMaybe<SearchItemSortBy>;
  sortOrder?: InputMaybe<SearchSortOrder>;
};

export enum SearchItemSortBy {
  CreatedAt = 'CREATED_AT',
  LastUpdate = 'LAST_UPDATE',
  Relevance = 'RELEVANCE',
  Type = 'TYPE'
}

export type SearchMaterialConnection = SearchConnection & {
  __typename?: 'SearchMaterialConnection';
  searchEdges: Array<SearchMaterialEdge>;
  searchPageInfo: SearchPageInfo;
  searchTime: Scalars['Float']['output'];
  totalCount: Scalars['Int']['output'];
};

export type SearchMaterialCursorFields = {
  id: Scalars['UUID']['input'];
};

export type SearchMaterialEdge = SearchEdge & {
  __typename?: 'SearchMaterialEdge';
  encodedSearchCursor: Scalars['String']['output'];
  node: PrivateMaterial;
};

export type SearchMaterialInput = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  isDeletedAt?: InputMaybe<Scalars['Boolean']['input']>;
  parentSubShelfId?: InputMaybe<Scalars['UUID']['input']>;
  query: Scalars['String']['input'];
  rootShelfId?: InputMaybe<Scalars['UUID']['input']>;
  sortBy?: InputMaybe<SearchMaterialSortBy>;
  sortOrder?: InputMaybe<SearchSortOrder>;
};

export enum SearchMaterialSortBy {
  ContentType = 'CONTENT_TYPE',
  CreatedAt = 'CREATED_AT',
  LastUpdate = 'LAST_UPDATE',
  Name = 'NAME',
  Relevance = 'RELEVANCE',
  Size = 'SIZE'
}

export type SearchPageInfo = {
  __typename?: 'SearchPageInfo';
  endEncodedSearchCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startEncodedSearchCursor?: Maybe<Scalars['String']['output']>;
};

export type SearchRootShelfConnection = SearchConnection & {
  __typename?: 'SearchRootShelfConnection';
  searchEdges: Array<SearchRootShelfEdge>;
  searchPageInfo: SearchPageInfo;
  searchTime: Scalars['Float']['output'];
  totalCount: Scalars['Int']['output'];
};

export type SearchRootShelfCursorFields = {
  id: Scalars['UUID']['input'];
};

export type SearchRootShelfEdge = SearchEdge & {
  __typename?: 'SearchRootShelfEdge';
  encodedSearchCursor: Scalars['String']['output'];
  node: PrivateRootShelf;
};

export type SearchRootShelfInput = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  isDeletedAt?: InputMaybe<Scalars['Boolean']['input']>;
  query: Scalars['String']['input'];
  sortBy?: InputMaybe<SearchRootShelfSortBy>;
  sortOrder?: InputMaybe<SearchSortOrder>;
};

export enum SearchRootShelfSortBy {
  CreatedAt = 'CREATED_AT',
  LastUpdate = 'LAST_UPDATE',
  Name = 'NAME',
  Relevance = 'RELEVANCE'
}

export type SearchRoutineConnection = SearchConnection & {
  __typename?: 'SearchRoutineConnection';
  searchEdges: Array<SearchRoutineEdge>;
  searchPageInfo: SearchPageInfo;
  searchTime: Scalars['Float']['output'];
  totalCount: Scalars['Int']['output'];
};

export type SearchRoutineCursorFields = {
  id: Scalars['UUID']['input'];
};

export type SearchRoutineEdge = SearchEdge & {
  __typename?: 'SearchRoutineEdge';
  encodedSearchCursor: Scalars['String']['output'];
  node: PrivateSearchableRoutine;
};

export type SearchRoutineInput = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  isDeletedAt?: InputMaybe<Scalars['Boolean']['input']>;
  query: Scalars['String']['input'];
  sortBy?: InputMaybe<SearchRoutineSortBy>;
  sortOrder?: InputMaybe<SearchSortOrder>;
  stationIds: Array<Scalars['UUID']['input']>;
  tagIds: Array<Scalars['UUID']['input']>;
};

export type SearchRoutineRecordConnection = SearchConnection & {
  __typename?: 'SearchRoutineRecordConnection';
  searchEdges: Array<SearchRoutineRecordEdge>;
  searchPageInfo: SearchPageInfo;
  searchTime: Scalars['Float']['output'];
  totalCount: Scalars['Int']['output'];
};

export type SearchRoutineRecordCursorFields = {
  id: Scalars['UUID']['input'];
};

export type SearchRoutineRecordEdge = SearchEdge & {
  __typename?: 'SearchRoutineRecordEdge';
  encodedSearchCursor: Scalars['String']['output'];
  node: PrivateRoutineRecord;
};

export type SearchRoutineRecordInput = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  query: Scalars['String']['input'];
  routineIds: Array<Scalars['UUID']['input']>;
  sortBy?: InputMaybe<SearchRoutineRecordSortBy>;
  sortOrder?: InputMaybe<SearchSortOrder>;
};

export enum SearchRoutineRecordSortBy {
  ActualEndedAt = 'ACTUAL_ENDED_AT',
  ActualStartedAt = 'ACTUAL_STARTED_AT',
  CreatedAt = 'CREATED_AT',
  LastUpdate = 'LAST_UPDATE',
  Relevance = 'RELEVANCE',
  ScheduledAt = 'SCHEDULED_AT',
  Status = 'STATUS'
}

export enum SearchRoutineSortBy {
  CreatedAt = 'CREATED_AT',
  LastUpdate = 'LAST_UPDATE',
  Period = 'PERIOD',
  Relevance = 'RELEVANCE',
  ScheduledEndAt = 'SCHEDULED_END_AT',
  ScheduledStartAt = 'SCHEDULED_START_AT',
  Status = 'STATUS',
  Title = 'TITLE'
}

export type SearchRoutineTagConnection = SearchConnection & {
  __typename?: 'SearchRoutineTagConnection';
  searchEdges: Array<SearchRoutineTagEdge>;
  searchPageInfo: SearchPageInfo;
  searchTime: Scalars['Float']['output'];
  totalCount: Scalars['Int']['output'];
};

export type SearchRoutineTagCursorFields = {
  id: Scalars['UUID']['input'];
};

export type SearchRoutineTagEdge = SearchEdge & {
  __typename?: 'SearchRoutineTagEdge';
  encodedSearchCursor: Scalars['String']['output'];
  node: PrivateRoutineTag;
};

export type SearchRoutineTagInput = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  query: Scalars['String']['input'];
  sortBy?: InputMaybe<SearchRoutineTagSortBy>;
  sortOrder?: InputMaybe<SearchSortOrder>;
};

export enum SearchRoutineTagSortBy {
  CreatedAt = 'CREATED_AT',
  LastUpdate = 'LAST_UPDATE',
  Name = 'NAME',
  Relevance = 'RELEVANCE'
}

export type SearchRoutineTaskConnection = SearchConnection & {
  __typename?: 'SearchRoutineTaskConnection';
  searchEdges: Array<SearchRoutineTaskEdge>;
  searchPageInfo: SearchPageInfo;
  searchTime: Scalars['Float']['output'];
  totalCount: Scalars['Int']['output'];
};

export type SearchRoutineTaskCursorFields = {
  id: Scalars['UUID']['input'];
};

export type SearchRoutineTaskEdge = SearchEdge & {
  __typename?: 'SearchRoutineTaskEdge';
  encodedSearchCursor: Scalars['String']['output'];
  node: PrivateRoutineTask;
};

export type SearchRoutineTaskInput = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  query: Scalars['String']['input'];
  routineIds: Array<Scalars['UUID']['input']>;
  sortBy?: InputMaybe<SearchRoutineTaskSortBy>;
  sortOrder?: InputMaybe<SearchSortOrder>;
};

export type SearchRoutineTaskRecordConnection = SearchConnection & {
  __typename?: 'SearchRoutineTaskRecordConnection';
  searchEdges: Array<SearchRoutineTaskRecordEdge>;
  searchPageInfo: SearchPageInfo;
  searchTime: Scalars['Float']['output'];
  totalCount: Scalars['Int']['output'];
};

export type SearchRoutineTaskRecordCursorFields = {
  id: Scalars['UUID']['input'];
};

export type SearchRoutineTaskRecordEdge = SearchEdge & {
  __typename?: 'SearchRoutineTaskRecordEdge';
  encodedSearchCursor: Scalars['String']['output'];
  node: PrivateRoutineTaskRecord;
};

export type SearchRoutineTaskRecordInput = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  query: Scalars['String']['input'];
  routineTaskIds: Array<Scalars['UUID']['input']>;
  sortBy?: InputMaybe<SearchRoutineTaskRecordSortBy>;
  sortOrder?: InputMaybe<SearchSortOrder>;
};

export enum SearchRoutineTaskRecordSortBy {
  ActualEndedAt = 'ACTUAL_ENDED_AT',
  ActualStartedAt = 'ACTUAL_STARTED_AT',
  Attempts = 'ATTEMPTS',
  CostUnit = 'COST_UNIT',
  CreatedAt = 'CREATED_AT',
  LastUpdate = 'LAST_UPDATE',
  Purpose = 'PURPOSE',
  Relevance = 'RELEVANCE',
  Status = 'STATUS'
}

export enum SearchRoutineTaskSortBy {
  CreatedAt = 'CREATED_AT',
  LastUpdate = 'LAST_UPDATE',
  MaxAttempts = 'MAX_ATTEMPTS',
  Priority = 'PRIORITY',
  Purpose = 'PURPOSE',
  Relevance = 'RELEVANCE',
  Title = 'TITLE'
}

export enum SearchSortOrder {
  Asc = 'ASC',
  Desc = 'DESC'
}

export type SearchStationConnection = SearchConnection & {
  __typename?: 'SearchStationConnection';
  searchEdges: Array<SearchStationEdge>;
  searchPageInfo: SearchPageInfo;
  searchTime: Scalars['Float']['output'];
  totalCount: Scalars['Int']['output'];
};

export type SearchStationCursorFields = {
  id: Scalars['UUID']['input'];
};

export type SearchStationEdge = SearchEdge & {
  __typename?: 'SearchStationEdge';
  encodedSearchCursor: Scalars['String']['output'];
  node: PrivateSearchableStation;
};

export type SearchStationInput = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  isDeletedAt?: InputMaybe<Scalars['Boolean']['input']>;
  query: Scalars['String']['input'];
  sortBy?: InputMaybe<SearchStationSortBy>;
  sortOrder?: InputMaybe<SearchSortOrder>;
};

export enum SearchStationSortBy {
  CreatedAt = 'CREATED_AT',
  LastUpdate = 'LAST_UPDATE',
  Name = 'NAME',
  Relevance = 'RELEVANCE',
  RoutineCount = 'ROUTINE_COUNT'
}

export type SearchSubShelfConnection = SearchConnection & {
  __typename?: 'SearchSubShelfConnection';
  searchEdges: Array<SearchSubShelfEdge>;
  searchPageInfo: SearchPageInfo;
  searchTime: Scalars['Float']['output'];
  totalCount: Scalars['Int']['output'];
};

export type SearchSubShelfCursorFields = {
  id: Scalars['UUID']['input'];
};

export type SearchSubShelfEdge = SearchEdge & {
  __typename?: 'SearchSubShelfEdge';
  encodedSearchCursor: Scalars['String']['output'];
  node: PrivateSubShelf;
};

export type SearchSubShelfInput = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  isDeletedAt?: InputMaybe<Scalars['Boolean']['input']>;
  prevSubShelfId?: InputMaybe<Scalars['UUID']['input']>;
  query: Scalars['String']['input'];
  rootShelfId?: InputMaybe<Scalars['UUID']['input']>;
  sortBy?: InputMaybe<SearchSubShelfSortBy>;
  sortOrder?: InputMaybe<SearchSortOrder>;
};

export enum SearchSubShelfSortBy {
  CreatedAt = 'CREATED_AT',
  LastUpdate = 'LAST_UPDATE',
  Name = 'NAME',
  PathLength = 'PATH_LENGTH',
  Relevance = 'RELEVANCE'
}

export type SearchThemeConnection = SearchConnection & {
  __typename?: 'SearchThemeConnection';
  searchEdges: Array<SearchThemeEdge>;
  searchPageInfo: SearchPageInfo;
  searchTime: Scalars['Float']['output'];
  totalCount: Scalars['Int']['output'];
};

export type SearchThemeCursorFields = {
  publicId: Scalars['UUID']['input'];
};

export type SearchThemeEdge = SearchEdge & {
  __typename?: 'SearchThemeEdge';
  encodedSearchCursor: Scalars['String']['output'];
  node: PublicTheme;
};

export type SearchThemeFilters = {
  downloadCountGreaterThan?: InputMaybe<Scalars['Int']['input']>;
  isDefault?: InputMaybe<Scalars['Boolean']['input']>;
};

export type SearchThemeInput = {
  after?: InputMaybe<Scalars['String']['input']>;
  filters?: InputMaybe<SearchThemeFilters>;
  first?: InputMaybe<Scalars['Int']['input']>;
  query: Scalars['String']['input'];
  sortBy?: InputMaybe<SearchThemeSortBy>;
  sortOrder?: InputMaybe<SearchSortOrder>;
};

export enum SearchThemeSortBy {
  CreatedAt = 'CREATED_AT',
  LastUpdate = 'LAST_UPDATE',
  Name = 'NAME',
  Relevance = 'RELEVANCE'
}

export type SearchUserConnection = SearchConnection & {
  __typename?: 'SearchUserConnection';
  searchEdges: Array<SearchUserEdge>;
  searchPageInfo: SearchPageInfo;
  searchTime: Scalars['Float']['output'];
  totalCount: Scalars['Int']['output'];
};

export type SearchUserCursorFields = {
  publicId: Scalars['UUID']['input'];
};

export type SearchUserEdge = SearchEdge & {
  __typename?: 'SearchUserEdge';
  encodedSearchCursor: Scalars['String']['output'];
  node: PublicUser;
};

export type SearchUserFilters = {
  country?: InputMaybe<Country>;
  hasAvatar?: InputMaybe<Scalars['Boolean']['input']>;
  isOnline?: InputMaybe<Scalars['Boolean']['input']>;
  plan?: InputMaybe<UserPlan>;
  role?: InputMaybe<UserRole>;
  status?: InputMaybe<UserStatus>;
};

export type SearchUserInput = {
  after?: InputMaybe<Scalars['String']['input']>;
  badgePublicIds?: InputMaybe<Array<Scalars['UUID']['input']>>;
  filters?: InputMaybe<SearchUserFilters>;
  first?: InputMaybe<Scalars['Int']['input']>;
  query: Scalars['String']['input'];
  rootShelfIds?: InputMaybe<Array<Scalars['UUID']['input']>>;
  sortBy?: InputMaybe<SearchUserSortBy>;
  sortOrder?: InputMaybe<SearchSortOrder>;
  stationIds?: InputMaybe<Array<Scalars['UUID']['input']>>;
};

export enum SearchUserSortBy {
  CreatedAt = 'CREATED_AT',
  LastActive = 'LAST_ACTIVE',
  Name = 'NAME',
  Relevance = 'RELEVANCE'
}

export enum SupportedIcon {
  SupportedIconBooks = 'SupportedIcon_Books',
  SupportedIconCalendar = 'SupportedIcon_Calendar',
  SupportedIconCheckMark = 'SupportedIcon_CheckMark',
  SupportedIconClock = 'SupportedIcon_Clock',
  SupportedIconFire = 'SupportedIcon_Fire',
  SupportedIconFolderOpen = 'SupportedIcon_FolderOpen',
  SupportedIconGrinningFace = 'SupportedIcon_GrinningFace',
  SupportedIconLightbulb = 'SupportedIcon_Lightbulb',
  SupportedIconNotebook = 'SupportedIcon_Notebook',
  SupportedIconPencilPaper = 'SupportedIcon_PencilPaper',
  SupportedIconPin = 'SupportedIcon_Pin',
  SupportedIconRedHeart = 'SupportedIcon_RedHeart',
  SupportedIconRocket = 'SupportedIcon_Rocket',
  SupportedIconSmilingFaceWithSmilingEyes = 'SupportedIcon_SmilingFaceWithSmilingEyes',
  SupportedIconStar = 'SupportedIcon_Star'
}

export enum UserGender {
  Female = 'Female',
  Male = 'Male',
  PreferNotToSay = 'PreferNotToSay'
}

export enum UserPlan {
  Enterprise = 'Enterprise',
  Free = 'Free',
  Pro = 'Pro',
  Ultimate = 'Ultimate'
}

export enum UserRole {
  Admin = 'Admin',
  Guest = 'Guest',
  Normal = 'Normal'
}

export enum UserStatus {
  Afk = 'AFK',
  DoNotDisturb = 'DoNotDisturb',
  Offline = 'Offline',
  Online = 'Online'
}

export type FragmentedBasicPublicBadgeFragment = { __typename?: 'PublicBadge', publicId: UUID, title: string, description: string, type: BadgeType, imageURL?: string | null, createdAt: Date } & { ' $fragmentName'?: 'FragmentedBasicPublicBadgeFragment' };

export type FragmentedBasicPrivateBlockFragment = { __typename?: 'PrivateBlock', id: UUID, blockPackId: UUID, parentBlockId?: UUID | null, prevBlockId?: UUID | null, nextBlockId?: UUID | null, type: BlockType, props: Record<string, unknown>, content: Record<string, unknown>, updatedAt: Date, createdAt: Date } & { ' $fragmentName'?: 'FragmentedBasicPrivateBlockFragment' };

export type FragmentedPrivateBlockFragment = (
  { __typename?: 'PrivateBlock' }
  & { ' $fragmentRefs'?: { 'FragmentedBasicPrivateBlockFragment': FragmentedBasicPrivateBlockFragment } }
) & { ' $fragmentName'?: 'FragmentedPrivateBlockFragment' };

export type FragmentedBasicPrivateBlockPackFragment = { __typename?: 'PrivateBlockPack', id: UUID, parentSubShelfId: UUID, name: string, icon?: SupportedIcon | null, headerBackgroundURL?: string | null, blockCount: number, deletedAt?: Date | null, updatedAt: Date, createdAt: Date, blockIds: Array<UUID> } & { ' $fragmentName'?: 'FragmentedBasicPrivateBlockPackFragment' };

export type FragmentedPrivateBlockPackFragment = (
  { __typename?: 'PrivateBlockPack' }
  & { ' $fragmentRefs'?: { 'FragmentedBasicPrivateBlockPackFragment': FragmentedBasicPrivateBlockPackFragment } }
) & { ' $fragmentName'?: 'FragmentedPrivateBlockPackFragment' };

export type FragmentedBasicPrivateItemFragment = { __typename?: 'PrivateItem', id: UUID, parentSubShelfId: UUID, rootShelfId: UUID, type: ItemType, deletedAt?: Date | null, updatedAt: Date, createdAt: Date, routineIds: Array<UUID> } & { ' $fragmentName'?: 'FragmentedBasicPrivateItemFragment' };

export type FragmentedPrivateItemFragment = (
  { __typename?: 'PrivateItem' }
  & { ' $fragmentRefs'?: { 'FragmentedBasicPrivateItemFragment': FragmentedBasicPrivateItemFragment } }
) & { ' $fragmentName'?: 'FragmentedPrivateItemFragment' };

export type FragmentedBasicPrivateMaterialFragment = { __typename?: 'PrivateMaterial', id: UUID, parentSubShelfId: UUID, name: string, size: number, contentType: MaterialContentType, parseMediaType: string, deletedAt?: Date | null, updatedAt: Date, createdAt: Date } & { ' $fragmentName'?: 'FragmentedBasicPrivateMaterialFragment' };

export type FragmentedPrivateMaterialFragment = (
  { __typename?: 'PrivateMaterial' }
  & { ' $fragmentRefs'?: { 'FragmentedBasicPrivateMaterialFragment': FragmentedBasicPrivateMaterialFragment } }
) & { ' $fragmentName'?: 'FragmentedPrivateMaterialFragment' };

export type FragmentedBasicPrivateRootShelfFragment = { __typename?: 'PrivateRootShelf', id: UUID, name: string, permission: AccessControlPermission, subShelfCount: number, itemCount: number, lastAnalyzedAt: Date, deletedAt?: Date | null, updatedAt: Date, createdAt: Date, itemIds: Array<UUID>, owner: (
    { __typename?: 'PublicUser' }
    & { ' $fragmentRefs'?: { 'FragmentedPublicUserFragment': FragmentedPublicUserFragment } }
  ), sharers: Array<(
    { __typename?: 'PublicUser' }
    & { ' $fragmentRefs'?: { 'FragmentedPublicUserFragment': FragmentedPublicUserFragment } }
  )> } & { ' $fragmentName'?: 'FragmentedBasicPrivateRootShelfFragment' };

export type FragmentedPrivateRootShelfFragment = (
  { __typename?: 'PrivateRootShelf' }
  & { ' $fragmentRefs'?: { 'FragmentedBasicPrivateRootShelfFragment': FragmentedBasicPrivateRootShelfFragment } }
) & { ' $fragmentName'?: 'FragmentedPrivateRootShelfFragment' };

export type FragmentedBasicPrivateRoutineFragment = { __typename?: 'PrivateRoutine', id: UUID, stationId: UUID, title: string, description: string, status: RoutineStatus, phase?: RoutinePhase | null, isPinned: boolean, scheduledStartAt: Date, scheduledEndAt: Date, period?: RoutinePeriod | null, timezone: string, deletedAt?: Date | null, updatedAt: Date, createdAt: Date, tagIds: Array<UUID>, taskIds: Array<UUID>, itemIds: Array<UUID> } & { ' $fragmentName'?: 'FragmentedBasicPrivateRoutineFragment' };

export type FragmentedPrivateRoutineFragment = (
  { __typename?: 'PrivateRoutine' }
  & { ' $fragmentRefs'?: { 'FragmentedBasicPrivateRoutineFragment': FragmentedBasicPrivateRoutineFragment } }
) & { ' $fragmentName'?: 'FragmentedPrivateRoutineFragment' };

export type FragmentedBasicPrivateSearchableRoutineFragment = { __typename?: 'PrivateSearchableRoutine', id: UUID, stationId: UUID, title: string, status: RoutineStatus, phase?: RoutinePhase | null, isPinned: boolean, scheduledStartAt: Date, scheduledEndAt: Date, period?: RoutinePeriod | null, timezone: string, deletedAt?: Date | null, updatedAt: Date, createdAt: Date, tagIds: Array<UUID>, taskIds: Array<UUID>, itemIds: Array<UUID> } & { ' $fragmentName'?: 'FragmentedBasicPrivateSearchableRoutineFragment' };

export type FragmentedPrivateSearchableRoutineFragment = (
  { __typename?: 'PrivateSearchableRoutine' }
  & { ' $fragmentRefs'?: { 'FragmentedBasicPrivateSearchableRoutineFragment': FragmentedBasicPrivateSearchableRoutineFragment } }
) & { ' $fragmentName'?: 'FragmentedPrivateSearchableRoutineFragment' };

export type FragmentedPrivateRoutineRecordFragment = { __typename?: 'PrivateRoutineRecord', id: UUID, routineId: UUID, status: RoutineRecordStatus, scheduledAt: Date, actualStartedAt?: Date | null, actualEndedAt?: Date | null, totalTaskCount: number, successTaskCount: number, failedTaskCount: number, blockedTaskCount: number, runningTaskCount: number, waitingTaskCount: number, snapshot: Record<string, unknown>, updatedAt: Date, createdAt: Date } & { ' $fragmentName'?: 'FragmentedPrivateRoutineRecordFragment' };

export type FragmentedBasicPrivateRoutineTagFragment = { __typename?: 'PrivateRoutineTag', id: UUID, name: string, color: string, icon?: SupportedIcon | null, updatedAt: Date, createdAt: Date } & { ' $fragmentName'?: 'FragmentedBasicPrivateRoutineTagFragment' };

export type FragmentedPrivateRoutineTagFragment = (
  { __typename?: 'PrivateRoutineTag' }
  & { ' $fragmentRefs'?: { 'FragmentedBasicPrivateRoutineTagFragment': FragmentedBasicPrivateRoutineTagFragment } }
) & { ' $fragmentName'?: 'FragmentedPrivateRoutineTagFragment' };

export type FragmentedBasicPrivateRoutineTaskFragment = { __typename?: 'PrivateRoutineTask', id: UUID, routineId: UUID, title: string, purpose: RoutineTaskPurpose, phase?: RoutinePhase | null, costUnit: number, priority: number, maxAttempts: number, previousRoutineTaskIds: Array<UUID>, updatedAt: Date, createdAt: Date } & { ' $fragmentName'?: 'FragmentedBasicPrivateRoutineTaskFragment' };

export type FragmentedPrivateRoutineTaskFragment = (
  { __typename?: 'PrivateRoutineTask' }
  & { ' $fragmentRefs'?: { 'FragmentedBasicPrivateRoutineTaskFragment': FragmentedBasicPrivateRoutineTaskFragment } }
) & { ' $fragmentName'?: 'FragmentedPrivateRoutineTaskFragment' };

export type FragmentedPrivateRoutineTaskRecordFragment = { __typename?: 'PrivateRoutineTaskRecord', id: UUID, routineRecordId: UUID, routineTaskId: UUID, purpose: RoutineTaskPurpose, status: RoutineTaskRecordStatus, errorCode?: RoutineTaskRecordErrorCode | null, errorReason?: string | null, costUnit: number, attempts: number, payloadSnapshot: Record<string, unknown>, resultSnapshot: Record<string, unknown>, actualStartedAt?: Date | null, actualEndedAt?: Date | null, updatedAt: Date, createdAt: Date } & { ' $fragmentName'?: 'FragmentedPrivateRoutineTaskRecordFragment' };

export type FragmentedBasicPrivateStationFragment = { __typename?: 'PrivateStation', id: UUID, permission: AccessControlPermission, name: string, description: string, icon?: SupportedIcon | null, headerBackgroundURL?: string | null, routineCount: number, deletedAt?: Date | null, updatedAt: Date, createdAt: Date } & { ' $fragmentName'?: 'FragmentedBasicPrivateStationFragment' };

export type FragmentedPrivateStationFragment = (
  { __typename?: 'PrivateStation' }
  & { ' $fragmentRefs'?: { 'FragmentedBasicPrivateStationFragment': FragmentedBasicPrivateStationFragment } }
) & { ' $fragmentName'?: 'FragmentedPrivateStationFragment' };

export type FragmentedBasicPrivateSearchableStationFragment = { __typename?: 'PrivateSearchableStation', id: UUID, permission: AccessControlPermission, name: string, icon?: SupportedIcon | null, headerBackgroundURL?: string | null, routineCount: number, deletedAt?: Date | null, updatedAt: Date, createdAt: Date } & { ' $fragmentName'?: 'FragmentedBasicPrivateSearchableStationFragment' };

export type FragmentedPrivateSearchableStationFragment = (
  { __typename?: 'PrivateSearchableStation' }
  & { ' $fragmentRefs'?: { 'FragmentedBasicPrivateSearchableStationFragment': FragmentedBasicPrivateSearchableStationFragment } }
) & { ' $fragmentName'?: 'FragmentedPrivateSearchableStationFragment' };

export type FragmentedBasicPrivateSubShelfFragment = { __typename?: 'PrivateSubShelf', id: UUID, name: string, rootShelfId: UUID, prevSubShelfId?: UUID | null, path: Array<UUID>, deletedAt?: Date | null, updatedAt: Date, createdAt: Date, nextSubShelfIds: Array<UUID>, itemIds: Array<UUID> } & { ' $fragmentName'?: 'FragmentedBasicPrivateSubShelfFragment' };

export type FragmentedPrivateSubShelfFragment = (
  { __typename?: 'PrivateSubShelf' }
  & { ' $fragmentRefs'?: { 'FragmentedBasicPrivateSubShelfFragment': FragmentedBasicPrivateSubShelfFragment } }
) & { ' $fragmentName'?: 'FragmentedPrivateSubShelfFragment' };

export type FragmentedBasicPublicThemeFragment = { __typename?: 'PublicTheme', publicId: UUID, name: string, isDark: boolean, authorId: UUID, version: string, isDefault: boolean, downloadURL?: string | null, downloadCount: number, createdAt: Date, updatedAt: Date } & { ' $fragmentName'?: 'FragmentedBasicPublicThemeFragment' };

export type FragmentedPublicThemeFragment = (
  { __typename?: 'PublicTheme' }
  & { ' $fragmentRefs'?: { 'FragmentedBasicPublicThemeFragment': FragmentedBasicPublicThemeFragment } }
) & { ' $fragmentName'?: 'FragmentedPublicThemeFragment' };

export type FragmentedBasicPublicUserFragment = { __typename?: 'PublicUser', publicId: UUID, name: string, displayName: string, role: UserRole, plan: UserPlan, status: UserStatus, createdAt: Date, info?: (
    { __typename?: 'PublicUserInfo' }
    & { ' $fragmentRefs'?: { 'FragmentedPublicUserInfoFragment': FragmentedPublicUserInfoFragment } }
  ) | null } & { ' $fragmentName'?: 'FragmentedBasicPublicUserFragment' };

export type FragmentedPublicUserFragment = (
  { __typename?: 'PublicUser' }
  & { ' $fragmentRefs'?: { 'FragmentedBasicPublicUserFragment': FragmentedBasicPublicUserFragment } }
) & { ' $fragmentName'?: 'FragmentedPublicUserFragment' };

export type FragmentedBasicPublicUserInfoFragment = { __typename?: 'PublicUserInfo', avatarURL?: string | null, coverBackgroundURL?: string | null, header?: string | null, introduction?: string | null, gender: UserGender, country?: Country | null, birthDate: Date } & { ' $fragmentName'?: 'FragmentedBasicPublicUserInfoFragment' };

export type FragmentedPublicUserInfoFragment = (
  { __typename?: 'PublicUserInfo' }
  & { ' $fragmentRefs'?: { 'FragmentedBasicPublicUserInfoFragment': FragmentedBasicPublicUserInfoFragment } }
) & { ' $fragmentName'?: 'FragmentedPublicUserInfoFragment' };

export type SearchUsersQueryVariables = Exact<{
  input: SearchUserInput;
}>;


export type SearchUsersQuery = { __typename?: 'Query', searchUsers: { __typename?: 'SearchUserConnection', totalCount: number, searchTime: number, searchEdges: Array<{ __typename?: 'SearchUserEdge', encodedSearchCursor: string, node: (
        { __typename?: 'PublicUser' }
        & { ' $fragmentRefs'?: { 'FragmentedPublicUserFragment': FragmentedPublicUserFragment } }
      ) }>, searchPageInfo: { __typename?: 'SearchPageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startEncodedSearchCursor?: string | null, endEncodedSearchCursor?: string | null } } };

export type SearchThemesQueryVariables = Exact<{
  input: SearchThemeInput;
}>;


export type SearchThemesQuery = { __typename?: 'Query', searchThemes: { __typename?: 'SearchThemeConnection', totalCount: number, searchTime: number, searchEdges: Array<{ __typename?: 'SearchThemeEdge', encodedSearchCursor: string, node: (
        { __typename?: 'PublicTheme' }
        & { ' $fragmentRefs'?: { 'FragmentedPublicThemeFragment': FragmentedPublicThemeFragment } }
      ) }>, searchPageInfo: { __typename?: 'SearchPageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startEncodedSearchCursor?: string | null, endEncodedSearchCursor?: string | null } } };

export type SearchRootShelvesQueryVariables = Exact<{
  input: SearchRootShelfInput;
}>;


export type SearchRootShelvesQuery = { __typename?: 'Query', searchRootShelves: { __typename?: 'SearchRootShelfConnection', totalCount: number, searchTime: number, searchEdges: Array<{ __typename?: 'SearchRootShelfEdge', encodedSearchCursor: string, node: (
        { __typename?: 'PrivateRootShelf' }
        & { ' $fragmentRefs'?: { 'FragmentedPrivateRootShelfFragment': FragmentedPrivateRootShelfFragment } }
      ) }>, searchPageInfo: { __typename?: 'SearchPageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startEncodedSearchCursor?: string | null, endEncodedSearchCursor?: string | null } } };

export type SearchSubShelvesQueryVariables = Exact<{
  input: SearchSubShelfInput;
}>;


export type SearchSubShelvesQuery = { __typename?: 'Query', searchSubShelves: { __typename?: 'SearchSubShelfConnection', totalCount: number, searchTime: number, searchEdges: Array<{ __typename?: 'SearchSubShelfEdge', encodedSearchCursor: string, node: (
        { __typename?: 'PrivateSubShelf' }
        & { ' $fragmentRefs'?: { 'FragmentedPrivateSubShelfFragment': FragmentedPrivateSubShelfFragment } }
      ) }>, searchPageInfo: { __typename?: 'SearchPageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startEncodedSearchCursor?: string | null, endEncodedSearchCursor?: string | null } } };

export type SearchItemsQueryVariables = Exact<{
  input: SearchItemInput;
}>;


export type SearchItemsQuery = { __typename?: 'Query', searchItems: { __typename?: 'SearchItemConnection', totalCount: number, searchTime: number, searchEdges: Array<{ __typename?: 'SearchItemEdge', encodedSearchCursor: string, node: (
        { __typename?: 'PrivateItem' }
        & { ' $fragmentRefs'?: { 'FragmentedPrivateItemFragment': FragmentedPrivateItemFragment } }
      ) }>, searchPageInfo: { __typename?: 'SearchPageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startEncodedSearchCursor?: string | null, endEncodedSearchCursor?: string | null } } };

export type SearchMaterialsQueryVariables = Exact<{
  input: SearchMaterialInput;
}>;


export type SearchMaterialsQuery = { __typename?: 'Query', searchMaterials: { __typename?: 'SearchMaterialConnection', totalCount: number, searchTime: number, searchEdges: Array<{ __typename?: 'SearchMaterialEdge', encodedSearchCursor: string, node: (
        { __typename?: 'PrivateMaterial' }
        & { ' $fragmentRefs'?: { 'FragmentedPrivateMaterialFragment': FragmentedPrivateMaterialFragment } }
      ) }>, searchPageInfo: { __typename?: 'SearchPageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startEncodedSearchCursor?: string | null, endEncodedSearchCursor?: string | null } } };

export type SearchBlockPacksQueryVariables = Exact<{
  input: SearchBlockPackInput;
}>;


export type SearchBlockPacksQuery = { __typename?: 'Query', searchBlockPacks: { __typename?: 'SearchBlockPackConnection', totalCount: number, searchTime: number, searchEdges: Array<{ __typename?: 'SearchBlockPackEdge', encodedSearchCursor: string, node: (
        { __typename?: 'PrivateBlockPack' }
        & { ' $fragmentRefs'?: { 'FragmentedPrivateBlockPackFragment': FragmentedPrivateBlockPackFragment } }
      ) }>, searchPageInfo: { __typename?: 'SearchPageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startEncodedSearchCursor?: string | null, endEncodedSearchCursor?: string | null } } };

export type SearchBlocksQueryVariables = Exact<{
  input: SearchBlockInput;
}>;


export type SearchBlocksQuery = { __typename?: 'Query', searchBlocks: { __typename?: 'SearchBlockConnection', totalCount: number, searchTime: number, searchEdges: Array<{ __typename?: 'SearchBlockEdge', encodedSearchCursor: string, node: (
        { __typename?: 'PrivateBlock' }
        & { ' $fragmentRefs'?: { 'FragmentedPrivateBlockFragment': FragmentedPrivateBlockFragment } }
      ) }>, searchPageInfo: { __typename?: 'SearchPageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startEncodedSearchCursor?: string | null, endEncodedSearchCursor?: string | null } } };

export type SearchStationsQueryVariables = Exact<{
  input: SearchStationInput;
}>;


export type SearchStationsQuery = { __typename?: 'Query', searchStations: { __typename?: 'SearchStationConnection', totalCount: number, searchTime: number, searchEdges: Array<{ __typename?: 'SearchStationEdge', encodedSearchCursor: string, node: (
        { __typename?: 'PrivateSearchableStation' }
        & { ' $fragmentRefs'?: { 'FragmentedPrivateSearchableStationFragment': FragmentedPrivateSearchableStationFragment } }
      ) }>, searchPageInfo: { __typename?: 'SearchPageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startEncodedSearchCursor?: string | null, endEncodedSearchCursor?: string | null } } };

export type SearchRoutinesQueryVariables = Exact<{
  input: SearchRoutineInput;
}>;


export type SearchRoutinesQuery = { __typename?: 'Query', searchRoutines: { __typename?: 'SearchRoutineConnection', totalCount: number, searchTime: number, searchEdges: Array<{ __typename?: 'SearchRoutineEdge', encodedSearchCursor: string, node: (
        { __typename?: 'PrivateSearchableRoutine' }
        & { ' $fragmentRefs'?: { 'FragmentedPrivateSearchableRoutineFragment': FragmentedPrivateSearchableRoutineFragment } }
      ) }>, searchPageInfo: { __typename?: 'SearchPageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startEncodedSearchCursor?: string | null, endEncodedSearchCursor?: string | null } } };

export type SearchRoutineTagsQueryVariables = Exact<{
  input: SearchRoutineTagInput;
}>;


export type SearchRoutineTagsQuery = { __typename?: 'Query', searchRoutineTags: { __typename?: 'SearchRoutineTagConnection', totalCount: number, searchTime: number, searchEdges: Array<{ __typename?: 'SearchRoutineTagEdge', encodedSearchCursor: string, node: (
        { __typename?: 'PrivateRoutineTag' }
        & { ' $fragmentRefs'?: { 'FragmentedPrivateRoutineTagFragment': FragmentedPrivateRoutineTagFragment } }
      ) }>, searchPageInfo: { __typename?: 'SearchPageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startEncodedSearchCursor?: string | null, endEncodedSearchCursor?: string | null } } };

export type SearchRoutineTasksQueryVariables = Exact<{
  input: SearchRoutineTaskInput;
}>;


export type SearchRoutineTasksQuery = { __typename?: 'Query', searchRoutineTasks: { __typename?: 'SearchRoutineTaskConnection', totalCount: number, searchTime: number, searchEdges: Array<{ __typename?: 'SearchRoutineTaskEdge', encodedSearchCursor: string, node: (
        { __typename?: 'PrivateRoutineTask' }
        & { ' $fragmentRefs'?: { 'FragmentedPrivateRoutineTaskFragment': FragmentedPrivateRoutineTaskFragment } }
      ) }>, searchPageInfo: { __typename?: 'SearchPageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startEncodedSearchCursor?: string | null, endEncodedSearchCursor?: string | null } } };

export type SearchRoutineRecordsQueryVariables = Exact<{
  input: SearchRoutineRecordInput;
}>;


export type SearchRoutineRecordsQuery = { __typename?: 'Query', searchRoutineRecords: { __typename?: 'SearchRoutineRecordConnection', totalCount: number, searchTime: number, searchEdges: Array<{ __typename?: 'SearchRoutineRecordEdge', encodedSearchCursor: string, node: (
        { __typename?: 'PrivateRoutineRecord' }
        & { ' $fragmentRefs'?: { 'FragmentedPrivateRoutineRecordFragment': FragmentedPrivateRoutineRecordFragment } }
      ) }>, searchPageInfo: { __typename?: 'SearchPageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startEncodedSearchCursor?: string | null, endEncodedSearchCursor?: string | null } } };

export type SearchRoutineTaskRecordsQueryVariables = Exact<{
  input: SearchRoutineTaskRecordInput;
}>;


export type SearchRoutineTaskRecordsQuery = { __typename?: 'Query', searchRoutineTaskRecords: { __typename?: 'SearchRoutineTaskRecordConnection', totalCount: number, searchTime: number, searchEdges: Array<{ __typename?: 'SearchRoutineTaskRecordEdge', encodedSearchCursor: string, node: (
        { __typename?: 'PrivateRoutineTaskRecord' }
        & { ' $fragmentRefs'?: { 'FragmentedPrivateRoutineTaskRecordFragment': FragmentedPrivateRoutineTaskRecordFragment } }
      ) }>, searchPageInfo: { __typename?: 'SearchPageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startEncodedSearchCursor?: string | null, endEncodedSearchCursor?: string | null } } };

export const FragmentedBasicPublicBadgeFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FragmentedBasicPublicBadge"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PublicBadge"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"publicId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"imageURL"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<FragmentedBasicPublicBadgeFragment, unknown>;
export const FragmentedBasicPrivateBlockFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FragmentedBasicPrivateBlock"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PrivateBlock"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"blockPackId"}},{"kind":"Field","name":{"kind":"Name","value":"parentBlockId"}},{"kind":"Field","name":{"kind":"Name","value":"prevBlockId"}},{"kind":"Field","name":{"kind":"Name","value":"nextBlockId"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"props"}},{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<FragmentedBasicPrivateBlockFragment, unknown>;
export const FragmentedPrivateBlockFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FragmentedPrivateBlock"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PrivateBlock"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FragmentedBasicPrivateBlock"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FragmentedBasicPrivateBlock"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PrivateBlock"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"blockPackId"}},{"kind":"Field","name":{"kind":"Name","value":"parentBlockId"}},{"kind":"Field","name":{"kind":"Name","value":"prevBlockId"}},{"kind":"Field","name":{"kind":"Name","value":"nextBlockId"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"props"}},{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<FragmentedPrivateBlockFragment, unknown>;
export const FragmentedBasicPrivateBlockPackFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FragmentedBasicPrivateBlockPack"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PrivateBlockPack"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"parentSubShelfId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"icon"}},{"kind":"Field","name":{"kind":"Name","value":"headerBackgroundURL"}},{"kind":"Field","name":{"kind":"Name","value":"blockCount"}},{"kind":"Field","name":{"kind":"Name","value":"deletedAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"blockIds"}}]}}]} as unknown as DocumentNode<FragmentedBasicPrivateBlockPackFragment, unknown>;
export const FragmentedPrivateBlockPackFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FragmentedPrivateBlockPack"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PrivateBlockPack"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FragmentedBasicPrivateBlockPack"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FragmentedBasicPrivateBlockPack"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PrivateBlockPack"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"parentSubShelfId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"icon"}},{"kind":"Field","name":{"kind":"Name","value":"headerBackgroundURL"}},{"kind":"Field","name":{"kind":"Name","value":"blockCount"}},{"kind":"Field","name":{"kind":"Name","value":"deletedAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"blockIds"}}]}}]} as unknown as DocumentNode<FragmentedPrivateBlockPackFragment, unknown>;
export const FragmentedBasicPrivateItemFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FragmentedBasicPrivateItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PrivateItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"parentSubShelfId"}},{"kind":"Field","name":{"kind":"Name","value":"rootShelfId"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"deletedAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"routineIds"}}]}}]} as unknown as DocumentNode<FragmentedBasicPrivateItemFragment, unknown>;
export const FragmentedPrivateItemFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FragmentedPrivateItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PrivateItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FragmentedBasicPrivateItem"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FragmentedBasicPrivateItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PrivateItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"parentSubShelfId"}},{"kind":"Field","name":{"kind":"Name","value":"rootShelfId"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"deletedAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"routineIds"}}]}}]} as unknown as DocumentNode<FragmentedPrivateItemFragment, unknown>;
export const FragmentedBasicPrivateMaterialFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FragmentedBasicPrivateMaterial"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PrivateMaterial"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"parentSubShelfId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"size"}},{"kind":"Field","name":{"kind":"Name","value":"contentType"}},{"kind":"Field","name":{"kind":"Name","value":"parseMediaType"}},{"kind":"Field","name":{"kind":"Name","value":"deletedAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<FragmentedBasicPrivateMaterialFragment, unknown>;
export const FragmentedPrivateMaterialFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FragmentedPrivateMaterial"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PrivateMaterial"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FragmentedBasicPrivateMaterial"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FragmentedBasicPrivateMaterial"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PrivateMaterial"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"parentSubShelfId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"size"}},{"kind":"Field","name":{"kind":"Name","value":"contentType"}},{"kind":"Field","name":{"kind":"Name","value":"parseMediaType"}},{"kind":"Field","name":{"kind":"Name","value":"deletedAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<FragmentedPrivateMaterialFragment, unknown>;
export const FragmentedBasicPublicUserInfoFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FragmentedBasicPublicUserInfo"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PublicUserInfo"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"avatarURL"}},{"kind":"Field","name":{"kind":"Name","value":"coverBackgroundURL"}},{"kind":"Field","name":{"kind":"Name","value":"header"}},{"kind":"Field","name":{"kind":"Name","value":"introduction"}},{"kind":"Field","name":{"kind":"Name","value":"gender"}},{"kind":"Field","name":{"kind":"Name","value":"country"}},{"kind":"Field","name":{"kind":"Name","value":"birthDate"}}]}}]} as unknown as DocumentNode<FragmentedBasicPublicUserInfoFragment, unknown>;
export const FragmentedPublicUserInfoFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FragmentedPublicUserInfo"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PublicUserInfo"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FragmentedBasicPublicUserInfo"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FragmentedBasicPublicUserInfo"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PublicUserInfo"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"avatarURL"}},{"kind":"Field","name":{"kind":"Name","value":"coverBackgroundURL"}},{"kind":"Field","name":{"kind":"Name","value":"header"}},{"kind":"Field","name":{"kind":"Name","value":"introduction"}},{"kind":"Field","name":{"kind":"Name","value":"gender"}},{"kind":"Field","name":{"kind":"Name","value":"country"}},{"kind":"Field","name":{"kind":"Name","value":"birthDate"}}]}}]} as unknown as DocumentNode<FragmentedPublicUserInfoFragment, unknown>;
export const FragmentedBasicPublicUserFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FragmentedBasicPublicUser"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PublicUser"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"publicId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"plan"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"info"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FragmentedPublicUserInfo"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FragmentedBasicPublicUserInfo"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PublicUserInfo"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"avatarURL"}},{"kind":"Field","name":{"kind":"Name","value":"coverBackgroundURL"}},{"kind":"Field","name":{"kind":"Name","value":"header"}},{"kind":"Field","name":{"kind":"Name","value":"introduction"}},{"kind":"Field","name":{"kind":"Name","value":"gender"}},{"kind":"Field","name":{"kind":"Name","value":"country"}},{"kind":"Field","name":{"kind":"Name","value":"birthDate"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FragmentedPublicUserInfo"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PublicUserInfo"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FragmentedBasicPublicUserInfo"}}]}}]} as unknown as DocumentNode<FragmentedBasicPublicUserFragment, unknown>;
export const FragmentedPublicUserFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FragmentedPublicUser"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PublicUser"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FragmentedBasicPublicUser"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FragmentedBasicPublicUserInfo"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PublicUserInfo"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"avatarURL"}},{"kind":"Field","name":{"kind":"Name","value":"coverBackgroundURL"}},{"kind":"Field","name":{"kind":"Name","value":"header"}},{"kind":"Field","name":{"kind":"Name","value":"introduction"}},{"kind":"Field","name":{"kind":"Name","value":"gender"}},{"kind":"Field","name":{"kind":"Name","value":"country"}},{"kind":"Field","name":{"kind":"Name","value":"birthDate"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FragmentedPublicUserInfo"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PublicUserInfo"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FragmentedBasicPublicUserInfo"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FragmentedBasicPublicUser"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PublicUser"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"publicId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"plan"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"info"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FragmentedPublicUserInfo"}}]}}]}}]} as unknown as DocumentNode<FragmentedPublicUserFragment, unknown>;
export const FragmentedBasicPrivateRootShelfFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FragmentedBasicPrivateRootShelf"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PrivateRootShelf"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"permission"}},{"kind":"Field","name":{"kind":"Name","value":"subShelfCount"}},{"kind":"Field","name":{"kind":"Name","value":"itemCount"}},{"kind":"Field","name":{"kind":"Name","value":"lastAnalyzedAt"}},{"kind":"Field","name":{"kind":"Name","value":"deletedAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"owner"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FragmentedPublicUser"}}]}},{"kind":"Field","name":{"kind":"Name","value":"sharers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FragmentedPublicUser"}}]}},{"kind":"Field","name":{"kind":"Name","value":"itemIds"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FragmentedBasicPublicUserInfo"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PublicUserInfo"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"avatarURL"}},{"kind":"Field","name":{"kind":"Name","value":"coverBackgroundURL"}},{"kind":"Field","name":{"kind":"Name","value":"header"}},{"kind":"Field","name":{"kind":"Name","value":"introduction"}},{"kind":"Field","name":{"kind":"Name","value":"gender"}},{"kind":"Field","name":{"kind":"Name","value":"country"}},{"kind":"Field","name":{"kind":"Name","value":"birthDate"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FragmentedPublicUserInfo"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PublicUserInfo"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FragmentedBasicPublicUserInfo"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FragmentedBasicPublicUser"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PublicUser"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"publicId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"plan"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"info"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FragmentedPublicUserInfo"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FragmentedPublicUser"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PublicUser"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FragmentedBasicPublicUser"}}]}}]} as unknown as DocumentNode<FragmentedBasicPrivateRootShelfFragment, unknown>;
export const FragmentedPrivateRootShelfFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FragmentedPrivateRootShelf"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PrivateRootShelf"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FragmentedBasicPrivateRootShelf"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FragmentedBasicPublicUserInfo"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PublicUserInfo"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"avatarURL"}},{"kind":"Field","name":{"kind":"Name","value":"coverBackgroundURL"}},{"kind":"Field","name":{"kind":"Name","value":"header"}},{"kind":"Field","name":{"kind":"Name","value":"introduction"}},{"kind":"Field","name":{"kind":"Name","value":"gender"}},{"kind":"Field","name":{"kind":"Name","value":"country"}},{"kind":"Field","name":{"kind":"Name","value":"birthDate"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FragmentedPublicUserInfo"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PublicUserInfo"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FragmentedBasicPublicUserInfo"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FragmentedBasicPublicUser"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PublicUser"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"publicId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"plan"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"info"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FragmentedPublicUserInfo"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FragmentedPublicUser"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PublicUser"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FragmentedBasicPublicUser"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FragmentedBasicPrivateRootShelf"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PrivateRootShelf"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"permission"}},{"kind":"Field","name":{"kind":"Name","value":"subShelfCount"}},{"kind":"Field","name":{"kind":"Name","value":"itemCount"}},{"kind":"Field","name":{"kind":"Name","value":"lastAnalyzedAt"}},{"kind":"Field","name":{"kind":"Name","value":"deletedAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"owner"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FragmentedPublicUser"}}]}},{"kind":"Field","name":{"kind":"Name","value":"sharers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FragmentedPublicUser"}}]}},{"kind":"Field","name":{"kind":"Name","value":"itemIds"}}]}}]} as unknown as DocumentNode<FragmentedPrivateRootShelfFragment, unknown>;
export const FragmentedBasicPrivateRoutineFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FragmentedBasicPrivateRoutine"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PrivateRoutine"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"stationId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"phase"}},{"kind":"Field","name":{"kind":"Name","value":"isPinned"}},{"kind":"Field","name":{"kind":"Name","value":"scheduledStartAt"}},{"kind":"Field","name":{"kind":"Name","value":"scheduledEndAt"}},{"kind":"Field","name":{"kind":"Name","value":"period"}},{"kind":"Field","name":{"kind":"Name","value":"timezone"}},{"kind":"Field","name":{"kind":"Name","value":"deletedAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"tagIds"}},{"kind":"Field","name":{"kind":"Name","value":"taskIds"}},{"kind":"Field","name":{"kind":"Name","value":"itemIds"}}]}}]} as unknown as DocumentNode<FragmentedBasicPrivateRoutineFragment, unknown>;
export const FragmentedPrivateRoutineFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FragmentedPrivateRoutine"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PrivateRoutine"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FragmentedBasicPrivateRoutine"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FragmentedBasicPrivateRoutine"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PrivateRoutine"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"stationId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"phase"}},{"kind":"Field","name":{"kind":"Name","value":"isPinned"}},{"kind":"Field","name":{"kind":"Name","value":"scheduledStartAt"}},{"kind":"Field","name":{"kind":"Name","value":"scheduledEndAt"}},{"kind":"Field","name":{"kind":"Name","value":"period"}},{"kind":"Field","name":{"kind":"Name","value":"timezone"}},{"kind":"Field","name":{"kind":"Name","value":"deletedAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"tagIds"}},{"kind":"Field","name":{"kind":"Name","value":"taskIds"}},{"kind":"Field","name":{"kind":"Name","value":"itemIds"}}]}}]} as unknown as DocumentNode<FragmentedPrivateRoutineFragment, unknown>;
export const FragmentedBasicPrivateSearchableRoutineFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FragmentedBasicPrivateSearchableRoutine"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PrivateSearchableRoutine"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"stationId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"phase"}},{"kind":"Field","name":{"kind":"Name","value":"isPinned"}},{"kind":"Field","name":{"kind":"Name","value":"scheduledStartAt"}},{"kind":"Field","name":{"kind":"Name","value":"scheduledEndAt"}},{"kind":"Field","name":{"kind":"Name","value":"period"}},{"kind":"Field","name":{"kind":"Name","value":"timezone"}},{"kind":"Field","name":{"kind":"Name","value":"deletedAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"tagIds"}},{"kind":"Field","name":{"kind":"Name","value":"taskIds"}},{"kind":"Field","name":{"kind":"Name","value":"itemIds"}}]}}]} as unknown as DocumentNode<FragmentedBasicPrivateSearchableRoutineFragment, unknown>;
export const FragmentedPrivateSearchableRoutineFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FragmentedPrivateSearchableRoutine"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PrivateSearchableRoutine"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FragmentedBasicPrivateSearchableRoutine"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FragmentedBasicPrivateSearchableRoutine"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PrivateSearchableRoutine"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"stationId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"phase"}},{"kind":"Field","name":{"kind":"Name","value":"isPinned"}},{"kind":"Field","name":{"kind":"Name","value":"scheduledStartAt"}},{"kind":"Field","name":{"kind":"Name","value":"scheduledEndAt"}},{"kind":"Field","name":{"kind":"Name","value":"period"}},{"kind":"Field","name":{"kind":"Name","value":"timezone"}},{"kind":"Field","name":{"kind":"Name","value":"deletedAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"tagIds"}},{"kind":"Field","name":{"kind":"Name","value":"taskIds"}},{"kind":"Field","name":{"kind":"Name","value":"itemIds"}}]}}]} as unknown as DocumentNode<FragmentedPrivateSearchableRoutineFragment, unknown>;
export const FragmentedPrivateRoutineRecordFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FragmentedPrivateRoutineRecord"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PrivateRoutineRecord"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"routineId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"scheduledAt"}},{"kind":"Field","name":{"kind":"Name","value":"actualStartedAt"}},{"kind":"Field","name":{"kind":"Name","value":"actualEndedAt"}},{"kind":"Field","name":{"kind":"Name","value":"totalTaskCount"}},{"kind":"Field","name":{"kind":"Name","value":"successTaskCount"}},{"kind":"Field","name":{"kind":"Name","value":"failedTaskCount"}},{"kind":"Field","name":{"kind":"Name","value":"blockedTaskCount"}},{"kind":"Field","name":{"kind":"Name","value":"runningTaskCount"}},{"kind":"Field","name":{"kind":"Name","value":"waitingTaskCount"}},{"kind":"Field","name":{"kind":"Name","value":"snapshot"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<FragmentedPrivateRoutineRecordFragment, unknown>;
export const FragmentedBasicPrivateRoutineTagFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FragmentedBasicPrivateRoutineTag"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PrivateRoutineTag"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color"}},{"kind":"Field","name":{"kind":"Name","value":"icon"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<FragmentedBasicPrivateRoutineTagFragment, unknown>;
export const FragmentedPrivateRoutineTagFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FragmentedPrivateRoutineTag"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PrivateRoutineTag"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FragmentedBasicPrivateRoutineTag"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FragmentedBasicPrivateRoutineTag"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PrivateRoutineTag"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color"}},{"kind":"Field","name":{"kind":"Name","value":"icon"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<FragmentedPrivateRoutineTagFragment, unknown>;
export const FragmentedBasicPrivateRoutineTaskFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FragmentedBasicPrivateRoutineTask"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PrivateRoutineTask"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"routineId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"purpose"}},{"kind":"Field","name":{"kind":"Name","value":"phase"}},{"kind":"Field","name":{"kind":"Name","value":"costUnit"}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"maxAttempts"}},{"kind":"Field","name":{"kind":"Name","value":"previousRoutineTaskIds"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<FragmentedBasicPrivateRoutineTaskFragment, unknown>;
export const FragmentedPrivateRoutineTaskFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FragmentedPrivateRoutineTask"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PrivateRoutineTask"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FragmentedBasicPrivateRoutineTask"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FragmentedBasicPrivateRoutineTask"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PrivateRoutineTask"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"routineId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"purpose"}},{"kind":"Field","name":{"kind":"Name","value":"phase"}},{"kind":"Field","name":{"kind":"Name","value":"costUnit"}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"maxAttempts"}},{"kind":"Field","name":{"kind":"Name","value":"previousRoutineTaskIds"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<FragmentedPrivateRoutineTaskFragment, unknown>;
export const FragmentedPrivateRoutineTaskRecordFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FragmentedPrivateRoutineTaskRecord"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PrivateRoutineTaskRecord"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"routineRecordId"}},{"kind":"Field","name":{"kind":"Name","value":"routineTaskId"}},{"kind":"Field","name":{"kind":"Name","value":"purpose"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"errorCode"}},{"kind":"Field","name":{"kind":"Name","value":"errorReason"}},{"kind":"Field","name":{"kind":"Name","value":"costUnit"}},{"kind":"Field","name":{"kind":"Name","value":"attempts"}},{"kind":"Field","name":{"kind":"Name","value":"payloadSnapshot"}},{"kind":"Field","name":{"kind":"Name","value":"resultSnapshot"}},{"kind":"Field","name":{"kind":"Name","value":"actualStartedAt"}},{"kind":"Field","name":{"kind":"Name","value":"actualEndedAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<FragmentedPrivateRoutineTaskRecordFragment, unknown>;
export const FragmentedBasicPrivateStationFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FragmentedBasicPrivateStation"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PrivateStation"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"permission"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"icon"}},{"kind":"Field","name":{"kind":"Name","value":"headerBackgroundURL"}},{"kind":"Field","name":{"kind":"Name","value":"routineCount"}},{"kind":"Field","name":{"kind":"Name","value":"deletedAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<FragmentedBasicPrivateStationFragment, unknown>;
export const FragmentedPrivateStationFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FragmentedPrivateStation"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PrivateStation"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FragmentedBasicPrivateStation"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FragmentedBasicPrivateStation"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PrivateStation"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"permission"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"icon"}},{"kind":"Field","name":{"kind":"Name","value":"headerBackgroundURL"}},{"kind":"Field","name":{"kind":"Name","value":"routineCount"}},{"kind":"Field","name":{"kind":"Name","value":"deletedAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<FragmentedPrivateStationFragment, unknown>;
export const FragmentedBasicPrivateSearchableStationFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FragmentedBasicPrivateSearchableStation"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PrivateSearchableStation"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"permission"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"icon"}},{"kind":"Field","name":{"kind":"Name","value":"headerBackgroundURL"}},{"kind":"Field","name":{"kind":"Name","value":"routineCount"}},{"kind":"Field","name":{"kind":"Name","value":"deletedAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<FragmentedBasicPrivateSearchableStationFragment, unknown>;
export const FragmentedPrivateSearchableStationFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FragmentedPrivateSearchableStation"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PrivateSearchableStation"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FragmentedBasicPrivateSearchableStation"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FragmentedBasicPrivateSearchableStation"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PrivateSearchableStation"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"permission"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"icon"}},{"kind":"Field","name":{"kind":"Name","value":"headerBackgroundURL"}},{"kind":"Field","name":{"kind":"Name","value":"routineCount"}},{"kind":"Field","name":{"kind":"Name","value":"deletedAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<FragmentedPrivateSearchableStationFragment, unknown>;
export const FragmentedBasicPrivateSubShelfFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FragmentedBasicPrivateSubShelf"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PrivateSubShelf"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"rootShelfId"}},{"kind":"Field","name":{"kind":"Name","value":"prevSubShelfId"}},{"kind":"Field","name":{"kind":"Name","value":"path"}},{"kind":"Field","name":{"kind":"Name","value":"deletedAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"nextSubShelfIds"}},{"kind":"Field","name":{"kind":"Name","value":"itemIds"}}]}}]} as unknown as DocumentNode<FragmentedBasicPrivateSubShelfFragment, unknown>;
export const FragmentedPrivateSubShelfFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FragmentedPrivateSubShelf"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PrivateSubShelf"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FragmentedBasicPrivateSubShelf"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FragmentedBasicPrivateSubShelf"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PrivateSubShelf"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"rootShelfId"}},{"kind":"Field","name":{"kind":"Name","value":"prevSubShelfId"}},{"kind":"Field","name":{"kind":"Name","value":"path"}},{"kind":"Field","name":{"kind":"Name","value":"deletedAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"nextSubShelfIds"}},{"kind":"Field","name":{"kind":"Name","value":"itemIds"}}]}}]} as unknown as DocumentNode<FragmentedPrivateSubShelfFragment, unknown>;
export const FragmentedBasicPublicThemeFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FragmentedBasicPublicTheme"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PublicTheme"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"publicId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"isDark"}},{"kind":"Field","name":{"kind":"Name","value":"authorId"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}},{"kind":"Field","name":{"kind":"Name","value":"downloadURL"}},{"kind":"Field","name":{"kind":"Name","value":"downloadCount"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<FragmentedBasicPublicThemeFragment, unknown>;
export const FragmentedPublicThemeFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FragmentedPublicTheme"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PublicTheme"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FragmentedBasicPublicTheme"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FragmentedBasicPublicTheme"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PublicTheme"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"publicId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"isDark"}},{"kind":"Field","name":{"kind":"Name","value":"authorId"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}},{"kind":"Field","name":{"kind":"Name","value":"downloadURL"}},{"kind":"Field","name":{"kind":"Name","value":"downloadCount"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<FragmentedPublicThemeFragment, unknown>;
export const SearchUsersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SearchUsers"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SearchUserInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"searchUsers"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"searchEdges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"encodedSearchCursor"}},{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FragmentedPublicUser"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"searchPageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"hasPreviousPage"}},{"kind":"Field","name":{"kind":"Name","value":"startEncodedSearchCursor"}},{"kind":"Field","name":{"kind":"Name","value":"endEncodedSearchCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"searchTime"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FragmentedBasicPublicUserInfo"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PublicUserInfo"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"avatarURL"}},{"kind":"Field","name":{"kind":"Name","value":"coverBackgroundURL"}},{"kind":"Field","name":{"kind":"Name","value":"header"}},{"kind":"Field","name":{"kind":"Name","value":"introduction"}},{"kind":"Field","name":{"kind":"Name","value":"gender"}},{"kind":"Field","name":{"kind":"Name","value":"country"}},{"kind":"Field","name":{"kind":"Name","value":"birthDate"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FragmentedPublicUserInfo"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PublicUserInfo"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FragmentedBasicPublicUserInfo"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FragmentedBasicPublicUser"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PublicUser"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"publicId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"plan"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"info"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FragmentedPublicUserInfo"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FragmentedPublicUser"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PublicUser"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FragmentedBasicPublicUser"}}]}}]} as unknown as DocumentNode<SearchUsersQuery, SearchUsersQueryVariables>;
export const SearchThemesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SearchThemes"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SearchThemeInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"searchThemes"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"searchEdges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"encodedSearchCursor"}},{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FragmentedPublicTheme"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"searchPageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"hasPreviousPage"}},{"kind":"Field","name":{"kind":"Name","value":"startEncodedSearchCursor"}},{"kind":"Field","name":{"kind":"Name","value":"endEncodedSearchCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"searchTime"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FragmentedBasicPublicTheme"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PublicTheme"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"publicId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"isDark"}},{"kind":"Field","name":{"kind":"Name","value":"authorId"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}},{"kind":"Field","name":{"kind":"Name","value":"downloadURL"}},{"kind":"Field","name":{"kind":"Name","value":"downloadCount"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FragmentedPublicTheme"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PublicTheme"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FragmentedBasicPublicTheme"}}]}}]} as unknown as DocumentNode<SearchThemesQuery, SearchThemesQueryVariables>;
export const SearchRootShelvesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SearchRootShelves"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SearchRootShelfInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"searchRootShelves"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"searchEdges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FragmentedPrivateRootShelf"}}]}},{"kind":"Field","name":{"kind":"Name","value":"encodedSearchCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"searchPageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"hasPreviousPage"}},{"kind":"Field","name":{"kind":"Name","value":"startEncodedSearchCursor"}},{"kind":"Field","name":{"kind":"Name","value":"endEncodedSearchCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"searchTime"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FragmentedBasicPublicUserInfo"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PublicUserInfo"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"avatarURL"}},{"kind":"Field","name":{"kind":"Name","value":"coverBackgroundURL"}},{"kind":"Field","name":{"kind":"Name","value":"header"}},{"kind":"Field","name":{"kind":"Name","value":"introduction"}},{"kind":"Field","name":{"kind":"Name","value":"gender"}},{"kind":"Field","name":{"kind":"Name","value":"country"}},{"kind":"Field","name":{"kind":"Name","value":"birthDate"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FragmentedPublicUserInfo"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PublicUserInfo"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FragmentedBasicPublicUserInfo"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FragmentedBasicPublicUser"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PublicUser"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"publicId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"plan"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"info"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FragmentedPublicUserInfo"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FragmentedPublicUser"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PublicUser"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FragmentedBasicPublicUser"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FragmentedBasicPrivateRootShelf"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PrivateRootShelf"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"permission"}},{"kind":"Field","name":{"kind":"Name","value":"subShelfCount"}},{"kind":"Field","name":{"kind":"Name","value":"itemCount"}},{"kind":"Field","name":{"kind":"Name","value":"lastAnalyzedAt"}},{"kind":"Field","name":{"kind":"Name","value":"deletedAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"owner"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FragmentedPublicUser"}}]}},{"kind":"Field","name":{"kind":"Name","value":"sharers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FragmentedPublicUser"}}]}},{"kind":"Field","name":{"kind":"Name","value":"itemIds"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FragmentedPrivateRootShelf"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PrivateRootShelf"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FragmentedBasicPrivateRootShelf"}}]}}]} as unknown as DocumentNode<SearchRootShelvesQuery, SearchRootShelvesQueryVariables>;
export const SearchSubShelvesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SearchSubShelves"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SearchSubShelfInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"searchSubShelves"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"searchEdges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FragmentedPrivateSubShelf"}}]}},{"kind":"Field","name":{"kind":"Name","value":"encodedSearchCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"searchPageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"hasPreviousPage"}},{"kind":"Field","name":{"kind":"Name","value":"startEncodedSearchCursor"}},{"kind":"Field","name":{"kind":"Name","value":"endEncodedSearchCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"searchTime"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FragmentedBasicPrivateSubShelf"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PrivateSubShelf"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"rootShelfId"}},{"kind":"Field","name":{"kind":"Name","value":"prevSubShelfId"}},{"kind":"Field","name":{"kind":"Name","value":"path"}},{"kind":"Field","name":{"kind":"Name","value":"deletedAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"nextSubShelfIds"}},{"kind":"Field","name":{"kind":"Name","value":"itemIds"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FragmentedPrivateSubShelf"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PrivateSubShelf"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FragmentedBasicPrivateSubShelf"}}]}}]} as unknown as DocumentNode<SearchSubShelvesQuery, SearchSubShelvesQueryVariables>;
export const SearchItemsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SearchItems"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SearchItemInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"searchItems"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"searchEdges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FragmentedPrivateItem"}}]}},{"kind":"Field","name":{"kind":"Name","value":"encodedSearchCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"searchPageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"hasPreviousPage"}},{"kind":"Field","name":{"kind":"Name","value":"startEncodedSearchCursor"}},{"kind":"Field","name":{"kind":"Name","value":"endEncodedSearchCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"searchTime"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FragmentedBasicPrivateItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PrivateItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"parentSubShelfId"}},{"kind":"Field","name":{"kind":"Name","value":"rootShelfId"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"deletedAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"routineIds"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FragmentedPrivateItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PrivateItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FragmentedBasicPrivateItem"}}]}}]} as unknown as DocumentNode<SearchItemsQuery, SearchItemsQueryVariables>;
export const SearchMaterialsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SearchMaterials"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SearchMaterialInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"searchMaterials"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"searchEdges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FragmentedPrivateMaterial"}}]}},{"kind":"Field","name":{"kind":"Name","value":"encodedSearchCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"searchPageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"hasPreviousPage"}},{"kind":"Field","name":{"kind":"Name","value":"startEncodedSearchCursor"}},{"kind":"Field","name":{"kind":"Name","value":"endEncodedSearchCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"searchTime"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FragmentedBasicPrivateMaterial"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PrivateMaterial"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"parentSubShelfId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"size"}},{"kind":"Field","name":{"kind":"Name","value":"contentType"}},{"kind":"Field","name":{"kind":"Name","value":"parseMediaType"}},{"kind":"Field","name":{"kind":"Name","value":"deletedAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FragmentedPrivateMaterial"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PrivateMaterial"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FragmentedBasicPrivateMaterial"}}]}}]} as unknown as DocumentNode<SearchMaterialsQuery, SearchMaterialsQueryVariables>;
export const SearchBlockPacksDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SearchBlockPacks"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SearchBlockPackInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"searchBlockPacks"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"searchEdges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FragmentedPrivateBlockPack"}}]}},{"kind":"Field","name":{"kind":"Name","value":"encodedSearchCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"searchPageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"hasPreviousPage"}},{"kind":"Field","name":{"kind":"Name","value":"startEncodedSearchCursor"}},{"kind":"Field","name":{"kind":"Name","value":"endEncodedSearchCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"searchTime"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FragmentedBasicPrivateBlockPack"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PrivateBlockPack"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"parentSubShelfId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"icon"}},{"kind":"Field","name":{"kind":"Name","value":"headerBackgroundURL"}},{"kind":"Field","name":{"kind":"Name","value":"blockCount"}},{"kind":"Field","name":{"kind":"Name","value":"deletedAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"blockIds"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FragmentedPrivateBlockPack"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PrivateBlockPack"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FragmentedBasicPrivateBlockPack"}}]}}]} as unknown as DocumentNode<SearchBlockPacksQuery, SearchBlockPacksQueryVariables>;
export const SearchBlocksDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SearchBlocks"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SearchBlockInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"searchBlocks"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"searchEdges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FragmentedPrivateBlock"}}]}},{"kind":"Field","name":{"kind":"Name","value":"encodedSearchCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"searchPageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"hasPreviousPage"}},{"kind":"Field","name":{"kind":"Name","value":"startEncodedSearchCursor"}},{"kind":"Field","name":{"kind":"Name","value":"endEncodedSearchCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"searchTime"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FragmentedBasicPrivateBlock"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PrivateBlock"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"blockPackId"}},{"kind":"Field","name":{"kind":"Name","value":"parentBlockId"}},{"kind":"Field","name":{"kind":"Name","value":"prevBlockId"}},{"kind":"Field","name":{"kind":"Name","value":"nextBlockId"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"props"}},{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FragmentedPrivateBlock"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PrivateBlock"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FragmentedBasicPrivateBlock"}}]}}]} as unknown as DocumentNode<SearchBlocksQuery, SearchBlocksQueryVariables>;
export const SearchStationsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SearchStations"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SearchStationInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"searchStations"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"searchEdges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FragmentedPrivateSearchableStation"}}]}},{"kind":"Field","name":{"kind":"Name","value":"encodedSearchCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"searchPageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"hasPreviousPage"}},{"kind":"Field","name":{"kind":"Name","value":"startEncodedSearchCursor"}},{"kind":"Field","name":{"kind":"Name","value":"endEncodedSearchCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"searchTime"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FragmentedBasicPrivateSearchableStation"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PrivateSearchableStation"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"permission"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"icon"}},{"kind":"Field","name":{"kind":"Name","value":"headerBackgroundURL"}},{"kind":"Field","name":{"kind":"Name","value":"routineCount"}},{"kind":"Field","name":{"kind":"Name","value":"deletedAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FragmentedPrivateSearchableStation"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PrivateSearchableStation"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FragmentedBasicPrivateSearchableStation"}}]}}]} as unknown as DocumentNode<SearchStationsQuery, SearchStationsQueryVariables>;
export const SearchRoutinesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SearchRoutines"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SearchRoutineInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"searchRoutines"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"searchEdges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FragmentedPrivateSearchableRoutine"}}]}},{"kind":"Field","name":{"kind":"Name","value":"encodedSearchCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"searchPageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"hasPreviousPage"}},{"kind":"Field","name":{"kind":"Name","value":"startEncodedSearchCursor"}},{"kind":"Field","name":{"kind":"Name","value":"endEncodedSearchCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"searchTime"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FragmentedBasicPrivateSearchableRoutine"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PrivateSearchableRoutine"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"stationId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"phase"}},{"kind":"Field","name":{"kind":"Name","value":"isPinned"}},{"kind":"Field","name":{"kind":"Name","value":"scheduledStartAt"}},{"kind":"Field","name":{"kind":"Name","value":"scheduledEndAt"}},{"kind":"Field","name":{"kind":"Name","value":"period"}},{"kind":"Field","name":{"kind":"Name","value":"timezone"}},{"kind":"Field","name":{"kind":"Name","value":"deletedAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"tagIds"}},{"kind":"Field","name":{"kind":"Name","value":"taskIds"}},{"kind":"Field","name":{"kind":"Name","value":"itemIds"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FragmentedPrivateSearchableRoutine"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PrivateSearchableRoutine"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FragmentedBasicPrivateSearchableRoutine"}}]}}]} as unknown as DocumentNode<SearchRoutinesQuery, SearchRoutinesQueryVariables>;
export const SearchRoutineTagsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SearchRoutineTags"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SearchRoutineTagInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"searchRoutineTags"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"searchEdges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FragmentedPrivateRoutineTag"}}]}},{"kind":"Field","name":{"kind":"Name","value":"encodedSearchCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"searchPageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"hasPreviousPage"}},{"kind":"Field","name":{"kind":"Name","value":"startEncodedSearchCursor"}},{"kind":"Field","name":{"kind":"Name","value":"endEncodedSearchCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"searchTime"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FragmentedBasicPrivateRoutineTag"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PrivateRoutineTag"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color"}},{"kind":"Field","name":{"kind":"Name","value":"icon"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FragmentedPrivateRoutineTag"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PrivateRoutineTag"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FragmentedBasicPrivateRoutineTag"}}]}}]} as unknown as DocumentNode<SearchRoutineTagsQuery, SearchRoutineTagsQueryVariables>;
export const SearchRoutineTasksDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SearchRoutineTasks"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SearchRoutineTaskInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"searchRoutineTasks"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"searchEdges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FragmentedPrivateRoutineTask"}}]}},{"kind":"Field","name":{"kind":"Name","value":"encodedSearchCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"searchPageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"hasPreviousPage"}},{"kind":"Field","name":{"kind":"Name","value":"startEncodedSearchCursor"}},{"kind":"Field","name":{"kind":"Name","value":"endEncodedSearchCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"searchTime"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FragmentedBasicPrivateRoutineTask"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PrivateRoutineTask"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"routineId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"purpose"}},{"kind":"Field","name":{"kind":"Name","value":"phase"}},{"kind":"Field","name":{"kind":"Name","value":"costUnit"}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"maxAttempts"}},{"kind":"Field","name":{"kind":"Name","value":"previousRoutineTaskIds"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FragmentedPrivateRoutineTask"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PrivateRoutineTask"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FragmentedBasicPrivateRoutineTask"}}]}}]} as unknown as DocumentNode<SearchRoutineTasksQuery, SearchRoutineTasksQueryVariables>;
export const SearchRoutineRecordsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SearchRoutineRecords"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SearchRoutineRecordInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"searchRoutineRecords"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"searchEdges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FragmentedPrivateRoutineRecord"}}]}},{"kind":"Field","name":{"kind":"Name","value":"encodedSearchCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"searchPageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"hasPreviousPage"}},{"kind":"Field","name":{"kind":"Name","value":"startEncodedSearchCursor"}},{"kind":"Field","name":{"kind":"Name","value":"endEncodedSearchCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"searchTime"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FragmentedPrivateRoutineRecord"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PrivateRoutineRecord"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"routineId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"scheduledAt"}},{"kind":"Field","name":{"kind":"Name","value":"actualStartedAt"}},{"kind":"Field","name":{"kind":"Name","value":"actualEndedAt"}},{"kind":"Field","name":{"kind":"Name","value":"totalTaskCount"}},{"kind":"Field","name":{"kind":"Name","value":"successTaskCount"}},{"kind":"Field","name":{"kind":"Name","value":"failedTaskCount"}},{"kind":"Field","name":{"kind":"Name","value":"blockedTaskCount"}},{"kind":"Field","name":{"kind":"Name","value":"runningTaskCount"}},{"kind":"Field","name":{"kind":"Name","value":"waitingTaskCount"}},{"kind":"Field","name":{"kind":"Name","value":"snapshot"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<SearchRoutineRecordsQuery, SearchRoutineRecordsQueryVariables>;
export const SearchRoutineTaskRecordsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SearchRoutineTaskRecords"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SearchRoutineTaskRecordInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"searchRoutineTaskRecords"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"searchEdges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FragmentedPrivateRoutineTaskRecord"}}]}},{"kind":"Field","name":{"kind":"Name","value":"encodedSearchCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"searchPageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"hasPreviousPage"}},{"kind":"Field","name":{"kind":"Name","value":"startEncodedSearchCursor"}},{"kind":"Field","name":{"kind":"Name","value":"endEncodedSearchCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"searchTime"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FragmentedPrivateRoutineTaskRecord"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PrivateRoutineTaskRecord"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"routineRecordId"}},{"kind":"Field","name":{"kind":"Name","value":"routineTaskId"}},{"kind":"Field","name":{"kind":"Name","value":"purpose"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"errorCode"}},{"kind":"Field","name":{"kind":"Name","value":"errorReason"}},{"kind":"Field","name":{"kind":"Name","value":"costUnit"}},{"kind":"Field","name":{"kind":"Name","value":"attempts"}},{"kind":"Field","name":{"kind":"Name","value":"payloadSnapshot"}},{"kind":"Field","name":{"kind":"Name","value":"resultSnapshot"}},{"kind":"Field","name":{"kind":"Name","value":"actualStartedAt"}},{"kind":"Field","name":{"kind":"Name","value":"actualEndedAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<SearchRoutineTaskRecordsQuery, SearchRoutineTaskRecordsQueryVariables>;