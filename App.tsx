/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import Toast from 'react-native-toast-message';
import { store } from './src/store';
import RootNavigator from './src/navigation/RootNavigator';
import { toastConfig } from './src/components/ui/ToastConfig';

function App() {

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" />

        <AppContent />
        <Toast config={toastConfig} />
      </SafeAreaProvider>
    </Provider>
  );
}

function AppContent() {
  return <RootNavigator />;
}

export default App;
