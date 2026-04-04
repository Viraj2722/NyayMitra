# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `React README`, you can find it at [`dataconnect-generated/react/README.md`](./react/README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*GetUserByUid*](#getuserbyuid)
- [**Mutations**](#mutations)
  - [*CreateUser*](#createuser)
  - [*UpsertUserProfile*](#upsertuserprofile)
  - [*CreateLegalAidCenter*](#createlegalaidcenter)
  - [*CreateUserQuery*](#createuserquery)
  - [*CreateAppointment*](#createappointment)
  - [*CreateAppointmentWithCenter*](#createappointmentwithcenter)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/my-app` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/my-app';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/my-app';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## GetUserByUid
You can execute the `GetUserByUid` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getUserByUid(vars: GetUserByUidVariables, options?: ExecuteQueryOptions): QueryPromise<GetUserByUidData, GetUserByUidVariables>;

interface GetUserByUidRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetUserByUidVariables): QueryRef<GetUserByUidData, GetUserByUidVariables>;
}
export const getUserByUidRef: GetUserByUidRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getUserByUid(dc: DataConnect, vars: GetUserByUidVariables, options?: ExecuteQueryOptions): QueryPromise<GetUserByUidData, GetUserByUidVariables>;

interface GetUserByUidRef {
  ...
  (dc: DataConnect, vars: GetUserByUidVariables): QueryRef<GetUserByUidData, GetUserByUidVariables>;
}
export const getUserByUidRef: GetUserByUidRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getUserByUidRef:
```typescript
const name = getUserByUidRef.operationName;
console.log(name);
```

### Variables
The `GetUserByUid` query requires an argument of type `GetUserByUidVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetUserByUidVariables {
  uid: string;
}
```
### Return Type
Recall that executing the `GetUserByUid` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetUserByUidData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetUserByUidData {
  users: ({
    id: UUIDString;
    uid: string;
    name?: string | null;
    preferredLanguage?: string | null;
    mobile?: string | null;
  } & User_Key)[];
}
```
### Using `GetUserByUid`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getUserByUid, GetUserByUidVariables } from '@dataconnect/my-app';

// The `GetUserByUid` query requires an argument of type `GetUserByUidVariables`:
const getUserByUidVars: GetUserByUidVariables = {
  uid: ..., 
};

// Call the `getUserByUid()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getUserByUid(getUserByUidVars);
// Variables can be defined inline as well.
const { data } = await getUserByUid({ uid: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getUserByUid(dataConnect, getUserByUidVars);

console.log(data.users);

// Or, you can use the `Promise` API.
getUserByUid(getUserByUidVars).then((response) => {
  const data = response.data;
  console.log(data.users);
});
```

### Using `GetUserByUid`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getUserByUidRef, GetUserByUidVariables } from '@dataconnect/my-app';

// The `GetUserByUid` query requires an argument of type `GetUserByUidVariables`:
const getUserByUidVars: GetUserByUidVariables = {
  uid: ..., 
};

// Call the `getUserByUidRef()` function to get a reference to the query.
const ref = getUserByUidRef(getUserByUidVars);
// Variables can be defined inline as well.
const ref = getUserByUidRef({ uid: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getUserByUidRef(dataConnect, getUserByUidVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.users);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.users);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreateUser
You can execute the `CreateUser` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createUser(vars: CreateUserVariables): MutationPromise<CreateUserData, CreateUserVariables>;

interface CreateUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateUserVariables): MutationRef<CreateUserData, CreateUserVariables>;
}
export const createUserRef: CreateUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createUser(dc: DataConnect, vars: CreateUserVariables): MutationPromise<CreateUserData, CreateUserVariables>;

interface CreateUserRef {
  ...
  (dc: DataConnect, vars: CreateUserVariables): MutationRef<CreateUserData, CreateUserVariables>;
}
export const createUserRef: CreateUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createUserRef:
```typescript
const name = createUserRef.operationName;
console.log(name);
```

### Variables
The `CreateUser` mutation requires an argument of type `CreateUserVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateUserVariables {
  uid: string;
  name?: string | null;
  preferredLanguage?: string | null;
  mobile?: string | null;
}
```
### Return Type
Recall that executing the `CreateUser` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateUserData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateUserData {
  user_insert: User_Key;
}
```
### Using `CreateUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createUser, CreateUserVariables } from '@dataconnect/my-app';

// The `CreateUser` mutation requires an argument of type `CreateUserVariables`:
const createUserVars: CreateUserVariables = {
  uid: ..., 
  name: ..., // optional
  preferredLanguage: ..., // optional
  mobile: ..., // optional
};

// Call the `createUser()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createUser(createUserVars);
// Variables can be defined inline as well.
const { data } = await createUser({ uid: ..., name: ..., preferredLanguage: ..., mobile: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createUser(dataConnect, createUserVars);

console.log(data.user_insert);

// Or, you can use the `Promise` API.
createUser(createUserVars).then((response) => {
  const data = response.data;
  console.log(data.user_insert);
});
```

### Using `CreateUser`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createUserRef, CreateUserVariables } from '@dataconnect/my-app';

// The `CreateUser` mutation requires an argument of type `CreateUserVariables`:
const createUserVars: CreateUserVariables = {
  uid: ..., 
  name: ..., // optional
  preferredLanguage: ..., // optional
  mobile: ..., // optional
};

// Call the `createUserRef()` function to get a reference to the mutation.
const ref = createUserRef(createUserVars);
// Variables can be defined inline as well.
const ref = createUserRef({ uid: ..., name: ..., preferredLanguage: ..., mobile: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createUserRef(dataConnect, createUserVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_insert);
});
```

## UpsertUserProfile
You can execute the `UpsertUserProfile` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
upsertUserProfile(vars: UpsertUserProfileVariables): MutationPromise<UpsertUserProfileData, UpsertUserProfileVariables>;

interface UpsertUserProfileRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertUserProfileVariables): MutationRef<UpsertUserProfileData, UpsertUserProfileVariables>;
}
export const upsertUserProfileRef: UpsertUserProfileRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
upsertUserProfile(dc: DataConnect, vars: UpsertUserProfileVariables): MutationPromise<UpsertUserProfileData, UpsertUserProfileVariables>;

interface UpsertUserProfileRef {
  ...
  (dc: DataConnect, vars: UpsertUserProfileVariables): MutationRef<UpsertUserProfileData, UpsertUserProfileVariables>;
}
export const upsertUserProfileRef: UpsertUserProfileRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the upsertUserProfileRef:
```typescript
const name = upsertUserProfileRef.operationName;
console.log(name);
```

### Variables
The `UpsertUserProfile` mutation requires an argument of type `UpsertUserProfileVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpsertUserProfileVariables {
  id?: UUIDString | null;
  uid: string;
  name?: string | null;
  preferredLanguage?: string | null;
  mobile?: string | null;
}
```
### Return Type
Recall that executing the `UpsertUserProfile` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpsertUserProfileData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpsertUserProfileData {
  user_upsert: User_Key;
}
```
### Using `UpsertUserProfile`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, upsertUserProfile, UpsertUserProfileVariables } from '@dataconnect/my-app';

// The `UpsertUserProfile` mutation requires an argument of type `UpsertUserProfileVariables`:
const upsertUserProfileVars: UpsertUserProfileVariables = {
  id: ..., // optional
  uid: ..., 
  name: ..., // optional
  preferredLanguage: ..., // optional
  mobile: ..., // optional
};

// Call the `upsertUserProfile()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await upsertUserProfile(upsertUserProfileVars);
// Variables can be defined inline as well.
const { data } = await upsertUserProfile({ id: ..., uid: ..., name: ..., preferredLanguage: ..., mobile: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await upsertUserProfile(dataConnect, upsertUserProfileVars);

console.log(data.user_upsert);

// Or, you can use the `Promise` API.
upsertUserProfile(upsertUserProfileVars).then((response) => {
  const data = response.data;
  console.log(data.user_upsert);
});
```

### Using `UpsertUserProfile`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, upsertUserProfileRef, UpsertUserProfileVariables } from '@dataconnect/my-app';

// The `UpsertUserProfile` mutation requires an argument of type `UpsertUserProfileVariables`:
const upsertUserProfileVars: UpsertUserProfileVariables = {
  id: ..., // optional
  uid: ..., 
  name: ..., // optional
  preferredLanguage: ..., // optional
  mobile: ..., // optional
};

// Call the `upsertUserProfileRef()` function to get a reference to the mutation.
const ref = upsertUserProfileRef(upsertUserProfileVars);
// Variables can be defined inline as well.
const ref = upsertUserProfileRef({ id: ..., uid: ..., name: ..., preferredLanguage: ..., mobile: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = upsertUserProfileRef(dataConnect, upsertUserProfileVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_upsert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_upsert);
});
```

## CreateLegalAidCenter
You can execute the `CreateLegalAidCenter` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createLegalAidCenter(vars: CreateLegalAidCenterVariables): MutationPromise<CreateLegalAidCenterData, CreateLegalAidCenterVariables>;

interface CreateLegalAidCenterRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateLegalAidCenterVariables): MutationRef<CreateLegalAidCenterData, CreateLegalAidCenterVariables>;
}
export const createLegalAidCenterRef: CreateLegalAidCenterRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createLegalAidCenter(dc: DataConnect, vars: CreateLegalAidCenterVariables): MutationPromise<CreateLegalAidCenterData, CreateLegalAidCenterVariables>;

interface CreateLegalAidCenterRef {
  ...
  (dc: DataConnect, vars: CreateLegalAidCenterVariables): MutationRef<CreateLegalAidCenterData, CreateLegalAidCenterVariables>;
}
export const createLegalAidCenterRef: CreateLegalAidCenterRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createLegalAidCenterRef:
```typescript
const name = createLegalAidCenterRef.operationName;
console.log(name);
```

### Variables
The `CreateLegalAidCenter` mutation requires an argument of type `CreateLegalAidCenterVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
```
### Return Type
Recall that executing the `CreateLegalAidCenter` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateLegalAidCenterData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateLegalAidCenterData {
  legalAidCenter_insert: LegalAidCenter_Key;
}
```
### Using `CreateLegalAidCenter`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createLegalAidCenter, CreateLegalAidCenterVariables } from '@dataconnect/my-app';

// The `CreateLegalAidCenter` mutation requires an argument of type `CreateLegalAidCenterVariables`:
const createLegalAidCenterVars: CreateLegalAidCenterVariables = {
  name: ..., 
  address: ..., 
  phone: ..., 
  latitude: ..., 
  longitude: ..., 
  freeServices: ..., 
  categories: ..., 
  timings: ..., // optional
  description: ..., // optional
};

// Call the `createLegalAidCenter()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createLegalAidCenter(createLegalAidCenterVars);
// Variables can be defined inline as well.
const { data } = await createLegalAidCenter({ name: ..., address: ..., phone: ..., latitude: ..., longitude: ..., freeServices: ..., categories: ..., timings: ..., description: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createLegalAidCenter(dataConnect, createLegalAidCenterVars);

console.log(data.legalAidCenter_insert);

// Or, you can use the `Promise` API.
createLegalAidCenter(createLegalAidCenterVars).then((response) => {
  const data = response.data;
  console.log(data.legalAidCenter_insert);
});
```

### Using `CreateLegalAidCenter`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createLegalAidCenterRef, CreateLegalAidCenterVariables } from '@dataconnect/my-app';

// The `CreateLegalAidCenter` mutation requires an argument of type `CreateLegalAidCenterVariables`:
const createLegalAidCenterVars: CreateLegalAidCenterVariables = {
  name: ..., 
  address: ..., 
  phone: ..., 
  latitude: ..., 
  longitude: ..., 
  freeServices: ..., 
  categories: ..., 
  timings: ..., // optional
  description: ..., // optional
};

// Call the `createLegalAidCenterRef()` function to get a reference to the mutation.
const ref = createLegalAidCenterRef(createLegalAidCenterVars);
// Variables can be defined inline as well.
const ref = createLegalAidCenterRef({ name: ..., address: ..., phone: ..., latitude: ..., longitude: ..., freeServices: ..., categories: ..., timings: ..., description: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createLegalAidCenterRef(dataConnect, createLegalAidCenterVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.legalAidCenter_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.legalAidCenter_insert);
});
```

## CreateUserQuery
You can execute the `CreateUserQuery` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createUserQuery(vars: CreateUserQueryVariables): MutationPromise<CreateUserQueryData, CreateUserQueryVariables>;

interface CreateUserQueryRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateUserQueryVariables): MutationRef<CreateUserQueryData, CreateUserQueryVariables>;
}
export const createUserQueryRef: CreateUserQueryRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createUserQuery(dc: DataConnect, vars: CreateUserQueryVariables): MutationPromise<CreateUserQueryData, CreateUserQueryVariables>;

interface CreateUserQueryRef {
  ...
  (dc: DataConnect, vars: CreateUserQueryVariables): MutationRef<CreateUserQueryData, CreateUserQueryVariables>;
}
export const createUserQueryRef: CreateUserQueryRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createUserQueryRef:
```typescript
const name = createUserQueryRef.operationName;
console.log(name);
```

### Variables
The `CreateUserQuery` mutation requires an argument of type `CreateUserQueryVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
}
```
### Return Type
Recall that executing the `CreateUserQuery` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateUserQueryData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateUserQueryData {
  userQuery_insert: UserQuery_Key;
}
```
### Using `CreateUserQuery`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createUserQuery, CreateUserQueryVariables } from '@dataconnect/my-app';

// The `CreateUserQuery` mutation requires an argument of type `CreateUserQueryVariables`:
const createUserQueryVars: CreateUserQueryVariables = {
  userId: ..., // optional
  queryText: ..., // optional
  detectedLanguage: ..., 
  selectedResponseLanguage: ..., // optional
  legalCategoryDetected: ..., // optional
  intakeFollowUpQuestion: ..., // optional
  intakeFollowUpAnswer: ..., // optional
  isUrgent: ..., 
  isAnonymous: ..., 
  aiResponse: ..., // optional
};

// Call the `createUserQuery()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createUserQuery(createUserQueryVars);
// Variables can be defined inline as well.
const { data } = await createUserQuery({ userId: ..., queryText: ..., detectedLanguage: ..., selectedResponseLanguage: ..., legalCategoryDetected: ..., intakeFollowUpQuestion: ..., intakeFollowUpAnswer: ..., isUrgent: ..., isAnonymous: ..., aiResponse: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createUserQuery(dataConnect, createUserQueryVars);

console.log(data.userQuery_insert);

// Or, you can use the `Promise` API.
createUserQuery(createUserQueryVars).then((response) => {
  const data = response.data;
  console.log(data.userQuery_insert);
});
```

### Using `CreateUserQuery`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createUserQueryRef, CreateUserQueryVariables } from '@dataconnect/my-app';

// The `CreateUserQuery` mutation requires an argument of type `CreateUserQueryVariables`:
const createUserQueryVars: CreateUserQueryVariables = {
  userId: ..., // optional
  queryText: ..., // optional
  detectedLanguage: ..., 
  selectedResponseLanguage: ..., // optional
  legalCategoryDetected: ..., // optional
  intakeFollowUpQuestion: ..., // optional
  intakeFollowUpAnswer: ..., // optional
  isUrgent: ..., 
  isAnonymous: ..., 
  aiResponse: ..., // optional
};

// Call the `createUserQueryRef()` function to get a reference to the mutation.
const ref = createUserQueryRef(createUserQueryVars);
// Variables can be defined inline as well.
const ref = createUserQueryRef({ userId: ..., queryText: ..., detectedLanguage: ..., selectedResponseLanguage: ..., legalCategoryDetected: ..., intakeFollowUpQuestion: ..., intakeFollowUpAnswer: ..., isUrgent: ..., isAnonymous: ..., aiResponse: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createUserQueryRef(dataConnect, createUserQueryVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.userQuery_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.userQuery_insert);
});
```

## CreateAppointment
You can execute the `CreateAppointment` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createAppointment(vars: CreateAppointmentVariables): MutationPromise<CreateAppointmentData, CreateAppointmentVariables>;

interface CreateAppointmentRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateAppointmentVariables): MutationRef<CreateAppointmentData, CreateAppointmentVariables>;
}
export const createAppointmentRef: CreateAppointmentRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createAppointment(dc: DataConnect, vars: CreateAppointmentVariables): MutationPromise<CreateAppointmentData, CreateAppointmentVariables>;

interface CreateAppointmentRef {
  ...
  (dc: DataConnect, vars: CreateAppointmentVariables): MutationRef<CreateAppointmentData, CreateAppointmentVariables>;
}
export const createAppointmentRef: CreateAppointmentRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createAppointmentRef:
```typescript
const name = createAppointmentRef.operationName;
console.log(name);
```

### Variables
The `CreateAppointment` mutation requires an argument of type `CreateAppointmentVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateAppointmentVariables {
  userName: string;
  userContact: string;
  problemSummary: string;
  preferredDate: DateString;
  status: string;
}
```
### Return Type
Recall that executing the `CreateAppointment` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateAppointmentData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateAppointmentData {
  appointment_insert: Appointment_Key;
}
```
### Using `CreateAppointment`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createAppointment, CreateAppointmentVariables } from '@dataconnect/my-app';

// The `CreateAppointment` mutation requires an argument of type `CreateAppointmentVariables`:
const createAppointmentVars: CreateAppointmentVariables = {
  userName: ..., 
  userContact: ..., 
  problemSummary: ..., 
  preferredDate: ..., 
  status: ..., 
};

// Call the `createAppointment()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createAppointment(createAppointmentVars);
// Variables can be defined inline as well.
const { data } = await createAppointment({ userName: ..., userContact: ..., problemSummary: ..., preferredDate: ..., status: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createAppointment(dataConnect, createAppointmentVars);

console.log(data.appointment_insert);

// Or, you can use the `Promise` API.
createAppointment(createAppointmentVars).then((response) => {
  const data = response.data;
  console.log(data.appointment_insert);
});
```

### Using `CreateAppointment`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createAppointmentRef, CreateAppointmentVariables } from '@dataconnect/my-app';

// The `CreateAppointment` mutation requires an argument of type `CreateAppointmentVariables`:
const createAppointmentVars: CreateAppointmentVariables = {
  userName: ..., 
  userContact: ..., 
  problemSummary: ..., 
  preferredDate: ..., 
  status: ..., 
};

// Call the `createAppointmentRef()` function to get a reference to the mutation.
const ref = createAppointmentRef(createAppointmentVars);
// Variables can be defined inline as well.
const ref = createAppointmentRef({ userName: ..., userContact: ..., problemSummary: ..., preferredDate: ..., status: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createAppointmentRef(dataConnect, createAppointmentVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.appointment_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.appointment_insert);
});
```

## CreateAppointmentWithCenter
You can execute the `CreateAppointmentWithCenter` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createAppointmentWithCenter(vars: CreateAppointmentWithCenterVariables): MutationPromise<CreateAppointmentWithCenterData, CreateAppointmentWithCenterVariables>;

interface CreateAppointmentWithCenterRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateAppointmentWithCenterVariables): MutationRef<CreateAppointmentWithCenterData, CreateAppointmentWithCenterVariables>;
}
export const createAppointmentWithCenterRef: CreateAppointmentWithCenterRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createAppointmentWithCenter(dc: DataConnect, vars: CreateAppointmentWithCenterVariables): MutationPromise<CreateAppointmentWithCenterData, CreateAppointmentWithCenterVariables>;

interface CreateAppointmentWithCenterRef {
  ...
  (dc: DataConnect, vars: CreateAppointmentWithCenterVariables): MutationRef<CreateAppointmentWithCenterData, CreateAppointmentWithCenterVariables>;
}
export const createAppointmentWithCenterRef: CreateAppointmentWithCenterRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createAppointmentWithCenterRef:
```typescript
const name = createAppointmentWithCenterRef.operationName;
console.log(name);
```

### Variables
The `CreateAppointmentWithCenter` mutation requires an argument of type `CreateAppointmentWithCenterVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
```
### Return Type
Recall that executing the `CreateAppointmentWithCenter` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateAppointmentWithCenterData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateAppointmentWithCenterData {
  appointment_insert: Appointment_Key;
}
```
### Using `CreateAppointmentWithCenter`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createAppointmentWithCenter, CreateAppointmentWithCenterVariables } from '@dataconnect/my-app';

// The `CreateAppointmentWithCenter` mutation requires an argument of type `CreateAppointmentWithCenterVariables`:
const createAppointmentWithCenterVars: CreateAppointmentWithCenterVariables = {
  userId: ..., // optional
  legalAidCenterId: ..., 
  userName: ..., 
  userContact: ..., 
  problemSummary: ..., 
  preferredDate: ..., 
  preferredTime: ..., // optional
  status: ..., 
};

// Call the `createAppointmentWithCenter()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createAppointmentWithCenter(createAppointmentWithCenterVars);
// Variables can be defined inline as well.
const { data } = await createAppointmentWithCenter({ userId: ..., legalAidCenterId: ..., userName: ..., userContact: ..., problemSummary: ..., preferredDate: ..., preferredTime: ..., status: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createAppointmentWithCenter(dataConnect, createAppointmentWithCenterVars);

console.log(data.appointment_insert);

// Or, you can use the `Promise` API.
createAppointmentWithCenter(createAppointmentWithCenterVars).then((response) => {
  const data = response.data;
  console.log(data.appointment_insert);
});
```

### Using `CreateAppointmentWithCenter`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createAppointmentWithCenterRef, CreateAppointmentWithCenterVariables } from '@dataconnect/my-app';

// The `CreateAppointmentWithCenter` mutation requires an argument of type `CreateAppointmentWithCenterVariables`:
const createAppointmentWithCenterVars: CreateAppointmentWithCenterVariables = {
  userId: ..., // optional
  legalAidCenterId: ..., 
  userName: ..., 
  userContact: ..., 
  problemSummary: ..., 
  preferredDate: ..., 
  preferredTime: ..., // optional
  status: ..., 
};

// Call the `createAppointmentWithCenterRef()` function to get a reference to the mutation.
const ref = createAppointmentWithCenterRef(createAppointmentWithCenterVars);
// Variables can be defined inline as well.
const ref = createAppointmentWithCenterRef({ userId: ..., legalAidCenterId: ..., userName: ..., userContact: ..., problemSummary: ..., preferredDate: ..., preferredTime: ..., status: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createAppointmentWithCenterRef(dataConnect, createAppointmentWithCenterVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.appointment_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.appointment_insert);
});
```

