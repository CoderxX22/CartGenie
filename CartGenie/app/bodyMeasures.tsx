import React from 'react';
import { Stack, useRouter } from 'expo-router';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ACCENT = '#0096c7';
const CARD_MAX = 520;

export default function BodyMeasures() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={{ title: 'Measures' }} />
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Body Measures</Text>
          <Text style={styles.des}>For a better analisist you will requasted to let as know your body physical parameters.Please be accurate as you possibily can.   </Text>
          {/* Weight */}
          <View style={styles.field}>
            <Text style={styles.label}>Weight</Text>
            <View style={[styles.inputRow]}>
              <TextInput
                placeholder="Enter Weight (KG)"
                style={styles.input}
                placeholderTextColor="#9AA0A6"
                keyboardType="numeric"
              />
              <Text style={styles.suffix}>KG</Text>
            </View>
          </View>

          {/* Height */}
          <View style={styles.field}>
            <Text style={styles.label}>Height</Text>
            <View style={styles.inputRow}>
              <TextInput
                placeholder="Enter Height (CM)"
                style={styles.input}
                placeholderTextColor="#9AA0A6"
                keyboardType="numeric"
              />
              <Text style={styles.suffix}>CM</Text>
            </View>
          </View>

          {/* BMI (read-only) */}
          <View style={styles.field}>
            <Text style={styles.label}>BMI</Text>
            <View style={styles.inputBlocked}>
              <TextInput
                placeholder="Calculated BMI"
                style={{ flex: 1, color: '#111827' }}
                placeholderTextColor="#9AA0A6"
                editable={false}
              />
              <Ionicons name="information-circle-outline" size={20} color="#94A3B8" />
            </View>
          </View>

          {/* Waist */}
          <View style={styles.field}>
            <Text style={styles.label}>Waist Size</Text>
            <View style={styles.inputRow}>
              <TextInput
                placeholder="Waist Size (CM)"
                style={styles.input}
                placeholderTextColor="#9AA0A6"
                keyboardType="numeric"
              />
              <Text style={styles.suffix}>CM</Text>
            </View>
          </View>

          {/* Continue */}
          <TouchableOpacity
            style={styles.ContinueButton}
            onPress={() => router.push('/AllergiesScreen')}
            activeOpacity={0.9}
          >
            <Text style={styles.ContinueButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F6FA',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  card: {
    width: '100%',
    maxWidth: CARD_MAX,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderWidth: 1,
    borderColor: '#EEF2F7',
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
    color: '#0F172A',
    marginBottom: 22,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  des: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 6,
    textAlign:'center',
    letterSpacing: 0.2,
  },
  inputRow: {
    width: '100%',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    padding: 0,
    margin: 0,
  },
  suffix: {
    marginLeft: 10,
    color: '#6B7280',
    fontSize: 14,
  },
  inputBlocked: {
    width: '100%',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ContinueButton: {
    width: '100%',
    backgroundColor: ACCENT,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
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
});
