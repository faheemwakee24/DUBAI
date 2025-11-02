import {baseApi} from './baseApi';

/**
 * Example API slice showing how to extend the base API
 * You can create similar slices for different resources
 * 
 * Usage example:
 * const { data, error, isLoading } = useGetUserQuery(userId);
 * const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
 */

// Example types - Replace with your actual types
export interface User {
  id: string;
  email: string;
  name: string;
}

export interface CreateUserRequest {
  email: string;
  name: string;
  password: string;
}

// Extend the base API with endpoints
export const exampleApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    // GET example
    getUser: builder.query<User, string>({
      query: (userId) => `/users/${userId}`,
      providesTags: (result, error, userId) => [{type: 'User', id: userId}],
    }),

    // POST example
    createUser: builder.mutation<User, CreateUserRequest>({
      query: (body) => ({
        url: '/users',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User'],
    }),

    // PUT example
    updateUser: builder.mutation<User, {id: string; data: Partial<User>}>({
      query: ({id, data}) => ({
        url: `/users/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, {id}) => [{type: 'User', id}],
    }),

    // DELETE example
    deleteUser: builder.mutation<void, string>({
      query: (userId) => ({
        url: `/users/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, userId) => [{type: 'User', id: userId}],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetUserQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = exampleApi;

