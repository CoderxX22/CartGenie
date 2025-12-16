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
import { useSignUpLogic } from '../hooks/useSignUp';
import { createAuthStyles } from '../app/styles/LoginScreen.styles';
import { InputField } from '../components/InputField';
import { PasswordInput } from '../components/passwordInput';
import { StrengthMeter } from '../components/strengthMeter';

const ACCENT = '#0096c7'; // Local accent color for checkbox/link emphasis

export default function SignUpScreen() {
  const col = useAppColors(); // App theme colors (dark/light, etc.)

  // Shared auth UI styles (container/card/buttons) derived from theme colors
  const authStyles = useMemo(() => createAuthStyles(col), [col]);

  // Screen-specific styles created from theme colors (memoized to avoid re-creating on every render)
  const localStyles = useMemo(
    () =>
      StyleSheet.create({
        field: { marginBottom: 14 }, // Standard spacing between form blocks
        termsRow: {
          flexDirection: 'row',
          alignItems: 'center',
          marginTop: 6,
          marginBottom: 16,
          flexWrap: 'wrap' // Allows the terms text to wrap on small screens
        },
        termsText: {
          marginLeft: 8,
          color: col.text,
          fontSize: 14,
          flexShrink: 1 // Prevents layout overflow when text is long
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
      }),
    [col]
  );

  // Business logic hook: form values, setters, actions (submit/show terms), and UI state
  const { form, setters, actions, state } = useSignUpLogic();

  return (
    <>
      {/* Hide the header for a clean full-screen auth experience */}
      <Stack.Screen options={{ headerShown: false, title: 'Sign Up' }} />

      {/* Prevents keyboard from covering inputs (especially on iOS) */}
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Allows the layout to scroll when the keyboard is open */}
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
                onChangeText={(t) => {
                  setters.setEmail(t);          // Update email field
                  actions.clearError('email');  // Clear validation error once user edits
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                // Forward potential error to the component (if supported)
                // @ts-ignore
                error={state.errors.email}
              />
              {/* Fallback error rendering if InputField doesn't support an error prop */}
              {state.errors.email && !InputField.prototype.hasOwnProperty('error') && (
                <Text style={localStyles.errorText}>{state.errors.email}</Text>
              )}

              {/* Username */}
              <InputField
                label="Username"
                colors={col}
                placeholder="Enter a username"
                value={form.username}
                onChangeText={(t) => {
                  setters.setUsername(t);            // Update username field
                  actions.clearError('username');    // Clear validation error once user edits
                }}
                autoCapitalize="none"
                // @ts-ignore
                error={state.errors.username}
              />
              {/* Fallback error rendering if InputField doesn't support an error prop */}
              {state.errors.username && !InputField.prototype.hasOwnProperty('error') && (
                <Text style={localStyles.errorText}>{state.errors.username}</Text>
              )}

              {/* Password */}
              <View style={localStyles.field}>
                <Text style={authStyles.label}>Password</Text>
                <PasswordInput
                  colors={col}
                  placeholder="Enter a password"
                  value={form.pwd}
                  onChangeText={(t) => {
                    setters.setPwd(t);          // Update password field
                    actions.clearError('pwd');  // Clear validation error once user edits
                  }}
                  error={state.errors.pwd}
                  returnKeyType="next"
                />
                {/* Visual indicator based on computed strength from the logic hook */}
                <StrengthMeter strength={state.strength} colors={col} />
              </View>

              {/* Confirm Password */}
              <View style={localStyles.field}>
                <Text style={authStyles.label}>Confirm Password</Text>
                <PasswordInput
                  colors={col}
                  placeholder="Repeat password"
                  value={form.pwd2}
                  onChangeText={(t) => {
                    setters.setPwd2(t);          // Update confirmation password
                    actions.clearError('pwd2');  // Clear validation error once user edits
                  }}
                  error={state.errors.pwd2}
                  returnKeyType="done"
                  onSubmitEditing={actions.onSubmit} // Submits form from keyboard "Done"
                />
              </View>

              {/* Terms acceptance */}
              <Pressable
                style={localStyles.termsRow}
                onPress={() => setters.setAccept(!form.accept)} // Toggle checkbox state
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
                      // Prevents the parent Pressable from toggling acceptance when the link is pressed
                      e.stopPropagation?.();
                      actions.showTerms(); // Opens Terms & Privacy Policy (Alert or screen)
                    }}
                  >
                    Terms and Privacy Policy
                  </Text>
                </Text>
              </Pressable>

              {/* Terms validation error */}
              {!!state.errors.accept && <Text style={localStyles.errorText}>{state.errors.accept}</Text>}

              {/* Submit */}
              <TouchableOpacity
                style={[authStyles.primaryButton, state.disabled && { opacity: 0.5 }]}
                onPress={actions.onSubmit}     // Triggers validation + registration request
                disabled={state.disabled}      // Disabled until form is valid and terms accepted
              >
                {state.loading ? (
                  <>
                    {/* Loading indicator while registration request is in progress */}
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

              {/* Navigate to Login */}
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
