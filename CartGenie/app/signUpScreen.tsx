import React, { useState, useMemo } from 'react';
import { Stack, useRouter } from 'expo-router';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  Modal,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { useAppColors, AppColors } from '@/components/appThemeProvider';


export default function signUpScreen() {
  const router = useRouter();

  const col = useAppColors();

  // יוצרים styles דינמיים לפי הצבעים הנוכחיים
  const styles = useMemo(() => makeStyles(col), [col]);
  return (
    <>
      <Stack.Screen options={{ title: 'signUp' }} />
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Sign-Up Form</Text>

          {/*UserName*/}
          <View style={styles.field}>
            <Text style={styles.label}>User name</Text>
            <TextInput
              placeholder="Enter your first name"
              style={styles.input}
              placeholderTextColor="#9AA0A6"
            />
          </View>

          {/*Password*/}
          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              placeholder="Enter your Password"
              secureTextEntry
              style={styles.input}
              placeholderTextColor="#9AA0A6"
              onFocus={() => {
              }}
            />
          </View>
          {/*Password*/}
          <View style={styles.field}>
            <Text style={styles.label}>Password Varification</Text>
            <TextInput
              placeholder="Enter your Password again"
              secureTextEntry
              style={styles.input}
              placeholderTextColor="#9AA0A6"
              onFocus={() => {
              }}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>E-mail</Text>
            <TextInput
              placeholder="Enter your E-mail"
              style={styles.input}
              placeholderTextColor="#9AA0A6"
            />
          </View>

          {/* signUp */}
          <TouchableOpacity
            style={styles.ContinueButton}
            onPress={() => router.push('/login')}
          >
            <Text style={styles.ContinueButtonText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const CARD_MAX = 520;
const ACCENT = '#0096c7';

const makeStyles = (c: AppColors) =>
  StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: c.background, // רקע רך ונעים
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
    marginBottom: 18,
    letterSpacing: 0.2,
  },
  field: {
    marginBottom: 16,
  },
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
  inputButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 12,
  },
  inputText: {
    fontSize: 16,
  },
  helperText: {
    marginTop: 6,
    fontSize: 12,
    color: c.text,
  },
  ContinueButton: {
    width: '100%',
    backgroundColor: c.accent,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
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
  ContinueButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  // Modals
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(17, 24, 39, 0.35)',
  },
  modalContainer: {
    backgroundColor: c.inputBg,
    paddingTop: 8,
    paddingBottom: 16,
    paddingHorizontal: 12,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderWidth: 1,
    borderColor: c.inputBorder,
  },
  modalHandle: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#D1D5DB',
    marginBottom: 10,
  },
  closeButton: {
    alignSelf: 'center',
    marginTop: 12,
    backgroundColor: c.accent,
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: 10,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
