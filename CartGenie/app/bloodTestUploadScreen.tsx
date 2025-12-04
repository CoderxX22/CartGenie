import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUploadFile } from '@/hooks/useUploadFile';
import { fmtSize } from '@/utils/bytes';
import { API_URL } from '../src/config/api';

const ACCENT = '#0096c7';
const CARD_MAX = 520;

export default function BloodTestUploadScreen() {
  const router = useRouter();
  const { file, progress, uploading, canSubmit, chooseSource } = useUploadFile();

  const params = useLocalSearchParams();
  const {
    username,
    firstName,
    lastName,
    birthDate,
    ageYears,
    sex,
    weight,
    height,
    waist,
    bmi,
  } = params;

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    console.log('📋 Blood Test Upload Screen - Received data:', params);
  }, [params]);

  // 👉 "Prefer not to upload now" → illnessesScreen
  const handleUploadLater = () => {
    router.push({
      pathname: '/illnessesScreen', // ✅ теперь идёт на экран болезней
      params: {
        username,
        firstName,
        lastName,
        birthDate,
        ageYears,
        sex,
        weight,
        height,
        waist,
        bmi,
      },
    });
  };

  // 👉 Загрузка и сохранение анализа
  const handleSubmit = async () => {
    if (!canSubmit || isSaving) return;

    try {
      setIsSaving(true);

      // Здесь можно добавить реальную загрузку на сервер
      await new Promise((r) => setTimeout(r, 1000));

      Alert.alert('Success!', 'Your blood test file was uploaded successfully.', [
        {
          text: 'Continue',
          onPress: () =>
            router.push({
              pathname: '/illnessesScreen', // ✅ после успешной загрузки — тоже сюда
              params: {
                username,
                firstName,
                lastName,
                birthDate,
                ageYears,
                sex,
                weight,
                height,
                waist,
                bmi,
              },
            }),
        },
      ]);
    } catch (error) {
      console.error('❌ Upload error:', error);
      Alert.alert('Error', 'Failed to upload blood test. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Upload Blood Test' }} />
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Upload Blood Test Results</Text>
          <Text style={styles.subtitle}>
            Upload your recent blood test results to personalize your recommendations.
            We accept PDF, JPG and PNG formats.
          </Text>

          {/* User Info Banner */}
          {username && (
            <View style={styles.usernameBanner}>
              <Ionicons name="person-circle" size={20} color={ACCENT} />
              <Text style={styles.usernameText}>
                {firstName} {lastName} (@{username})
              </Text>
            </View>
          )}

          {/* File uploader */}
          <View style={styles.dropZone}>
            <View style={{ alignItems: 'center', gap: 6 }}>
              <Text style={styles.dropTitle}>
                {file ? 'File selected' : 'Tap below to choose a file'}
              </Text>
              {file && (
                <Text style={styles.fileInfo}>
                  {file.name} {file.size ? `• ${fmtSize(file.size)}` : ''}
                </Text>
              )}
            </View>

            <TouchableOpacity
              style={styles.browseBtn}
              activeOpacity={0.9}
              onPress={chooseSource}
              disabled={isSaving}
            >
              <Text style={styles.browseText}>
                {file ? 'Choose another file' : 'Browse Files'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Upload progress */}
          {file && (
            <View style={styles.progressWrap}>
              <Text style={styles.progressLabel}>
                {uploading && progress < 100 ? 'Uploading...' : 'Ready'}
              </Text>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>
            </View>
          )}

          {/* Submit button */}
          <TouchableOpacity
            style={[styles.submitBtn, (!canSubmit || isSaving) && { opacity: 0.6 }]}
            onPress={handleSubmit}
            activeOpacity={0.92}
            disabled={!canSubmit || isSaving}
          >
            {isSaving ? (
              <>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={[styles.submitText, { marginLeft: 8 }]}>Saving...</Text>
              </>
            ) : (
              <>
                <Text style={styles.submitText}>Submit</Text>
                <Ionicons
                  name="arrow-forward"
                  size={20}
                  color="#fff"
                  style={{ marginLeft: 8 }}
                />
              </>
            )}
          </TouchableOpacity>

          {/* ✅ Skip button */}
          <TouchableOpacity onPress={handleUploadLater} activeOpacity={0.8}>
            <Text style={styles.skip}>Prefer not to upload now</Text>
          </TouchableOpacity>

          {isSaving && (
            <View style={styles.savingIndicator}>
              <ActivityIndicator size="small" color={ACCENT} />
              <Text style={styles.savingText}>Saving your data...</Text>
            </View>
          )}
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
    paddingVertical: 22,
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
    fontSize: 20,
    fontWeight: '800',
    color: '#141414',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 16,
  },
  usernameBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${ACCENT}15`,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 16,
    gap: 6,
  },
  usernameText: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '600',
  },
  dropZone: {
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: '#DBDBDB',
    borderRadius: 12,
    paddingVertical: 56,
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#FFFFFF',
  },
  dropTitle: {
    color: '#141414',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
    textAlign: 'center',
  },
  fileInfo: {
    marginTop: 6,
    fontSize: 12,
    color: '#475569',
  },
  browseBtn: {
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 140,
  },
  browseText: {
    color: ACCENT,
    fontSize: 14,
    fontWeight: '700',
  },
  progressWrap: {
    marginTop: 16,
  },
  progressLabel: {
    color: '#141414',
    fontSize: 14,
    marginBottom: 8,
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#DBDBDB',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: ACCENT,
  },
  submitBtn: {
    width: '100%',
    backgroundColor: ACCENT,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 24,
  },
  submitText: {
    color: '#FAFAFA',
    fontSize: 15,
    fontWeight: '700',
  },
  skip: {
    fontWeight: '700',
    marginTop: 20,
    textAlign: 'center',
    textDecorationLine: 'underline',
    color: '#023e8a',
  },
  savingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 16,
    paddingVertical: 10,
    backgroundColor: `${ACCENT}10`,
    borderRadius: 10,
  },
  savingText: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '600',
  },
});
