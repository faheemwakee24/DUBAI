# App Store Review Issues - Status Check

## Issue Analysis and Resolution Status

### ✅ Issue 1: Guideline 4.0 - Design - Sign in with Apple

**Problem:** App requires users to provide their name after using Sign in with Apple, but this information is already provided by the Authentication Services framework.

**Current Status:** ⚠️ **PARTIALLY FIXED** (Frontend ready, backend needs update)

**Frontend Implementation:**
- ✅ Code extracts name from Apple's response (`fullName` from `appleAuthRequestResponse`)
- ✅ If name is not available (subsequent sign-ins), sends empty strings for `firstName` and `lastName`
- ✅ No UI prompts user to enter name after Apple Sign In

**Location:**
- `src/screens/auth/LoginScreen.tsx` (lines 114-158)
- `src/screens/auth/Signup.tsx` (lines 125-179)
- `src/services/authService.ts` (lines 163-231)

**Backend Action Required:**
- ⚠️ Backend must accept empty `firstName` and `lastName` when `authProvider` is 'apple'
- ⚠️ Backend should not require name fields for Apple Sign In users
- ⚠️ Backend endpoint: `POST /api/v1/auth/social-auth` should handle empty names gracefully

**Recommendation:**
Update backend to make `firstName` and `lastName` optional when `authProvider === 'apple'`. The frontend already handles this correctly.

---

### ⚠️ Issue 2: Guideline 2.1 - Performance - App Completeness (IAP Receipt Validation)

**Problem:** App failed to validate receipt. Error: "Cannot POST /api/v1/subscriptions/confirm-ios"

**Current Status:** ⚠️ **BACKEND ISSUE** (Frontend is correct)

**Frontend Implementation:**
- ✅ Endpoint correctly configured: `/subscriptions/confirm-ios`
- ✅ Full URL: `https://dubnxtbe.infyrolabs.com/api/v1/subscriptions/confirm-ios`
- ✅ Request payload includes: `planKey`, `transactionReceipt`, `transactionId`, `productId`
- ✅ Error handling implemented
- ✅ Transaction finishing logic in place

**Location:**
- `src/screens/Subscriptions/SubsCriptionDetail.tsx` (lines 296-410)
- `src/store/api/subscriptionsApi.ts` (lines 157-164)
- `src/constants/api.ts` (line 65)

**Backend Action Required:**
- ❌ **CRITICAL:** Backend endpoint `POST /api/v1/subscriptions/confirm-ios` must be implemented
- ⚠️ Endpoint should:
  1. Accept: `planKey`, `transactionReceipt`, `transactionId`, `productId`
  2. Verify receipt with Apple's servers
  3. Activate subscription in your system
  4. Return subscription details

**Recommendation:**
Implement the backend endpoint immediately. The frontend is ready and waiting for this endpoint.

---

### ✅ Issue 3: Guideline 3.1.2 - Business - Payments - Subscriptions (Terms of Use Link)

**Problem:** Missing functional link to Terms of Use (EULA) in app metadata/description.

**Current Status:** ✅ **FIXED** (Frontend updated, needs URL configuration)

**Frontend Implementation:**
- ✅ Created `src/constants/urls.ts` for external URLs
- ✅ Updated subscription screen to link to external Terms of Use URL
- ✅ Link labeled as "Terms of Use (EULA)" as required by Apple
- ✅ Link opens in external browser (functional link)
- ✅ Privacy Policy link also updated to use external URL

**Location:**
- `src/screens/Subscriptions/SubsCriptionDetail.tsx` (lines 548-567)
- `src/constants/urls.ts` (new file)

**Action Required:**
- ⚠️ **Update `src/constants/urls.ts`** with your actual Terms of Use URL:
  ```typescript
  export const EXTERNAL_URLS = {
    TERMS_OF_USE: 'https://your-website.com/terms-of-use', // UPDATE THIS
    PRIVACY_POLICY: 'https://your-website.com/privacy-policy', // UPDATE THIS
  };
  ```

**App Store Connect Action Required:**
- ⚠️ Add Terms of Use (EULA) URL to App Store Connect metadata:
  - Go to App Store Connect → Your App → App Information
  - Add Terms of Use URL in the "EULA" field OR include it in the App Description
- ⚠️ Add Privacy Policy URL to App Store Connect:
  - Go to App Store Connect → Your App → App Information
  - Add Privacy Policy URL in the "Privacy Policy URL" field

---

## Summary

| Issue | Status | Action Required |
|-------|--------|----------------|
| **1. Apple Sign In - Name Requirement** | ⚠️ Partial | Backend must accept empty names for Apple Sign In |
| **2. IAP Receipt Validation** | ❌ Backend | Implement `POST /api/v1/subscriptions/confirm-ios` endpoint |
| **3. Terms of Use (EULA) Link** | ✅ Fixed | Update URL in `src/constants/urls.ts` and App Store Connect |

---

## Next Steps

### Immediate Actions:

1. **Update Terms of Use URL:**
   - Edit `src/constants/urls.ts`
   - Replace placeholder URL with your actual published Terms of Use URL
   - Ensure the URL is publicly accessible and functional

2. **Backend - IAP Endpoint:**
   - Implement `POST /api/v1/subscriptions/confirm-ios`
   - Verify receipt with Apple
   - Activate subscription
   - Test thoroughly in sandbox environment

3. **Backend - Apple Sign In:**
   - Update `POST /api/v1/auth/social-auth` to accept empty `firstName`/`lastName` for Apple Sign In
   - Make name fields optional when `authProvider === 'apple'`

4. **App Store Connect:**
   - Add Terms of Use (EULA) URL to App Store Connect metadata
   - Add Privacy Policy URL to App Store Connect metadata
   - Verify all subscription products are configured correctly

### Testing Checklist:

- [ ] Test Apple Sign In with and without name provided
- [ ] Test IAP purchase flow end-to-end
- [ ] Verify Terms of Use link opens correctly in browser
- [ ] Verify Privacy Policy link opens correctly in browser
- [ ] Test in sandbox environment
- [ ] Verify all links are functional and accessible

---

## Files Modified

1. ✅ `src/constants/urls.ts` - Created (needs URL update)
2. ✅ `src/screens/Subscriptions/SubsCriptionDetail.tsx` - Updated to use external URLs

## Files That Need Backend Updates

1. ⚠️ Backend: `POST /api/v1/subscriptions/confirm-ios` - Must be implemented
2. ⚠️ Backend: `POST /api/v1/auth/social-auth` - Must accept empty names for Apple


