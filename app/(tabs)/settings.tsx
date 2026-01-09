
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { SupabaseStorageService } from '@/utils/supabaseStorage';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);

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
            await signOut();
            router.replace('/auth/login');
          },
        },
      ]
    );
  };

  const handleSyncData = async () => {
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
        {user && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current User</Text>
            
            <View style={styles.card}>
              <View style={styles.userRow}>
                <View style={styles.userAvatar}>
                  <IconSymbol
                    ios_icon_name="person.circle.fill"
                    android_material_icon_name="account-circle"
                    size={56}
                    color={colors.primary}
                  />
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{user.email}</Text>
                  <Text style={styles.userSubtext}>Logged in</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Cloud Sync Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cloud Sync</Text>
          
          <View style={styles.card}>
            <View style={styles.statusRow}>
              <IconSymbol
                ios_icon_name="checkmark.circle.fill"
                android_material_icon_name="check-circle"
                size={24}
                color="#4CAF50"
              />
              <View style={styles.statusTextContainer}>
                <Text style={styles.statusTitle}>Cloud Sync Enabled</Text>
                <Text style={styles.statusSubtitle}>
                  Data synced across all team members
                </Text>
              </View>
            </View>

            {user && (
              <View style={styles.userInfoBox}>
                <Text style={styles.userEmail}>{user.email}</Text>
              </View>
            )}
          </View>

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
            
            <Text style={[styles.infoLabel, { marginTop: 16 }]}>Team App</Text>
            <Text style={styles.infoValue}>All users share the same data</Text>
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
    marginRight: 16,
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
