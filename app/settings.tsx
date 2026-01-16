
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { IconSymbol } from '@/components/IconSymbol';
import { useThemeColors } from '@/styles/commonStyles';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

const getStyles = (colors: ReturnType<typeof useThemeColors>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      padding: 16,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textSecondary,
      marginBottom: 8,
      marginLeft: 16,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    settingItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      padding: 16,
      borderRadius: 12,
      marginBottom: 8,
    },
    settingIcon: {
      marginRight: 12,
    },
    settingText: {
      flex: 1,
      fontSize: 16,
      color: colors.text,
    },
    logoutButton: {
      backgroundColor: '#FF3B30',
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 8,
    },
    logoutText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    versionText: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 24,
    },
  });

export default function SettingsScreen() {
  console.log('User opened Settings screen');
  const colors = useThemeColors();
  const styles = getStyles(colors);
  const { signOut, user } = useSupabaseAuth();
  const router = useRouter();

  const handleLogout = async () => {
    console.log('User tapped Logout button');
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => console.log('User cancelled logout'),
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            console.log('User confirmed logout');
            await signOut();
            router.replace('/auth/login');
          },
        },
      ]
    );
  };

  const handlePrivacyPolicy = () => {
    console.log('User tapped Privacy Policy button');
    router.push('/privacy-policy');
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Settings',
          headerShown: false,
        }}
      />
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.section}>
            <View style={styles.settingItem}>
              <IconSymbol
                ios_icon_name="person.circle"
                android_material_icon_name="account-circle"
                size={24}
                color={colors.primary}
                style={styles.settingIcon}
              />
              <Text style={styles.settingText}>{user?.email || 'Not logged in'}</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Legal</Text>
          <View style={styles.section}>
            <TouchableOpacity style={styles.settingItem} onPress={handlePrivacyPolicy}>
              <IconSymbol
                ios_icon_name="doc.text"
                android_material_icon_name="description"
                size={24}
                color={colors.primary}
                style={styles.settingIcon}
              />
              <Text style={styles.settingText}>Privacy Policy</Text>
              <IconSymbol
                ios_icon_name="chevron.right"
                android_material_icon_name="arrow-forward"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.versionText}>Track Analyzer Pro v1.0.0</Text>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
