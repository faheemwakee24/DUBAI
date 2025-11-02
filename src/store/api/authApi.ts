import {baseApi} from './baseApi';
import {API_ENDPOINTS} from '../../constants/api';

/**
 * Auth API slice based on Swagger docs at https://dubnxt.infyrolabs.com/docs
 * Complete authentication endpoints implementation
 */

// Type definitions based on API schema
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isEmailVerified: boolean;
  authProvider: 'email' | 'google' | 'apple' | string;
  avatar?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
  user: User;
}

// Register Request/Response
export interface RegisterRequest {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

export interface RegisterResponse {
  message: string;
  otpSent: boolean;
}

// Verify OTP Request/Response
export interface VerifyOtpRequest {
  email: string;
  otpCode: string;
}

// Login Request (same response as VerifyOtp)
export interface LoginRequest {
  email: string;
  password: string;
}

// Social Auth Request
export interface SocialAuthRequest {
  email: string;
  firstName: string;
  lastName: string;
  authProvider: 'google' | 'apple' | string;
  providerId: string;
  avatar?: string;
}

// Refresh Token Request/Response
export interface RefreshTokenRequest {
  refreshToken: string;
}

// Logout Response
export interface LogoutResponse {
  message?: string;
}

// Resend OTP Request/Response
export interface ResendOtpRequest {
  email: string;
}

export interface ResendOtpResponse {
  message: string;
  otpSent: boolean;
}

// Profile Response
export interface ProfileResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isEmailVerified: boolean;
  authProvider: string;
}

// Forgot Password Request/Response
export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
  otpSent: boolean;
}

// Verify Reset OTP Request/Response
export interface VerifyResetOtpRequest {
  email: string;
  otpCode: string;
}

export interface VerifyResetOtpResponse {
  message: string;
  verified: boolean;
}

// Reset Password Request/Response
export interface ResetPasswordRequest {
  email: string;
  otpCode: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
}

/**
 * Auth API slice
 * Complete authentication endpoints
 */
export const authApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    // Register - sends OTP
    register: builder.mutation<RegisterResponse, RegisterRequest>({
      query: body => ({
        url: API_ENDPOINTS.AUTH.REGISTER,
        method: 'POST',
        body,
      }),
    }),

    // Verify OTP after registration
    verifyOtp: builder.mutation<AuthResponse, VerifyOtpRequest>({
      query: body => ({
        url: API_ENDPOINTS.AUTH.VERIFY_OTP,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User', 'Auth'],
    }),

    // Login
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: body => ({
        url: API_ENDPOINTS.AUTH.LOGIN,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User', 'Auth'],
    }),

    // Social Auth (Google/Apple)
    socialAuth: builder.mutation<AuthResponse, SocialAuthRequest>({
      query: body => ({
        url: API_ENDPOINTS.AUTH.SOCIAL_AUTH,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User', 'Auth'],
    }),

    // Refresh Token
    refreshToken: builder.mutation<AuthResponse, RefreshTokenRequest>({
      query: body => ({
        url: API_ENDPOINTS.AUTH.REFRESH_TOKEN,
        method: 'POST',
        body,
      }),
    }),

    // Logout
    logout: builder.mutation<LogoutResponse, void>({
      query: () => ({
        url: API_ENDPOINTS.AUTH.LOGOUT,
        method: 'POST',
      }),
      invalidatesTags: ['User', 'Auth'],
    }),

    // Resend OTP
    resendOtp: builder.mutation<ResendOtpResponse, ResendOtpRequest>({
      query: body => ({
        url: API_ENDPOINTS.AUTH.RESEND_OTP,
        method: 'POST',
        body,
      }),
    }),

    // Get Profile
    getProfile: builder.query<ProfileResponse, void>({
      query: () => ({
        url: API_ENDPOINTS.AUTH.PROFILE,
        method: 'GET',
      }),
      providesTags: ['User'],
    }),

    // Forgot Password - sends OTP
    forgotPassword: builder.mutation<ForgotPasswordResponse, ForgotPasswordRequest>({
      query: body => ({
        url: API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
        method: 'POST',
        body,
      }),
    }),

    // Verify Reset OTP
    verifyResetOtp: builder.mutation<VerifyResetOtpResponse, VerifyResetOtpRequest>({
      query: body => ({
        url: API_ENDPOINTS.AUTH.VERIFY_RESET_OTP,
        method: 'POST',
        body,
      }),
    }),

    // Reset Password
    resetPassword: builder.mutation<ResetPasswordResponse, ResetPasswordRequest>({
      query: body => ({
        url: API_ENDPOINTS.AUTH.RESET_PASSWORD,
        method: 'POST',
        body,
      }),
    }),
  }),
});

// Export hooks for usage in components
export const {
  useRegisterMutation,
  useVerifyOtpMutation,
  useLoginMutation,
  useSocialAuthMutation,
  useRefreshTokenMutation,
  useLogoutMutation,
  useResendOtpMutation,
  useGetProfileQuery,
  useForgotPasswordMutation,
  useVerifyResetOtpMutation,
  useResetPasswordMutation,
} = authApi;

