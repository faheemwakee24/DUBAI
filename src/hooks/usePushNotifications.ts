import { useEffect, useState, useCallback } from 'react';
import { pushNotificationService, PushNotificationData } from '../services/pushNotificationService';

export const usePushNotifications = () => {
  const [notifications, setNotifications] = useState<PushNotificationData[]>([]);
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize push notifications
    const init = async () => {
      try {
        await pushNotificationService.initialize();
        const token = await pushNotificationService.getToken();
        setFcmToken(token);
        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing push notifications:', error);
      }
    };

    init();

    // Subscribe to new notifications
    const unsubscribe = pushNotificationService.subscribe((notification) => {
      setNotifications((prev) => [notification, ...prev]);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) =>
      prev.map((notif) => ({ ...notif, read: true }))
    );
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    fcmToken,
    isInitialized,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  };
};

