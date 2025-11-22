import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, EventType, Event } from '@notifee/react-native';
import { Platform, PermissionsAndroid } from 'react-native';
import { tokenStorage } from '../utils/tokenStorage';

export interface PushNotificationData {
  id?: string;
  type?: 'success' | 'error' | 'processing' | 'info';
  title: string;
  body: string;
  timestamp?: string;
  data?: any;
  read?: boolean;
}

class PushNotificationService {
  private fcmToken: string | null = null;
  private notificationListeners: Array<(notification: PushNotificationData) => void> = [];

  /**
   * Request notification permissions
   */
  async requestPermission(): Promise<boolean> {
    try {
      // Request Notifee permissions (handles both iOS and Android)
      const settings = await notifee.requestPermission();
      
      if (settings.authorizationStatus >= 1) {
        console.log('[PushNotifications] Notifee permission granted');
      } else {
        console.warn('[PushNotifications] Notifee permission denied');
        return false;
      }

      if (Platform.OS === 'android') {
        // For Android 13+ (API 33+), request POST_NOTIFICATIONS permission
        if (Platform.Version >= 33) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
          );
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            console.warn('[PushNotifications] Android POST_NOTIFICATIONS permission denied');
            return false;
          }
        }
      }

      // Request FCM permission
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('[PushNotifications] FCM permission granted');
        return true;
      } else {
        console.warn('[PushNotifications] FCM permission denied');
        return false;
      }
    } catch (error) {
      console.error('[PushNotifications] Error requesting notification permission:', error);
      return false;
    }
  }

  /**
   * Get FCM token
   */
  async getToken(): Promise<string | null> {
    try {
      if (!this.fcmToken) {
        this.fcmToken = await messaging().getToken();
        // Store token for backend API
        await this.saveTokenToStorage(this.fcmToken);
      }
      return this.fcmToken;
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  }

  /**
   * Save FCM token to storage (you can extend this to send to your backend)
   */
  private async saveTokenToStorage(token: string): Promise<void> {
    try {
      // You can store the token in AsyncStorage or send it to your backend
      // For now, we'll just log it
      console.log('FCM Token:', token);
      
      // TODO: Send token to your backend API
      // Example:
      // await api.updateFCMToken(token);
    } catch (error) {
      console.error('Error saving FCM token:', error);
    }
  }

  /**
   * Delete FCM token (on logout)
   */
  async deleteToken(): Promise<void> {
    try {
      await messaging().deleteToken();
      this.fcmToken = null;
      console.log('FCM token deleted');
    } catch (error) {
      console.error('Error deleting FCM token:', error);
    }
  }

  /**
   * Subscribe to notification updates
   */
  subscribe(callback: (notification: PushNotificationData) => void): () => void {
    this.notificationListeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.notificationListeners = this.notificationListeners.filter(
        (listener) => listener !== callback
      );
    };
  }

  /**
   * Notify all subscribers
   */
  private notifySubscribers(notification: PushNotificationData): void {
    this.notificationListeners.forEach((callback) => callback(notification));
  }

  /**
   * Initialize push notifications
   */
  async initialize(): Promise<void> {
    try {
      console.log('[PushNotifications] Starting initialization...');
      
      // Check if messaging is available
      const messagingInstance = messaging();
      if (!messagingInstance) {
        console.error('[PushNotifications] Messaging instance not available');
        return;
      }

      // Request permission
      console.log('[PushNotifications] Requesting permissions...');
      const hasPermission = await this.requestPermission();
      if (!hasPermission) {
        console.warn('[PushNotifications] Notification permission not granted');
        return;
      }

      // Get FCM token
      console.log('[PushNotifications] Getting FCM token...');
      const token = await this.getToken();
      if (token) {
        console.log('[PushNotifications] FCM token obtained:', token.substring(0, 20) + '...');
      } else {
        console.warn('[PushNotifications] Failed to get FCM token');
      }

      // Create notification channels
      await this.createNotificationChannel();

      // Set up Notifee event handlers
      notifee.onForegroundEvent(async ({ type, detail }: Event) => {
        console.log('[PushNotifications] Notifee foreground event:', type, detail);
        
        if (type === EventType.PRESS) {
          // Handle notification press
          const notificationData = detail.notification?.data as any;
          if (notificationData) {
            const notification: PushNotificationData = {
              id: detail.notification?.id || Date.now().toString(),
              type: this.getNotificationType(notificationData),
              title: detail.notification?.title || 'Notification',
              body: detail.notification?.body || '',
              timestamp: new Date().toISOString(),
              data: notificationData,
            };
            this.notifySubscribers(notification);
          }
        }
      });

      notifee.onBackgroundEvent(async ({ type, detail }: Event) => {
        console.log('[PushNotifications] Notifee background event:', type, detail);
        // Handle background events if needed
      });

      // Handle foreground messages from FCM
      console.log('[PushNotifications] Setting up foreground message handler...');
      messagingInstance.onMessage(async (remoteMessage) => {
        console.log('[PushNotifications] Foreground message received:', JSON.stringify(remoteMessage, null, 2));
        
        const notification: PushNotificationData = {
          id: remoteMessage.messageId || Date.now().toString(),
          type: this.getNotificationType(remoteMessage.data),
          title: remoteMessage.notification?.title || 'Notification',
          body: remoteMessage.notification?.body || '',
          timestamp: new Date().toISOString(),
          data: remoteMessage.data,
        };

        // Display notification using Notifee
        await this.displayNotification(notification);

        // Notify subscribers
        console.log('[PushNotifications] Notifying subscribers with:', notification);
        this.notifySubscribers(notification);
      });

      // Handle background/quit state messages
      console.log('[PushNotifications] Setting up background message handler...');
      messagingInstance.onNotificationOpenedApp((remoteMessage) => {
        console.log('[PushNotifications] Notification opened app from background:', JSON.stringify(remoteMessage, null, 2));
        
        // Convert to PushNotificationData and notify
        const notification: PushNotificationData = {
          id: remoteMessage.messageId || Date.now().toString(),
          type: this.getNotificationType(remoteMessage.data),
          title: remoteMessage.notification?.title || 'Notification',
          body: remoteMessage.notification?.body || '',
          timestamp: new Date().toISOString(),
          data: remoteMessage.data,
        };
        this.notifySubscribers(notification);
      });

      // Check if app was opened from a notification
      console.log('[PushNotifications] Checking for initial notification...');
      messagingInstance
        .getInitialNotification()
        .then(async (remoteMessage) => {
          if (remoteMessage) {
            console.log('[PushNotifications] Notification opened app from quit state:', JSON.stringify(remoteMessage, null, 2));
            
            // Convert to PushNotificationData and notify
            const notification: PushNotificationData = {
              id: remoteMessage.messageId || Date.now().toString(),
              type: this.getNotificationType(remoteMessage.data),
              title: remoteMessage.notification?.title || 'Notification',
              body: remoteMessage.notification?.body || '',
              timestamp: new Date().toISOString(),
              data: remoteMessage.data,
            };
            
            // Display notification if not already displayed
            await this.displayNotification(notification);
            this.notifySubscribers(notification);
          } else {
            console.log('[PushNotifications] No initial notification found');
          }
        })
        .catch((error) => {
          console.error('[PushNotifications] Error getting initial notification:', error);
        });

      // Handle token refresh
      console.log('[PushNotifications] Setting up token refresh handler...');
      messagingInstance.onTokenRefresh(async (token) => {
        console.log('[PushNotifications] FCM token refreshed:', token);
        this.fcmToken = token;
        await this.saveTokenToStorage(token);
      });

      console.log('[PushNotifications] Initialization complete!');
    } catch (error) {
      console.error('[PushNotifications] Error initializing push notifications:', error);
      if (error instanceof Error) {
        console.error('[PushNotifications] Error details:', error.message, error.stack);
      }
    }
  }

  /**
   * Get notification type from data
   */
  private getNotificationType(data?: any): 'success' | 'error' | 'processing' | 'info' {
    if (!data || !data.type) return 'info';
    
    const type = data.type.toLowerCase();
    if (['success', 'error', 'processing', 'info'].includes(type)) {
      return type as 'success' | 'error' | 'processing' | 'info';
    }
    return 'info';
  }

  /**
   * Create local notification channel (Android)
   */
  async createNotificationChannel(): Promise<void> {
    if (Platform.OS === 'android') {
      try {
        // Create default channel
        const channelId = await notifee.createChannel({
          id: 'default',
          name: 'Default Notifications',
          importance: AndroidImportance.HIGH,
          sound: 'default',
          vibration: true,
        });

        // Create channels for different notification types
        await notifee.createChannel({
          id: 'success',
          name: 'Success Notifications',
          importance: AndroidImportance.HIGH,
          sound: 'default',
          vibration: true,
        });

        await notifee.createChannel({
          id: 'error',
          name: 'Error Notifications',
          importance: AndroidImportance.HIGH,
          sound: 'default',
          vibration: true,
        });

        await notifee.createChannel({
          id: 'processing',
          name: 'Processing Notifications',
          importance: AndroidImportance.DEFAULT,
          sound: 'default',
        });

        console.log('[PushNotifications] Notification channels created:', channelId);
      } catch (error) {
        console.error('[PushNotifications] Error creating notification channels:', error);
      }
    }
  }

  /**
   * Convert data object values to strings (Notifee requirement)
   */
  private convertDataToStrings(data: any): Record<string, string> {
    if (!data || typeof data !== 'object') {
      return {};
    }

    const stringData: Record<string, string> = {};
    for (const [key, value] of Object.entries(data)) {
      // Convert all values to strings
      if (value === null || value === undefined) {
        stringData[key] = '';
      } else if (typeof value === 'object') {
        stringData[key] = JSON.stringify(value);
      } else {
        stringData[key] = String(value);
      }
    }
    return stringData;
  }

  /**
   * Display a notification using Notifee
   */
  async displayNotification(notification: PushNotificationData): Promise<string | null> {
    try {
      const channelId = Platform.OS === 'android' 
        ? (notification.type || 'default')
        : undefined;

      // Convert all data values to strings (Notifee requirement)
      const stringData = this.convertDataToStrings(notification.data);

      const notificationId = await notifee.displayNotification({
        title: notification.title,
        body: notification.body,
        data: stringData,
        android: {
          channelId: channelId || 'default',
          importance: AndroidImportance.HIGH,
          pressAction: {
            id: 'default',
          },
          // Use notification icon (monochrome white icon)
          // This should be a simple white/transparent icon in drawable folder
          smallIcon: 'ic_notification',
          // Large icon shows full-color app icon in expanded notification
          largeIcon: 'ic_launcher',
        },
        ios: {
          sound: 'default',
        },
      });

      console.log('[PushNotifications] Notification displayed with ID:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('[PushNotifications] Error displaying notification:', error);
      return null;
    }
  }

  /**
   * Trigger a test notification (for development/testing)
   */
  async triggerTestNotification(type: 'success' | 'error' | 'processing' | 'info' = 'info'): Promise<void> {
    const testNotification: PushNotificationData = {
      id: `test-${Date.now()}`,
      type,
      title: this.getTestTitle(type),
      body: this.getTestBody(type),
      timestamp: new Date().toISOString(),
      data: { test: true, type },
    };

    console.log('[PushNotifications] Triggering test notification:', testNotification);
    
    // Display notification using Notifee
    await this.displayNotification(testNotification);
    
    // Notify subscribers
    this.notifySubscribers(testNotification);
  }

  /**
   * Get test notification title based on type
   */
  private getTestTitle(type: string): string {
    switch (type) {
      case 'success':
        return 'Test: Video Ready';
      case 'error':
        return 'Test: Upload Failed';
      case 'processing':
        return 'Test: Processing';
      default:
        return 'Test Notification';
    }
  }

  /**
   * Get test notification body based on type
   */
  private getTestBody(type: string): string {
    switch (type) {
      case 'success':
        return 'This is a test success notification. Your video has been processed successfully!';
      case 'error':
        return 'This is a test error notification. Something went wrong during processing.';
      case 'processing':
        return 'This is a test processing notification. Your video is being processed...';
      default:
        return 'This is a test notification to verify push notification functionality.';
    }
  }
}

export const pushNotificationService = new PushNotificationService();

