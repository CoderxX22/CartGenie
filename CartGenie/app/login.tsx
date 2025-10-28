import React, { useMemo } from 'react';
import { Stack, useRouter,Link, Href } from 'expo-router';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppColors, AppColors } from '@/components/appThemeProvider';

const { width } = Dimensions.get('window');
const ACCENT = '#0096c7';

export default function LoginScreen() {
  const router = useRouter();
  const col = useAppColors();

  // יוצרים styles דינמיים לפי הצבעים הנוכחיים
  const styles = useMemo(() => makeStyles(col), [col]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false, title: 'Login' }} />
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Welcome To CartGenie</Text>

          {/* Username */}
          <View style={styles.field}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              placeholder="Enter your username"
              style={styles.input}
              placeholderTextColor={col.subtitle}
              autoCapitalize="none"
            />
          </View>

          {/* Password */}
          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              placeholder="Enter your password"
              secureTextEntry
              style={styles.input}
              placeholderTextColor={col.subtitle}
            />
          </View>

          {/* Login */}
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push('/personalDetails')}
            activeOpacity={0.9}
          >
            <Text style={styles.loginButtonText}>Login</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
          </TouchableOpacity>

          {/* Or divider */}
          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.divider} />
          </View>

          {/* Google */}
          <TouchableOpacity style={styles.googleButton} activeOpacity={0.9}>
            <Ionicons name="logo-google" size={20} />
            <Text style={styles.googleButtonText}>Connect via Google</Text>
          </TouchableOpacity>

          {/* Links */}
          <TouchableOpacity>
            <Text style={styles.forgotPassword}>Forgot Password?</Text>
          </TouchableOpacity>

          <Link href={'/signUpScreen' as Href}>
            <Text style={styles.signUp}>
             Don’t have an account? <Text style={styles.signUpLink}>Sign Up</Text>
            </Text>
          </Link>

        </View>
      </View>
    </>
  );
}

const CARD_MAX = 520;

// Factory שמייצר StyleSheet לפי ערכות הצבעים
const makeStyles = (c: AppColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.background,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 20,
      paddingVertical: 24,
    },
    card: {
      width: '100%',
      maxWidth: CARD_MAX,
      backgroundColor: c.card,
      borderRadius: 18,
      paddingHorizontal: 20,
      paddingVertical: 24,
      borderWidth: 1,
      borderColor: c.inputBorder,
      ...Platform.select({
        ios: {
          shadowColor: '#0F172A',
          shadowOpacity: 0.08,
          shadowRadius: 14,
          shadowOffset: { width: 0, height: 8 },
        },
        android: { elevation: 5 },
      }),
    },
    title: {
      fontSize: 22,
      fontWeight: '800',
      color: c.text,
      marginBottom: 22,
      textAlign: 'center',
      letterSpacing: 0.2,
    },
    field: { marginBottom: 14 },
    label: {
      fontSize: 13,
      color: c.subtitle,
      marginBottom: 6,
      letterSpacing: 0.2,
    },
    input: {
      width: '100%',
      backgroundColor: c.inputBg,
      borderRadius: 12,
      paddingVertical: 14,
      paddingHorizontal: 14,
      fontSize: 16,
      color: c.text,
      borderWidth: 1,
      borderColor: c.inputBorder,
    },
    loginButton: {
      width: '100%',
      backgroundColor: ACCENT,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      marginTop: 6,
      ...Platform.select({
        ios: {
          shadowColor: '#0369A1',
          shadowOffset: { width: 0, height: 5 },
          shadowOpacity: 0.22,
          shadowRadius: 8,
        },
        android: { elevation: 3 },
      }),
    },
    loginButtonText: {
      color: '#FFFFFF',
      fontSize: 17,
      fontWeight: '700',
      letterSpacing: 0.3,
    },
    dividerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 14,
    },
    divider: {
      flex: 1,
      height: 1,
      backgroundColor: c.inputBorder,
    },
    dividerText: {
      marginHorizontal: 10,
      color: c.subtitle,
      fontSize: 13,
    },
    googleButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.card,
      borderRadius: 12,
      paddingVertical: 14,
      paddingHorizontal: 20,
      borderWidth: 1,
      borderColor: c.inputBorder,
      width: '100%',
      justifyContent: 'center',
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 3,
        },
        android: { elevation: 2 },
      }),
    },
    googleButtonText: {
      marginLeft: 10,
      fontSize: 16,
      fontWeight: '600',
      color: c.text,
    },
    forgotPassword: {
      fontSize: 14,
      color: c.subtitle,
      marginTop: 16,
      textAlign: 'center',
    },
    signUp: {
      fontSize: 14,
      color: c.subtitle,
      marginTop: 8,
      textAlign: 'center',
    },
    signUpLink: {
      fontWeight: '700',
      color: '#023e8a',
      textDecorationLine: 'underline',
    },
  });
