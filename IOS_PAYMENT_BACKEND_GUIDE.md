# iOS In-App Purchase Backend Integration Guide

This guide explains how to implement the backend API endpoint for confirming iOS subscription purchases.

## Overview

When a user purchases a subscription on iOS, the app receives a transaction receipt from Apple. This receipt must be verified with Apple's servers and then the subscription must be activated in your backend system.

## API Endpoint

**Endpoint:** `POST /api/v1/subscriptions/confirm-ios`

**Authentication:** Required (Bearer token)

## Request Body

```typescript
{
  planKey: string;           // The subscription plan key (e.g., "basic", "creator", "business_pro")
  transactionReceipt: string; // Purchase token or receipt data from iOS (purchaseToken or purchase.id)
  transactionId: string;     // Transaction ID from iOS purchase (purchase.id or originalTransactionIdentifierIOS)
  productId: string;          // iOS product ID (e.g., "com.dubnnxt.basic.monthly")
}
```

### Product ID Mapping

The frontend uses the following product IDs:

```typescript
const PLAN_TO_IOS_PRODUCT_ID = {
  basic: 'com.dubnnxt.basic.monthly',
  creator: 'com.dubnnxt.creator.monthly',
  business_pro: 'com.dubnnxt.business.monthly',
};
```

**Note:** The plan key `business_pro` maps to product ID `com.dubnnxt.business.monthly`. Make sure your backend plan keys match these values.

**Note:** The `transactionReceipt` field may contain either:
- `purchaseToken` from the purchase object (JWS token for StoreKit 2)
- `purchase.id` as fallback
- For full receipt validation, you may need to fetch the complete receipt using `getReceiptDataIOS()` from react-native-iap

## Response

```typescript
{
  plan: {
    _id: string;
    key: string;
    name: string;
    amount: number;
    interval: string;
    // ... other plan fields
  };
  status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing';
  currentPeriodStart: string;  // ISO 8601 date
  currentPeriodEnd: string;     // ISO 8601 date
  daysRemaining: number;
  nextPaymentDate: string;     // ISO 8601 date
}
```

## Implementation Steps

### 1. Install Required Dependencies

For Node.js/Express backend:

```bash
npm install axios
# or
npm install node-fetch
```

For Python/Django backend:

```bash
pip install requests
```

### 2. Verify Receipt with Apple

You need to verify the transaction receipt with Apple's App Store. There are two environments:

- **Sandbox (Testing):** `https://sandbox.itunes.apple.com/verifyReceipt`
- **Production:** `https://buy.itunes.apple.com/verifyReceipt`

**Important:** Always try production first, then fall back to sandbox if you get a 21007 error (sandbox receipt sent to production).

**Note on Receipt Data:**
- The frontend sends `purchaseToken` or `purchase.id` which may be a JWS token (StoreKit 2) or transaction identifier
- For StoreKit 2 (iOS 15+), you may receive a JWS token instead of a traditional receipt
- If you receive a JWS token, you can validate it directly or extract receipt data from it
- For older receipts, you'll need the full base64-encoded receipt data

#### Node.js/Express Example

```javascript
const axios = require('axios');

async function verifyReceiptWithApple(transactionReceipt, isProduction = true) {
  const url = isProduction
    ? 'https://buy.itunes.apple.com/verifyReceipt'
    : 'https://sandbox.itunes.apple.com/verifyReceipt';

  try {
    const response = await axios.post(url, {
      'receipt-data': transactionReceipt,
      'password': process.env.APPLE_SHARED_SECRET, // Your App Store Connect shared secret
      'exclude-old-transactions': true,
    });

    // If sandbox receipt sent to production, try sandbox
    if (response.data.status === 21007 && isProduction) {
      return await verifyReceiptWithApple(transactionReceipt, false);
    }

    if (response.data.status !== 0) {
      throw new Error(`Apple verification failed with status: ${response.data.status}`);
    }

    return response.data;
  } catch (error) {
    console.error('Error verifying receipt:', error);
    throw error;
  }
}
```

#### Python/Django Example

