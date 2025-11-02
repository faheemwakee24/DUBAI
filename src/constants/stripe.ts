/**
 * Stripe Configuration
 * Store your Stripe publishable keys here
 */

// Stripe Publishable Key (Test key)
export const STRIPE_PUBLISHABLE_KEY =
  'pk_test_51SP3thAUfFKCA2wQXWcqsE5VmszuNdlfeP23mPCyGU8qlY0oqOaXIRi7aWK5uG8grkLL5fC5CpRvRhhiCyQILEg500uWyBgB13';

// Stripe Configuration Options
export const STRIPE_CONFIG = {
  publishableKey: STRIPE_PUBLISHABLE_KEY,
  merchantIdentifier: 'merchant.com.dubai', // Optional: For Apple Pay
  // Set to true when ready for production
  // setUrlSchemeOnAndroid: true,
};

