import React, { useMemo } from 'react';
import { Stack, Link, Href } from 'expo-router';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useAppColors } from '@/components/appThemeProvider';
import { useLoginLogic } from '../hooks/useLoginLogic'; 
import { createAuthStyles } from '../app/styles/LoginScreen.styles'; // 👇 וודא שזה הנתיב לקובץ המשותף שיצרנו
import { InputField } from '../components/InputField';

export default function LoginScreen() {
  const col = useAppColors();
  // טוען את כל העיצובים המשותפים (כולל googleButton, primaryButton וכו')
  const styles = useMemo(() => createAuthStyles(col), [col]);
  
  const { 
    username, setUsername, 
    password, setPassword, 
    isLoading, isDisabled,
    handleLogin, handleGoogleLogin, handleForgotPassword 
  } = useLoginLogic();

  return (
    <>
      <Stack.Screen options={{ headerShown: false, gestureEnabled: false }} />

      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Welcome To CartGenie</Text>

          {/* Reusable Input Fields */}
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

          {/* Login Button - מעודכן לשימוש ב-primaryButton מה-authStyles */}
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

          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.divider} />
          </View>

          {/* Google Button - עכשיו זה קיים ב-styles */}
          <TouchableOpacity
            style={[styles.googleButton, isLoading && { opacity: 0.6 }]}
            activeOpacity={0.9}
            disabled={isLoading}
            onPress={handleGoogleLogin}
          >
            <Ionicons name="logo-google" size={20} color={col.text} />
            <Text style={styles.googleButtonText}>Connect via Google</Text>
          </TouchableOpacity>

          {/* Forgot Password - שימוש ב-footerText */}
          <TouchableOpacity disabled={isLoading} onPress={handleForgotPassword}>
            <Text style={styles.footerText}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Sign Up Link - שימוש ב-footerText עם התאמה קלה אם צריך */}
          <Link href={'/signUpScreen' as Href} asChild>
            <TouchableOpacity disabled={isLoading}>
              <Text style={[styles.footerText, { marginTop: 8 }]}>
                Don’t have an account? <Text style={styles.linkText}>Sign Up</Text>
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </>
  );
}