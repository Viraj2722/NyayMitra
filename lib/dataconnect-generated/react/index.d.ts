import { CreateUserData, CreateUserVariables, CreateAppointmentData, CreateAppointmentVariables, CreateUserQueryData, CreateUserQueryVariables } from '../';
import { UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useCreateUser(options?: useDataConnectMutationOptions<CreateUserData, FirebaseError, CreateUserVariables>): UseDataConnectMutationResult<CreateUserData, CreateUserVariables>;
export function useCreateUser(dc: DataConnect, options?: useDataConnectMutationOptions<CreateUserData, FirebaseError, CreateUserVariables>): UseDataConnectMutationResult<CreateUserData, CreateUserVariables>;

export function useCreateAppointment(options?: useDataConnectMutationOptions<CreateAppointmentData, FirebaseError, CreateAppointmentVariables>): UseDataConnectMutationResult<CreateAppointmentData, CreateAppointmentVariables>;
export function useCreateAppointment(dc: DataConnect, options?: useDataConnectMutationOptions<CreateAppointmentData, FirebaseError, CreateAppointmentVariables>): UseDataConnectMutationResult<CreateAppointmentData, CreateAppointmentVariables>;

export function useCreateUserQuery(options?: useDataConnectMutationOptions<CreateUserQueryData, FirebaseError, CreateUserQueryVariables>): UseDataConnectMutationResult<CreateUserQueryData, CreateUserQueryVariables>;
export function useCreateUserQuery(dc: DataConnect, options?: useDataConnectMutationOptions<CreateUserQueryData, FirebaseError, CreateUserQueryVariables>): UseDataConnectMutationResult<CreateUserQueryData, CreateUserQueryVariables>;
