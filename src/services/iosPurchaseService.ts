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
      const products = await fetchProducts({ skus: productIds, type: 'subs' });
      console.log('IAP: Products fetched', products);
      return products as Product[];
    } catch (error) {
      console.error('IAP: Error fetching products', error);
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

    try {
      await requestPurchase({
        request: {
          ios: { sku: productId },
        },
        type: 'subs',
      });
      // The actual purchase result will come through the purchaseUpdatedListener
      // We'll return a promise that resolves when purchase is complete
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Purchase timeout'));
        }, 60000); // 60 second timeout

        const updateSub = purchaseUpdatedListener((purchase: Purchase) => {
          if (purchase.productId === productId) {
            clearTimeout(timeout);
            updateSub.remove();
            resolve(purchase);
          }
        });

        const errorSub = purchaseErrorListener((error: PurchaseError) => {
          clearTimeout(timeout);
          updateSub.remove();
          errorSub.remove();
          reject(error);
        });
      });
    } catch (error) {
      console.error('IAP: Error purchasing product', error);
      throw error;
    }
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

