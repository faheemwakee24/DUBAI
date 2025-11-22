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
  project_id?: string;
  avatar_photo_url?: string;
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

export interface GenerateAv4VideoRequest {
  image_key: string;
  video_title: string;
  script: string;
  voice_id: string;
  video_orientation: string;
  fit: string;
  custom_motion_prompt: string;
  enhance_custom_motion_prompt: boolean;
  project_id?: string;
  avatar_photo_url?: string;
}

export interface GenerateAv4VideoResponse {
  code?: number;
  data?: {
    video_id: string;
    status: string;
    message?: string;
  };
  video_id?: string;
  status?: string;
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

export interface MakeYourOwnCharacterRequest {
  name: string;
  age: string;
  gender: string;
  ethnicity: string;
  orientation: string;
  pose: string;
  style: string;
  appearance: string;
  project_id?: string;
}

export interface MakeYourOwnCharacterResponse {
  error: null | string;
  data: {
    generation_id: string;
  };
}

export interface PhotoGenerationResponse {
  error: null | string;
  data: {
    id: string;
    status: 'in_progress' | 'success' | 'failed';
    msg: string | null;
    image_url_list: string[] | null;
    image_key_list: string[] | null;
  };
}

export interface VoiceLocale {
  value: string;
  label: string;
  language: string;
  tag: string | null;
  locale: string | null;
  language_code: string;
}

export interface GetAllVoicesLocalesResponse {
  error: null | string;
  data: {
    languages: string[];
  };
}

export interface TranslateVideoRequest {
  video_url: string;
  title: string;
  output_language: string;
  translate_audio_only: boolean;
  speaker_num: string;
  keep_the_same_format: boolean;
  mode: string;
  project_id?: string;
}

export interface TranslateVideoResponse {
  error?: null | string;
  data?: {
    job_id?: string;
    video_id?: string;
    video_translate_id?: string;
    status?: string;
    message?: string;
  };
  job_id?: string;
  video_id?: string;
  video_translate_id?: string;
  status?: string;
  message?: string;
}

export interface TranslateVideoStatusResponse {
  error: null | string;
  data: {
    video_translate_id: string;
    title: string;
    output_language: string;
    status: string; // 'success', 'processing', etc.
    url: string;
    message: string | null;
    callback_id: string | null;
    caption_url: string | null;
  };
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
    generateAv4Video: builder.mutation<GenerateAv4VideoResponse, GenerateAv4VideoRequest>({
      query: (body) => ({
        url: API_ENDPOINTS.HEYGEN.GENERATE_AV4_VIDEO,
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
    makeYourOwnCharacter: builder.mutation<MakeYourOwnCharacterResponse, MakeYourOwnCharacterRequest>({
      query: (body) => ({
        url: API_ENDPOINTS.HEYGEN.MAKE_YOUR_OWN_CHARACTER,
        method: 'POST',
        body,
      }),
    }),
    getPhotoGeneration: builder.query<PhotoGenerationResponse, string>({
      query: (generationId) => ({
        url: API_ENDPOINTS.HEYGEN.PHOTO_GENERATION(generationId),
        method: 'GET',
      }),
      keepUnusedDataFor: 0, // Don't cache - always fetch fresh data
    }),
    getAllVoicesLocales: builder.query<GetAllVoicesLocalesResponse, void>({
      query: () => ({
        url: API_ENDPOINTS.HEYGEN.GET_ALL_VOICES_LOCALES,
        method: 'GET',
      }),
    }),
    translateVideo: builder.mutation<TranslateVideoResponse, TranslateVideoRequest>({
      query: (body) => ({
        url: API_ENDPOINTS.HEYGEN.VIDEO_TRANSLATE,
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const {
  useGetAllAvatarsQuery,
  useLazyGetAllAvatarsQuery,
  useGetAllVoicesQuery,
  useLazyGetAllVoicesQuery,
  useGetAllVoicesLocalesQuery,
  useLazyGetAllVoicesLocalesQuery,
  useGenerateVideoMutation,
  useGenerateAv4VideoMutation,
  useTranslateVideoMutation,
  useGetHeygenVideoStatusQuery,
  useLazyGetHeygenVideoStatusQuery,
  useMakeYourOwnCharacterMutation,
  useGetPhotoGenerationQuery,
  useLazyGetPhotoGenerationQuery,
} = heygenApi;


