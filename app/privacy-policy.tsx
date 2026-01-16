
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { Stack } from 'expo-router';
import { useThemeColors } from '@/styles/commonStyles';
import { SafeAreaView } from 'react-native-safe-area-context';

const getStyles = (colors: ReturnType<typeof useThemeColors>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      padding: 20,
      paddingBottom: 40,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 8,
    },
    lastUpdated: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginTop: 20,
      marginBottom: 12,
    },
    paragraph: {
      fontSize: 15,
      color: colors.text,
      lineHeight: 22,
      marginBottom: 12,
    },
    bulletPoint: {
      fontSize: 15,
      color: colors.text,
      lineHeight: 22,
      marginBottom: 8,
      paddingLeft: 16,
    },
    contactText: {
      fontSize: 15,
      color: colors.primary,
      lineHeight: 22,
      marginTop: 8,
    },
  });

export default function PrivacyPolicyScreen() {
  console.log('User opened Privacy Policy screen');
  const colors = useThemeColors();
  const styles = getStyles(colors);

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Privacy Policy',
          headerShown: true,
          headerBackTitle: 'Back',
        }}
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>Privacy Policy</Text>
          <Text style={styles.lastUpdated}>Last Updated: {new Date().toLocaleDateString()}</Text>

          <Text style={styles.paragraph}>
            Track Analyzer Pro ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our mobile application.
          </Text>

          <Text style={styles.sectionTitle}>1. Information We Collect</Text>
          <Text style={styles.paragraph}>
            We collect information that you provide directly to us when using Track Analyzer Pro:
          </Text>
          <Text style={styles.bulletPoint}>• Account information (email address, password)</Text>
          <Text style={styles.bulletPoint}>• Track data and readings you record</Text>
          <Text style={styles.bulletPoint}>• Photos you upload of track conditions</Text>
          <Text style={styles.bulletPoint}>• Notes and observations you enter</Text>

          <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
          <Text style={styles.paragraph}>
            We use the information we collect to:
          </Text>
          <Text style={styles.bulletPoint}>• Provide and maintain the Track Analyzer Pro service</Text>
          <Text style={styles.bulletPoint}>• Store and organize your track data and readings</Text>
          <Text style={styles.bulletPoint}>• Sync your data across your devices</Text>
          <Text style={styles.bulletPoint}>• Improve and optimize our app functionality</Text>
          <Text style={styles.bulletPoint}>• Communicate with you about service updates</Text>

          <Text style={styles.sectionTitle}>3. Data Storage and Security</Text>
          <Text style={styles.paragraph}>
            Your data is stored securely using industry-standard encryption. We use Supabase as our backend service provider, which implements robust security measures including:
          </Text>
          <Text style={styles.bulletPoint}>• Encrypted data transmission (SSL/TLS)</Text>
          <Text style={styles.bulletPoint}>• Secure database storage</Text>
          <Text style={styles.bulletPoint}>• Regular security audits</Text>
          <Text style={styles.bulletPoint}>• Access controls and authentication</Text>

          <Text style={styles.sectionTitle}>4. Data Sharing and Disclosure</Text>
          <Text style={styles.paragraph}>
            We do not sell, trade, or rent your personal information to third parties. Your track data and readings are private and only accessible to you through your account. We may share information only in the following circumstances:
          </Text>
          <Text style={styles.bulletPoint}>• With your explicit consent</Text>
          <Text style={styles.bulletPoint}>• To comply with legal obligations</Text>
          <Text style={styles.bulletPoint}>• To protect our rights and safety</Text>

          <Text style={styles.sectionTitle}>5. Your Data Rights</Text>
          <Text style={styles.paragraph}>
            You have the right to:
          </Text>
          <Text style={styles.bulletPoint}>• Access your personal data</Text>
          <Text style={styles.bulletPoint}>• Correct inaccurate data</Text>
          <Text style={styles.bulletPoint}>• Delete your account and data</Text>
          <Text style={styles.bulletPoint}>• Export your data</Text>
          <Text style={styles.bulletPoint}>• Opt-out of communications</Text>

          <Text style={styles.sectionTitle}>6. Data Retention</Text>
          <Text style={styles.paragraph}>
            We retain your data for as long as your account is active or as needed to provide you services. If you delete your account, we will delete your personal data within 30 days, except where we are required to retain it for legal purposes.
          </Text>

          <Text style={styles.sectionTitle}>7. Children's Privacy</Text>
          <Text style={styles.paragraph}>
            Track Analyzer Pro is not intended for use by children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately.
          </Text>

          <Text style={styles.sectionTitle}>8. Third-Party Services</Text>
          <Text style={styles.paragraph}>
            Our app uses the following third-party services:
          </Text>
          <Text style={styles.bulletPoint}>• Supabase (database and authentication)</Text>
          <Text style={styles.bulletPoint}>• Expo (app development platform)</Text>
          <Text style={styles.paragraph}>
            These services have their own privacy policies governing their use of your information.
          </Text>

          <Text style={styles.sectionTitle}>9. Changes to This Privacy Policy</Text>
          <Text style={styles.paragraph}>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes.
          </Text>

          <Text style={styles.sectionTitle}>10. Contact Us</Text>
          <Text style={styles.paragraph}>
            If you have any questions about this Privacy Policy or our data practices, please contact us at:
          </Text>
          <Text style={styles.contactText}>support@trackanalyzerpro.com</Text>

          <Text style={styles.paragraph}>
            By using Track Analyzer Pro, you agree to the collection and use of information in accordance with this Privacy Policy.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
