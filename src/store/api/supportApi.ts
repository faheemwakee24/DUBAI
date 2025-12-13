import {baseApi} from './baseApi';
import {API_ENDPOINTS} from '../../constants/api';

/**
 * Support API slice
 */

// Support Request Types
export interface SupportRequestRequest {
  name: string;
  email: string;
  message: string;
  userId: string;
}

export interface SupportRequestResponse {
  message: string;
  success: boolean;
  data?: {
    id: string;
    name: string;
    email: string;
    message: string;
    userId: string;
    createdAt?: string;
  };
}

/**
 * Support API slice
 */
export const supportApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    // Submit support request
    submitSupportRequest: builder.mutation<
      SupportRequestResponse,
      SupportRequestRequest
    >({
      query: body => ({
        url: API_ENDPOINTS.SUPPORT.REQUEST,
        method: 'POST',
        body,
      }),
    }),
  }),
});

// Export hooks for usage in components
export const {useSubmitSupportRequestMutation} = supportApi;

