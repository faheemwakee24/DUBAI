/**
 * API Configuration Constants
 * Base API URL from https://dubnxt.infyrolabs.com/docs
 */

// Base API URLs
export const API_BASE_URL = 'https://dubnxt.infyrolabs.com';

// API version prefix
export const API_VERSION_PREFIX = '/api/v1';

// API Endpoints based on Swagger docs at https://dubnxt.infyrolabs.com/docs
export const API_ENDPOINTS = {
  // User endpoints
  USER: {
    LIST: '/users',
    CREATE: '/users',
    DETAIL: (id: string) => `/users/${id}`,
    UPDATE: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`,
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
  },
  // Auth endpoints
  AUTH: {
    REGISTER: '/auth/register',
    VERIFY_OTP: '/auth/verify-otp',
    LOGIN: '/auth/login',
    SOCIAL_AUTH: '/auth/social-auth',
    REFRESH_TOKEN: '/auth/refresh-token',
    LOGOUT: '/auth/logout',
    RESEND_OTP: '/auth/resend-otp',
    PROFILE: '/auth/profile',
    FORGOT_PASSWORD: '/auth/forgot-password',
    VERIFY_RESET_OTP: '/auth/verify-reset-otp',
    RESET_PASSWORD: '/auth/reset-password',
  },
  // Project endpoints (add based on your Swagger docs)
  PROJECT: {
    LIST: '/projects',
    CREATE: '/projects',
    DETAIL: (id: string) => `/projects/${id}`,
    UPDATE: (id: string) => `/projects/${id}`,
    DELETE: (id: string) => `/projects/${id}`,
  },
  // Video endpoints (add based on your Swagger docs)
  VIDEO: {
    LIST: '/videos',
    UPLOAD: '/videos/upload',
    DETAIL: (id: string) => `/videos/${id}`,
    DELETE: (id: string) => `/videos/${id}`,
  },
  // Subscription endpoints
  SUBSCRIPTION: {
    LIST: '/subscriptions',
    PLANS: '/subscriptions/plans',
    ME: '/subscriptions/me',
    CHECKOUT: '/subscriptions/checkout',
    CONFIRM: '/subscriptions/confirm',
    CANCEL: '/subscriptions/cancel',
    DETAIL: (id: string) => `/subscriptions/${id}`,
    CREATE: '/subscriptions',
    UPDATE: (id: string) => `/subscriptions/${id}`,
    CANCEL_BY_ID: (id: string) => `/subscriptions/${id}/cancel`,
  },
  // Payment endpoints
  PAYMENT: {
    PAYMENT_METHODS: '/payment-methods',
    PAYMENT_METHOD: (id: string) => `/payment-methods/${id}`,
    CREATE_PAYMENT_INTENT: '/payment-intents',
    CONFIRM_PAYMENT: (id: string) => `/payment-intents/${id}/confirm`,
    SETUP_INTENT: '/setup-intents',
  },
} as const;

