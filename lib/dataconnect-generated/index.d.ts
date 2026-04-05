import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, ExecuteQueryOptions, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface Appointment_Key {
  id: UUIDString;
  __typename?: 'Appointment_Key';
}

export interface CreateAppointmentData {
  appointment_insert: Appointment_Key;
}

export interface CreateAppointmentVariables {
  userName: string;
  userContact: string;
  problemSummary: string;
  preferredDate: DateString;
  status: string;
}

export interface CreateAppointmentWithCenterData {
  appointment_insert: Appointment_Key;
}

export interface CreateAppointmentWithCenterVariables {
  userId?: UUIDString | null;
  legalAidCenterId: UUIDString;
  userName: string;
  userContact: string;
  problemSummary: string;
  preferredDate: DateString;
  preferredTime?: string | null;
  status: string;
}

export interface CreateLegalAidCenterData {
  legalAidCenter_insert: LegalAidCenter_Key;
}

export interface CreateLegalAidCenterVariables {
  name: string;
  address: string;
  phone: string;
  latitude: number;
  longitude: number;
  freeServices: boolean;
  categories: string[];
  timings?: string | null;
  description?: string | null;
}

export interface CreateLegalChunkData {
  legalChunk_insert: LegalChunk_Key;
}

export interface CreateLegalChunkVariables {
  lawName: string;
  sourceUrl?: string | null;
  sourceFile?: string | null;
  page?: number | null;
  chunkIndex: number;
  text: string;
  tokens: string[];
  embeddingJson?: string | null;
}

export interface CreateUserData {
  user_insert: User_Key;
}

export interface CreateUserQueryData {
  userQuery_insert: UserQuery_Key;
}

export interface CreateUserQueryVariables {
  userId?: UUIDString | null;
  queryText?: string | null;
  detectedLanguage: string;
  selectedResponseLanguage?: string | null;
  legalCategoryDetected?: string | null;
  intakeFollowUpQuestion?: string | null;
  intakeFollowUpAnswer?: string | null;
  isUrgent: boolean;
  isAnonymous: boolean;
  aiResponse?: string | null;
  ragVerificationStatus?: string | null;
  ragConfidence?: number | null;
  ragCitationsJson?: string | null;
}

export interface CreateUserVariables {
  uid: string;
  name?: string | null;
  preferredLanguage?: string | null;
  mobile?: string | null;
}

export interface DeleteAppointmentByIdData {
  appointment_delete?: Appointment_Key | null;
}

export interface DeleteAppointmentByIdVariables {
  id: UUIDString;
}

export interface GetUserByUidData {
  users: ({
    id: UUIDString;
    uid: string;
    name?: string | null;
    preferredLanguage?: string | null;
    mobile?: string | null;
  } & User_Key)[];
}

export interface GetUserByUidVariables {
  uid: string;
}

export interface LegalAidCenter_Key {
  id: UUIDString;
  __typename?: 'LegalAidCenter_Key';
}

export interface LegalChunk_Key {
  id: UUIDString;
  __typename?: 'LegalChunk_Key';
}

export interface ListAppointmentsByUserIdData {
  appointments: ({
    id: UUIDString;
    userName: string;
    userContact: string;
    problemSummary: string;
    preferredDate: DateString;
    preferredTime?: string | null;
    status: string;
    createdAt: TimestampString;
    legalAidCenter: {
      id: UUIDString;
      name: string;
      address: string;
      phone: string;
    } & LegalAidCenter_Key;
  } & Appointment_Key)[];
}

export interface ListAppointmentsByUserIdVariables {
  userId: UUIDString;
  limit: number;
}

export interface ListLegalAidCentersData {
  legalAidCenters: ({
    id: UUIDString;
    name: string;
    address: string;
    phone: string;
    latitude: number;
    longitude: number;
    freeServices: boolean;
    categories: string[];
    timings?: string | null;
    description?: string | null;
    createdAt: TimestampString;
  } & LegalAidCenter_Key)[];
}

