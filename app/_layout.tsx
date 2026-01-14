
import { Stack } from 'expo-router';
import { SupabaseAuthProvider } from '@/contexts/SupabaseAuthContext';
import React from 'react';

export default function RootLayout() {
  return (
    <SupabaseAuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </SupabaseAuthProvider>
  );
}