```python
import requests
import os

def verify_receipt_with_apple(transaction_receipt, is_production=True):
    url = (
        'https://buy.itunes.apple.com/verifyReceipt'
        if is_production
        else 'https://sandbox.itunes.apple.com/verifyReceipt'
    )
    
    payload = {
        'receipt-data': transaction_receipt,
        'password': os.getenv('APPLE_SHARED_SECRET'),
        'exclude-old-transactions': True,
    }
    
    try:
        response = requests.post(url, json=payload)
        data = response.json()
        
        # If sandbox receipt sent to production, try sandbox
        if data.get('status') == 21007 and is_production:
            return verify_receipt_with_apple(transaction_receipt, False)
        
        if data.get('status') != 0:
            raise Exception(f"Apple verification failed with status: {data.get('status')}")
        
        return data
    except Exception as e:
        print(f'Error verifying receipt: {e}')
        raise
```

### 3. Extract Subscription Information

After verifying the receipt, extract the subscription information:

```javascript
function extractSubscriptionInfo(appleResponse, productId) {
  // Handle both StoreKit 1 (receipt) and StoreKit 2 (JWS) responses
  const receipt = appleResponse.receipt;
  const latestReceiptInfo = appleResponse.latest_receipt_info || [];
  
  // Find the transaction for the specific product
  const transaction = latestReceiptInfo.find(
    (t) => t.product_id === productId
  );
  
  if (!transaction) {
    throw new Error('Transaction not found in receipt');
  }
  
  return {
    transactionId: transaction.transaction_id,
    originalTransactionId: transaction.original_transaction_id,
    productId: transaction.product_id,
    purchaseDate: transaction.purchase_date_ms,
    expiresDate: transaction.expires_date_ms,
    isTrialPeriod: transaction.is_trial_period === 'true',
    isInIntroOfferPeriod: transaction.is_in_intro_offer_period === 'true',
  };
}
```

**Note:** For StoreKit 2 (iOS 15+), the response structure may differ. You may need to handle JWS token validation differently. Check Apple's documentation for StoreKit 2 validation.

### 4. Create/Update Subscription in Database

**Important:** This function must be idempotent because it's called both for new purchases and restore purchases. The same purchase can be restored multiple times.

```javascript
async function createOrUpdateSubscription(userId, planKey, subscriptionInfo) {
  // Find the plan
  const plan = await Plan.findOne({ key: planKey });
  if (!plan) {
    throw new Error('Plan not found');
  }
  
  // First, check if subscription already exists with this original transaction ID
  // This handles restore purchases idempotently
  let subscription = await Subscription.findOne({
    userId,
    iosOriginalTransactionId: subscriptionInfo.originalTransactionId,
  });
  
  if (subscription) {
    // Subscription already exists - update it (idempotent operation)
    subscription.planId = plan._id;
    subscription.status = 'active';
    subscription.currentPeriodStart = new Date(subscriptionInfo.purchaseDate);
    subscription.currentPeriodEnd = new Date(subscriptionInfo.expiresDate);
    subscription.iosTransactionId = subscriptionInfo.transactionId;
    subscription.paymentMethod = 'ios';
    await subscription.save();
    return subscription;
  }
  
  // Check if user has any active subscription (for plan upgrades/changes)
  const activeSubscription = await Subscription.findOne({
    userId,
    status: { $in: ['active', 'trialing'] },
  });
  
  if (activeSubscription) {
    // Update existing active subscription (plan change or renewal)
    activeSubscription.planId = plan._id;
    activeSubscription.status = 'active';
    activeSubscription.currentPeriodStart = new Date(subscriptionInfo.purchaseDate);
    activeSubscription.currentPeriodEnd = new Date(subscriptionInfo.expiresDate);
    activeSubscription.iosTransactionId = subscriptionInfo.transactionId;
    activeSubscription.iosOriginalTransactionId = subscriptionInfo.originalTransactionId;
    activeSubscription.paymentMethod = 'ios';
    await activeSubscription.save();
    return activeSubscription;
  }
  
  // Create new subscription (first-time purchase)
  subscription = new Subscription({
    userId,
    planId: plan._id,
    status: 'active',
    currentPeriodStart: new Date(subscriptionInfo.purchaseDate),
    currentPeriodEnd: new Date(subscriptionInfo.expiresDate),
    iosTransactionId: subscriptionInfo.transactionId,
    iosOriginalTransactionId: subscriptionInfo.originalTransactionId,
    paymentMethod: 'ios',
  });
  
  await subscription.save();
  return subscription;
}
```

