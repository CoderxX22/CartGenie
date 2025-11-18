import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert, ActivityIndicator } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUploadFile } from '@/hooks/useUploadFile';
import { fmtSize } from '@/utils/bytes';
import { API_URL } from '../src/config/api';

const ACCENT = '#0096c7';
const CARD_MAX = 520;

export default function UploadResultsScreen() {
  const router = useRouter();
  const { file, progress, uploading, canSubmit, chooseSource } = useUploadFile();
  
  // 📥 קבלת כל הנתונים מהמסכים הקודמים
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
    allergies,
    otherAllergies,
    allergySeverity,
  } = params;

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    console.log('📋 Upload Results Screen - Received all data:');
    console.log('Username:', username);
    console.log('Name:', firstName, lastName);
    console.log('All params:', params);
  }, [params]);

  /**
   * פונקציה לשליחת כל הנתונים למונגו
   */
  const saveDataToMongo = async (includeBloodTest = false) => {
    if (isSaving) return;

    try {
      setIsSaving(true);

      // בניית אובייקט הנתונים
      const userData = {
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
        allergies,
        otherAllergies,
        allergySeverity,
      };

      // אם יש קובץ בדיקת דם, נוסיף אותו
      //if (includeBloodTest && file) {
       // userData.bloodTest = {
        //  fileName: file.name,
        //  fileUrl: file.uri || '', // אם יש URL של הקובץ
        //  fileSize: file.size,
       // };
     // }

      console.log('Sending data to MongoDB:', userData);

      const response = await fetch(`${API_URL}/api/userdata/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to save data');
      }

      console.log('✅ Data saved successfully:', data);
      return true;

    } catch (error) {
      console.error('❌ Error saving data:', error);
      Alert.alert(
        'Error',
        `Failed to save data: ${error}`,
        [{ text: 'OK' }]
      );
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * טיפול בלחיצה על "Submit" - שמירה עם בדיקת דם
   */
  const handleSubmit = async () => {
    if (!canSubmit || isSaving) return;

    const success = await saveDataToMongo(true);
    
    if (success) {
      Alert.alert(
        'Success!',
        'Your data and blood test results have been saved successfully.',
        [
          {
            text: 'OK',
            onPress: () => router.push('/(tabs)/homePage'),
          },
        ]
      );
    }
  };

  /**
   * טיפול בלחיצה על "Upload Later" - שמירה ללא בדיקת דם
   */
  const handleUploadLater = async () => {
    if (isSaving) return;

    Alert.alert(
      'Upload Later',
      'Your personal information will be saved. You can upload blood test results later.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Continue',
          onPress: async () => {
            const success = await saveDataToMongo(false);
            
            if (success) {
              router.push({
                pathname: '/(tabs)/homePage',
                params: { 
                  username, 
                  firstName, 
                  lastName 
                }
              });
            }
          },
        },
      ]
    );
  };

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

          {/* הצגת username */}
          {username && (
            <View style={styles.usernameBanner}>
              <Ionicons name="person-circle" size={20} color={ACCENT} />
              <Text style={styles.usernameText}>
                {firstName} {lastName} (@{username})
              </Text>
            </View>
          )}

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

            <TouchableOpacity 
              style={styles.browseBtn} 
              activeOpacity={0.9} 
              onPress={chooseSource}
              disabled={isSaving}
            >
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
              style={[
                styles.submitBtn, 
                (!canSubmit || isSaving) && { opacity: 0.6 }
              ]}
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
                  <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Upload Later */}
          <TouchableOpacity
            onPress={handleUploadLater}
            disabled={isSaving}
          >
            <Text style={[styles.skip, isSaving && { opacity: 0.5 }]}>
              I prefer Upload Later
            </Text>
          </TouchableOpacity>

          {/* Saving indicator */}
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
    paddingVertical: 24 
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
        shadowOffset: { width: 0, height: 8 } 
      },
      android: { elevation: 5 },
    }),
  },
  title: { 
    fontSize: 20, 
    fontWeight: '800', 
    color: '#141414', 
    marginBottom: 6, 
    letterSpacing: -0.2 
  },
  subtitle: { 
    fontSize: 13, 
    color: '#6B7280', 
    marginBottom: 16 
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
    backgroundColor: '#FFFFFF' 
  },
  dropTitle: { 
    color: '#141414', 
    fontSize: 17, 
    fontWeight: '700', 
    letterSpacing: -0.2, 
    textAlign: 'center' 
  },
  dropSub: { 
    color: '#141414', 
    fontSize: 13, 
    textAlign: 'center', 
    opacity: 0.9 
  },
  fileInfo: { 
    marginTop: 6, 
    fontSize: 12, 
    color: '#475569' 
  },
  browseBtn: { 
    height: 40, 
    paddingHorizontal: 16, 
    borderRadius: 10, 
    backgroundColor: '#EDEDED', 
    alignItems: 'center', 
    justifyContent: 'center', 
    minWidth: 120, 
    maxWidth: 480 
  },
  browseText: { 
    color: '#141414', 
    fontSize: 14, 
    fontWeight: '700', 
    letterSpacing: 0.15 
  },
  progressWrap: { 
    gap: 8, 
    paddingTop: 14 
  },
  progressRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between' 
  },
  progressLabel: { 
    color: '#141414', 
    fontSize: 16, 
    fontWeight: '500' 
  },
  progressPct: { 
    color: '#141414', 
    fontSize: 14, 
    fontWeight: '600' 
  },
  progressTrack: { 
    height: 8, 
    backgroundColor: '#DBDBDB', 
    borderRadius: 6, 
    overflow: 'hidden' 
  },
  progressFill: { 
    height: '100%', 
    backgroundColor: '#141414', 
    borderRadius: 6 
  },
  submitRow: { 
    alignItems: 'flex-end', 
    paddingTop: 16 
  },
  submitBtn: {
    width: '100%', 
    backgroundColor: ACCENT, 
    paddingVertical: 16, 
    borderRadius: 12,
    alignItems: 'center', 
    justifyContent: 'center', 
    flexDirection: 'row', 
    marginTop: 6,
    ...Platform.select({
      ios: { 
        shadowColor: '#0369A1', 
        shadowOffset: { width: 0, height: 5 }, 
        shadowOpacity: 0.22, 
        shadowRadius: 8 
      },
      android: { elevation: 3 },
    }),
  },
  submitText: { 
    color: '#FAFAFA', 
    fontSize: 14, 
    fontWeight: '700', 
    letterSpacing: 0.15 
  },
  skip: { 
    fontWeight: '700', 
    marginTop: 20, 
    alignItems: 'center', 
    justifyContent: 'center', 
    textAlign: 'center', 
    textDecorationLine: 'underline', 
    color: '#023e8a' 
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