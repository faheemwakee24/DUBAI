import {baseApi} from './baseApi';
import {API_ENDPOINTS} from '../../constants/api';

/**
 * Subscriptions API slice based on Swagger docs at https://dubnxt.infyrolabs.com/docs
 * Subscription plans and subscription management endpoints
 */

// Subscription Plan Type based on API response
export interface SubscriptionPlan {
  _id: string;
  key: string;
  name: string;
  amount: number;
  interval: string;
  videosPerWeek: number;
  watermark: boolean;
  resolution: string;
  notes: string;
  stripeProductId?: string;
  stripePriceId?: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

// Current User Subscription Type
export interface MySubscription {
  id?: string;
  userId?: string;
  planId?: string;
  planName?: string;
  plan?: SubscriptionPlan;
  status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd?: boolean;
  paymentMethodId?: string;
  amount?: number;
  currency?: string;
  daysRemaining?: number;
  nextPaymentDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Checkout Request
export interface CheckoutSubscriptionRequest {
  planKey: string;
}

// Checkout Response
export interface CheckoutSubscriptionResponse {
  url: string;
  id: string;
}

// Cancel Subscription Request
export interface CancelSubscriptionRequest {
  immediate: boolean;
}

// Cancel Subscription Response
export interface CancelSubscriptionResponse {
  message: string;
  subscription?: MySubscription;
}

// Confirm Subscription Request
export interface ConfirmSubscriptionRequest {
  sessionId: string;
}

// Confirm Subscription Response
export interface ConfirmSubscriptionResponse {
  plan: SubscriptionPlan;
  status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  daysRemaining: number;
  nextPaymentDate: string;
}

/**
 * Subscriptions API slice
 */
export const subscriptionsApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    // Get Subscription Plans
    getSubscriptionPlans: builder.query<SubscriptionPlan[], void>({
      query: () => ({
        url: API_ENDPOINTS.SUBSCRIPTION.PLANS,
        method: 'GET',
      }),
      providesTags: ['Subscription'],
    }),

    // Get Current User's Subscription
    getMySubscription: builder.query<MySubscription, void>({
      query: () => ({
        url: API_ENDPOINTS.SUBSCRIPTION.ME,
        method: 'GET',
      }),
      providesTags: ['Subscription'],
    }),

    // Checkout Subscription
    checkoutSubscription: builder.mutation<CheckoutSubscriptionResponse, CheckoutSubscriptionRequest>({
      query: body => ({
        url: API_ENDPOINTS.SUBSCRIPTION.CHECKOUT,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Subscription'],
    }),

    // Cancel Subscription
    cancelSubscription: builder.mutation<CancelSubscriptionResponse, CancelSubscriptionRequest>({
      query: body => ({
        url: API_ENDPOINTS.SUBSCRIPTION.CANCEL,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Subscription'],
    }),

    // Confirm Subscription
    confirmSubscription: builder.mutation<ConfirmSubscriptionResponse, ConfirmSubscriptionRequest>({
      query: body => ({
        url: API_ENDPOINTS.SUBSCRIPTION.CONFIRM,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Subscription'],
    }),
  }),
});

// Export hooks
export const {
  useGetSubscriptionPlansQuery,
  useGetMySubscriptionQuery,
  useCheckoutSubscriptionMutation,
  useCancelSubscriptionMutation,
  useConfirmSubscriptionMutation,
} = subscriptionsApi;

