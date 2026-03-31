/**
 * PushSetup — registers the device for FCM push notifications on app launch.
 *
 * On Android this uses @react-native-firebase/messaging.
 * Token is stored in userStore and registered with CompanionClaw on first run
 * or whenever the token refreshes.
 */

import { useEffect } from 'react';
import { Platform } from 'react-native';
import { useUserStore } from '../store/userStore';

// Dynamic import so the module doesn't crash on iOS simulators or web
let messaging: (() => any) | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  messaging = require('@react-native-firebase/messaging').default;
} catch {
  // Firebase not installed — push notifications disabled
}

/**
 * Call once in App.tsx after the user has onboarded.
 * Returns a cleanup function.
 */
export async function setupPushNotifications(
  userId: string,
  companionClawHost: string,
  onToken: (token: string) => void,
): Promise<() => void> {
  if (!messaging) return () => {};

  const m = messaging();

  // Request permission (iOS requires explicit ask; Android 13+ too)
  const authStatus = await m.requestPermission();
  const enabled =
    authStatus === 1 || // AUTHORIZED
    authStatus === 2;   // PROVISIONAL (iOS)

  if (!enabled) return () => {};

  // Get current token
  const token: string = await m.getToken();
  if (token) {
    onToken(token);
    await registerTokenWithServer(userId, token, companionClawHost);
  }

  // Listen for token refresh
  const unsubRefresh = m.onTokenRefresh(async (newToken: string) => {
    onToken(newToken);
    await registerTokenWithServer(userId, newToken, companionClawHost);
  });

  // Handle notification tapped while app is in background/quit
  m.onNotificationOpenedApp((remoteMessage: any) => {
    console.log('[push] opened from notification:', remoteMessage?.notification?.title);
    // Future: navigate to relevant screen based on remoteMessage.data.screen
  });

  return unsubRefresh;
}

async function registerTokenWithServer(
  userId: string,
  token: string,
  host: string,
): Promise<void> {
  try {
    await fetch(`${host}/users/${userId}/fcm-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
  } catch {
    // Non-critical — retry next launch
  }
}

/**
 * React hook that sets up push notifications after onboarding is complete.
 */
export function usePushNotifications(): void {
  const { hasOnboarded, walletAddress, companionClawHost, setFcmToken } = useUserStore();

  useEffect(() => {
    if (!hasOnboarded) return;
    const userId = walletAddress ?? 'local';
    let cleanup: (() => void) | null = null;

    setupPushNotifications(userId, companionClawHost, setFcmToken).then((fn) => {
      cleanup = fn;
    });

    return () => { cleanup?.(); };
  }, [hasOnboarded, walletAddress, companionClawHost, setFcmToken]);
}
