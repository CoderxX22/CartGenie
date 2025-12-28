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

import { useAppColors, AppColors } from '@/components/appThemeProvider';
import { useSignUpLogic } from '../hooks/useSignUp';
import { createAuthStyles } from '../app/styles/LoginScreen.styles';
import { InputField } from '../components/InputField';
import { PasswordInput } from '../components/passwordInput';
import { StrengthMeter } from '../components/strengthMeter';

const ACCENT = '#0096c7';

export default function SignUpScreen() {
  const col = useAppColors();
  const authStyles = useMemo(() => createAuthStyles(col), [col]);
  const localStyles = useMemo(() => createLocalStyles(col), [col]);

  const { form, setters, actions, state } = useSignUpLogic();
  
  type FieldKey = "email" | "username" | "pwd" | "pwd2" | "accept";

  const handleChange = (setter: (text: string) => void, fieldName: FieldKey) => (text: string) => {
    setter(text);
    actions.clearError(fieldName);
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false, title: 'Sign Up' }} />

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View style={authStyles.container}>
            <View style={authStyles.card}>
              <Text style={authStyles.title}>Create Your CartGenie Account</Text>

              {/* Email */}
              <InputField
                label="Email"
                colors={col}
                placeholder="name@example.com"
                value={form.email}
                onChangeText={handleChange(setters.setEmail, 'email')}
                keyboardType="email-address"
                autoCapitalize="none"
                error={state.errors.email}
              />

              {/* Username */}
              <InputField
                label="Username"
                colors={col}
                placeholder="Enter a username"
                value={form.username}
                onChangeText={handleChange(setters.setUsername, 'username')}
                autoCapitalize="none"
                error={state.errors.username}
              />

              {/* Password */}
              <View style={localStyles.field}>
                <Text style={authStyles.label}>Password</Text>
                <PasswordInput
                  colors={col}
                  placeholder="Enter a password"
                  value={form.pwd}
                  onChangeText={handleChange(setters.setPwd, 'pwd')}
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
                  onChangeText={handleChange(setters.setPwd2, 'pwd2')}
                  error={state.errors.pwd2}
                  returnKeyType="done"
                  onSubmitEditing={actions.onSubmit}
                />
              </View>

              {/* Terms Checkbox */}
              <Pressable
                style={localStyles.termsRow}
                onPress={() => setters.setAccept(!form.accept)}
              >
                <Ionicons
                  name={form.accept ? 'checkbox' : 'square-outline'}
                  size={24}
                  color={form.accept ? ACCENT : col.subtitle}
                />
                <Text style={localStyles.termsText}>
                  I accept the{' '}
                  <Text
                    style={localStyles.termsLink}
                    onPress={(e) => {
                      e.stopPropagation();
                      actions.showTerms();
                    }}
                  >
                    Terms and Privacy Policy
                  </Text>
                </Text>
              </Pressable>

              {/* Terms Error */}
              {!!state.errors.accept && (
                <Text style={localStyles.errorText}>{state.errors.accept}</Text>
              )}

              {/* Submit Button */}
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

              {/* Footer / Login Link */}
              <View style={authStyles.dividerRow}>
                <View style={authStyles.divider} />
                <Text style={authStyles.dividerText}>or</Text>
                <View style={authStyles.divider} />
              </View>

              <Text style={authStyles.footerText}>
                Already have an account?{' '}
                <Link href={'/login' as Href} asChild>
                  <Text style={authStyles.linkText}>Log in</Text>
                </Link>
              </Text>
              
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

// Extracted style creation for cleaner component body
const createLocalStyles = (col: AppColors) => StyleSheet.create({
  field: { 
    marginBottom: 14 
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 16,
    flexWrap: 'wrap'
  },
  termsText: {
    marginLeft: 8,
    color: col.text,
    fontSize: 14,
    flexShrink: 1
  },
  termsLink: {
    color: ACCENT,
    textDecorationLine: 'underline',
    fontWeight: '600'
  },
  errorText: {
    marginTop: 4,
    color: '#ef4444',
    fontSize: 12,
    marginLeft: 4
  }
});