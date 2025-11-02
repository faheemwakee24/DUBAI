# Stripe Payment Testing Guide

This guide helps you test the Stripe payment integration in the DubAI app.

## Quick Start Testing

### 1. Test Payment Method Addition

**Steps:**
1. Navigate to **Profile** → **Billing Detail** (or Subscription → Billing History)
2. Tap **"Update Payment Method"**
3. Enter test card details:
   - **Card Number**: `4242 4242 4242 4242`
   - **Expiry**: Any future date (e.g., `12/34`)
   - **CVC**: Any 3 digits (e.g., `123`)
   - **Postal Code**: Any valid code (e.g., `12345`)
4. Tap **"Save Payment Method"**
5. Payment method should be created successfully

### 2. Test Subscription Checkout

**Steps:**
1. Navigate to **Dashboard** → **Subscription** (or tap "Upgrade" on Pro Plan card)
2. Select a plan (e.g., **Pro Plan**)
3. Tap **"Upgrade Now"**
4. Review subscription details on confirmation screen
5. Tap **"Confirm & Pay"**
6. If payment method not set up, you'll be redirected to add one
7. Complete payment method setup
8. Return to subscription screen and confirm payment

## Test Cards

### Success Cards

These cards will complete payments successfully:

| Card Number | Brand | Description |
|------------|-------|-------------|
| `4242 4242 4242 4242` | Visa | ✅ Default test card - Always succeeds |
| `5555 5555 5555 4444` | Mastercard | ✅ Always succeeds |
| `3782 822463 10005` | Amex | ✅ Always succeeds |

**Use with:**
- **Expiry**: Any future date (e.g., `12/34`, `01/25`)
- **CVC**: Any 3 digits for Visa/Mastercard (4 digits for Amex)
- **Postal Code**: Any valid postal code

### Decline Cards

These cards will be declined:

| Card Number | Brand | Description |
|------------|-------|-------------|
| `4000 0000 0000 0002` | Visa | ❌ Generic decline |
| `4000 0000 0000 9995` | Visa | ❌ Insufficient funds |

**Expected Behavior:**
- Payment will fail
- Error message will be displayed
- No charge will be made

### 3D Secure Cards

These cards require additional authentication:

| Card Number | Brand | Description |
|------------|-------|-------------|
| `4000 0025 0000 3155` | Visa | 🔒 3D Secure authentication required |

**Expected Behavior:**
- Payment will trigger 3D Secure flow
- User will need to authenticate (in test mode, just click "Complete authentication")

## Testing Scenarios

### Scenario 1: First Time Subscription

1. **User has no payment method:**
   - Navigate to Subscription screen
   - Select Pro plan → "Upgrade Now"
   - On confirmation, tap "Confirm & Pay"
   - Should redirect to Payment Method screen
   - Add payment method with test card
   - Return and complete subscription

2. **User already has payment method:**
   - Payment should process directly
   - Success message should appear
   - Subscription should be activated

### Scenario 2: Update Payment Method

1. Navigate to **Billing Detail** screen
2. Tap **"Update Payment Method"**
3. Enter new test card details
4. Tap **"Save Payment Method"**
5. New payment method should be saved
6. Return to Billing Detail
7. Updated payment method should be displayed

### Scenario 3: Failed Payment

1. Use decline test card: `4000 0000 0000 0002`
2. Attempt to subscribe or update payment method
3. Payment should fail
4. Error toast should appear with decline message
5. No subscription should be created

### Scenario 4: 3D Secure Authentication

1. Use 3D Secure test card: `4000 0025 0000 3155`
2. Complete card details
3. Payment flow will pause for authentication
4. Complete the authentication prompt
5. Payment should proceed after authentication

## Testing Checklist

### Payment Method Screen
- [ ] Card input field appears correctly
- [ ] Test card can be entered
- [ ] Validation works (incomplete card shows error)
- [ ] Save button is disabled until card is valid
- [ ] Success toast appears after saving
- [ ] Navigation back works after save

