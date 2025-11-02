import {baseApi} from './baseApi';
import {API_ENDPOINTS} from '../../constants/api';

/**
 * Payments API slice for Stripe integration
 * Handles payment methods, payment intents, and subscriptions
 */

// Payment Method Types
export interface PaymentMethod {
  id: string;
  type: 'card';
  card: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
  isDefault?: boolean;
  createdAt?: string;
}

export interface CreatePaymentMethodRequest {
  paymentMethodId: string;
  setAsDefault?: boolean;
}

export interface CreatePaymentMethodResponse {
  id: string;
  paymentMethod: PaymentMethod;
}

// Payment Intent Types
export interface CreatePaymentIntentRequest {
  amount: number;
  currency?: string;
  paymentMethodId?: string;
  subscriptionId?: string;
  metadata?: Record<string, string>;
}

export interface PaymentIntent {
  id: string;
  clientSecret: string;
  amount: number;
  currency: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'succeeded' | 'canceled';
}

export interface CreatePaymentIntentResponse {
  paymentIntent: PaymentIntent;
}

export interface ConfirmPaymentRequest {
  paymentIntentId: string;
  paymentMethodId: string;
}

export interface ConfirmPaymentResponse {
  paymentIntent: PaymentIntent;
}

// Subscription Types
export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  planName: string;
  status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  paymentMethodId?: string;
  amount: number;
  currency: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSubscriptionRequest {
  planId: string;
  paymentMethodId: string;
  trialDays?: number;
}

export interface CreateSubscriptionResponse {
  subscription: Subscription;
  paymentIntent?: PaymentIntent;
  clientSecret?: string;
}

export interface UpdateSubscriptionRequest {
  planId?: string;
  paymentMethodId?: string;
  cancelAtPeriodEnd?: boolean;
}

// Setup Intent Types (for saving payment methods without charging)
export interface CreateSetupIntentRequest {
  paymentMethodId: string;
}

export interface SetupIntent {
  id: string;
  clientSecret: string;
  status: string;
}

export interface CreateSetupIntentResponse {
  setupIntent: SetupIntent;
}

/**
 * Payments API slice
 */
export const paymentsApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    // Get all payment methods
    getPaymentMethods: builder.query<PaymentMethod[], void>({
      query: () => ({
        url: API_ENDPOINTS.PAYMENT.PAYMENT_METHODS,
        method: 'GET',
      }),
      providesTags: ['PaymentMethod'],
    }),

    // Create payment method
    createPaymentMethod: builder.mutation<CreatePaymentMethodResponse, CreatePaymentMethodRequest>({
      query: body => ({
        url: API_ENDPOINTS.PAYMENT.PAYMENT_METHODS,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['PaymentMethod'],
    }),

    // Delete payment method
    deletePaymentMethod: builder.mutation<void, string>({
      query: id => ({
        url: API_ENDPOINTS.PAYMENT.PAYMENT_METHOD(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['PaymentMethod'],
    }),

    // Create payment intent
    createPaymentIntent: builder.mutation<CreatePaymentIntentResponse, CreatePaymentIntentRequest>({
      query: body => ({
        url: API_ENDPOINTS.PAYMENT.CREATE_PAYMENT_INTENT,
        method: 'POST',
        body,
      }),
    }),

    // Confirm payment
    confirmPayment: builder.mutation<ConfirmPaymentResponse, ConfirmPaymentRequest>({
      query: ({paymentIntentId, paymentMethodId}) => ({
        url: API_ENDPOINTS.PAYMENT.CONFIRM_PAYMENT(paymentIntentId),
        method: 'POST',
        body: {paymentMethodId},
      }),
      invalidatesTags: ['Subscription', 'PaymentMethod'],
    }),

    // Create setup intent (for saving payment methods)
    createSetupIntent: builder.mutation<CreateSetupIntentResponse, CreateSetupIntentRequest>({
      query: body => ({
        url: API_ENDPOINTS.PAYMENT.SETUP_INTENT,
        method: 'POST',
        body,
      }),
    }),

    // Get subscriptions
    getSubscriptions: builder.query<Subscription[], void>({
      query: () => ({
        url: API_ENDPOINTS.SUBSCRIPTION.LIST,
        method: 'GET',
      }),
      providesTags: ['Subscription'],
    }),

    // Get subscription detail
    getSubscription: builder.query<Subscription, string>({
      query: id => ({
        url: API_ENDPOINTS.SUBSCRIPTION.DETAIL(id),
        method: 'GET',
      }),
      providesTags: ['Subscription'],
    }),

    // Create subscription
    createSubscription: builder.mutation<CreateSubscriptionResponse, CreateSubscriptionRequest>({
      query: body => ({
        url: API_ENDPOINTS.SUBSCRIPTION.CREATE,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Subscription'],
    }),

    // Update subscription
    updateSubscription: builder.mutation<Subscription, {id: string; data: UpdateSubscriptionRequest}>({
      query: ({id, data}) => ({
        url: API_ENDPOINTS.SUBSCRIPTION.UPDATE(id),
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Subscription'],
    }),

    // Cancel subscription
    cancelSubscription: builder.mutation<Subscription, string>({
      query: id => ({
        url: API_ENDPOINTS.SUBSCRIPTION.CANCEL(id),
        method: 'POST',
      }),
      invalidatesTags: ['Subscription'],
    }),
  }),
});

// Export hooks
export const {
  useGetPaymentMethodsQuery,
  useCreatePaymentMethodMutation,
  useDeletePaymentMethodMutation,
  useCreatePaymentIntentMutation,
  useConfirmPaymentMutation,
  useCreateSetupIntentMutation,
  useGetSubscriptionsQuery,
  useGetSubscriptionQuery,
  useCreateSubscriptionMutation,
  useUpdateSubscriptionMutation,
  useCancelSubscriptionMutation,
} = paymentsApi;

