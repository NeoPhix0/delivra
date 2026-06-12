import { Stack } from 'expo-router';
import { router } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider, useAuth } from '@context/AuthContext';
import { ThemeProvider } from '@context/ThemeContext';
import colors from '@constants/colors';
import { useEffect, useRef, useState } from 'react';
import SplashScreenComponent from './splash';

SplashScreen.preventAutoHideAsync();

// Separate component that only handles auth routing
function RootLayoutNav() {
  const { isAuthenticated, user, loading } = useAuth();
  const hasRedirected = useRef(false);
  const prevAuthState = useRef<string>('');

  useEffect(() => {
    if (loading) return;

    const currentAuthState = isAuthenticated && user
      ? `${isAuthenticated}-${user.role}`
      : `${isAuthenticated}-null`;

    if (currentAuthState === prevAuthState.current) return;
    prevAuthState.current = currentAuthState;

    if (!isAuthenticated || !user) {
      hasRedirected.current = true;
      setTimeout(() => router.replace('/(auth)/welcome'), 0);
    } else {
      hasRedirected.current = true;
      const role = user.role.toLowerCase();
      setTimeout(() => {
        if (role === 'admin') router.replace('/admin');
        else if (role === 'driver') router.replace('/driver');
        else router.replace('/(tabs)');
      }, 0);
    }
  }, [isAuthenticated, user, loading]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

// Root layout controls splash at top level, never remounts splash
export default function RootLayout() {
  const [splashDone, setSplashDone] = useState(false);

  const handleSplashComplete = async () => {
    try {
      await SplashScreen.hideAsync();
    } catch (e) {}
    setSplashDone(true);
  };

  if (!splashDone) {
    return <SplashScreenComponent onComplete={handleSplashComplete} />;
  }

  return (
    <AuthProvider>
      <ThemeProvider>
        <RootLayoutNav />
      </ThemeProvider>
    </AuthProvider>
  );
}