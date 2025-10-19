/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';

function App() {

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" />

      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  return <RootNavigator />;
}

export default App;
