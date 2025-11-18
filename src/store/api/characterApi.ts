import {baseApi} from './baseApi';
import {API_ENDPOINTS, API_BASE_URL, API_VERSION_PREFIX} from '../../constants/api';

/**
 * Character API slice
 * Handles character-related endpoints including image uploads
 */

// Upload Image Request/Response
export interface UploadImageRequest {
  file: {
    uri: string;
    type: string;
    name: string;
  };
}

export interface UploadImageResponse {
  url?: string;
  message?: string;
  [key: string]: any;
}

// Create Video Request/Response
export interface CreateVideoRequest {
  source_url: string;
  text: string;
}

export interface CreateVideoResponse {
  success: boolean;
  talk_id: string;
  status: string;
  message: string;
  check_status_url: string;
}

// Video Status Response
export interface VideoStatusResponse {
  success?: boolean;
  talk_id?: string;
  status?: 'created' | 'processing' | 'done' | 'failed';
  video_url?: string;
  message?: string;
  [key: string]: any;
}

/**
 * Character API slice
 */
export const characterApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    // Upload image to GCS
    uploadImage: builder.mutation<UploadImageResponse, UploadImageRequest>({
      queryFn: async ({file}) => {
        try {
          // Get auth token for this request
          const {tokenStorage} = await import('../../utils/tokenStorage');
          const token = await tokenStorage.getAccessToken();

          const formData = new FormData();
          formData.append('file', {
            uri: file.uri,
            type: file.type,
            name: file.name,
          } as any);

          // Prepare headers - don't set Content-Type for FormData
          // React Native will automatically set it with boundary for multipart/form-data
          const headers: Record<string, string> = {
            'Accept': 'application/json',
          };
          
          if (token) {
            headers['authorization'] = `Bearer ${token}`;
          }

          // Make the fetch request directly to handle FormData properly
          const uploadUrl = `${API_BASE_URL}${API_VERSION_PREFIX}${API_ENDPOINTS.CHARACTER.UPLOAD_IMAGE}`;
          console.log('[CharacterAPI] Uploading image to:', uploadUrl);
          console.log('[CharacterAPI] Upload headers:', headers);
          console.log('[CharacterAPI] File info:', { uri: file.uri, type: file.type, name: file.name });
          
          const response = await fetch(uploadUrl, {
            method: 'POST',
            headers,
            body: formData,
          });

          console.log('[CharacterAPI] Upload response status:', response.status, response.statusText);
          const data = await response.json();
          console.log('[CharacterAPI] Upload response data:', JSON.stringify(data, null, 2));

          if (!response.ok) {
            return {
              error: {
                status: response.status,
                data: data,
              },
            };
          }

          return {data};
        } catch (error: any) {
          return {
            error: {
              status: 'FETCH_ERROR',
              error: error.message || 'Failed to upload image',
            },
          };
        }
      },
    }),

    // Create character speaking video
    createVideo: builder.mutation<CreateVideoResponse, CreateVideoRequest>({
      query: body => {
        console.log('[CharacterAPI] Creating video with params:', JSON.stringify(body, null, 2));
        console.log('[CharacterAPI] Create video endpoint:', API_ENDPOINTS.CHARACTER.CREATE_VIDEO);
        return {
          url: API_ENDPOINTS.CHARACTER.CREATE_VIDEO,
          method: 'POST',
          body,
        };
      },
    }),

    // Get video status
    getVideoStatus: builder.query<VideoStatusResponse, string>({
      query: talkId => {
        const statusUrl = API_ENDPOINTS.CHARACTER.VIDEO_STATUS(talkId);
        console.log('[CharacterAPI] Getting video status for talkId:', talkId);
        console.log('[CharacterAPI] Status endpoint:', statusUrl);
        return {
          url: statusUrl,
          method: 'GET',
        };
      },
    }),
  }),
});

// Export hooks for usage in components
export const {
  useUploadImageMutation,
  useCreateVideoMutation,
  useGetVideoStatusQuery,
  useLazyGetVideoStatusQuery,
} = characterApi;

