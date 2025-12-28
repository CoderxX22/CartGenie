import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useAppColors } from '@/components/appThemeProvider';
import { createAuthStyles } from './styles/LoginScreen.styles';
import { InputField } from '@/components/InputField';
import { PasswordInput } from '../components/passwordInput'; 
import { useForgotPasswordLogic } from '../hooks/useForgotPassword';

export default function ForgotPasswordScreen() {
  const col = useAppColors();
  const styles = useMemo(() => createAuthStyles(col), [col]);

  const { state, setters, actions } = useForgotPasswordLogic();

  // Render logic based on the current wizard step
  const renderContent = () => {
    switch (state.step) {
      case 1: // Identity Verification
        return (
          <>
            <Text style={styles.subtitle}>Enter your details to verify your identity.</Text>
            <InputField
              label="Username"
              colors={col}
              value={state.username}
              onChangeText={setters.setUsername}
              placeholder="Your username"
              editable={!state.loading}
            />
            <InputField
              label="Email Address"
              colors={col}
              value={state.email}
              onChangeText={setters.setEmail}
              placeholder="Your registered email"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!state.loading}
            />
            <ActionButton 
              title="Verify Identity" 
              onPress={actions.handleVerify} 
              loading={state.loading} 
              styles={styles} 
            />
          </>
        );

      case 2: // Password Reset
        return (
          <>
            <Text style={styles.subtitle}>Identity verified. Create a new password.</Text>
            
            {/* New Password Field */}
            <Text style={{ marginBottom: 6, fontWeight: '600', color: col.text }}>New Password</Text>
            <PasswordInput
              value={state.newPassword}
              onChangeText={setters.setNewPassword}
              placeholder="At least 6 characters"
              colors={col}
              returnKeyType="next"
            />

            {/* Confirm Password Field */}
            <Text style={{ marginBottom: 6, fontWeight: '600', color: col.text }}>Confirm Password</Text>
            <PasswordInput
              value={state.confirmPassword}
              onChangeText={setters.setConfirmPassword}
              placeholder="Re-enter new password"
              colors={col}
              returnKeyType="done"
              onSubmitEditing={actions.handleResetPassword}
            />

            <ActionButton 
              title="Reset Password" 
              onPress={actions.handleResetPassword} 
              loading={state.loading} 
              styles={styles} 
            />
          </>
        );

      case 3: // Success State
        return (
          <View style={{ alignItems: 'center', paddingVertical: 20 }}>
            <Ionicons name="checkmark-circle" size={80} color="#22c55e" />
            <Text style={[styles.title, { marginTop: 16, marginBottom: 8 }]}>Success!</Text>
            <Text style={[styles.subtitle, { textAlign: 'center' }]}>
              Your password has been updated successfully.
            </Text>
            
            <TouchableOpacity
              style={[styles.primaryButton, { marginTop: 30, width: '100%' }]}
              onPress={actions.goBackToLogin}
              activeOpacity={0.9}
            >
              <Text style={styles.primaryButtonText}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        );
        
      default:
        return null;
    }
  };

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Reset Password', 
          headerBackTitle: 'Login', 
          headerTintColor: col.text 
        }} 
      />
      
      <View style={styles.container}>
        <View style={styles.card}>
          {state.step !== 3 && <Text style={styles.title}>Reset Password</Text>}
          {renderContent()}
        </View>
      </View>
    </>
  );
}

// --- Sub-Components ---

interface ActionButtonProps {
  title: string;
  onPress: () => void;
  loading: boolean;
  styles: any;
}

const ActionButton = ({ title, onPress, loading, styles }: ActionButtonProps) => (
  <TouchableOpacity
    style={[styles.primaryButton, loading && { opacity: 0.7 }]}
    onPress={onPress}
    disabled={loading}
    activeOpacity={0.9}
  >
    {loading ? (
      <ActivityIndicator color="#fff" />
    ) : (
      <Text style={styles.primaryButtonText}>{title}</Text>
    )}
  </TouchableOpacity>
);