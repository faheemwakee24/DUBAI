import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';
import {API_BASE_URL, API_VERSION_PREFIX} from '../../constants/api';

/**
 * Base API slice for RTK Query
 * This provides a centralized API setup that can be extended with endpoints
 * Based on API from https://dubnxt.infyrolabs.com/docs
 */
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}${API_VERSION_PREFIX}`,
    prepareHeaders: async (headers, {getState}) => {
      // Get auth token from AsyncStorage
      const {tokenStorage} = await import('../../utils/tokenStorage');
      const token = await tokenStorage.getAccessToken();
      
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }

      // Set default headers
      headers.set('Content-Type', 'application/json');
      headers.set('Accept', 'application/json');

      return headers;
    },
  }),
  tagTypes: [
    // Define tag types for cache invalidation
    'User',
    'Auth',
    'Project',
    'Video',
    'Subscription',
    'PaymentMethod',
    'HeygenAvatar',
  ],
  endpoints: () => ({}), // Endpoints will be injected by other API slices
});

