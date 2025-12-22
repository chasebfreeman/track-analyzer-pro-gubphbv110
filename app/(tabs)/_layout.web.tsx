
import React from 'react';
import { Tabs } from 'expo-router';
import FloatingTabBar from '@/components/FloatingTabBar';
import { colors } from '@/styles/commonStyles';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
      }}
    >
      <Tabs.Screen
        name="tracks"
        options={{
          title: 'Tracks',
        }}
      />
      <Tabs.Screen
        name="record"
        options={{
          title: 'Record',
        }}
      />
      <Tabs.Screen
        name="browse"
        options={{
          title: 'Browse',
        }}
      />
    </Tabs>
  );
}
