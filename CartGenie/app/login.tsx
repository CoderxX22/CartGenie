import React, { useMemo } from 'react';
import { Stack, Link, Href } from 'expo-router';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useAppColors } from '@/components/appThemeProvider';
import { useLoginLogic } from '../hooks/useLoginLogic';
import { createAuthStyles } from '../app/styles/LoginScreen.styles';
import { InputField } from '../components/InputField';

export default function LoginScreen() {
  const col = useAppColors();
  const styles = useMemo(() => createAuthStyles(col), [col]);

  const {
    username,
    setUsername,
    password,
    setPassword,
    isLoading,
    isDisabled,
    handleLogin,
    handleGoogleLogin
  } = useLoginLogic();

  return (
    <>
      {/* Hide header and prevent swipe back on login to ensure auth flow */}
      <Stack.Screen options={{ headerShown: false, gestureEnabled: false }} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View style={styles.container}>
            <View style={styles.card}>
              <Text style={styles.title}>Welcome To CartGenie</Text>

              {/* Username Input */}
              <InputField
                label="Username"
                colors={col}
                placeholder="Enter your username"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                editable={!isLoading}
                returnKeyType="next"
              />

              {/* Password Input */}
              <InputField
                label="Password"
                colors={col}
                placeholder="Enter your password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                editable={!isLoading}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />

              {/* Primary Login Button */}
              <TouchableOpacity
                style={[styles.primaryButton, isDisabled && { opacity: 0.5 }]}
                onPress={handleLogin}
                activeOpacity={0.9}
                disabled={isDisabled}
              >
                {isLoading ? (
                  <>
                    <ActivityIndicator size="small" color="#fff" />
                    <Text style={styles.primaryButtonText}>Signing in…</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.primaryButtonText}>Login</Text>
                    <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
                  </>
                )}
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.dividerRow}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.divider} />
              </View>

              {/* Google Social Login */}
              <TouchableOpacity
                style={[styles.googleButton, isLoading && { opacity: 0.6 }]}
                activeOpacity={0.9}
                disabled={isLoading}
                onPress={handleGoogleLogin}
              >
                <Ionicons name="logo-google" size={20} color={col.text} />
                <Text style={styles.googleButtonText}>Connect via Google</Text>
              </TouchableOpacity>

              {/* Footer Links */}
              <View style={{ marginTop: 20, gap: 12, alignItems: 'center' }}>
                
                {/* Forgot Password */}
                <Link href={'/forgotPassword' as Href} asChild>
                  <TouchableOpacity activeOpacity={0.7}>
                    <Text style={[styles.footerText, styles.linkText]}>
                      Forgot Password?
                    </Text>
                  </TouchableOpacity>
                </Link>

                {/* Sign Up Navigation */}
                <Text style={styles.footerText}>
                  Don’t have an account?{' '}
                  <Link href={'/signUpScreen' as Href} asChild>
                    <Text style={styles.linkText}>Sign Up</Text>
                  </Link>
                </Text>
              </View>

            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}