import {baseApi} from './baseApi';
import {API_ENDPOINTS} from '../../constants/api';

/**
 * Notifications API slice
 * Endpoints for managing notifications
 */

// Type definitions based on API response
export interface Notification {
  _id: string;
  userId: string;
  title: string;
  body: string;
  data?: {
    type?: string;
    video_id?: string;
    video_title?: string;
    generation_id?: string;
    photo_id?: string | null;
    status?: string;
    image_count?: number;
    fcmSuccessCount?: number;
    fcmFailureCount?: number;
    [key: string]: any;
  };
  status: string;
  type: string;
  referenceId?: string;
  read: boolean;
  image?: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface NotificationsListResponse {
  notifications: Notification[];
  total: number;
  page: number;
  limit: number;
}

export interface GetNotificationsRequest {
  page?: number;
  limit?: number;
}

export interface MarkAsReadResponse {
  message: string;
  notification: Notification;
}

export interface MarkAllAsReadResponse {
  message: string;
  count: number;
}

/**
 * Notifications API slice
 */
export const notificationsApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    // Get notifications list
    getNotifications: builder.query<
      NotificationsListResponse,
      GetNotificationsRequest
    >({
      query: ({page = 1, limit = 20}) => ({
        url: API_ENDPOINTS.NOTIFICATIONS.LIST,
        method: 'GET',
        params: {
          page,
          limit,
        },
      }),
      providesTags: ['Notification'],
    }),

    // Mark notification as read
    markNotificationAsRead: builder.mutation<
      MarkAsReadResponse,
      string
    >({
      query: id => ({
        url: API_ENDPOINTS.NOTIFICATIONS.MARK_AS_READ(id),
        method: 'PATCH',
      }),
      invalidatesTags: ['Notification'],
    }),

    // Mark all notifications as read
    markAllNotificationsAsRead: builder.mutation<
      MarkAllAsReadResponse,
      void
    >({
      query: () => ({
        url: API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_AS_READ,
        method: 'PATCH',
      }),
      invalidatesTags: ['Notification'],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
} = notificationsApi;

