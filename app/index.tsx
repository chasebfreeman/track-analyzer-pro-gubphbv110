
import { Redirect } from 'expo-router';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { View, ActivityIndicator } from 'react-native';
import { useThemeColors } from '@/styles/commonStyles';

export default function Index() {
  const { user, isLoading } = useSupabaseAuth();
  const colors = useThemeColors();

  console.log('Index screen - isLoading:', isLoading, 'user:', !!user);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (user) {
    console.log('User authenticated, redirecting to tracks');
    return <Redirect href="/(tabs)/tracks" />;
  }

  console.log('User not authenticated, redirecting to login');
  return <Redirect href="/auth/login" />;
}
