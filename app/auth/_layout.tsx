
import { Stack } from 'expo-router';
import React from 'react';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="user-selection" />
      <Stack.Screen name="user-pin" />
      <Stack.Screen name="create-user" />
      <Stack.Screen name="login" />
      <Stack.Screen name="setup-pin" />
      <Stack.Screen name="supabase-login" />
    </Stack>
  );
}