**Key Points:**
- **Idempotency:** Check for `iosOriginalTransactionId` first to prevent duplicates
- **Restore Purchases:** Same endpoint handles both new purchases and restores
- **Plan Changes:** Updates existing subscription if user already has one active
- **Original Transaction ID:** Use this to track subscriptions across renewals and restores

### 5. Complete Endpoint Implementation

#### Node.js/Express Example

```javascript
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

router.post('/confirm-ios', authenticate, async (req, res) => {
  try {
    const { planKey, transactionReceipt, transactionId, productId } = req.body;
    const userId = req.user.id; // From authentication middleware
    
    // Validate input
    if (!planKey || !transactionReceipt || !transactionId || !productId) {
      return res.status(400).json({
        message: 'Missing required fields',
      });
    }
    
    // Verify receipt with Apple
    const appleResponse = await verifyReceiptWithApple(transactionReceipt);
    
    // Extract subscription info
    const subscriptionInfo = extractSubscriptionInfo(appleResponse, productId);
    
    // Verify transaction ID matches (be flexible with ID format)
    // The frontend may send purchase.id or originalTransactionIdentifierIOS
    const receivedTransactionId = subscriptionInfo.transactionId || subscriptionInfo.originalTransactionId;
    if (receivedTransactionId && receivedTransactionId !== transactionId) {
      // Log warning but don't fail - transaction IDs may vary in format
      console.warn('Transaction ID mismatch:', { received: receivedTransactionId, sent: transactionId });
    }
    
    // Create or update subscription
    const subscription = await createOrUpdateSubscription(
      userId,
      planKey,
      subscriptionInfo
    );
    
    // Populate plan details
    await subscription.populate('planId');
    
    // Calculate days remaining
    const daysRemaining = Math.ceil(
      (subscription.currentPeriodEnd - new Date()) / (1000 * 60 * 60 * 24)
    );
    
    // Return response
    res.json({
      plan: subscription.planId,
      status: subscription.status,
      currentPeriodStart: subscription.currentPeriodStart.toISOString(),
      currentPeriodEnd: subscription.currentPeriodEnd.toISOString(),
      daysRemaining: Math.max(0, daysRemaining),
      nextPaymentDate: subscription.currentPeriodEnd.toISOString(),
    });
  } catch (error) {
    console.error('Error confirming iOS subscription:', error);
    res.status(500).json({
      message: error.message || 'Failed to confirm subscription',
    });
  }
});

module.exports = router;
```

#### Python/Django Example

```python
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from datetime import timedelta

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def confirm_ios_subscription(request):
    try:
        plan_key = request.data.get('planKey')
        transaction_receipt = request.data.get('transactionReceipt')
        transaction_id = request.data.get('transactionId')
        product_id = request.data.get('productId')
        
        # Validate input
        if not all([plan_key, transaction_receipt, transaction_id, product_id]):
            return Response(
                {'message': 'Missing required fields'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verify receipt with Apple
        apple_response = verify_receipt_with_apple(transaction_receipt)
        
        # Extract subscription info
        subscription_info = extract_subscription_info(apple_response, product_id)
        
        # Verify transaction ID matches (be flexible with ID format)
        # The frontend may send purchase.id or originalTransactionIdentifierIOS
        received_transaction_id = subscription_info.get('transaction_id') or subscription_info.get('original_transaction_id')
        if received_transaction_id and received_transaction_id != transaction_id:
            # Log warning but don't fail - transaction IDs may vary in format
            print(f'Warning: Transaction ID mismatch: received={received_transaction_id}, sent={transaction_id}')
        
        # Find plan
        try:
            plan = Plan.objects.get(key=plan_key)
        except Plan.DoesNotExist:
            return Response(
                {'message': 'Plan not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Create or update subscription
        subscription, created = Subscription.objects.update_or_create(
            user=request.user,
            defaults={
                'plan': plan,
                'status': 'active',
                'current_period_start': timezone.datetime.fromtimestamp(
                    subscription_info['purchase_date'] / 1000,
                    tz=timezone.utc
                ),
                'current_period_end': timezone.datetime.fromtimestamp(
                    subscription_info['expires_date'] / 1000,
                    tz=timezone.utc
                ),
                'ios_transaction_id': subscription_info['transaction_id'],
                'ios_original_transaction_id': subscription_info['original_transaction_id'],
                'payment_method': 'ios',
            }
        )
        
        # Calculate days remaining
        days_remaining = max(0, (subscription.current_period_end - timezone.now()).days)
        
        # Return response
        return Response({
            'plan': {
                '_id': str(plan.id),
                'key': plan.key,
                'name': plan.name,
                'amount': plan.amount,
                'interval': plan.interval,
                # ... other plan fields
            },
            'status': subscription.status,
            'currentPeriodStart': subscription.current_period_start.isoformat(),
            'currentPeriodEnd': subscription.current_period_end.isoformat(),
            'daysRemaining': days_remaining,
            'nextPaymentDate': subscription.current_period_end.isoformat(),
        })
        
    except Exception as e:
        print(f'Error confirming iOS subscription: {e}')
        return Response(
            {'message': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
```