export interface ListLegalAidCentersVariables {
  limit: number;
}

export interface ListLegalChunksByLawData {
  legalChunks: ({
    id: UUIDString;
    lawName: string;
    sourceUrl?: string | null;
    sourceFile?: string | null;
    page?: number | null;
    chunkIndex: number;
    text: string;
    tokens: string[];
    embeddingJson?: string | null;
    createdAt: TimestampString;
  } & LegalChunk_Key)[];
}

export interface ListLegalChunksByLawVariables {
  lawName: string;
  limit: number;
}

export interface SearchLegalChunksByLawData {
  legalChunks: ({
    id: UUIDString;
    lawName: string;
    sourceUrl?: string | null;
    sourceFile?: string | null;
    page?: number | null;
    chunkIndex: number;
    text: string;
    tokens: string[];
    embeddingJson?: string | null;
    createdAt: TimestampString;
  } & LegalChunk_Key)[];
}

export interface SearchLegalChunksByLawVariables {
  lawName: string;
  term: string;
  limit: number;
}

export interface SearchLegalChunksData {
  legalChunks: ({
    id: UUIDString;
    lawName: string;
    sourceUrl?: string | null;
    sourceFile?: string | null;
    page?: number | null;
    chunkIndex: number;
    text: string;
    tokens: string[];
    embeddingJson?: string | null;
    createdAt: TimestampString;
  } & LegalChunk_Key)[];
}

export interface SearchLegalChunksVariables {
  term: string;
  limit: number;
}

export interface UpsertUserProfileData {
  user_upsert: User_Key;
}

export interface UpsertUserProfileVariables {
  id?: UUIDString | null;
  uid: string;
  name?: string | null;
  preferredLanguage?: string | null;
  mobile?: string | null;
}

export interface UserQuery_Key {
  id: UUIDString;
  __typename?: 'UserQuery_Key';
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

interface CreateUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateUserVariables): MutationRef<CreateUserData, CreateUserVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateUserVariables): MutationRef<CreateUserData, CreateUserVariables>;
  operationName: string;
}
export const createUserRef: CreateUserRef;

export function createUser(vars: CreateUserVariables): MutationPromise<CreateUserData, CreateUserVariables>;
export function createUser(dc: DataConnect, vars: CreateUserVariables): MutationPromise<CreateUserData, CreateUserVariables>;

interface GetUserByUidRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetUserByUidVariables): QueryRef<GetUserByUidData, GetUserByUidVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetUserByUidVariables): QueryRef<GetUserByUidData, GetUserByUidVariables>;
  operationName: string;
}
export const getUserByUidRef: GetUserByUidRef;

export function getUserByUid(vars: GetUserByUidVariables, options?: ExecuteQueryOptions): QueryPromise<GetUserByUidData, GetUserByUidVariables>;
export function getUserByUid(dc: DataConnect, vars: GetUserByUidVariables, options?: ExecuteQueryOptions): QueryPromise<GetUserByUidData, GetUserByUidVariables>;

interface UpsertUserProfileRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertUserProfileVariables): MutationRef<UpsertUserProfileData, UpsertUserProfileVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpsertUserProfileVariables): MutationRef<UpsertUserProfileData, UpsertUserProfileVariables>;
  operationName: string;
}
export const upsertUserProfileRef: UpsertUserProfileRef;

export function upsertUserProfile(vars: UpsertUserProfileVariables): MutationPromise<UpsertUserProfileData, UpsertUserProfileVariables>;
export function upsertUserProfile(dc: DataConnect, vars: UpsertUserProfileVariables): MutationPromise<UpsertUserProfileData, UpsertUserProfileVariables>;

interface CreateLegalAidCenterRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateLegalAidCenterVariables): MutationRef<CreateLegalAidCenterData, CreateLegalAidCenterVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateLegalAidCenterVariables): MutationRef<CreateLegalAidCenterData, CreateLegalAidCenterVariables>;
  operationName: string;
}
export const createLegalAidCenterRef: CreateLegalAidCenterRef;

