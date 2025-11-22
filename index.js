/**
 * @format
 */

import { AppRegistry } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import notifee from '@notifee/react-native';
import App from './App';
import { name as appName } from './app.json';

// Helper function to convert data values to strings (Notifee requirement)
const convertDataToStrings = (data) => {
  if (!data || typeof data !== 'object') {
    return {};
  }

  const stringData = {};
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
};

// Register background handler for Firebase Cloud Messaging
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log('[PushNotifications] Background message received:', remoteMessage);
  
  // Display notification using Notifee
  const channelId = await notifee.createChannel({
    id: 'default',
    name: 'Default Notifications',
    importance: 4, // AndroidImportance.HIGH
  });

  // Convert all data values to strings (Notifee requirement)
  const stringData = convertDataToStrings(remoteMessage.data);

  await notifee.displayNotification({
    title: remoteMessage.notification?.title || 'Notification',
    body: remoteMessage.notification?.body || '',
    data: stringData,
    android: {
      channelId,
      importance: 4,
      pressAction: {
        id: 'default',
      },
      // Use notification icon (monochrome white icon)
      smallIcon: 'ic_notification',
      // Large icon shows full-color app icon in expanded notification
      largeIcon: 'ic_launcher',
    },
  });
});

AppRegistry.registerComponent(appName, () => App);
