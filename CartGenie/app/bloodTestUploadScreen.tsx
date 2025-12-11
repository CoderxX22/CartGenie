import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { API_URL } from '../src/config/api';
import { useAppColors, AppColors } from '@/components/appThemeProvider';
import UserDataService from '@/components/userDataServices';

const ACCENT = '#0096c7';
const CARD_MAX = 520;

interface ServerResponse {
  rawText?: string;
  diagnosis: string[];
}

type PickedFile = {
  uri: string;
  name: string;
  mimeType: string;
};

type SearchParams = {
  username?: string;
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  ageYears?: string;
  sex?: string;
  height?: string;
  weight?: string;
  waist?: string;
  bmi?: string;
  whtr?: string;
};

export default function BloodTestUploadScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<SearchParams>();

  const {
    username,
    firstName,
    lastName,
    birthDate,
    ageYears,
    sex,
    height,
    weight,
    waist,
    bmi,
    whtr,
  } = params;

  const col = useAppColors();
  const styles = useMemo(() => makeStyles(col), [col]);

  const [file, setFile] = useState<PickedFile | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<ServerResponse | null>(
    null,
  );

  // Filter out "does not ill" or similar from diagnosis list, just in case backend sends it
  const visibleDiagnosis = useMemo(
    () =>
      analysisResults?.diagnosis
        ?.filter(
          (d) =>
            d &&
            d.trim() &&
            d.trim().toLowerCase() !== 'does not ill' &&
            d.trim().toLowerCase() !== "doesn't ill",
        ) ?? [],
    [analysisResults],
  );

  const chooseSource = () => {
    Alert.alert('Select Source', 'Choose where to upload your blood test from:', [
      { text: 'Take Photo', onPress: takePhoto },
      { text: 'Library', onPress: pickFromLibrary },
      { text: 'Document', onPress: pickDocument },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Camera access is needed to take a photo.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (!result.canceled && result.assets[0]) {
      setFile({
        uri: result.assets[0].uri,
        name: 'photo.jpg',
        mimeType: 'image/jpeg',
      });
      setAnalysisResults(null);
    }
  };

  const pickFromLibrary = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.7 });
    if (!result.canceled && result.assets[0]) {
      setFile({
        uri: result.assets[0].uri,
        name: result.assets[0].fileName || 'image.jpg',
        mimeType: 'image/jpeg',
      });
      setAnalysisResults(null);
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
      });

      if (!result.canceled && result.assets[0]) {
        setFile({
          uri: result.assets[0].uri,
          name: result.assets[0].name,
          mimeType: result.assets[0].mimeType || 'application/pdf',
        });
        setAnalysisResults(null);
      }
    } catch (err) {
      console.error('Document Picker Error:', err);
      Alert.alert('Error', 'Could not open document picker.');
    }
  };

  const handleUpload = async () => {
    if (!file || isAnalyzing) return;

    try {
      setIsAnalyzing(true);
      setAnalysisResults(null);

      const formData = new FormData();
      const cleanUri =
        Platform.OS === 'android' ? file.uri : file.uri.replace('file://', '');

      // @ts-ignore
      formData.append('bloodTestFile', {
        uri: cleanUri,
        name: file.name || 'upload.jpg',
        type: file.mimeType || 'image/jpeg',
      });

      console.log('📡 Uploading to:', `${API_URL}/api/blood-test/analyze`);

      const response = await fetch(`${API_URL}/api/blood-test/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const jsonResponse = await response.json();
      console.log('🧪 Blood test response raw:', jsonResponse);

      if (!response.ok || !jsonResponse.success) {
        throw new Error(jsonResponse.message || 'Server returned an error');
      }

      const data: ServerResponse = jsonResponse.data ?? { diagnosis: [] };

      // Console preview for DB payload (blood test–specific)
      const dbPayloadPreview = {
        ...(params as any),
        sourceFileName: file.name,
        diagnosis: data.diagnosis,
        rawText: data.rawText ?? '',
      };
      console.log(
        '💾 BloodTest – payload for database preview (analysis only):',
        dbPayloadPreview,
      );

      setAnalysisResults(data);
      Alert.alert('Success', 'Analysis complete!');
    } catch (error: any) {
      console.error('Upload Error:', error);
      Alert.alert(
        'Error',
        error?.message || 'Failed to analyze document. Please try again.',
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleManualSelect = () => {
    router.push({
      pathname: '/illnessesScreen',
      params: {
        ...(params as any),
      },
    });
  };

  /**
   * Build and send payload to backend using the same contract as IllnessesScreen:
   * - illnesses (derived from blood test)
   * - optional identity / demographics / body measures, only if available
   * No strict validation: if some fields are missing, they are simply omitted.
   */
  const saveData = async (illnessesList: string[]) => {
    try {
      const payload: any = {
        illnesses: illnessesList,
      };

      // Identity & demographics
      if (username) payload.username = username;
      if (firstName) payload.firstName = firstName;
      if (lastName) payload.lastName = lastName;
      if (birthDate) payload.birthDate = birthDate;
      if (sex) payload.sex = sex;
      if (ageYears) payload.ageYears = String(ageYears);

      // Body measures (same field names as other screens)
      if (weight) payload.weight = String(weight);
      if (height) payload.height = String(height);
      if (waist) payload.waist = String(waist);
      if (bmi) payload.bmi = String(bmi);
      if (whtr) payload.whtr = String(whtr);

      // Optional blood test metadata, if available
      if (analysisResults?.rawText) payload.bloodTestRawText = analysisResults.rawText;
      if (analysisResults?.diagnosis) payload.bloodTestDiagnosis = analysisResults.diagnosis;

      // Debug: full payload being sent to backend (do not remove).
      console.log('BloodTestUploadScreen – payload for backend:', payload);

      await UserDataService.saveUserProfile(payload);
    } catch (error: any) {
      console.error('BloodTestUploadScreen – save error:', error);
      // Here we do NOT block navigation; DB error should not break the flow
      Alert.alert(
        'Save Warning',
        error?.message || 'Could not fully save your profile, but you can continue.',
      );
    }
  };

  const handleContinue = async () => {
    const detectedConditions: string[] = [];

    if (analysisResults && Array.isArray(analysisResults.diagnosis)) {
      const diag = analysisResults.diagnosis;

      if (diag.includes('High Cholesterol')) {
        detectedConditions.push('High cholesterol');
      }
      if (diag.includes('Type 2 Diabetes')) {
        detectedConditions.push('Diabetes Type 2');
      }
      if (diag.includes('High Blood Pressure (Sodium)')) {
        detectedConditions.push('High blood pressure (Hypertension)');
      }
    }

    console.log('🏁 Final illnesses sent to home:', detectedConditions);

    // Save to DB without strict validation (missing fields are fine)
    await saveData(detectedConditions);

    router.push({
      pathname: '/(tabs)/homePage',
      params: {
        ...(params as any),
        illnesses: JSON.stringify(detectedConditions),
      },
    });
  };

  const hasResults = !!analysisResults;

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Upload Blood Test',
          headerShown: true,
        }}
      />
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.title}>Blood Test Upload</Text>
          <Text style={styles.subtitle}>
            Upload your recent blood test for a more accurate product matching.
          </Text>

          {firstName && (
            <View style={styles.usernameBanner}>
              <Ionicons
                name="person-circle"
                size={20}
                color={col.accent ?? ACCENT}
              />
              <Text style={styles.usernameText}>Hi, {firstName}</Text>
            </View>
          )}

          {/* File selection area */}
          <View style={styles.dropZone}>
            <View style={{ alignItems: 'center', gap: 6 }}>
              <Text style={styles.dropTitle}>
                {file ? 'File ready to upload' : 'Select your blood test file'}
              </Text>
              {file && <Text style={styles.fileName}>{file.name}</Text>}
            </View>

            <TouchableOpacity
              style={styles.browseBtn}
              onPress={chooseSource}
              disabled={isAnalyzing}
            >
              <Ionicons
                name="cloud-upload-outline"
                size={18}
                color={col.accent ?? ACCENT}
              />
              <Text style={styles.browseText}>
                {file ? 'Change file' : 'Select file'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Main analyze button */}
          <TouchableOpacity
            style={[styles.submitBtn, (!file || isAnalyzing) && { opacity: 0.6 }]}
            onPress={handleUpload}
            disabled={!file || isAnalyzing}
          >
            {isAnalyzing ? (
              <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                <ActivityIndicator color="#fff" />
                <Text style={styles.submitText}>Analyzing...</Text>
              </View>
            ) : (
              <Text style={styles.submitText}>Analyze File</Text>
            )}
          </TouchableOpacity>

          {/* Manual illnesses selection */}
          <TouchableOpacity
            style={styles.manualBtn}
            onPress={handleManualSelect}
            disabled={isAnalyzing}
          >
            <Text style={styles.manualBtnText}>
              {hasResults
                ? 'Adjust illnesses manually'
                : 'No file? Select illnesses manually'}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={col.accent ?? ACCENT}
            />
          </TouchableOpacity>

          {/* Analysis results */}
          {analysisResults && (
            <View style={styles.resultsContainer}>
              <View style={styles.divider} />
              <Text style={styles.resultsTitle}>📊 Analysis Results</Text>
              <Text style={styles.secureSubtitle}>Your data securely safed!</Text>

              {/* Only show list if there are any visible diagnoses */}
              {visibleDiagnosis.length > 0 && (
                <View style={styles.resultsList}>
                  {visibleDiagnosis.map((diag, index) => (
                    <Text key={index} style={styles.diagnosisLine}>
                      • {diag}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          )}

          {analysisResults && (
            <TouchableOpacity
              style={styles.continueBtn}
              onPress={handleContinue}
              disabled={isAnalyzing}
            >
              <Text style={styles.continueText}>Save & Finish</Text>
              <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </>
  );
}

const makeStyles = (c: AppColors) =>
  StyleSheet.create({
    container: {
      flexGrow: 1,
      backgroundColor: c.background,
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
      paddingVertical: 22,
      borderWidth: 1,
      borderColor: c.inputBorder,
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
      marginBottom: 5,
      color: c.text,
    },
    subtitle: {
      fontSize: 13,
      color: c.subtitle,
      marginBottom: 15,
    },
    usernameBanner: {
      flexDirection: 'row',
      gap: 5,
      backgroundColor: c.inputBg,
      padding: 10,
      borderRadius: 8,
      marginBottom: 15,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: c.inputBorder,
    },
    usernameText: {
      fontWeight: '600',
      color: c.text,
    },
    dropZone: {
      borderStyle: 'dashed',
      borderWidth: 2,
      borderColor: c.inputBorder,
      borderRadius: 12,
      padding: 20,
      alignItems: 'center',
      gap: 10,
      marginBottom: 20,
      backgroundColor: c.background,
    },
    dropTitle: {
      fontWeight: '700',
      color: c.text,
    },
    fileName: {
      fontSize: 12,
      color: c.subtitle,
    },
    browseBtn: {
      flexDirection: 'row',
      gap: 5,
      backgroundColor: '#e0f2fe',
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderRadius: 8,
      alignItems: 'center',
    },
    browseText: {
      color: ACCENT,
      fontWeight: '700',
    },
    submitBtn: {
      backgroundColor: c.accent ?? ACCENT,
      paddingVertical: 15,
      borderRadius: 12,
      alignItems: 'center',
      marginBottom: 12,
    },
    submitText: {
      color: '#fff',
      fontWeight: '700',
    },
    manualBtn: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 5,
      paddingVertical: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.accent ?? ACCENT,
      backgroundColor: '#f0f9ff',
    },
    manualBtnText: {
      color: c.accent ?? ACCENT,
      fontWeight: '600',
    },
    resultsContainer: {
      marginTop: 20,
      marginBottom: 20,
    },
    divider: {
      height: 1,
      backgroundColor: c.inputBorder,
      marginBottom: 15,
    },
    resultsTitle: {
      fontSize: 18,
      fontWeight: '700',
      marginBottom: 6,
      color: c.text,
    },
    secureSubtitle: {
      fontSize: 13,
      color: c.subtitle,
      marginBottom: 10,
    },
    resultsList: {
      gap: 4,
      marginBottom: 15,
    },
    diagnosisLine: {
      color: c.text,
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '500',
    },
    continueBtn: {
      backgroundColor: '#10b981',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 15,
      borderRadius: 12,
      gap: 8,
      marginTop: 10,
    },
    continueText: {
      color: '#fff',
      fontWeight: '700',
    },
  });
