# RTK Query API Setup

This directory contains RTK Query API slices for the DubAI project, configured to work with the API at [https://dubnxt.infyrolabs.com/docs](https://dubnxt.infyrolabs.com/docs).

## Current API Slices

- `baseApi.ts` - Base API configuration with authentication and headers
- `usersApi.ts` - User endpoints (GET, POST, PATCH, DELETE)

## Adding New API Slices

To add a new API slice based on the Swagger documentation:

### 1. Create a new API slice file

Example: `authApi.ts`, `projectApi.ts`, etc.

```typescript
import {baseApi} from './baseApi';
import {API_ENDPOINTS} from '../../constants/api';

// Define your types based on Swagger schema
export interface AuthRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Inject endpoints into base API
export const authApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    // Login endpoint
    login: builder.mutation<AuthResponse, AuthRequest>({
      query: body => ({
        url: API_ENDPOINTS.AUTH.LOGIN,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

// Export hooks
export const {
  useLoginMutation,
} = authApi;
```

### 2. Update `src/constants/api.ts`

Add your endpoints to the `API_ENDPOINTS` object:

```typescript
export const API_ENDPOINTS = {
  // ... existing endpoints
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    // ... more endpoints
  },
} as const;
```

### 3. Export from `src/store/api/index.ts`

```typescript
export * from './authApi';
```

### 4. Add tag types to `baseApi.ts`

If you need cache invalidation:

```typescript
tagTypes: [
  'User',
  'Auth', // Add new tag types here
  // ...
],
```

## Usage in Components

```typescript
import {useGetUsersQuery, useCreateUserMutation} from '../store/api/usersApi';

function MyComponent() {
  const {data, isLoading, error} = useGetUsersQuery();
  const [createUser, {isLoading: isCreating}] = useCreateUserMutation();

  const handleCreate = async () => {
    try {
      await createUser({
        email: 'user@example.com',
        name: 'John Doe',
      }).unwrap();
    } catch (err) {
      console.error('Failed to create user:', err);
    }
  };

  return (
    // Your component JSX
  );
}
```

## API Base Configuration

The base API is configured at:
- Base URL: `https://dubnxt.infyrolabs.com`
- API Prefix: `/api/v1`
- Full URL: `https://dubnxt.infyrolabs.com/api/v1`

## Authentication

To add authentication headers, uncomment and update the auth section in `baseApi.ts`:

```typescript
prepareHeaders: async (headers, {getState}) => {
  const state = getState() as RootState;
  const token = state.auth?.token; // Get from your auth state
  
  if (token) {
    headers.set('authorization', `Bearer ${token}`);
  }
  
  return headers;
},
```

## Reference

- [RTK Query Documentation](https://redux-toolkit.js.org/rtk-query/overview)
- [Swagger API Docs](https://dubnxt.infyrolabs.com/docs)

