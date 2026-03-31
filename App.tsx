/**
 * Companion OS
 * Root navigator: routes to onboarding or main session based on hasOnboarded flag.
 * Handles deep link: companionos://demo → sets isDemoMode = true (session-only).
 */

import React, { useEffect } from 'react';
import { Linking, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { OnboardingNavigator } from './src/screens/onboarding/OnboardingNavigator';
import { MainNavigator } from './src/screens/main/MainNavigator';
import { useUserStore } from './src/store/userStore';
import { usePushNotifications } from './src/notifications/PushSetup';

function App() {
  const hasOnboarded = useUserStore((s) => s.hasOnboarded);
  const isDemoMode = useUserStore((s) => s.isDemoMode);
  const setIsDemoMode = useUserStore((s) => s.setIsDemoMode);

  usePushNotifications();

  // Handle deep link: companionos://demo
  useEffect(() => {
    const handleUrl = ({ url }: { url: string }) => {
      if (url === 'companionos://demo') {
        setIsDemoMode(true);
      }
    };

    // App opened from deep link while cold-starting
    Linking.getInitialURL().then((url) => {
      if (url === 'companionos://demo') setIsDemoMode(true);
    });

    // App brought to foreground via deep link
    const sub = Linking.addEventListener('url', handleUrl);
    return () => sub.remove();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#0a0e1a" />
      {!hasOnboarded && !isDemoMode ? (
        <OnboardingNavigator onComplete={() => {}} />
      ) : (
        <MainNavigator />
      )}
    </SafeAreaProvider>
  );
}

export default App;
