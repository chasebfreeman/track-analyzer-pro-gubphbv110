
import { Stack } from 'expo-router';
import { SupabaseAuthProvider } from '@/contexts/SupabaseAuthContext';
import { UserProvider } from '@/contexts/UserContext';
import React from 'react';

export default function RootLayout() {
  return (
    <SupabaseAuthProvider>
      <UserProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="auth" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </UserProvider>
    </SupabaseAuthProvider>
  );
}
