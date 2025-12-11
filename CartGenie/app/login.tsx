import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Stack, useRouter, Link, Href } from 'expo-router';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  Alert,
  ActivityIndicator,
  BackHandler,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../src/config/api';
import { useAppColors, AppColors } from '@/components/appThemeProvider';

const ACCENT = '#0096c7';
const CARD_MAX = 520;

export default function LoginScreen() {
  const router = useRouter();
  const col = useAppColors();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const styles = useMemo(() => makeStyles(col), [col]);

  // Prevent navigating back from the login screen on Android.
  // This avoids returning to splash/logout or an invalid auth state.
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const onBackPress = () => true;
    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);

    return () => sub.remove();
  }, []);

  const handleLogin = useCallback(async () => {
    const usernameTrim = username.trim();
    const passwordTrim = password.trim();

    if (!usernameTrim || !passwordTrim) {
      Alert.alert('Missing information', 'Please fill in both fields before logging in.');
      return;
    }
    if (isLoading) return;

    setIsLoading(true);

    try {
      // 1) Authenticate credentials.
      const loginRes = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usernameTrim, password: passwordTrim }),
      });

      let loginData: any = null;
      try {
        loginData = await loginRes.json();
      } catch {
        // If the server didn't return JSON, handle it gracefully.
      }

      if (!loginRes.ok || !loginData?.success) {
        Alert.alert('Login failed', loginData?.message || 'Invalid credentials or server error.');
        return;
      }

      // 2) Check whether the user already has stored profile data.
      const userDataRes = await fetch(
        `${API_URL}/api/userdata/${encodeURIComponent(usernameTrim)}`
      );

      if (userDataRes.status === 200) {
        const userDataJson = await userDataRes.json();
        const firstName =
          userDataJson?.data?.personalDetails?.firstName || usernameTrim;

        // Use replace to prevent returning to the login screen from Home.
        router.replace({
          pathname: '/(tabs)/homePage',
          params: { username: usernameTrim, firstName },
        });
        return;
      }

      // If user profile data is missing, route to the onboarding/details flow.
      router.replace({
        pathname: '/personalDetails',
        params: { username: usernameTrim },
      });
    } catch (e) {
      console.error('Login error:', e);
      Alert.alert('Login failed', 'Network error or server issue.');
    } finally {
      setIsLoading(false);
    }
  }, [username, password, isLoading, router]);

  // Google auth is intentionally not wired yet.
  const handleGoogleLogin = useCallback(() => {
    Alert.alert('Coming soon', 'Google sign-in will be available in a future build.');
  }, []);

  const handleForgotPassword = useCallback(() => {
    Alert.alert('Not implemented', 'Password recovery is not available yet.');
  }, []);

  const usernameTrim = username.trim();
  const passwordTrim = password.trim();
  const isDisabled = isLoading || !usernameTrim || !passwordTrim;

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
          title: 'Login',
          gestureEnabled: false,
          headerLeft: () => null,
        }}
      />

      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Welcome To CartGenie</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              placeholder="Enter your username"
              style={styles.input}
              placeholderTextColor={col.subtitle}
              autoCapitalize="none"
              autoCorrect={false}
              value={username}
              onChangeText={setUsername}
              editable={!isLoading}
              returnKeyType="next"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              placeholder="Enter your password"
              secureTextEntry
              style={styles.input}
              placeholderTextColor={col.subtitle}
              value={password}
              onChangeText={setPassword}
              editable={!isLoading}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />
          </View>

          <TouchableOpacity
            style={[styles.loginButton, isDisabled && { opacity: 0.5 }]}
            onPress={handleLogin}
            activeOpacity={0.9}
            disabled={isDisabled}
          >
            {isLoading ? (
              <>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={[styles.loginButtonText, { marginLeft: 8 }]}>
                  Signing in…
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.loginButtonText}>Login</Text>
                <Ionicons
                  name="arrow-forward"
                  size={20}
                  color="#fff"
                  style={{ marginLeft: 8 }}
                />
              </>
            )}
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.divider} />
          </View>

          <TouchableOpacity
            style={[styles.googleButton, isLoading && { opacity: 0.6 }]}
            activeOpacity={0.9}
            disabled={isLoading}
            onPress={handleGoogleLogin}
          >
            <Ionicons name="logo-google" size={20} />
            <Text style={styles.googleButtonText}>Connect via Google</Text>
          </TouchableOpacity>

          <TouchableOpacity disabled={isLoading} onPress={handleForgotPassword}>
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
