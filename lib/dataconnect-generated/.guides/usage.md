# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.




### React
For each operation, there is a wrapper hook that can be used to call the operation.

Here are all of the hooks that get generated:
```ts
import { useCreateUser, useGetUserByUid, useUpsertUserProfile, useCreateLegalAidCenter, useCreateUserQuery, useCreateAppointment, useCreateAppointmentWithCenter, useCreateLegalChunk, useSearchLegalChunks, useSearchLegalChunksByLaw } from '@dataconnect/my-app/react';
// The types of these hooks are available in react/index.d.ts

const { data, isPending, isSuccess, isError, error } = useCreateUser(createUserVars);

const { data, isPending, isSuccess, isError, error } = useGetUserByUid(getUserByUidVars);

const { data, isPending, isSuccess, isError, error } = useUpsertUserProfile(upsertUserProfileVars);

const { data, isPending, isSuccess, isError, error } = useCreateLegalAidCenter(createLegalAidCenterVars);

const { data, isPending, isSuccess, isError, error } = useCreateUserQuery(createUserQueryVars);

const { data, isPending, isSuccess, isError, error } = useCreateAppointment(createAppointmentVars);

const { data, isPending, isSuccess, isError, error } = useCreateAppointmentWithCenter(createAppointmentWithCenterVars);

const { data, isPending, isSuccess, isError, error } = useCreateLegalChunk(createLegalChunkVars);

const { data, isPending, isSuccess, isError, error } = useSearchLegalChunks(searchLegalChunksVars);

const { data, isPending, isSuccess, isError, error } = useSearchLegalChunksByLaw(searchLegalChunksByLawVars);

```

Here's an example from a different generated SDK:

```ts
import { useListAllMovies } from '@dataconnect/generated/react';

function MyComponent() {
  const { isLoading, data, error } = useListAllMovies();
  if(isLoading) {
    return <div>Loading...</div>
  }
  if(error) {
    return <div> An Error Occurred: {error} </div>
  }
}

// App.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MyComponent from './my-component';

function App() {
  const queryClient = new QueryClient();
  return <QueryClientProvider client={queryClient}>
    <MyComponent />
  </QueryClientProvider>
}
```



## Advanced Usage
If a user is not using a supported framework, they can use the generated SDK directly.

Here's an example of how to use it with the first 5 operations:

```js
import { createUser, getUserByUid, upsertUserProfile, createLegalAidCenter, createUserQuery, createAppointment, createAppointmentWithCenter, createLegalChunk, searchLegalChunks, searchLegalChunksByLaw } from '@dataconnect/my-app';


// Operation CreateUser:  For variables, look at type CreateUserVars in ../index.d.ts
const { data } = await CreateUser(dataConnect, createUserVars);

// Operation GetUserByUid:  For variables, look at type GetUserByUidVars in ../index.d.ts
const { data } = await GetUserByUid(dataConnect, getUserByUidVars);

// Operation UpsertUserProfile:  For variables, look at type UpsertUserProfileVars in ../index.d.ts
const { data } = await UpsertUserProfile(dataConnect, upsertUserProfileVars);

// Operation CreateLegalAidCenter:  For variables, look at type CreateLegalAidCenterVars in ../index.d.ts
const { data } = await CreateLegalAidCenter(dataConnect, createLegalAidCenterVars);

// Operation CreateUserQuery:  For variables, look at type CreateUserQueryVars in ../index.d.ts
const { data } = await CreateUserQuery(dataConnect, createUserQueryVars);

// Operation CreateAppointment:  For variables, look at type CreateAppointmentVars in ../index.d.ts
const { data } = await CreateAppointment(dataConnect, createAppointmentVars);

// Operation CreateAppointmentWithCenter:  For variables, look at type CreateAppointmentWithCenterVars in ../index.d.ts
const { data } = await CreateAppointmentWithCenter(dataConnect, createAppointmentWithCenterVars);

// Operation CreateLegalChunk:  For variables, look at type CreateLegalChunkVars in ../index.d.ts
const { data } = await CreateLegalChunk(dataConnect, createLegalChunkVars);

// Operation SearchLegalChunks:  For variables, look at type SearchLegalChunksVars in ../index.d.ts
const { data } = await SearchLegalChunks(dataConnect, searchLegalChunksVars);

// Operation SearchLegalChunksByLaw:  For variables, look at type SearchLegalChunksByLawVars in ../index.d.ts
const { data } = await SearchLegalChunksByLaw(dataConnect, searchLegalChunksByLawVars);


```