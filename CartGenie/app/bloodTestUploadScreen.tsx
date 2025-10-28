import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUploadFile } from '@/hooks/useUploadFile';
import { fmtSize } from '@/utils/bytes';

const ACCENT = '#0096c7';
const CARD_MAX = 520;

export default function UploadResultsScreen() {
  const router = useRouter();
  const { file, progress, uploading, canSubmit, chooseSource } = useUploadFile();

  return (
    <>
      <Stack.Screen options={{ title: 'Test Upload' }} />
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Upload Blood Test Results</Text>
          <Text style={styles.subtitle}>
            Upload your recent blood test results to personalize your grocery recommendations.
            We accept PDF and JPG formats.
          </Text>

          {/* Functional uploader */}
          <View style={styles.dropZone}>
            <View style={{ alignItems: 'center', gap: 6, maxWidth: 480 }}>
              <Text style={styles.dropTitle}>{file ? 'File selected' : 'Drag and drop or browse'}</Text>
              <Text style={styles.dropSub}>Accepted formats: PDF, JPG, PNG</Text>
              {file && (
                <Text style={styles.fileInfo} numberOfLines={1}>
                  {file.name} {file.size ? `• ${fmtSize(file.size)}` : ''}
                </Text>
              )}
            </View>

            <TouchableOpacity style={styles.browseBtn} activeOpacity={0.9} onPress={chooseSource}>
              <Text style={styles.browseText}>{file ? 'Choose another file' : 'Browse Files'}</Text>
            </TouchableOpacity>
          </View>

          {/* Progress */}
          {file && (
            <View style={styles.progressWrap}>
              <View style={styles.progressRow}>
                <Text style={styles.progressLabel}>
                  {uploading && progress < 100 ? 'Uploading...' : 'Ready'}
                </Text>
                <Text style={styles.progressPct}>{progress}%</Text>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>
            </View>
          )}

          {/* Submit */}
          <View style={styles.submitRow}>
            <TouchableOpacity
              style={[styles.submitBtn, !canSubmit && { opacity: 0.6 }]}
              onPress={() => router.push('/(tabs)/homePage')}
              activeOpacity={0.92}
              disabled={!canSubmit}
            >
              <Text style={styles.submitText}>submit</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/homePage')}>
            <Text style={styles.skip}>I prefer Upload Later</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F6FA', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, paddingVertical: 24 },
  card: {
    width: '100%', maxWidth: CARD_MAX, backgroundColor: '#FFFFFF', borderRadius: 18,
    paddingHorizontal: 20, paddingVertical: 22, borderWidth: 1, borderColor: '#EEF2F7',
    ...Platform.select({
      ios: { shadowColor: '#0F172A', shadowOpacity: 0.08, shadowRadius: 14, shadowOffset: { width: 0, height: 8 } },
      android: { elevation: 5 },
    }),
  },
  title: { fontSize: 20, fontWeight: '800', color: '#141414', marginBottom: 6, letterSpacing: -0.2 },
  subtitle: { fontSize: 13, color: '#6B7280', marginBottom: 16 },

  dropZone: { borderStyle: 'dashed', borderWidth: 2, borderColor: '#DBDBDB', borderRadius: 12, paddingVertical: 56, paddingHorizontal: 24, alignItems: 'center', gap: 16, backgroundColor: '#FFFFFF' },
  dropTitle: { color: '#141414', fontSize: 17, fontWeight: '700', letterSpacing: -0.2, textAlign: 'center' },
  dropSub: { color: '#141414', fontSize: 13, textAlign: 'center', opacity: 0.9 },
  fileInfo: { marginTop: 6, fontSize: 12, color: '#475569' },
  browseBtn: { height: 40, paddingHorizontal: 16, borderRadius: 10, backgroundColor: '#EDEDED', alignItems: 'center', justifyContent: 'center', minWidth: 120, maxWidth: 480 },
  browseText: { color: '#141414', fontSize: 14, fontWeight: '700', letterSpacing: 0.15 },

  progressWrap: { gap: 8, paddingTop: 14 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: { color: '#141414', fontSize: 16, fontWeight: '500' },
  progressPct: { color: '#141414', fontSize: 14, fontWeight: '600' },
  progressTrack: { height: 8, backgroundColor: '#DBDBDB', borderRadius: 6, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#141414', borderRadius: 6 },

  submitRow: { alignItems: 'flex-end', paddingTop: 16 },
  submitBtn: {
    width: '100%', backgroundColor: ACCENT, paddingVertical: 16, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', flexDirection: 'row', marginTop: 6,
    ...Platform.select({
      ios: { shadowColor: '#0369A1', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.22, shadowRadius: 8 },
      android: { elevation: 3 },
    }),
  },
  submitText: { color: '#FAFAFA', fontSize: 14, fontWeight: '700', letterSpacing: 0.15 },
  skip: { fontWeight: '700', marginTop: 20, alignItems: 'center', justifyContent: 'center', textAlign: 'center', textDecorationLine: 'underline', color: '#023e8a' },
});
