import {baseApi} from './baseApi';
import {API_ENDPOINTS} from '../../constants/api';

export interface HeygenAvatar {
  avatar_id: string;
  avatar_name: string;
  gender: string | null;
  preview_image_url: string;
  preview_video_url: string | null;
  premium: boolean;
  type: string | null;
  tags: string[] | null;
  default_voice_id: string | null;
}

export interface HeygenPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface GetAllAvatarsResponse {
  data: HeygenAvatar[];
  pagination: HeygenPagination;
}

export interface GetAllAvatarsRequest {
  page?: number;
  limit?: number;
}

export interface HeygenVoice {
  voice_id: string;
  language: string;
  gender: string;
  name: string;
  preview_audio: string;
  support_pause: boolean;
  emotion_support: boolean;
  support_interactive_avatar: boolean;
  support_locale: boolean;
}

export interface GetAllVoicesResponse {
  data: HeygenVoice[];
  pagination: HeygenPagination;
}

export interface GetAllVoicesRequest {
  page?: number;
  limit?: number;
}

export interface GenerateVideoRequest {
  avatar_id: string;
  voice_id: string;
  input_text: string;
  emotion: string;
  speed: string;
}

export interface GenerateVideoResponse {
  code: number;
  data: {
    video_id: string;
    status: string;
    message?: string;
  };
  message?: string;
}

export interface VideoStatusResponse {
  code: number;
  data: {
    id: string;
    status: 'processing' | 'completed' | 'failed';
    video_url?: string;
    thumbnail_url?: string;
    gif_url?: string;
    caption_url?: string;
    duration?: number;
    error?: string | null;
    callback_id?: string;
    created_at?: number;
    video_url_caption?: string | null;
  };
  message?: string;
}

export const heygenApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getAllAvatars: builder.query<GetAllAvatarsResponse, GetAllAvatarsRequest | void>({
      query: ({page = 1, limit = 10} = {}) => ({
        url: API_ENDPOINTS.HEYGEN.GET_ALL_AVATARS,
        method: 'GET',
        params: {page, limit},
      }),
    }),
    getAllVoices: builder.query<GetAllVoicesResponse, GetAllVoicesRequest | void>({
      query: ({page = 1, limit = 10} = {}) => ({
        url: API_ENDPOINTS.HEYGEN.GET_ALL_VOICES,
        method: 'GET',
        params: {page, limit},
      }),
    }),
    generateVideo: builder.mutation<GenerateVideoResponse, GenerateVideoRequest>({
      query: (body) => ({
        url: API_ENDPOINTS.HEYGEN.GENERATE_VIDEO,
        method: 'POST',
        body,
      }),
    }),
    getHeygenVideoStatus: builder.query<VideoStatusResponse, string>({
      query: (videoId) => ({
        url: `${API_ENDPOINTS.HEYGEN.VIDEO_STATUS}?video_id=${videoId}`,
        method: 'GET',
      }),
      keepUnusedDataFor: 0, // Don't cache - always fetch fresh data
    }),
  }),
});

export const {
  useGetAllAvatarsQuery,
  useLazyGetAllAvatarsQuery,
  useGetAllVoicesQuery,
  useLazyGetAllVoicesQuery,
  useGenerateVideoMutation,
  useGetHeygenVideoStatusQuery,
  useLazyGetHeygenVideoStatusQuery,
} = heygenApi;


