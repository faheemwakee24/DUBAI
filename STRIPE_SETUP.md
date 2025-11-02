# Stripe Payment Setup

This document explains the Stripe payment integration in the DubAI React Native app.

## Overview

The app uses `@stripe/stripe-react-native` for payment processing. The integration includes:
- Payment method management
- Subscription checkout flow
- Payment method updates

## Configuration

### Stripe Publishable Key

The Stripe publishable key is stored in:
- **File**: `src/constants/stripe.ts`
- **Key**: Test key is currently configured
- **Usage**: Used in `App.tsx` to initialize `StripeProvider`

```typescript
export const STRIPE_PUBLISHABLE_KEY =
  'pk_test_51SP3thAUfFKCA2wQXWcqsE5VmszuNdlfeP23mPCyGU8qlY0oqOaXIRi7aWK5uG8grkLL5fC5CpRvRhhiCyQILEg500uWyBgB13';
```

**Important**: When moving to production, replace with your production publishable key.

## Implementation Details

### 1. App-Level Setup

**File**: `App.tsx`

The `StripeProvider` wraps the entire app to enable Stripe functionality:

```typescript
<StripeProvider publishableKey={STRIPE_CONFIG.publishableKey}>
  {/* App content */}
</StripeProvider>
```

### 2. Payment Method Screen

**File**: `src/screens/Subscriptions/PaymentMethodScreen.tsx`

This screen allows users to add or update their payment method:
- Uses Stripe's `CardField` component for card input
- Validates card details
- Creates payment method via Stripe SDK
- **TODO**: Send `paymentMethod.id` to your backend to save it

**Navigation**: 
- Accessible from `BillingDetail` screen via "Update Payment Method" button

### 3. Subscription Checkout

**File**: `src/screens/Subscriptions/SubsCriptionDetail.tsx`

Handles subscription confirmation and payment:
- Shows subscription details (current plan, new plan, cost)
- "Confirm & Pay" button initiates payment flow
- **TODO**: Integrate with your backend API to:
  1. Create payment intent on backend
  2. Confirm payment with Stripe
  3. Create subscription record

### 4. Billing Detail Screen

**File**: `src/screens/Subscriptions/BillingDetail.tsx`

Displays billing information and provides access to update payment method:
- Shows current payment method, next billing date, and payment amount
- "Update Payment Method" button navigates to `PaymentMethodScreen`

## Backend Integration Required

To complete the payment flow, you need to integrate with your backend:

### 1. Payment Method Setup Flow

When a user adds a payment method:

```typescript
// Frontend: PaymentMethodScreen.tsx
const { paymentMethod, error } = await createPaymentMethod({
  paymentMethodType: 'Card',
});

// Send to your backend
await fetch('/api/v1/payment-methods', {
  method: 'POST',
  body: JSON.stringify({ paymentMethodId: paymentMethod.id }),
});
```

**Backend endpoints needed**:
- `POST /api/v1/payment-methods` - Save payment method
- `GET /api/v1/payment-methods` - Get user's payment methods
- `DELETE /api/v1/payment-methods/:id` - Remove payment method

### 2. Subscription Checkout Flow

When a user confirms subscription:

```typescript
// Frontend: SubsCriptionDetail.tsx
// 1. Get payment method from user
const { paymentMethod, error } = await createPaymentMethod({
  paymentMethodType: 'Card',
});

// 2. Create subscription on backend
const response = await fetch('/api/v1/subscriptions', {
  method: 'POST',
  body: JSON.stringify({
    planId: 'pro',
    paymentMethodId: paymentMethod.id,
  }),
});

// 3. Confirm payment with Stripe
const { clientSecret } = await response.json();
const { error: confirmError } = await confirmPayment(clientSecret, {
  paymentMethodType: 'Card',
});
```

**Backend endpoints needed**:
- `POST /api/v1/subscriptions` - Create subscription
  - Create Stripe subscription
  - Create payment intent
  - Return `clientSecret` for payment confirmation
- `GET /api/v1/subscriptions` - Get user's subscriptions
- `PATCH /api/v1/subscriptions/:id` - Update subscription
- `DELETE /api/v1/subscriptions/:id` - Cancel subscription

### 3. Test Cards

Use these test card numbers for testing:

| Card Number | Brand | Status |
|------------|-------|--------|
| 4242 4242 4242 4242 | Visa | Success |
| 4000 0000 0000 9995 | Visa | Decline |
| 4000 0025 0000 3155 | Visa | 3D Secure |

Any future expiry date (e.g., 12/34) and any 3-digit CVC will work.

## Testing

1. **Test Payment Method Addition**:
   - Navigate to `BillingDetail` → "Update Payment Method"
   - Enter test card: `4242 4242 4242 4242`
   - Future expiry date and any CVC
   - Should successfully create payment method

2. **Test Subscription Checkout**:
   - Navigate to `Subscription` → Select plan → "Upgrade Now"
   - Review subscription details
   - Click "Confirm & Pay"
   - Complete payment method setup if needed
   - Process payment

## Security Notes

1. **Never expose your Stripe secret key** in the frontend
2. **Always use your backend** to create payment intents and confirmations
3. **Validate subscriptions** on your backend before granting access
4. **Use HTTPS** for all API calls in production
5. **Store payment methods securely** on your backend, not in the app

## Next Steps

1. Implement backend endpoints for payment methods and subscriptions
2. Integrate payment intents and confirmations
3. Add error handling for payment failures
4. Implement subscription status checks
5. Add payment history display
6. Test with real Stripe account (test mode first)
7. Replace test key with production key when ready

## Resources

- [Stripe React Native SDK Docs](https://stripe.dev/stripe-react-native/)
- [Stripe Test Cards](https://stripe.com/docs/testing)
- [Stripe Payment Intents](https://stripe.com/docs/payments/payment-intents)
- [Stripe Subscriptions](https://stripe.com/docs/billing/subscriptions/overview)

