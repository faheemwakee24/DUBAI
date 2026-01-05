/**
 * External URLs for legal documents and resources
 * These URLs must be publicly accessible and functional
 */

// Base website URL - Update this with your actual website domain
export const WEBSITE_BASE_URL = 'https://dubnxt.ai'; // TODO: Update with your actual website URL

// Legal Documents URLs
export const EXTERNAL_URLS = {
  // Terms of Use (EULA) - Required for App Store compliance
  // Using Apple's Standard EULA (default option)
  // If you want to use custom EULA, replace with your Terms of Use URL
  TERMS_OF_USE: 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/',
  
  // Privacy Policy - Required for App Store compliance
  // Update with your actual Privacy Policy URL
  PRIVACY_POLICY: `${WEBSITE_BASE_URL}/iosprivacypolicy`, // TODO: Update with your actual Privacy Policy URL
  
  // Support/Contact
  SUPPORT: `${WEBSITE_BASE_URL}/support`, // Optional
} as const;

