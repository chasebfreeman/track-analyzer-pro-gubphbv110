
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useUser } from '@/contexts/UserContext';
import { SupabaseStorageService } from '@/utils/supabaseStorage';
import { UserProfileService } from '@/utils/userProfileService';
import { UserProfile } from '@/types/UserProfile';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

export default function SettingsScreen() {
  const router = useRouter();
  const { 
    isSupabaseEnabled, 
    user, 
    signOut, 
    logout, 
    isAuthenticated 
  } = useSupabaseAuth();
  const { currentUser, setCurrentUser } = useUser();
  const [isSyncing, setIsSyncing] = useState(false);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const profiles = await UserProfileService.getUserProfiles();
      setAllUsers(profiles);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            if (isSupabaseEnabled) {
              await signOut();
            } else {
              logout();
            }
            await setCurrentUser(null);
            router.replace('/auth/user-selection');
          },
        },
      ]
    );
  };

  const handleSwitchUser = () => {
    Alert.alert(
      'Switch User',
      'Switch to a different user account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Switch',
          onPress: async () => {
            await setCurrentUser(null);
            router.replace('/auth/user-selection');
          },
        },
      ]
    );
  };

  const handleManageUsers = () => {
    router.push('/settings/manage-users' as any);
  };

  const handleSyncData = async () => {
    if (!isSupabaseEnabled) {
      Alert.alert(
        'Supabase Not Configured',
        'Please enable Supabase to sync your data to the cloud.',
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Sync Local Data',
      'This will upload all your local tracks and readings to Supabase. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sync',
          onPress: async () => {
            setIsSyncing(true);
            try {
              await SupabaseStorageService.syncLocalToSupabase();
              Alert.alert('Success', 'All data synced to cloud successfully!');
            } catch (error) {
              console.error('Sync error:', error);
              Alert.alert('Error', 'Failed to sync data. Please try again.');
            } finally {
              setIsSyncing(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Settings</Text>

        {/* Current User Section */}
        {currentUser && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current User</Text>
            
            <View style={styles.card}>
              <View style={styles.userRow}>
                <View style={[styles.userAvatar, { backgroundColor: currentUser.color }]}>
                  <Text style={styles.userInitial}>
                    {currentUser.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{currentUser.name}</Text>
                  <Text style={styles.userSubtext}>Logged in</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.button} onPress={handleSwitchUser}>
              <IconSymbol
                ios_icon_name="arrow.left.arrow.right"
                android_material_icon_name="swap-horiz"
                size={20}
                color="#FFFFFF"
              />
              <Text style={styles.buttonText}>Switch User</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* User Management Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>User Management</Text>
          
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <IconSymbol
                ios_icon_name="person.3.fill"
                android_material_icon_name="group"
                size={24}
                color={colors.primary}
              />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoTitle}>Team Members</Text>
                <Text style={styles.infoSubtitle}>{allUsers.length} active users</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.button} 
            onPress={() => router.push('/auth/create-user')}
          >
            <IconSymbol
              ios_icon_name="person.badge.plus"
              android_material_icon_name="person-add"
              size={20}
              color="#FFFFFF"
            />
            <Text style={styles.buttonText}>Add New User</Text>
          </TouchableOpacity>
        </View>

        {/* Cloud Sync Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cloud Sync</Text>
          
          <View style={styles.card}>
            <View style={styles.statusRow}>
              <IconSymbol
                ios_icon_name={isSupabaseEnabled ? 'checkmark.circle.fill' : 'xmark.circle.fill'}
                android_material_icon_name={isSupabaseEnabled ? 'check-circle' : 'cancel'}
                size={24}
                color={isSupabaseEnabled ? '#4CAF50' : colors.textSecondary}
              />
              <View style={styles.statusTextContainer}>
                <Text style={styles.statusTitle}>
                  {isSupabaseEnabled ? 'Cloud Sync Enabled' : 'Cloud Sync Disabled'}
                </Text>
                <Text style={styles.statusSubtitle}>
                  {isSupabaseEnabled 
                    ? 'Data synced across all team members' 
                    : 'Using local storage only'}
                </Text>
              </View>
            </View>

            {isSupabaseEnabled && user && (
              <View style={styles.userInfoBox}>
                <Text style={styles.userEmail}>{user.email}</Text>
              </View>
            )}
          </View>

          {isSupabaseEnabled && (
            <TouchableOpacity
              style={[styles.button, isSyncing && styles.buttonDisabled]}
              onPress={handleSyncData}
              disabled={isSyncing}
            >
              <IconSymbol
                ios_icon_name="arrow.triangle.2.circlepath"
                android_material_icon_name="sync"
                size={20}
                color="#FFFFFF"
              />
              <Text style={styles.buttonText}>
                {isSyncing ? 'Syncing...' : 'Sync Local Data to Cloud'}
              </Text>
            </TouchableOpacity>
          )}

          {!isSupabaseEnabled && (
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                To enable cloud syncing for your team:
              </Text>
              <Text style={styles.infoStep}>1. Press the Supabase button in Natively</Text>
              <Text style={styles.infoStep}>2. Connect to your Supabase project</Text>
              <Text style={styles.infoStep}>3. Run the database setup SQL</Text>
              <Text style={styles.infoStep}>4. Restart the app</Text>
            </View>
          )}
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <TouchableOpacity style={styles.card} onPress={handleLogout}>
            <View style={styles.menuItem}>
              <IconSymbol
                ios_icon_name="rectangle.portrait.and.arrow.right"
                android_material_icon_name="logout"
                size={24}
                color={colors.error}
              />
              <Text style={[styles.menuItemText, { color: colors.error }]}>
                Logout
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          
          <View style={styles.card}>
            <Text style={styles.infoLabel}>Version</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
            
            <Text style={[styles.infoLabel, { marginTop: 16 }]}>Team Capacity</Text>
            <Text style={styles.infoValue}>Up to 10 users</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingTop: Platform.OS === 'android' ? 48 : 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userInitial: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  userSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  infoSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  statusSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  userInfoBox: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  userEmail: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  infoBox: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoText: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 12,
    fontWeight: '600',
  },
  infoStep: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 6,
    paddingLeft: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
  },
});
