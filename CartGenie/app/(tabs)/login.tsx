import React from 'react';
import { Stack } from 'expo-router';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');
const Colors = {
  tabIconDefault: '#4285F4',
};

export default function LoginScreen() {
  return (
    <>
    <Stack.Screen options={{ title: 'Log-in' }} />
    <View style={styles.container}>
        <Text style={styles.title}>Welcome To CartGenie</Text>

        {/* Username */}
        <TextInput
          placeholder="Username"
          style={styles.input}
          placeholderTextColor="#999"
        />

        {/* Password */}
        <TextInput
          placeholder="Password"
          secureTextEntry
          style={styles.input}
          placeholderTextColor="#999"
        />

        {/* Login Button */}
        <TouchableOpacity style={styles.loginButton}>
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>

        {/* Google Connect Button */}
        <TouchableOpacity style={styles.googleButton}>
          <Ionicons name="logo-google" size={22} color={Colors.tabIconDefault} />
          <Text style={styles.googleButtonText}>Connect via Google</Text>
        </TouchableOpacity>

        {/* Forgot Password & SignUp */}
        <TouchableOpacity>
          <Text style={styles.forgotPassword}>Forgot Password?</Text>
        </TouchableOpacity>

        <Text style={styles.signUp}>
          Don’t have an account?{' '}
          <Text style={styles.signUpLink}>Sign Up</Text>
        </Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: "flex-start",
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#222',
    marginBottom: 50,
    marginTop:50,
    letterSpacing: 0.5,
  },
  input: {
    width: '100%',
    backgroundColor: '#f7f7f7',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#000',
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  loginButton: {
    width: '100%',
    backgroundColor: '#000',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: { elevation: 4 },
    }),
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 20,
    width: '100%',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: { elevation: 2 },
    }),
  },
  googleButtonText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  forgotPassword: {
    fontSize: 15,
    color: '#666',
    marginTop: 10,
    marginBottom: 8,
  },
});
