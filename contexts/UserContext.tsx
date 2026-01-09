
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile } from '@/types/UserProfile';

interface UserContextType {
  currentUser: UserProfile | null;
  setCurrentUser: (user: UserProfile | null) => void;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const CURRENT_USER_KEY = 'current_user';

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUserState] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const userJson = await AsyncStorage.getItem(CURRENT_USER_KEY);
      if (userJson) {
        const user = JSON.parse(userJson);
        setCurrentUserState(user);
      }
    } catch (error) {
      console.error('Error loading current user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setCurrentUser = async (user: UserProfile | null) => {
    try {
      if (user) {
        await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      } else {
        await AsyncStorage.removeItem(CURRENT_USER_KEY);
      }
      setCurrentUserState(user);
    } catch (error) {
      console.error('Error setting current user:', error);
    }
  };

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser, isLoading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
