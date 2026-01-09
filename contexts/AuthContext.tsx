
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/utils/supabase';
import { Session, User } from '@supabase/supabase-js';
import { Platform } from 'react-native';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('AuthContext: Initializing... Platform:', Platform.OS);
    
    let mounted = true;
    let authSubscription: any = null;

    const initialize = async () => {
      try {
        // Check Supabase configuration
        const supabaseConfigured = isSupabaseConfigured();
        console.log('AuthContext: Supabase configured:', supabaseConfigured);
        
        if (!supabaseConfigured) {
          console.error('AuthContext: Supabase is not configured!');
          if (mounted) {
            setLoading(false);
          }
          return;
        }
        
        // Set up auth listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
          console.log('AuthContext: Auth state changed:', _event);
          if (!mounted) return;
          setSession(session);
          setUser(session?.user ?? null);
        });
        authSubscription = subscription;

        // Get initial session
        try {
          const { data: { session: initialSession }, error } = await supabase.auth.getSession();
          
          if (!mounted) return;
          
          if (error) {
            console.error('AuthContext: Error getting session:', error);
          } else if (initialSession) {
            console.log('AuthContext: Initial session found');
            setSession(initialSession);
            setUser(initialSession.user);
          } else {
            console.log('AuthContext: No initial session');
          }
        } catch (error) {
          console.error('AuthContext: Session check failed:', error);
        }
      } catch (error) {
        console.error('AuthContext: Error during initialization:', error);
      } finally {
        if (mounted) {
          console.log('AuthContext: Initialization complete');
          setLoading(false);
        }
      }
    };

    initialize();

    return () => {
      mounted = false;
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    console.log('AuthContext: Signing in with email...');
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('AuthContext: Sign in error:', error);
      throw new Error(error.message);
    }

    console.log('AuthContext: Sign in successful');
  };

  const signUpWithEmail = async (email: string, password: string, name?: string) => {
    console.log('AuthContext: Signing up with email...');
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name || '',
        },
      },
    });

    if (error) {
      console.error('AuthContext: Sign up error:', error);
      throw new Error(error.message);
    }

    console.log('AuthContext: Sign up successful');
  };

  const signOut = async () => {
    console.log('AuthContext: Signing out...');
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    console.log('AuthContext: Sign out successful');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signInWithEmail,
        signUpWithEmail,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
