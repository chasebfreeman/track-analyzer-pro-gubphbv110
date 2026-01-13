
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { UserProfileService } from '@/utils/userProfileService';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

export default function CreateUserScreen() {
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState<'name' | 'pin' | 'confirm'>('name');
  const [selectedColor, setSelectedColor] = useState('#4A90E2');
  const router = useRouter();

  const colors_palette = [
    '#4A90E2', '#50C878', '#FF6B6B', '#FFA500', '#9B59B6',
    '#3498DB', '#E74C3C', '#F39C12', '#1ABC9C', '#E67E22',
  ];

  const handleNext = () => {
    console.log('User tapped Next button on create user screen, step:', step);
    if (step === 'name') {
      if (!name.trim()) {
        Alert.alert('Error', 'Please enter a name');
        return;
      }
      setStep('pin');
    } else if (step === 'pin') {
      if (pin.length !== 4) {
        Alert.alert('Error', 'PIN must be 4 digits');
        return;
      }
      setStep('confirm');
    }
  };

  const handlePinInput = (digit: string) => {
    console.log('User entered PIN digit:', digit, 'current step:', step);
    if (step === 'pin') {
      if (pin.length < 4) {
        setPin(pin + digit);
      }
    } else if (step === 'confirm') {
      if (confirmPin.length < 4) {
        const newConfirmPin = confirmPin + digit;
        setConfirmPin(newConfirmPin);
        
        if (newConfirmPin.length === 4) {
          if (pin === newConfirmPin) {
            handleCreateUser();
          } else {
            Alert.alert('Error', 'PINs do not match. Please try again.');
            setPin('');
            setConfirmPin('');
            setStep('pin');
          }
        }
      }
    }
  };

  const handleBackspace = () => {
    console.log('User tapped backspace on PIN entry');
    if (step === 'pin') {
      setPin(pin.slice(0, -1));
    } else if (step === 'confirm') {
      setConfirmPin(confirmPin.slice(0, -1));
    }
  };

  const handleBack = () => {
    console.log('User tapped back button on create user screen');
    if (step === 'pin') {
      setStep('name');
      setPin('');
    } else if (step === 'confirm') {
      setStep('pin');
      setConfirmPin('');
    } else {
      router.back();
    }
  };

  const handleCreateUser = async () => {
    console.log('Creating user with name:', name, 'and color:', selectedColor);
    try {
      await UserProfileService.createUserProfile(name.trim(), pin, selectedColor);
      console.log('User created successfully:', name);
      Alert.alert('Success', `User "${name}" created successfully!`, [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error('Error creating user:', error);
      Alert.alert('Error', 'Failed to create user. Please try again.');
      setPin('');
      setConfirmPin('');
      setStep('pin');
    }
  };

  const renderPinDots = () => {
    const currentPin = step === 'pin' ? pin : confirmPin;
    return (
      <View style={styles.pinDotsContainer}>
        {[0, 1, 2, 3].map((index) => (
          <View
            key={`pin-dot-${index}`}
            style={[
              styles.pinDot,
              currentPin.length > index && styles.pinDotFilled,
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
          <View key={`keypad-row-${rowIndex}`} style={styles.keypadRow}>
            {row.map((key, keyIndex) => {
              if (key === '') {
                return <View key={`empty-${rowIndex}-${keyIndex}`} style={styles.keyButton} />;
              }
              if (key === 'back') {
                return (
                  <TouchableOpacity
                    key={`back-${rowIndex}-${keyIndex}`}
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
                  key={`key-${key}-${rowIndex}-${keyIndex}`}
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

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <IconSymbol
            ios_icon_name="person.badge.plus"
            android_material_icon_name="person-add"
            size={60}
            color={colors.primary}
          />
          <Text style={styles.title}>
            {step === 'name' && 'Create New User'}
            {step === 'pin' && 'Set PIN'}
            {step === 'confirm' && 'Confirm PIN'}
          </Text>
          <Text style={styles.subtitle}>
            {step === 'name' && 'Enter user name and choose a color'}
            {step === 'pin' && 'Enter a 4-digit PIN'}
            {step === 'confirm' && 'Re-enter your PIN to confirm'}
          </Text>
        </View>

        {step === 'name' && (
          <View style={styles.nameSection}>
            <View style={[styles.avatarPreview, { backgroundColor: selectedColor }]}>
              <Text style={styles.avatarText}>
                {name ? name.charAt(0).toUpperCase() : '?'}
              </Text>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Enter name"
              placeholderTextColor={colors.textSecondary}
              value={name}
              onChangeText={setName}
              autoFocus
              maxLength={20}
            />

            <Text style={styles.colorLabel}>Choose Color</Text>
            <View style={styles.colorPicker}>
              {colors_palette.map((color, index) => (
                <TouchableOpacity
                  key={`color-${color}-${index}`}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    selectedColor === color && styles.colorOptionSelected,
                  ]}
                  onPress={() => {
                    console.log('User selected color:', color);
                    setSelectedColor(color);
                  }}
                >
                  {selectedColor === color && (
                    <IconSymbol
                      ios_icon_name="checkmark"
                      android_material_icon_name="check"
                      size={20}
                      color="#FFFFFF"
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.nextButtonPerfect! I found the issue. On line 229, the `colors_palette.map()` is missing a `key` prop. The error message is clear - each child in a list needs a unique key. I can see that the code already has `key={color}` on line 230, which should be correct. However, looking more closely at the error stack trace, it seems the issue might be that React is complaining about the mapping itself.

Let me fix this by ensuring the key is properly set:

<write file="app/auth/create-user.tsx">
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { UserProfileService } from '@/utils/userProfileService';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

export default function CreateUserScreen() {
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState<'name' | 'pin' | 'confirm'>('name');
  const [selectedColor, setSelectedColor] = useState('#4A90E2');
  const router = useRouter();

  const colors_palette = [
    '#4A90E2', '#50C878', '#FF6B6B', '#FFA500', '#9B59B6',
    '#3498DB', '#E74C3C', '#F39C12', '#1ABC9C', '#E67E22',
  ];

  const handleNext = () => {
    console.log('User tapped Next button on create user screen, step:', step);
    if (step === 'name') {
      if (!name.trim()) {
        Alert.alert('Error', 'Please enter a name');
        return;
      }
      setStep('pin');
    } else if (step === 'pin') {
      if (pin.length !== 4) {
        Alert.alert('Error', 'PIN must be 4 digits');
        return;
      }
      setStep('confirm');
    }
  };

  const handlePinInput = (digit: string) => {
    console.log('User entered PIN digit:', digit, 'Current step:', step);
    if (step === 'pin') {
      if (pin.length < 4) {
        setPin(pin + digit);
      }
    } else if (step === 'confirm') {
      if (confirmPin.length < 4) {
        const newConfirmPin = confirmPin + digit;
        setConfirmPin(newConfirmPin);
        
        if (newConfirmPin.length === 4) {
          if (pin === newConfirmPin) {
            handleCreateUser();
          } else {
            Alert.alert('Error', 'PINs do not match. Please try again.');
            setPin('');
            setConfirmPin('');
            setStep('pin');
          }
        }
      }
    }
  };

  const handleBackspace = () => {
    console.log('User tapped backspace on PIN entry');
    if (step === 'pin') {
      setPin(pin.slice(0, -1));
    } else if (step === 'confirm') {
      setConfirmPin(confirmPin.slice(0, -1));
    }
  };

  const handleBack = () => {
    console.log('User tapped back button on create user screen');
    if (step === 'pin') {
      setStep('name');
      setPin('');
    } else if (step === 'confirm') {
      setStep('pin');
      setConfirmPin('');
    } else {
      router.back();
    }
  };

  const handleCreateUser = async () => {
    console.log('Creating user with name:', name, 'and color:', selectedColor);
    try {
      await UserProfileService.createUserProfile(name.trim(), pin, selectedColor);
      console.log('User created successfully:', name);
      Alert.alert('Success', `User "${name}" created successfully!`, [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error('Error creating user:', error);
      Alert.alert('Error', 'Failed to create user. Please try again.');
      setPin('');
      setConfirmPin('');
      setStep('pin');
    }
  };

  const renderPinDots = () => {
    const currentPin = step === 'pin' ? pin : confirmPin;
    return (
      <View style={styles.pinDotsContainer}>
        {[0, 1, 2, 3].map((index) => (
          <View
            key={`pin-dot-${index}`}
            style={[
              styles.pinDot,
              currentPin.length > index && styles.pinDotFilled,
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
          <View key={`keypad-row-${rowIndex}`} style={styles.keypadRow}>
            {row.map((key, keyIndex) => {
              if (key === '') {
                return <View key={`keypad-empty-${rowIndex}-${keyIndex}`} style={styles.keyButton} />;
              }
              if (key === 'back') {
                return (
                  <TouchableOpacity
                    key={`keypad-back-${rowIndex}-${keyIndex}`}
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
                  key={`keypad-${key}-${rowIndex}-${keyIndex}`}
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

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <IconSymbol
            ios_icon_name="person.badge.plus"
            android_material_icon_name="person-add"
            size={60}
            color={colors.primary}
          />
          <Text style={styles.title}>
            {step === 'name' && 'Create New User'}
            {step === 'pin' && 'Set PIN'}
            {step === 'confirm' && 'Confirm PIN'}
          </Text>
          <Text style={styles.subtitle}>
            {step === 'name' && 'Enter user name and choose a color'}
            {step === 'pin' && 'Enter a 4-digit PIN'}
            {step === 'confirm' && 'Re-enter your PIN to confirm'}
          </Text>
        </View>

        {step === 'name' && (
          <View style={styles.nameSection}>
            <View style={[styles.avatarPreview, { backgroundColor: selectedColor }]}>
              <Text style={styles.avatarText}>
                {name ? name.charAt(0).toUpperCase() : '?'}
              </Text>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Enter name"
              placeholderTextColor={colors.textSecondary}
              value={name}
              onChangeText={setName}
              autoFocus
              maxLength={20}
            />

            <Text style={styles.colorLabel}>Choose Color</Text>
            <View style={styles.colorPicker}>
              {colors_palette.map((color, index) => (
                <TouchableOpacity
                  key={`color-${color}-${index}`}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    selectedColor === color && styles.colorOptionSelected,
                  ]}
                  onPress={() => {
                    console.log('User selected color:', color);
                    setSelectedColor(color);
                  }}
                >
                  {selectedColor === color && (
                    <IconSymbol
                      ios_icon_name="checkmark"
                      android_material_icon_name="check"
                      size={20}
                      color="#FFFFFF"
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <Text style={styles.nextButtonText}>Next</Text>
              <IconSymbol
                ios_icon_name="arrow.right"
                android_material_icon_name="arrow-forward"
                size={20}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>
        )}

        {(step === 'pin' || step === 'confirm') && (
          <View style={styles.pinSection}>
            {renderPinDots()}
            {renderKeypad()}
          </View>
        )}
      </ScrollView>
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
    flexGrow: 1,
    padding: 20,
    paddingTop: Platform.OS === 'android' ? 100 : 120,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  nameSection: {
    alignItems: 'center',
  },
  avatarPreview: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  input: {
    width: '100%',
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 24,
    textAlign: 'center',
  },
  colorLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  colorPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 32,
  },
  colorOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  colorOptionSelected: {
    borderColor: colors.text,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    gap: 8,
    width: '100%',
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  pinSection: {
    alignItems: 'center',
  },
  pinDotsContainer: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 40,
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
