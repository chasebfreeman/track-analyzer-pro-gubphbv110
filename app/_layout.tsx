
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { useColorScheme, Platform, View, Text, ActivityIndicator } from 'react-native';
import { SupabaseAuthProvider } from '@/contexts/SupabaseAuthContext';
import { colors } from '@/styles/commonStyles';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [forceRender, setForceRender] = useState(false);

  useEffect(() => {
    console.log('RootLayout: Component mounted, Platform:', Platform.OS);
    
    // Force render after 1.5 seconds if fonts haven't loaded
    const timeout = setTimeout(() => {
      console.log('RootLayout: Force render timeout reached');
      setForceRender(true);
    }, 1500);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (loaded || forceRender) {
      console.log('RootLayout: Ready to show app, hiding splash screen');
      SplashScreen.hideAsync().catch((err) => {
        console.error('RootLayout: Error hiding splash screen:', err);
      });
    }
  }, [loaded, forceRender]);

  // Show loading only briefly
  if (!loaded && !forceRender) {
    console.log('RootLayout: Waiting for initialization');
    return null; // Let splash screen show
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
