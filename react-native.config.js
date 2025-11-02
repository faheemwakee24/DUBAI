module.exports = {
  dependencies: {
    // Exclude react-native-splash-screen from autolinking
    'react-native-splash-screen': {
      platforms: {
        android: null, // disable Android platform, otherwise it will autolink
        ios: null, // disable iOS platform, otherwise it will autolink
      },
    },
  },
};
