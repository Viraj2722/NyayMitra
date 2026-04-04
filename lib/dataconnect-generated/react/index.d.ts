import { CreateUserData, CreateUserVariables, GetUserByUidData, GetUserByUidVariables, UpsertUserProfileData, UpsertUserProfileVariables, CreateLegalAidCenterData, CreateLegalAidCenterVariables, CreateUserQueryData, CreateUserQueryVariables, CreateAppointmentData, CreateAppointmentVariables, CreateAppointmentWithCenterData, CreateAppointmentWithCenterVariables } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useCreateUser(options?: useDataConnectMutationOptions<CreateUserData, FirebaseError, CreateUserVariables>): UseDataConnectMutationResult<CreateUserData, CreateUserVariables>;
export function useCreateUser(dc: DataConnect, options?: useDataConnectMutationOptions<CreateUserData, FirebaseError, CreateUserVariables>): UseDataConnectMutationResult<CreateUserData, CreateUserVariables>;

export function useGetUserByUid(vars: GetUserByUidVariables, options?: useDataConnectQueryOptions<GetUserByUidData>): UseDataConnectQueryResult<GetUserByUidData, GetUserByUidVariables>;
export function useGetUserByUid(dc: DataConnect, vars: GetUserByUidVariables, options?: useDataConnectQueryOptions<GetUserByUidData>): UseDataConnectQueryResult<GetUserByUidData, GetUserByUidVariables>;

export function useUpsertUserProfile(options?: useDataConnectMutationOptions<UpsertUserProfileData, FirebaseError, UpsertUserProfileVariables>): UseDataConnectMutationResult<UpsertUserProfileData, UpsertUserProfileVariables>;
export function useUpsertUserProfile(dc: DataConnect, options?: useDataConnectMutationOptions<UpsertUserProfileData, FirebaseError, UpsertUserProfileVariables>): UseDataConnectMutationResult<UpsertUserProfileData, UpsertUserProfileVariables>;

export function useCreateLegalAidCenter(options?: useDataConnectMutationOptions<CreateLegalAidCenterData, FirebaseError, CreateLegalAidCenterVariables>): UseDataConnectMutationResult<CreateLegalAidCenterData, CreateLegalAidCenterVariables>;
export function useCreateLegalAidCenter(dc: DataConnect, options?: useDataConnectMutationOptions<CreateLegalAidCenterData, FirebaseError, CreateLegalAidCenterVariables>): UseDataConnectMutationResult<CreateLegalAidCenterData, CreateLegalAidCenterVariables>;

export function useCreateUserQuery(options?: useDataConnectMutationOptions<CreateUserQueryData, FirebaseError, CreateUserQueryVariables>): UseDataConnectMutationResult<CreateUserQueryData, CreateUserQueryVariables>;
export function useCreateUserQuery(dc: DataConnect, options?: useDataConnectMutationOptions<CreateUserQueryData, FirebaseError, CreateUserQueryVariables>): UseDataConnectMutationResult<CreateUserQueryData, CreateUserQueryVariables>;

export function useCreateAppointment(options?: useDataConnectMutationOptions<CreateAppointmentData, FirebaseError, CreateAppointmentVariables>): UseDataConnectMutationResult<CreateAppointmentData, CreateAppointmentVariables>;
export function useCreateAppointment(dc: DataConnect, options?: useDataConnectMutationOptions<CreateAppointmentData, FirebaseError, CreateAppointmentVariables>): UseDataConnectMutationResult<CreateAppointmentData, CreateAppointmentVariables>;

export function useCreateAppointmentWithCenter(options?: useDataConnectMutationOptions<CreateAppointmentWithCenterData, FirebaseError, CreateAppointmentWithCenterVariables>): UseDataConnectMutationResult<CreateAppointmentWithCenterData, CreateAppointmentWithCenterVariables>;
export function useCreateAppointmentWithCenter(dc: DataConnect, options?: useDataConnectMutationOptions<CreateAppointmentWithCenterData, FirebaseError, CreateAppointmentWithCenterVariables>): UseDataConnectMutationResult<CreateAppointmentWithCenterData, CreateAppointmentWithCenterVariables>;
