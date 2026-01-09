
import { Redirect } from 'expo-router';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useUser } from '@/contexts/UserContext';
import { UserProfileService } from '@/utils/userProfileService';
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { colors } from '@/styles/commonStyles';

export default function Index() {
  const { isLoading: authLoading, isPinSetup, isAuthenticated } = useSupabaseAuth();
  const { currentUser, isLoading: userLoading } = useUser();
  const [hasUsers, setHasUsers] = useState<boolean | null>(null);
  const [checkingUsers, setCheckingUsers] = useState(true);

  useEffect(() => {
    checkForUsers();
  }, []);

  const checkForUsers = async () => {
    try {
      const usersExist = await UserProfileService.hasUsers();
      console.log('Users exist:', usersExist);
      setHasUsers(usersExist);
    } catch (error) {
      console.error('Error checking for users:', error);
      setHasUsers(false);
    } finally {
      setCheckingUsers(false);
    }
  };

  console.log('Index: authLoading:', authLoading, 'userLoading:', userLoading, 'checkingUsers:', checkingUsers);
  console.log('Index: isPinSetup:', isPinSetup, 'isAuthenticated:', isAuthenticated, 'currentUser:', currentUser?.name);
  console.log('Index: hasUsers:', hasUsers);

  // Show loading while checking
  if (authLoading || userLoading || checkingUsers) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // If no users exist, go to create user
  if (hasUsers === false) {
    console.log('Index: No users, redirecting to create-user');
    return <Redirect href="/auth/create-user" />;
  }

  // If user is authenticated (has selected user and entered PIN), go to app
  if (currentUser && isAuthenticated) {
    console.log('Index: User authenticated, redirecting to tracks');
    return <Redirect href="/(tabs)/tracks" />;
  }

  // Otherwise, go to user selection
  console.log('Index: Not authenticated, redirecting to user-selection');
  return <Redirect href="/auth/user-selection" />;
}
