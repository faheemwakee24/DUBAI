module.exports = {
  dependencies: {
    // Exclude react-native-splash-screen to avoid AndroidX dependency conflicts
    // We'll use native Android splash screen instead (already configured)
    'react-native-splash-screen': {
      platforms: {
        android: null,
        ios: null,
      },
    },
  },
};