export function createLegalAidCenter(vars: CreateLegalAidCenterVariables): MutationPromise<CreateLegalAidCenterData, CreateLegalAidCenterVariables>;
export function createLegalAidCenter(dc: DataConnect, vars: CreateLegalAidCenterVariables): MutationPromise<CreateLegalAidCenterData, CreateLegalAidCenterVariables>;

interface CreateUserQueryRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateUserQueryVariables): MutationRef<CreateUserQueryData, CreateUserQueryVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateUserQueryVariables): MutationRef<CreateUserQueryData, CreateUserQueryVariables>;
  operationName: string;
}
export const createUserQueryRef: CreateUserQueryRef;

export function createUserQuery(vars: CreateUserQueryVariables): MutationPromise<CreateUserQueryData, CreateUserQueryVariables>;
export function createUserQuery(dc: DataConnect, vars: CreateUserQueryVariables): MutationPromise<CreateUserQueryData, CreateUserQueryVariables>;

interface CreateAppointmentRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateAppointmentVariables): MutationRef<CreateAppointmentData, CreateAppointmentVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateAppointmentVariables): MutationRef<CreateAppointmentData, CreateAppointmentVariables>;
  operationName: string;
}
export const createAppointmentRef: CreateAppointmentRef;

export function createAppointment(vars: CreateAppointmentVariables): MutationPromise<CreateAppointmentData, CreateAppointmentVariables>;
export function createAppointment(dc: DataConnect, vars: CreateAppointmentVariables): MutationPromise<CreateAppointmentData, CreateAppointmentVariables>;

interface CreateAppointmentWithCenterRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateAppointmentWithCenterVariables): MutationRef<CreateAppointmentWithCenterData, CreateAppointmentWithCenterVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateAppointmentWithCenterVariables): MutationRef<CreateAppointmentWithCenterData, CreateAppointmentWithCenterVariables>;
  operationName: string;
}
export const createAppointmentWithCenterRef: CreateAppointmentWithCenterRef;

export function createAppointmentWithCenter(vars: CreateAppointmentWithCenterVariables): MutationPromise<CreateAppointmentWithCenterData, CreateAppointmentWithCenterVariables>;
export function createAppointmentWithCenter(dc: DataConnect, vars: CreateAppointmentWithCenterVariables): MutationPromise<CreateAppointmentWithCenterData, CreateAppointmentWithCenterVariables>;

interface ListAppointmentsByUserIdRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListAppointmentsByUserIdVariables): QueryRef<ListAppointmentsByUserIdData, ListAppointmentsByUserIdVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ListAppointmentsByUserIdVariables): QueryRef<ListAppointmentsByUserIdData, ListAppointmentsByUserIdVariables>;
  operationName: string;
}
export const listAppointmentsByUserIdRef: ListAppointmentsByUserIdRef;

export function listAppointmentsByUserId(vars: ListAppointmentsByUserIdVariables, options?: ExecuteQueryOptions): QueryPromise<ListAppointmentsByUserIdData, ListAppointmentsByUserIdVariables>;
export function listAppointmentsByUserId(dc: DataConnect, vars: ListAppointmentsByUserIdVariables, options?: ExecuteQueryOptions): QueryPromise<ListAppointmentsByUserIdData, ListAppointmentsByUserIdVariables>;

interface ListLegalAidCentersRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListLegalAidCentersVariables): QueryRef<ListLegalAidCentersData, ListLegalAidCentersVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ListLegalAidCentersVariables): QueryRef<ListLegalAidCentersData, ListLegalAidCentersVariables>;
  operationName: string;
}
export const listLegalAidCentersRef: ListLegalAidCentersRef;

export function listLegalAidCenters(vars: ListLegalAidCentersVariables, options?: ExecuteQueryOptions): QueryPromise<ListLegalAidCentersData, ListLegalAidCentersVariables>;
export function listLegalAidCenters(dc: DataConnect, vars: ListLegalAidCentersVariables, options?: ExecuteQueryOptions): QueryPromise<ListLegalAidCentersData, ListLegalAidCentersVariables>;

interface DeleteAppointmentByIdRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteAppointmentByIdVariables): MutationRef<DeleteAppointmentByIdData, DeleteAppointmentByIdVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteAppointmentByIdVariables): MutationRef<DeleteAppointmentByIdData, DeleteAppointmentByIdVariables>;
  operationName: string;
}
export const deleteAppointmentByIdRef: DeleteAppointmentByIdRef;

export function deleteAppointmentById(vars: DeleteAppointmentByIdVariables): MutationPromise<DeleteAppointmentByIdData, DeleteAppointmentByIdVariables>;
export function deleteAppointmentById(dc: DataConnect, vars: DeleteAppointmentByIdVariables): MutationPromise<DeleteAppointmentByIdData, DeleteAppointmentByIdVariables>;

interface CreateLegalChunkRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateLegalChunkVariables): MutationRef<CreateLegalChunkData, CreateLegalChunkVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateLegalChunkVariables): MutationRef<CreateLegalChunkData, CreateLegalChunkVariables>;
  operationName: string;
}
export const createLegalChunkRef: CreateLegalChunkRef;

export function createLegalChunk(vars: CreateLegalChunkVariables): MutationPromise<CreateLegalChunkData, CreateLegalChunkVariables>;
export function createLegalChunk(dc: DataConnect, vars: CreateLegalChunkVariables): MutationPromise<CreateLegalChunkData, CreateLegalChunkVariables>;

interface SearchLegalChunksRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: SearchLegalChunksVariables): QueryRef<SearchLegalChunksData, SearchLegalChunksVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: SearchLegalChunksVariables): QueryRef<SearchLegalChunksData, SearchLegalChunksVariables>;
  operationName: string;
}
export const searchLegalChunksRef: SearchLegalChunksRef;

export function searchLegalChunks(vars: SearchLegalChunksVariables, options?: ExecuteQueryOptions): QueryPromise<SearchLegalChunksData, SearchLegalChunksVariables>;
export function searchLegalChunks(dc: DataConnect, vars: SearchLegalChunksVariables, options?: ExecuteQueryOptions): QueryPromise<SearchLegalChunksData, SearchLegalChunksVariables>;

interface SearchLegalChunksByLawRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: SearchLegalChunksByLawVariables): QueryRef<SearchLegalChunksByLawData, SearchLegalChunksByLawVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: SearchLegalChunksByLawVariables): QueryRef<SearchLegalChunksByLawData, SearchLegalChunksByLawVariables>;
  operationName: string;
}
export const searchLegalChunksByLawRef: SearchLegalChunksByLawRef;

export function searchLegalChunksByLaw(vars: SearchLegalChunksByLawVariables, options?: ExecuteQueryOptions): QueryPromise<SearchLegalChunksByLawData, SearchLegalChunksByLawVariables>;
export function searchLegalChunksByLaw(dc: DataConnect, vars: SearchLegalChunksByLawVariables, options?: ExecuteQueryOptions): QueryPromise<SearchLegalChunksByLawData, SearchLegalChunksByLawVariables>;

interface ListLegalChunksByLawRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListLegalChunksByLawVariables): QueryRef<ListLegalChunksByLawData, ListLegalChunksByLawVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ListLegalChunksByLawVariables): QueryRef<ListLegalChunksByLawData, ListLegalChunksByLawVariables>;
  operationName: string;
}
export const listLegalChunksByLawRef: ListLegalChunksByLawRef;

export function listLegalChunksByLaw(vars: ListLegalChunksByLawVariables, options?: ExecuteQueryOptions): QueryPromise<ListLegalChunksByLawData, ListLegalChunksByLawVariables>;
export function listLegalChunksByLaw(dc: DataConnect, vars: ListLegalChunksByLawVariables, options?: ExecuteQueryOptions): QueryPromise<ListLegalChunksByLawData, ListLegalChunksByLawVariables>;

