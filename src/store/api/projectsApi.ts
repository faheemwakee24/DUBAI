import {baseApi} from './baseApi';
import {API_ENDPOINTS} from '../../constants/api';

/**
 * Projects API slice based on Swagger docs at https://dubnxt.infyrolabs.com/docs
 * Project management endpoints implementation
 */

// Type definitions based on API schema
export interface Project {
  id: string;
  name: string;
  description: string;
  userId?: string;
  isActive?: boolean;
  metadata: {
    category: string;
    language: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

// Create Project Request
export interface CreateProjectRequest {
  name: string;
  description: string;
  metadata: {
    category: string;
    language: string;
  };
}

// Create Project Response
export interface CreateProjectResponse {
  id: string;
  name: string;
  description: string;
  metadata: {
    category: string;
    language: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

// Projects List Response
export interface ProjectsResponse {
  projects: Project[];
  total?: number;
  page?: number;
  limit?: number;
}

// Project Video interface based on API response
export interface ProjectVideo {
  id: string;
  video_id: string;
  avatar_id: string;
  voice_id: string;
  input_text: string;
  emotion: string;
  speed: string;
  avatar_photo_url: string;
  status: string;
  video_url: string;
  gif_download_url: string;
  video_share_page_url: string;
  gcs_video_url: string | null;
  gcs_signed_url: string;
  gcs_gif_url: string | null;
  gcs_gif_signed_url: string;
  createdAt: string;
  updatedAt: string;
}

// Photo Avatar Generation interface
export interface PhotoAvatarGeneration {
  id: string;
  userId: string;
  projectId: string;
  generation_id: string;
  photo_id: string;
  name: string;
  age: string;
  gender: string;
  ethnicity: string;
  orientation: string;
  pose: string;
  style: string;
  appearance: string;
  callback_url?: string;
  callback_id?: string;
  status: string;
  photo_url: string;
  image_url_list: string[];
  image_key_list: string[];
  metadata?: {
    webhook_data?: any;
    event_type?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Video Translation interface
export interface VideoTranslation {
  id: string;
  userId: string;
  projectId: string;
  video_translate_id: string;
  original_video_url: string;
  video_id: string;
  title: string;
  output_language: string;
  translate_audio_only: boolean;
  speaker_num: string;
  keep_the_same_format: boolean;
  mode: string;
  status: string;
  translated_video_url: string;
  gcs_video_url: string;
  gcs_signed_url: string;
  gcs_file_name: string;
  metadata?: {
    webhook_data?: any;
    event_type?: string;
  };
  createdAt: string;
  updatedAt: string;
}

/**
 * Projects API slice
 */
export const projectsApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    // Create Project
    createProject: builder.mutation<CreateProjectResponse, CreateProjectRequest>({
      query: body => ({
        url: API_ENDPOINTS.PROJECT.CREATE,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Project'],
    }),

    // Get Projects List
    getProjects: builder.query<Project[], void>({
      query: () => ({
        url: API_ENDPOINTS.PROJECT.LIST,
        method: 'GET',
      }),
      transformResponse: (response: Project[] | { data: Project[] } | { projects: Project[] }) => {
        // Handle different response formats
        if (Array.isArray(response)) {
          return response;
        }
        if ('data' in response && Array.isArray(response.data)) {
          return response.data;
        }
        if ('projects' in response && Array.isArray(response.projects)) {
          return response.projects;
        }
        return [];
      },
      providesTags: ['Project'],
    }),

    // Get Project Detail
    getProject: builder.query<Project, string>({
      query: id => ({
        url: API_ENDPOINTS.PROJECT.DETAIL(id),
        method: 'GET',
      }),
      providesTags: ['Project'],
    }),

    // Update Project
    updateProject: builder.mutation<
      Project,
      {id: string; data: Partial<CreateProjectRequest>}
    >({
      query: ({id, data}) => ({
        url: API_ENDPOINTS.PROJECT.UPDATE(id),
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Project'],
    }),

    // Delete Project
    deleteProject: builder.mutation<void, string>({
      query: id => ({
        url: API_ENDPOINTS.PROJECT.DELETE(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['Project'],
    }),

    // Get Project Videos
    getProjectVideos: builder.query<ProjectVideo[], string>({
      query: projectId => ({
        url: API_ENDPOINTS.PROJECT.VIDEOS(projectId),
        method: 'GET',
      }),
      providesTags: ['Project'],
    }),

    // Get Photo Avatar Generations by Project
    getPhotoAvatarGenerations: builder.query<PhotoAvatarGeneration[], string>({
      query: projectId => ({
        url: API_ENDPOINTS.HEYGEN.PHOTO_AVATAR_GENERATIONS(projectId),
        method: 'GET',
      }),
      transformResponse: (response: PhotoAvatarGeneration[] | { data: PhotoAvatarGeneration[] }) => {
        if (Array.isArray(response)) {
          return response;
        }
        if ('data' in response && Array.isArray(response.data)) {
          return response.data;
        }
        return [];
      },
      providesTags: ['Project'],
    }),

    // Get Video Translations by Project
    getVideoTranslations: builder.query<VideoTranslation[], string>({
      query: projectId => ({
        url: API_ENDPOINTS.HEYGEN.VIDEO_TRANSLATIONS(projectId),
        method: 'GET',
      }),
      transformResponse: (response: VideoTranslation[] | { data: VideoTranslation[] }) => {
        if (Array.isArray(response)) {
          return response;
        }
        if ('data' in response && Array.isArray(response.data)) {
          return response.data;
        }
        return [];
      },
      providesTags: ['Project'],
    }),
  }),
});

// Export hooks
export const {
  useCreateProjectMutation,
  useGetProjectsQuery,
  useGetProjectQuery,
  useGetProjectVideosQuery,
  useLazyGetProjectVideosQuery,
  useGetPhotoAvatarGenerationsQuery,
  useGetVideoTranslationsQuery,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
} = projectsApi;

