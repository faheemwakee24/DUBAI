import Toast from 'react-native-toast-message';

/**
 * Toast utility for showing success, error, and info messages
 */

export const showToast = {
  /**
   * Show success toast
   */
  success: (message: string, subMessage?: string) => {
    Toast.show({
      type: 'success',
      text1: message,
      text2: subMessage,
      position: 'top',
      visibilityTime: 3000,
    });
  },

  /**
   * Show error toast
   */
  error: (message: string, subMessage?: string) => {
    Toast.show({
      type: 'error',
      text1: message,
      text2: subMessage,
      position: 'top',
      visibilityTime: 4000,
    });
  },

  /**
   * Show info toast
   */
  info: (message: string, subMessage?: string) => {
    Toast.show({
      type: 'info',
      text1: message,
      text2: subMessage,
      position: 'top',
      visibilityTime: 3000,
    });
  },
};

