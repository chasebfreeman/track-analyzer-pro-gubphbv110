
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { UserProfileService } from '@/utils/userProfileService';
import { useUser } from '@/contexts/UserContext';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

export default function UserPinScreen() {
  const [pin, setPin] = useState('');
  const router = useRouter();
  const { userId, userName } = useLocalSearchParams<{ userId: string; userName: string }>();
  const { setCurrentUser } = useUser();

  const handlePinInput = async (digit: string) => {
    const newPin = pin + digit;
    setPin(newPin);

    if (newPin.length === 4) {
      const isValid = await UserProfileService.verifyUserPin(userId, newPin);
      if (isValid) {
        // Update last login
        await UserProfileService.updateLastLogin(userId);
        
        // Get user profile and set as current user
        const profiles = await UserProfileService.getUserProfiles();
        const user = profiles.find(p => p.id === userId);
        if (user) {
          await setCurrentUser(user);
          router.replace('/(tabs)/tracks');
        }
      } else {
        Alert.alert('Error', 'Incorrect PIN. Please try again.');
        setPin('');
      }
    }
  };

  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
  };

  const handleBack = () => {
    router.back();
  };

  const renderPinDots = () => {
    return (
      <View style={styles.pinDotsContainer}>
        {[0, 1, 2, 3].map((index) => (
          <View
            key={index}
            style={[
              styles.pinDot,
              pin.length > index && styles.pinDotFilled,
            ]}
          />
        ))}
      </View>
    );
  };

  const renderKeypad = () => {
    const keys = [
      ['1', '2', '3'],
      ['4', '5', '6'],
      ['7', '8', '9'],
      ['', '0', 'back'],
    ];

    return (
      <View style={styles.keypad}>
        {keys.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.keypadRow}>
            {row.map((key, keyIndex) => {
              if (key === '') {
                return <View key={keyIndex} style={styles.keyButton} />;
              }
              if (key === 'back') {
                return (
                  <TouchableOpacity
                    key={keyIndex}
                    style={styles.keyButton}
                    onPress={handleBackspace}
                  >
                    <IconSymbol
                      ios_icon_name="delete.left"
                      android_material_icon_name="backspace"
                      size={28}
                      color={colors.text}
                    />
                  </TouchableOpacity>
                );
              }
              return (
                <TouchableOpacity
                  key={keyIndex}
                  style={styles.keyButton}
                  onPress={() => handlePinInput(key)}
                >
                  <Text style={styles.keyText}>{key}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <IconSymbol
          ios_icon_name="chevron.left"
          android_material_icon_name="arrow-back"
          size={28}
          color={colors.text}
        />
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.header}>
          <IconSymbol
            ios_icon_name="lock.fill"
            android_material_icon_name="lock"
            size={60}
            color={colors.primary}
          />
          <Text style={styles.title}>Welcome, {userName}</Text>
          <Text style={styles.subtitle}>Enter your PIN to continue</Text>
        </View>

        {renderPinDots()}
        {renderKeypad()}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 48 : 60,
    left: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  pinDotsContainer: {
    flexDirection: 'row',
    gap: 20,
    marginVertical: 40,
  },
  pinDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: 'transparent',
  },
  pinDotFilled: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  keypad: {
    gap: 16,
  },
  keypadRow: {
    flexDirection: 'row',
    gap: 16,
  },
  keyButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  keyText: {
    fontSize: 32,
    fontWeight: '400',
    color: colors.text,
  },
});
