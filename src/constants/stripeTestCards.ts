/**
 * Stripe Test Cards for Testing Payment Integration
 * Use these cards to test various payment scenarios
 */

export interface TestCard {
  number: string;
  brand: 'visa' | 'mastercard' | 'amex' | 'discover';
  cvc: string;
  expiryMonth: string;
  expiryYear: string;
  description: string;
  scenario: 'success' | 'decline' | '3d_secure' | 'insufficient_funds';
}

export const STRIPE_TEST_CARDS: TestCard[] = [
  {
    number: '4242 4242 4242 4242',
    brand: 'visa',
    cvc: '123',
    expiryMonth: '12',
    expiryYear: '34',
    description: 'Visa - Success',
    scenario: 'success',
  },
  {
    number: '4000 0000 0000 0002',
    brand: 'visa',
    cvc: '123',
    expiryMonth: '12',
    expiryYear: '34',
    description: 'Visa - Card declined',
    scenario: 'decline',
  },
  {
    number: '4000 0025 0000 3155',
    brand: 'visa',
    cvc: '123',
    expiryMonth: '12',
    expiryYear: '34',
    description: 'Visa - 3D Secure required',
    scenario: '3d_secure',
  },
  {
    number: '4000 0000 0000 9995',
    brand: 'visa',
    cvc: '123',
    expiryMonth: '12',
    expiryYear: '34',
    description: 'Visa - Insufficient funds',
    scenario: 'insufficient_funds',
  },
  {
    number: '5555 5555 5555 4444',
    brand: 'mastercard',
    cvc: '123',
    expiryMonth: '12',
    expiryYear: '34',
    description: 'Mastercard - Success',
    scenario: 'success',
  },
  {
    number: '3782 822463 10005',
    brand: 'amex',
    cvc: '1234',
    expiryMonth: '12',
    expiryYear: '34',
    description: 'American Express - Success',
    scenario: 'success',
  },
];

/**
 * Get a test card by scenario
 */
export const getTestCardByScenario = (scenario: TestCard['scenario']): TestCard | undefined => {
  return STRIPE_TEST_CARDS.find((card) => card.scenario === scenario);
};

/**
 * Get default success test card (most common for testing)
 */
export const getDefaultTestCard = (): TestCard => {
  return STRIPE_TEST_CARDS[0]; // 4242 4242 4242 4242
};

