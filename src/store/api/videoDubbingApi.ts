import {baseApi} from './baseApi';
import {API_BASE_URL, API_VERSION_PREFIX} from '../../constants/api';

/**
 * Video Dubbing API slice
 * Handles video dubbing upload and status checking
 */

// Upload Video Request/Response
export interface UploadVideoDubbingRequest {
  file: {
    uri: string;
    type: string;
    name: string;
  };
  language: string;
}

export interface UploadVideoDubbingResponse {
  success?: boolean;
  jobId?: string;
  status?: string;
  message?: string;
  [key: string]: any;
}

// Video Status Response
export interface VideoDubbingStatusResponse {
  jobId: string;
  status: string; // e.g., "created", "processing", "completed", "failed"
  originalVideoPath?: string;
  audioPath?: string;
  targetLanguage?: string;
  dubbedAudioPath?: string;
  dubbedVideoPath?: string; // This is the final video URL
  progress?: number; // 0-100
  error?: string;
  detectedLanguage?: string;
  transcription?: string;
  languageConfidence?: number;
  createdAt?: string;
  completedAt?: string;
}

/**
 * Video Dubbing API slice
 */
export const videoDubbingApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    // Upload video for dubbing
    uploadVideoDubbing: builder.mutation<UploadVideoDubbingResponse, UploadVideoDubbingRequest>({
      queryFn: async ({file, language}) => {
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
          const uploadUrl = `${API_BASE_URL}${API_VERSION_PREFIX}/gcp/upload`;
          console.log('[VideoDubbingAPI] Uploading video to:', uploadUrl);
          console.log('[VideoDubbingAPI] Upload headers:', headers);
          console.log('[VideoDubbingAPI] File info:', { uri: file.uri, type: file.type, name: file.name });
          console.log('[VideoDubbingAPI] Language:', language);
          
          const response = await fetch(uploadUrl, {
            method: 'POST',
            headers,
            body: formData,
          });

          console.log('[VideoDubbingAPI] Upload response status:', response.status, response.statusText);
          const data = await response.json();
          console.log('[VideoDubbingAPI] Upload response data:', JSON.stringify(data, null, 2));

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
              error: error.message || 'Failed to upload video',
            },
          };
        }
      },
    }),

    // Get video dubbing status
    getVideoDubbingStatus: builder.query<VideoDubbingStatusResponse, string>({
      query: jobId => {
        const statusUrl = `/video-dubbing/status/${jobId}`;
        console.log('[VideoDubbingAPI] Getting video dubbing status for jobId:', jobId);
        console.log('[VideoDubbingAPI] Status endpoint:', statusUrl);
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
  useUploadVideoDubbingMutation,
  useGetVideoDubbingStatusQuery,
  useLazyGetVideoDubbingStatusQuery,
} = videoDubbingApi;


