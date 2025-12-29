
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { useColorScheme, Platform } from 'react-native';
import { SupabaseAuthProvider } from '@/contexts/SupabaseAuthContext';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    console.log('RootLayout: useEffect triggered, loaded:', loaded, 'error:', error, 'Platform:', Platform.OS);
    
    if (loaded || error) {
      console.log('RootLayout: Fonts loaded or error occurred');
      // Give a small delay to ensure auth context initializes
      setTimeout(() => {
        setAppReady(true);
        console.log('RootLayout: App ready, hiding splash screen');
        SplashScreen.hideAsync().catch((err) => {
          console.error('RootLayout: Error hiding splash screen:', err);
        });
      }, 100);
    }
  }, [loaded, error]);

  // Don't render until fonts are loaded and app is ready
  if (!appReady) {
    console.log('RootLayout: Waiting for app to be ready');
    return null;
  }

  console.log('RootLayout: Rendering app');

  return (
    <SupabaseAuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="auth" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen 
            name="modal" 
            options={{
              presentation: 'modal',
              headerShown: true,
              title: 'Modal',
            }}
          />
          <Stack.Screen 
            name="formsheet" 
            options={{
              presentation: 'formSheet',
              headerShown: true,
              title: 'Form Sheet',
            }}
          />
          <Stack.Screen 
            name="transparent-modal" 
            options={{
              presentation: 'transparentModal',
              animation: 'fade',
              headerShown: false,
            }}
          />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </SupabaseAuthProvider>
  );
}
