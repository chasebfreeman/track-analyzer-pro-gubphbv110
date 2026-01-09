
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import { supabase, isSupabaseConfigured } from './supabase';
import { UserProfile, UserProfileDB } from '@/types/UserProfile';

const USER_PROFILES_KEY = 'user_profiles';

// Hash a PIN for secure storage
async function hashPin(pin: string): Promise<string> {
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    pin
  );
  return hash;
}

// Convert DB format to app format
function dbToUserProfile(db: UserProfileDB): UserProfile {
  return {
    id: db.id,
    name: db.name,
    pinHash: db.pin_hash,
    color: db.color,
    createdAt: new Date(db.created_at).getTime(),
    updatedAt: new Date(db.updated_at).getTime(),
    lastLoginAt: db.last_login_at ? new Date(db.last_login_at).getTime() : undefined,
    isActive: db.is_active,
  };
}

// Convert app format to DB format
function userProfileToDb(profile: UserProfile): Partial<UserProfileDB> {
  return {
    id: profile.id,
    name: profile.name,
    pin_hash: profile.pinHash,
    color: profile.color,
    created_at: new Date(profile.createdAt).toISOString(),
    updated_at: new Date(profile.updatedAt).toISOString(),
    last_login_at: profile.lastLoginAt ? new Date(profile.lastLoginAt).toISOString() : undefined,
    is_active: profile.isActive,
  };
}

export const UserProfileService = {
  // Get all user profiles
  async getUserProfiles(): Promise<UserProfile[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Error fetching user profiles from Supabase:', error);
          return this.getLocalUserProfiles();
        }

        return data.map(dbToUserProfile);
      } catch (error) {
        console.error('Error getting user profiles:', error);
        return this.getLocalUserProfiles();
      }
    } else {
      return this.getLocalUserProfiles();
    }
  },

  // Get local user profiles (fallback)
  async getLocalUserProfiles(): Promise<UserProfile[]> {
    try {
      const profilesJson = await SecureStore.getItemAsync(USER_PROFILES_KEY);
      if (!profilesJson) {
        return [];
      }
      return JSON.parse(profilesJson);
    } catch (error) {
      console.error('Error getting local user profiles:', error);
      return [];
    }
  },

  // Save local user profiles
  async saveLocalUserProfiles(profiles: UserProfile[]): Promise<void> {
    try {
      await SecureStore.setItemAsync(USER_PROFILES_KEY, JSON.stringify(profiles));
    } catch (error) {
      console.error('Error saving local user profiles:', error);
      throw error;
    }
  },

  // Create a new user profile
  async createUserProfile(name: string, pin: string, color?: string): Promise<UserProfile> {
    const pinHash = await hashPin(pin);
    const now = Date.now();
    
    const profile: UserProfile = {
      id: `user_${now}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      pinHash,
      color: color || this.getRandomColor(),
      createdAt: now,
      updatedAt: now,
      isActive: true,
    };

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .insert(userProfileToDb(profile))
          .select()
          .single();

        if (error) {
          console.error('Error creating user profile in Supabase:', error);
          throw error;
        }

        return dbToUserProfile(data);
      } catch (error) {
        console.error('Error creating user profile:', error);
        // Fallback to local storage
        const profiles = await this.getLocalUserProfiles();
        profiles.push(profile);
        await this.saveLocalUserProfiles(profiles);
        return profile;
      }
    } else {
      const profiles = await this.getLocalUserProfiles();
      profiles.push(profile);
      await this.saveLocalUserProfiles(profiles);
      return profile;
    }
  },

  // Verify user PIN
  async verifyUserPin(userId: string, pin: string): Promise<boolean> {
    const pinHash = await hashPin(pin);
    const profiles = await this.getUserProfiles();
    const profile = profiles.find(p => p.id === userId);
    
    if (!profile) {
      return false;
    }

    return profile.pinHash === pinHash;
  },

  // Update last login time
  async updateLastLogin(userId: string): Promise<void> {
    const now = Date.now();

    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from('user_profiles')
          .update({ 
            last_login_at: new Date(now).toISOString(),
            updated_at: new Date(now).toISOString(),
          })
          .eq('id', userId);

        if (error) {
          console.error('Error updating last login in Supabase:', error);
        }
      } catch (error) {
        console.error('Error updating last login:', error);
      }
    }

    // Also update local storage
    const profiles = await this.getLocalUserProfiles();
    const profileIndex = profiles.findIndex(p => p.id === userId);
    if (profileIndex !== -1) {
      profiles[profileIndex].lastLoginAt = now;
      profiles[profileIndex].updatedAt = now;
      await this.saveLocalUserProfiles(profiles);
    }
  },

  // Delete user profile
  async deleteUserProfile(userId: string): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from('user_profiles')
          .update({ is_active: false })
          .eq('id', userId);

        if (error) {
          console.error('Error deleting user profile in Supabase:', error);
          throw error;
        }
      } catch (error) {
        console.error('Error deleting user profile:', error);
        throw error;
      }
    }

    // Also update local storage
    const profiles = await this.getLocalUserProfiles();
    const updatedProfiles = profiles.filter(p => p.id !== userId);
    await this.saveLocalUserProfiles(updatedProfiles);
  },

  // Change user PIN
  async changeUserPin(userId: string, oldPin: string, newPin: string): Promise<boolean> {
    const isValid = await this.verifyUserPin(userId, oldPin);
    if (!isValid) {
      return false;
    }

    const newPinHash = await hashPin(newPin);
    const now = Date.now();

    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from('user_profiles')
          .update({ 
            pin_hash: newPinHash,
            updated_at: new Date(now).toISOString(),
          })
          .eq('id', userId);

        if (error) {
          console.error('Error changing PIN in Supabase:', error);
          throw error;
        }
      } catch (error) {
        console.error('Error changing PIN:', error);
        throw error;
      }
    }

    // Also update local storage
    const profiles = await this.getLocalUserProfiles();
    const profileIndex = profiles.findIndex(p => p.id === userId);
    if (profileIndex !== -1) {
      profiles[profileIndex].pinHash = newPinHash;
      profiles[profileIndex].updatedAt = now;
      await this.saveLocalUserProfiles(profiles);
    }

    return true;
  },

  // Get random color for user avatar
  getRandomColor(): string {
    const colors = [
      '#4A90E2', // Blue
      '#50C878', // Green
      '#FF6B6B', // Red
      '#FFA500', // Orange
      '#9B59B6', // Purple
      '#3498DB', // Light Blue
      '#E74C3C', // Crimson
      '#F39C12', // Yellow
      '#1ABC9C', // Turquoise
      '#E67E22', // Carrot
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  },

  // Check if any users exist
  async hasUsers(): Promise<boolean> {
    const profiles = await this.getUserProfiles();
    return profiles.length > 0;
  },
};