## Apple Status Codes

When verifying receipts, Apple returns status codes:

- `0` - Valid receipt
- `21000` - The App Store could not read the JSON object you provided
- `21002` - The data in the receipt-data property was malformed or missing
- `21003` - The receipt could not be authenticated
- `21004` - The shared secret you provided does not match the shared secret on file
- `21005` - The receipt server is not currently available
- `21006` - This receipt is valid but the subscription has expired
- `21007` - This receipt is from the test environment, but it was sent to the production environment
- `21008` - This receipt is from the production environment, but it was sent to the test environment
- `21010` - This receipt could not be authorized

## Environment Variables

Make sure to set these environment variables:

```bash
APPLE_SHARED_SECRET=your_shared_secret_from_app_store_connect
```

To get your shared secret:
1. Go to App Store Connect
2. Navigate to your app
3. Go to App Information → App Store Server Notifications
4. Generate or copy your shared secret

## Security Considerations

1. **Always verify receipts server-side** - Never trust client-side receipt data
2. **Store transaction IDs** - Use `original_transaction_id` to track subscriptions across renewals
3. **Handle renewals** - Set up webhooks to handle subscription renewals automatically
4. **Validate product IDs** - Ensure the product ID matches your plan configuration
5. **Rate limiting** - Implement rate limiting to prevent abuse

## Testing

### Sandbox Testing

1. Create a sandbox test user in App Store Connect
2. Sign out of your Apple ID on the test device
3. When prompted during purchase, sign in with the sandbox user
4. Use sandbox receipt verification endpoint

### Production Testing

1. Use a real Apple ID (not sandbox)
2. Make a real purchase (will be refunded if needed)
3. Use production receipt verification endpoint

## Webhook Integration (Recommended)

For automatic subscription renewal handling, set up App Store Server Notifications:

1. Configure webhook URL in App Store Connect
2. Handle these events:
   - `INITIAL_BUY` - First purchase
   - `DID_RENEW` - Subscription renewed
   - `DID_FAIL_TO_RENEW` - Renewal failed
   - `CANCEL` - Subscription canceled
   - `REFUND` - Refund issued

## Database Schema

Recommended subscription table structure:

```sql
CREATE TABLE subscriptions (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  plan_id VARCHAR(255) NOT NULL,
  status ENUM('active', 'canceled', 'past_due', 'unpaid', 'trialing') NOT NULL,
  current_period_start DATETIME NOT NULL,
  current_period_end DATETIME NOT NULL,
  ios_transaction_id VARCHAR(255),
  ios_original_transaction_id VARCHAR(255),
  payment_method ENUM('stripe', 'ios', 'android') NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_ios_transaction (ios_transaction_id),
  INDEX idx_ios_original_transaction (ios_original_transaction_id) -- Important for restore purchases idempotency
);
```

**Important Indexes:**
- `idx_ios_original_transaction_id` - Critical for restore purchases idempotency checks
- `idx_user_id` - For finding user's subscriptions
- `idx_status` - For filtering active subscriptions

## Error Handling

Handle these common errors:

1. **Invalid receipt** - Return 400 with clear error message
2. **Expired subscription** - For restore purchases, you may want to reactivate expired subscriptions. For new purchases, return 400
3. **Transaction ID mismatch** - Log warning but don't fail (transaction IDs may vary in format)
4. **Apple server error** - Retry with exponential backoff
5. **Network timeout** - Retry or queue for later processing
6. **Duplicate restore** - Handle gracefully (idempotent operation should prevent issues)

### Restore Purchases Error Handling

When handling restore purchases:
- If a purchase is already synced, return success (idempotent)
- If receipt validation fails for a restored purchase, log error but continue with other purchases
- Don't fail the entire restore operation if one purchase fails

