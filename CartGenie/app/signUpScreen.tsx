import React, { useMemo } from 'react';
import { Stack, Link, Href } from 'expo-router';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  ActivityIndicator,
  Pressable,
  StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useAppColors } from '@/components/appThemeProvider';
// 👇 וודא שהנתיב תואם למיקום הקבצים אצלך
import { useSignUpLogic } from '../hooks/useSignUp'; 
import { createAuthStyles } from '../app/styles/LoginScreen.styles'; 
import { InputField } from '../components/InputField';
import { PasswordInput } from '../components/passwordInput';
import { StrengthMeter } from '../components/strengthMeter';

const ACCENT = '#0096c7'; // צבע להדגשה מקומית (Checkbox)

export default function SignUpScreen() {
  const col = useAppColors();
  
  // 1. סגנונות משותפים (Card, Container, Buttons)
  const authStyles = useMemo(() => createAuthStyles(col), [col]);
  
  // 2. סגנונות מקומיים (Checkbox, Errors, Spacing specific to signup)
  const localStyles = useMemo(() => StyleSheet.create({
    field: { 
      marginBottom: 14 
    },
    termsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 6,
      marginBottom: 16,
      flexWrap: 'wrap',
    },
    termsText: {
      marginLeft: 8,
      color: col.text,
      fontSize: 14,
      flexShrink: 1,
    },
    termsLink: {
      color: ACCENT,
      textDecorationLine: 'underline',
      fontWeight: '600',
    },
    errorText: { 
      marginTop: 4, 
      color: '#ef4444', 
      fontSize: 12,
      marginLeft: 4
    },
  }), [col]);

  const { form, setters, actions, state } = useSignUpLogic();

  return (
    <>
      <Stack.Screen options={{ headerShown: false, title: 'Sign Up' }} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={authStyles.container}>
            <View style={authStyles.card}>
              <Text style={authStyles.title}>Create Your CartGenie Account</Text>

              {/* Email */}
              <InputField
                label="Email"
                colors={col}
                placeholder="name@example.com"
                value={form.email}
                onChangeText={(t) => { setters.setEmail(t); actions.clearError('email'); }}
                keyboardType="email-address"
                autoCapitalize="none"
                // @ts-ignore - אם הוספת תמיכה ב-error ל-InputField
                error={state.errors.email} 
              />
              {/* Fallback error text if InputField doesn't handle it yet */}
              {state.errors.email && !InputField.prototype.hasOwnProperty('error') && (
                 <Text style={localStyles.errorText}>{state.errors.email}</Text>
              )}

              {/* Username */}
              <InputField
                label="Username"
                colors={col}
                placeholder="Enter a username"
                value={form.username}
                onChangeText={(t) => { setters.setUsername(t); actions.clearError('username'); }}
                autoCapitalize="none"
                // @ts-ignore
                error={state.errors.username}
              />
               {state.errors.username && !InputField.prototype.hasOwnProperty('error') && (
                 <Text style={localStyles.errorText}>{state.errors.username}</Text>
              )}

              {/* Password Section */}
              <View style={localStyles.field}>
                <Text style={authStyles.label}>Password</Text>
                <PasswordInput
                  colors={col}
                  placeholder="Enter a password"
                  value={form.pwd}
                  onChangeText={(t) => { setters.setPwd(t); actions.clearError('pwd'); }}
                  error={state.errors.pwd}
                  returnKeyType="next"
                />
                <StrengthMeter strength={state.strength} colors={col} />
              </View>

              {/* Confirm Password */}
              <View style={localStyles.field}>
                <Text style={authStyles.label}>Confirm Password</Text>
                <PasswordInput
                  colors={col}
                  placeholder="Repeat password"
                  value={form.pwd2}
                  onChangeText={(t) => { setters.setPwd2(t); actions.clearError('pwd2'); }}
                  error={state.errors.pwd2}
                  returnKeyType="done"
                  onSubmitEditing={actions.onSubmit}
                />
              </View>

              {/* Terms Checkbox */}
              <Pressable style={localStyles.termsRow} onPress={() => setters.setAccept(!form.accept)}>
                <Ionicons
                  name={form.accept ? 'checkbox' : 'square-outline'}
                  size={24}
                  color={form.accept ? ACCENT : col.subtitle}
                />
                <Text style={localStyles.termsText}>
                   I accept the{' '}
                  <Text style={localStyles.termsLink} onPress={actions.showTerms}>
                    Terms and Privacy Policy
                  </Text>
                </Text>
              </Pressable>
              {!!state.errors.accept && <Text style={localStyles.errorText}>{state.errors.accept}</Text>}

              {/* Submit Button - שימוש ב-primaryButton מה-Shared Styles */}
              <TouchableOpacity
                style={[authStyles.primaryButton, state.disabled && { opacity: 0.5 }]}
                onPress={actions.onSubmit}
                disabled={state.disabled}
              >
                {state.loading ? (
                  <>
                    <ActivityIndicator size="small" color="#fff" />
                    <Text style={[authStyles.primaryButtonText, { marginLeft: 8 }]}>Creating…</Text>
                  </>
                ) : (
                  <>
                    <Text style={authStyles.primaryButtonText}>Create Account</Text>
                    <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
                  </>
                )}
              </TouchableOpacity>

              {/* Divider */}
              <View style={authStyles.dividerRow}>
                <View style={authStyles.divider} />
                <Text style={authStyles.dividerText}>or</Text>
                <View style={authStyles.divider} />
              </View>
              
              {/* Link to Login */}
              <Link href={'/login' as Href} asChild>
                <TouchableOpacity disabled={state.loading}>
                  <Text style={authStyles.footerText}>
                    Already have an account? <Text style={authStyles.linkText}>Log in</Text>
                  </Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}