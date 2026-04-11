import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import 'react-native-reanimated';
import 'react-native-gesture-handler';
import RootNavigator from './src/navigation/RootNavigator';
import { useAppStore } from './src/store';
import { useAuthStore } from './src/store';
import { getAsyncItem } from './src/utils/asyncStorageHelper';
import { loadSession } from './src/api';
import { COLORS, STORAGE_KEYS } from './src/constants';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      gcTime: 1000 * 60 * 5,
    },
  },
});

function App() {
  const { appLoading, setAppLoading, setOnboardingComplete, onboardingComplete } =
    useAppStore();
  const { setSession } = useAuthStore();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('🚀 App initializing...');
        // Bypassing onboarding for debugging
        const onboardingFlag = 'true'; // await getAsyncItem(STORAGE_KEYS.ONBOARDING_COMPLETE);
        setOnboardingComplete(onboardingFlag === 'true');

        const restoredSession = await loadSession();
        if (restoredSession) {
          setSession(restoredSession);
        }

        console.log('✅ App initialized, onboarding =', onboardingFlag === 'true');
      } catch (error) {
        console.error('❌ Error initializing app:', error);
      } finally {
        setAppLoading(false);
      }
    };

    initializeApp();
  }, [setAppLoading, setOnboardingComplete, setSession]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <NavigationContainer>
            <StatusBar
              barStyle="dark-content"
              backgroundColor={COLORS.WHITE}
            />
            <RootNavigator />
          </NavigationContainer>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default App;