### Subscription Screen
- [ ] Plan details display correctly
- [ ] "Upgrade Now" button navigates to detail screen
- [ ] Current plan shows as "Current Plan"

### Subscription Detail Screen
- [ ] Plan comparison shows correctly (Current: Free, New: Pro)
- [ ] Monthly cost displays ($9.99)
- [ ] "Cancel" button navigates back
- [ ] "Confirm & Pay" button works
- [ ] Loading state appears during processing

### Billing Detail Screen
- [ ] Payment method displays
- [ ] Next billing date shows
- [ ] Payment amount displays
- [ ] "Update Payment Method" navigates correctly
- [ ] Billing history table displays

## Common Issues & Solutions

### Issue: "Payment method creation failed"

**Solution:**
- Ensure you're using a valid test card number
- Check card expiry is in the future
- Verify CVC is correct length (3 digits for most cards, 4 for Amex)
- Ensure postal code is provided if required

### Issue: "Network error"

**Solution:**
- Check internet connection
- Verify Stripe publishable key is correct
- Ensure backend API is running (if integrated)

### Issue: Card field not showing

**Solution:**
- Ensure `StripeProvider` wraps the app (check `App.tsx`)
- Verify `@stripe/stripe-react-native` is installed
- Rebuild the app: `npm run android` or `npm run ios`

### Issue: "Card declined"

**Solution:**
- This is expected behavior with decline test cards
- Use success test card: `4242 4242 4242 4242`
- Check you're using test mode, not production

## Backend Testing (When Integrated)

### Mock Backend for Testing

While backend is not integrated, you can test the UI flow:

1. Payment method creation will succeed in Stripe SDK
2. You'll need to implement backend endpoints to:
   - Save payment methods
   - Create subscriptions
   - Process payments

### Testing with Backend

Once backend is integrated:

1. **Test Payment Method Save:**
   ```bash
   POST /api/v1/payment-methods
   {
     "paymentMethodId": "pm_test_..."
   }
   ```

2. **Test Subscription Creation:**
   ```bash
   POST /api/v1/subscriptions
   {
     "planId": "pro",
     "paymentMethodId": "pm_test_..."
   }
   ```

3. **Verify Subscription Status:**
   ```bash
   GET /api/v1/subscriptions
   ```

## Development Mode vs Production

### Current Setup (Development)
- **Publishable Key**: Test key (`pk_test_...`)
- **Environment**: Test mode
- **Charges**: No real charges will be made
- **Cards**: Use test cards only

### Production Checklist
- [ ] Replace test key with production key
- [ ] Update `STRIPE_PUBLISHABLE_KEY` in `src/constants/stripe.ts`
- [ ] Test with real Stripe account (test mode first)
- [ ] Implement proper error handling
- [ ] Add payment confirmation emails
- [ ] Set up webhook handlers for payment events
- [ ] Test subscription renewals
- [ ] Test payment failures and retries

## Quick Test Card Reference

**Copy-paste ready test cards:**

```
Visa Success:
4242 4242 4242 4242
Expiry: 12/34
CVC: 123
Postal: 12345

Visa Decline:
4000 0000 0000 0002
Expiry: 12/34
CVC: 123
Postal: 12345

3D Secure:
4000 0025 0000 3155
Expiry: 12/34
CVC: 123
Postal: 12345
```

## Next Steps

1. ✅ Test payment method addition
2. ✅ Test subscription checkout flow
3. ⏳ Integrate backend API endpoints
4. ⏳ Test full payment flow with backend
5. ⏳ Test subscription renewals
6. ⏳ Test payment failures and retries
7. ⏳ Move to production when ready

## Resources

- [Stripe Test Cards](https://stripe.com/docs/testing)
- [Stripe React Native Docs](https://stripe.dev/stripe-react-native/)
- [Payment Intents Guide](https://stripe.com/docs/payments/payment-intents)
- [Testing Checklist](https://stripe.com/docs/testing)

