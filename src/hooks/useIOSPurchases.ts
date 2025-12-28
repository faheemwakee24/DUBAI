import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import {
  iosPurchaseService,
  Product,
  Purchase,
  PurchaseError,
} from '../services/iosPurchaseService';

interface UseIOSPurchasesReturn {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  fetchProducts: (productIds: string[]) => Promise<void>;
  purchaseProduct: (productId: string) => Promise<Purchase>;
  restorePurchases: () => Promise<Purchase[]>;
  getProductById: (productId: string) => Product | undefined;
  getProductPrice: (productId: string) => string | null;
  getProductCurrency: (productId: string) => string | null;
}

/**
 * Hook for managing iOS in-app purchases
 */
export const useIOSPurchases = (): UseIOSPurchasesReturn => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize on mount (iOS only)
  useEffect(() => {
    if (Platform.OS !== 'ios') {
      return;
    }

    const init = async () => {
      try {
        await iosPurchaseService.initialize();
      } catch (err: any) {
        console.error('Error initializing IAP:', err);
        setError(err.message || 'Failed to initialize IAP');
      }
    };

    init();

    // Cleanup on unmount
    return () => {
      iosPurchaseService.cleanup();
    };
  }, []);

  /**
   * Fetch products by their IDs
   */
  const fetchProducts = useCallback(async (productIds: string[]) => {
    if (Platform.OS !== 'ios' || productIds.length === 0) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const fetchedProducts = await iosPurchaseService.getProducts(productIds);
      setProducts(fetchedProducts);
    } catch (err: any) {
      console.error('Error fetching products:', err);
      setError(err.message || 'Failed to fetch products');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Purchase a product
   * Note: Transaction should be finished AFTER backend confirmation, not here
   */
  const purchaseProduct = useCallback(async (productId: string): Promise<Purchase> => {
    if (Platform.OS !== 'ios') {
      throw new Error('IAP purchases are only available on iOS');
    }

    setError(null);

    try {
      const purchase = await iosPurchaseService.purchaseProduct(productId);
      // DO NOT finish transaction here - it should be finished AFTER backend confirmation
      // The transaction will be finished in the component after successful backend sync
      return purchase;
    } catch (err: any) {
      console.error('Error purchasing product:', err);
      const errorMessage = err.message || 'Failed to purchase product';
      setError(errorMessage);
      throw err;
    }
  }, []);

  /**
   * Restore previous purchases
   */
  const restorePurchases = useCallback(async (): Promise<Purchase[]> => {
    if (Platform.OS !== 'ios') {
      return [];
    }

    setError(null);

    try {
      const purchases = await iosPurchaseService.getAvailablePurchases();
      return purchases;
    } catch (err: any) {
      console.error('Error restoring purchases:', err);
      const errorMessage = err.message || 'Failed to restore purchases';
      setError(errorMessage);
      throw err;
    }
  }, []);

  /**
   * Get product by ID
   */
  const getProductById = useCallback(
    (productId: string): Product | undefined => {
      return products.find(p => p.id === productId);
    },
    [products]
  );

  /**
   * Get formatted price for a product (includes currency symbol)
   * This uses displayPrice which is already formatted with currency
   */
  const getProductPrice = useCallback(
    (productId: string): string | null => {
      const product = getProductById(productId);
      console.log('product ---------', JSON.stringify(product,null,2));
      // displayPrice already includes currency symbol (e.g., "$38.99")
      return product?.displayPrice || null;
    },
    [getProductById]
  );

  /**
   * Get currency code for a product (e.g., "USD", "EUR")
   */
  const getProductCurrency = useCallback(
    (productId: string): string | null => {
      const product = getProductById(productId);
      return product?.currency || null;
    },
    [getProductById]
  );

  return {
    products,
    isLoading,
    error,
    fetchProducts,
    purchaseProduct,
    restorePurchases,
    getProductById,
    getProductPrice,
    getProductCurrency,
  };
};

