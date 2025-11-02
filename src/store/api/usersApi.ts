import {baseApi} from './baseApi';
import {API_ENDPOINTS} from '../../constants/api';

/**
 * User API slice based on Swagger docs at https://dubnxt.infyrolabs.com/docs
 * Update types and endpoints based on your actual API schema
 */

// Type definitions - Update these based on your Swagger schema
export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserDto {
  email: string;
  password?: string;
  name?: string;
}

export interface UpdateUserDto {
  email?: string;
  name?: string;
}

export interface UsersResponse {
  data: User[];
  total?: number;
  page?: number;
  limit?: number;
}

/**
 * Users API slice
 * Endpoints from Swagger: /api/v1/users
 */
export const usersApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    // Get all users
    getUsers: builder.query<UsersResponse, {page?: number; limit?: number} | void>({
      query: (params = {}) => ({
        url: API_ENDPOINTS.USER.LIST,
        params: {
          page: params?.page,
          limit: params?.limit,
        },
      }),
      providesTags: result =>
        result
          ? [
              ...result.data.map(({id}) => ({type: 'User' as const, id})),
              {type: 'User', id: 'LIST'},
            ]
          : [{type: 'User', id: 'LIST'}],
    }),

    // Get user by ID
    getUserById: builder.query<User, string>({
      query: id => API_ENDPOINTS.USER.DETAIL(id),
      providesTags: (result, error, id) => [{type: 'User', id}],
    }),

    // Create a new user
    createUser: builder.mutation<User, CreateUserDto>({
      query: body => ({
        url: API_ENDPOINTS.USER.CREATE,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{type: 'User', id: 'LIST'}],
    }),

    // Update user
    updateUser: builder.mutation<User, {id: string; data: UpdateUserDto}>({
      query: ({id, data}) => ({
        url: API_ENDPOINTS.USER.UPDATE(id),
        method: 'PATCH', // or 'PUT' based on your API
        body: data,
      }),
      invalidatesTags: (result, error, {id}) => [
        {type: 'User', id},
        {type: 'User', id: 'LIST'},
      ],
    }),

    // Delete user
    deleteUser: builder.mutation<void, string>({
      query: id => ({
        url: API_ENDPOINTS.USER.DELETE(id),
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        {type: 'User', id},
        {type: 'User', id: 'LIST'},
      ],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = usersApi;