## Restore Purchases Flow

The app implements "Restore Purchases" functionality which also uses the same `/confirm-ios` endpoint. When a user restores purchases:

1. Frontend calls `getAvailablePurchases()` to get all previous purchases
2. For each purchase, it calls `/confirm-ios` with the purchase data
3. Backend should handle this idempotently (same purchase can be restored multiple times)

### Backend Considerations for Restore Purchases

**Important:** The same endpoint is used for both new purchases and restore purchases. Your backend should:

1. **Check for Existing Subscriptions:** Before creating a new subscription, check if the user already has an active subscription with the same `originalTransactionId`
2. **Idempotency:** If the subscription already exists and is active, return success without creating a duplicate
3. **Update Existing:** If subscription exists but is expired/canceled, reactivate it with new dates

#### Example: Idempotent Subscription Handling

```javascript
async function createOrUpdateSubscription(userId, planKey, subscriptionInfo) {
  const plan = await Plan.findOne({ key: planKey });
  if (!plan) {
    throw new Error('Plan not found');
  }
  
  // Check for existing subscription with same original transaction ID
  let subscription = await Subscription.findOne({
    userId,
    iosOriginalTransactionId: subscriptionInfo.originalTransactionId,
  });
  
  if (subscription) {
    // Subscription already exists - update it
    subscription.planId = plan._id;
    subscription.status = 'active';
    subscription.currentPeriodStart = new Date(subscriptionInfo.purchaseDate);
    subscription.currentPeriodEnd = new Date(subscriptionInfo.expiresDate);
    subscription.iosTransactionId = subscriptionInfo.transactionId;
    await subscription.save();
    return subscription;
  }
  
  // Check if user has any active subscription
  const activeSubscription = await Subscription.findOne({
    userId,
    status: { $in: ['active', 'trialing'] },
  });
  
  if (activeSubscription) {
    // Update existing active subscription
    activeSubscription.planId = plan._id;
    activeSubscription.status = 'active';
    activeSubscription.currentPeriodStart = new Date(subscriptionInfo.purchaseDate);
    activeSubscription.currentPeriodEnd = new Date(subscriptionInfo.expiresDate);
    activeSubscription.iosTransactionId = subscriptionInfo.transactionId;
    activeSubscription.iosOriginalTransactionId = subscriptionInfo.originalTransactionId;
    activeSubscription.paymentMethod = 'ios';
    await activeSubscription.save();
    return activeSubscription;
  }
  
  // Create new subscription
  subscription = new Subscription({
    userId,
    planId: plan._id,
    status: 'active',
    currentPeriodStart: new Date(subscriptionInfo.purchaseDate),
    currentPeriodEnd: new Date(subscriptionInfo.expiresDate),
    iosTransactionId: subscriptionInfo.transactionId,
    iosOriginalTransactionId: subscriptionInfo.originalTransactionId,
    paymentMethod: 'ios',
  });
  
  await subscription.save();
  return subscription;
}
```

## Frontend Implementation Notes

The React Native app uses `react-native-iap` version 14.6.2. Key implementation details:

1. **Product Fetching:** Uses `fetchProducts({ skus: [...], type: 'subs' })` to get iOS product information
2. **Price Display:** Shows `displayPrice` from product which includes currency formatting (e.g., "$38.99")
3. **Purchase Flow:** Uses `requestPurchase()` with subscription type
4. **Restore Purchases:** Calls `getAvailablePurchases()` and syncs each purchase with backend via `/confirm-ios`
5. **Receipt Handling:** Currently sends `purchaseToken` or `purchase.id` - you may need to enhance this to send full receipt data

### Recommended Enhancement

For more robust receipt validation, consider updating the frontend to send the full receipt:

```typescript
import { getReceiptDataIOS } from 'react-native-iap';

// After purchase
const receiptData = await getReceiptDataIOS();
// Send receiptData to backend instead of purchaseToken
```

## Additional Resources

- [Apple Receipt Validation Guide](https://developer.apple.com/documentation/appstorereceipts/validating_receipts_with_the_app_store)
- [App Store Server Notifications](https://developer.apple.com/documentation/appstoreservernotifications)
- [react-native-iap Documentation](https://github.com/dooboolab/react-native-iap)
- [StoreKit 2 Documentation](https://developer.apple.com/documentation/storekit)

