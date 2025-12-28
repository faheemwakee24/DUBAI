import {
  initConnection,
  endConnection,
  fetchProducts,
  purchaseUpdatedListener,
  purchaseErrorListener,
  finishTransaction,
  requestPurchase,
  getAvailablePurchases,
  Product,
  Purchase,
  PurchaseError,
} from 'react-native-iap';
import { Platform } from 'react-native';

/**
 * iOS In-App Purchase Service
 * Handles iOS subscription purchases using react-native-iap
 */
class IOSPurchaseService {
  private purchaseUpdateSubscription: any = null;
  private purchaseErrorSubscription: any = null;
  private isInitialized = false;

  /**
   * Initialize the IAP connection
   */
  async initialize(): Promise<void> {
    if (Platform.OS !== 'ios') {
      console.log('IAP: Not iOS platform, skipping initialization');
      return;
    }

    try {
      await initConnection();
      this.isInitialized = true;
      console.log('IAP: Initialized successfully');
    } catch (error) {
      console.error('IAP: Initialization error', error);
      throw error;
    }
  }

  /**
   * Get product information for given product IDs
   */
  async getProducts(productIds: string[]): Promise<Product[]> {
    if (Platform.OS !== 'ios') {
      return [];
    }

    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      if (!productIds || productIds.length === 0) {
        console.warn('IAP: No product IDs provided');
        return [];
      }

      const products = await fetchProducts({ skus: productIds, type: 'subs' });
      console.log('IAP: Products fetched', products);
      
      if (!products || products.length === 0) {
        console.warn('IAP: No products returned from App Store. Product IDs:', productIds);
        console.warn('IAP: Make sure products are configured in App Store Connect');
      }
      
      return products as Product[];
    } catch (error: any) {
      console.error('IAP: Error fetching products', error);
      console.error('IAP: Product IDs attempted:', productIds);
      
      // Provide more helpful error message
      if (error?.message?.includes('runtime_error') || error?.message?.includes('Unknown')) {
        const errorMsg = `Failed to fetch products. Please verify:\n` +
          `1. Product IDs are configured in App Store Connect\n` +
          `2. Products are approved and available\n` +
          `3. App is signed with correct provisioning profile\n` +
          `4. Using sandbox account for testing`;
        throw new Error(errorMsg);
      }
      
      throw error;
    }
  }

  /**
   * Purchase a subscription product
   */
  async purchaseProduct(productId: string): Promise<Purchase> {
    if (Platform.OS !== 'ios') {
      throw new Error('IAP purchases are only available on iOS');
    }

    if (!this.isInitialized) {
      await this.initialize();
    }

    // Set up listeners BEFORE making the purchase request to avoid race conditions
    return new Promise((resolve, reject) => {
      let updateSub: any = null;
      let errorSub: any = null;
      let timeout: NodeJS.Timeout | null = null;

      const cleanup = () => {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        if (updateSub) {
          updateSub.remove();
          updateSub = null;
        }
        if (errorSub) {
          errorSub.remove();
          errorSub = null;
        }
      };

      // Set up purchase success listener BEFORE request
      updateSub = purchaseUpdatedListener((purchase: Purchase) => {
        if (purchase.productId === productId) {
          cleanup();
          resolve(purchase);
        }
      });

      // Set up error listener BEFORE request
      errorSub = purchaseErrorListener((error: PurchaseError) => {
        cleanup();
        // Handle user cancellation gracefully
        if (error.code === 'E_USER_CANCELLED' || error.message?.includes('cancel')) {
          reject(new Error('Purchase cancelled by user'));
        } else {
          reject(error);
        }
      });

      // Set timeout
      timeout = setTimeout(() => {
        cleanup();
        reject(new Error('Purchase timeout - please try again'));
      }, 120000); // 120 second timeout (increased from 60)

      // Now make the purchase request
      requestPurchase({
        request: {
          ios: { sku: productId },
        },
        type: 'subs',
      }).catch((error) => {
        // If requestPurchase itself fails, clean up and reject
        cleanup();
        console.error('IAP: Error initiating purchase request', error);
        reject(error);
      });
    });
  }

  /**
   * Finish a transaction (acknowledge purchase)
   */
  async finishPurchase(purchase: Purchase): Promise<void> {
    if (Platform.OS !== 'ios') {
      return;
    }

    try {
      await finishTransaction({ purchase });
      console.log('IAP: Transaction finished', purchase.transactionId);
    } catch (error) {
      console.error('IAP: Error finishing transaction', error);
      throw error;
    }
  }

  /**
   * Get available purchases (restore purchases)
   */
  async getAvailablePurchases(): Promise<Purchase[]> {
    if (Platform.OS !== 'ios') {
      return [];
    }

    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const purchases = await getAvailablePurchases();
      console.log('IAP: Available purchases', purchases);
      return purchases;
    } catch (error) {
      console.error('IAP: Error getting available purchases', error);
      throw error;
    }
  }

  /**
   * Set up purchase listeners
   */
  setupPurchaseListeners(
    onPurchaseUpdate: (purchase: Purchase) => void,
    onPurchaseError: (error: PurchaseError) => void
  ): () => void {
    if (Platform.OS !== 'ios') {
      return () => {}; // Return no-op cleanup function
    }

    this.purchaseUpdateSubscription = purchaseUpdatedListener(onPurchaseUpdate);
    this.purchaseErrorSubscription = purchaseErrorListener(onPurchaseError);

    // Return cleanup function
    return () => {
      if (this.purchaseUpdateSubscription) {
        this.purchaseUpdateSubscription.remove();
        this.purchaseUpdateSubscription = null;
      }
      if (this.purchaseErrorSubscription) {
        this.purchaseErrorSubscription.remove();
        this.purchaseErrorSubscription = null;
      }
    };
  }

  /**
   * Clean up and end connection
   */
  async cleanup(): Promise<void> {
    if (Platform.OS !== 'ios') {
      return;
    }

    if (this.purchaseUpdateSubscription) {
      this.purchaseUpdateSubscription.remove();
      this.purchaseUpdateSubscription = null;
    }

    if (this.purchaseErrorSubscription) {
      this.purchaseErrorSubscription.remove();
      this.purchaseErrorSubscription = null;
    }

    try {
      await endConnection();
      this.isInitialized = false;
      console.log('IAP: Connection ended');
    } catch (error) {
      console.error('IAP: Error ending connection', error);
    }
  }
}

export const iosPurchaseService = new IOSPurchaseService();
export type { Product, Purchase, PurchaseError };

