import React, { useState } from 'react';
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

const ACCENT = '#0096c7';

interface ServerResponse {
  rawText?: string;
  diagnosis: string[];
}

export default function BloodTestUploadScreen() {
  const router = useRouter();
  
  const params = useLocalSearchParams();
  const { firstName } = params;

  const [file, setFile] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<ServerResponse | null>(null);

  const chooseSource = () => {
    Alert.alert('Select Source', 'Choose source', [
      { text: 'Take Photo', onPress: takePhoto },
      { text: 'Library', onPress: pickFromLibrary },
      { text: 'Document', onPress: pickDocument },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (!result.canceled && result.assets[0]) {
      setFile({ uri: result.assets[0].uri, name: `photo.jpg`, mimeType: 'image/jpeg' });
      setAnalysisResults(null);
    }
  };
  
  const pickFromLibrary = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.7 });
    if (!result.canceled && result.assets[0]) {
      setFile({ uri: result.assets[0].uri, name: result.assets[0].fileName || 'image.jpg', mimeType: 'image/jpeg' });
      setAnalysisResults(null);
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: ['application/pdf', 'image/*'] });
      if (!result.canceled && result.assets[0]) {
        setFile({ uri: result.assets[0].uri, name: result.assets[0].name, mimeType: result.assets[0].mimeType || 'application/pdf' });
        setAnalysisResults(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpload = async () => {
    if (!file || isAnalyzing) return;

    try {
      setIsAnalyzing(true);
      setAnalysisResults(null);

      const formData = new FormData();
      const cleanUri = Platform.OS === 'android' ? file.uri : file.uri.replace('file://', '');
      
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

      if (!jsonResponse.success) {
        throw new Error(jsonResponse.message || 'Server returned an error');
      }

      setAnalysisResults(jsonResponse.data);
      Alert.alert('Success', 'Analysis complete!');

    } catch (error: any) {
      console.error('Upload Error:', error);
      Alert.alert('Error', 'Failed to analyze document. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 🔥 פונקציה למעבר ידני למסך בחירת מחלות
  const handleManualSelect = () => {
    router.push({
      pathname: '/illnessesScreen', // וודא שזה הנתיב הנכון בקבצים שלך
      params: {
        ...(params as any), // מעביר את כל הפרמטרים (שם, גובה, משקל וכו')
      },
    });
  };

  const handleContinue = () => {
    // עיבוד המחלות שנמצאו בבדיקת הדם
    const detectedConditions: string[] = [];
    
    // אם יש תוצאות, נבדוק מה נמצא
    if (analysisResults) {
      if (analysisResults.diagnosis.includes('High Cholesterol')) detectedConditions.push('High cholesterol');
      if (analysisResults.diagnosis.includes('Type 2 Diabetes')) detectedConditions.push('Diabetes Type 2');
      if (analysisResults.diagnosis.includes('High Blood Pressure (Sodium)')) detectedConditions.push('High blood pressure (Hypertension)');
    }
    
    if (detectedConditions.length === 0) detectedConditions.push('does not ill');

    // 📤 שליחה סופית ל-Home Page
    router.push({
      pathname: '/(tabs)/homePage',
      params: {
        ...(params as any),
        illnesses: JSON.stringify(detectedConditions),
      },
    });
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Upload Blood Test' }} />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Blood Test Upload</Text>
          <Text style={styles.subtitle}>
            Upload Your file for a better matching of products.
          </Text>

          {/* הצגת השם במידה והתקבל */}
          {firstName && (
            <View style={styles.usernameBanner}>
              <Ionicons name="person-circle" size={20} color={ACCENT} />
              <Text style={styles.usernameText}>{firstName}</Text>
            </View>
          )}

          <View style={styles.dropZone}>
            <View style={{ alignItems: 'center', gap: 6 }}>
              <Text style={styles.dropTitle}>
                {file ? 'File Ready to Upload' : 'Select File'}
              </Text>
              {file && <Text style={styles.fileName}>{file.name}</Text>}
            </View>

            <TouchableOpacity style={styles.browseBtn} onPress={chooseSource} disabled={isAnalyzing}>
              <Ionicons name="cloud-upload-outline" size={18} color={ACCENT} />
              <Text style={styles.browseText}>{file ? 'Change' : 'Select'}</Text>
            </TouchableOpacity>
          </View>

          {/* כפתור ניתוח - ראשי */}
          <TouchableOpacity
            style={[styles.submitBtn, (!file || isAnalyzing) && { opacity: 0.6 }]}
            onPress={handleUpload}
            disabled={!file || isAnalyzing}
          >
            {isAnalyzing ? (
              <View style={{flexDirection: 'row', gap: 10}}>
                <ActivityIndicator color="#fff" />
                <Text style={styles.submitText}>Analyzing...</Text>
              </View>
            ) : (
              <Text style={styles.submitText}>Analyze File</Text>
            )}
          </TouchableOpacity>

          {/* 🔥 כפתור מעבר ידני - אם אין קובץ */}
          {!analysisResults && !isAnalyzing && (
            <TouchableOpacity style={styles.manualBtn} onPress={handleManualSelect}>
              <Text style={styles.manualBtnText}>No file? Select Illnesses Manually</Text>
              <Ionicons name="chevron-forward" size={16} color={ACCENT} />
            </TouchableOpacity>
          )}

          {analysisResults && (
            <View style={styles.resultsContainer}>
              <View style={styles.divider} />
              <Text style={styles.resultsTitle}>📊 Results:</Text>
              
              <View style={styles.tagsContainer}>
                {analysisResults.diagnosis.map((diag, index) => (
                  <View key={index} style={styles.diagnosisTag}>
                    <Ionicons name="medkit-outline" size={16} color="#B91C1C" />
                    <Text style={styles.diagnosisText}>{diag}</Text>
                  </View>
                ))}
                 {analysisResults.diagnosis.length === 0 && (
                    <Text style={{color: 'green'}}>No abnormal conditions detected.</Text>
                )}
              </View>
            </View>
          )}

          {/* כפתור שמירה וסיום (מופיע רק אחרי אנליזה) */}
          {analysisResults && (
            <TouchableOpacity style={styles.continueBtn} onPress={handleContinue}>
                <Text style={styles.continueText}>Save & Finish</Text>
                <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
            </TouchableOpacity>
          )}

        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#F3F6FA', alignItems: 'center', padding: 20 },
  card: { width: '100%', backgroundColor: '#fff', borderRadius: 18, padding: 20 },
  title: { fontSize: 20, fontWeight: '800', marginBottom: 5 },
  subtitle: { fontSize: 13, color: '#666', marginBottom: 15 },
  usernameBanner: { flexDirection: 'row', gap: 5, backgroundColor: '#e0f2fe', padding: 10, borderRadius: 8, marginBottom: 15 },
  usernameText: { fontWeight: '600' },
  dropZone: { borderStyle: 'dashed', borderWidth: 2, borderColor: '#ccc', borderRadius: 12, padding: 20, alignItems: 'center', gap: 10, marginBottom: 20 },
  dropTitle: { fontWeight: '700' },
  fileName: { fontSize: 12, color: '#555' },
  browseBtn: { flexDirection: 'row', gap: 5, backgroundColor: '#e0f2fe', padding: 10, borderRadius: 8 },
  browseText: { color: ACCENT, fontWeight: '700' },
  
  submitBtn: { backgroundColor: ACCENT, padding: 15, borderRadius: 12, alignItems: 'center', marginBottom: 12 },
  submitText: { color: '#fff', fontWeight: '700' },

  // סגנון לכפתור הידני החדש
  manualBtn: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    gap: 5, 
    padding: 12, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: ACCENT,
    backgroundColor: '#f0f9ff'
  },
  manualBtnText: { color: ACCENT, fontWeight: '600' },

  resultsContainer: { marginTop: 20, marginBottom: 20 },
  divider: { height: 1, backgroundColor: '#eee', marginBottom: 15 },
  resultsTitle: { fontSize: 18, fontWeight: '700', marginBottom: 10 },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 15 },
  diagnosisTag: { flexDirection: 'row', gap: 5, backgroundColor: '#fef2f2', padding: 8, borderRadius: 20, borderWidth: 1, borderColor: '#fecaca' },
  diagnosisText: { color: '#b91c1c', fontWeight: '600' },
  continueBtn: { backgroundColor: '#10b981', flexDirection: 'row', justifyContent: 'center', padding: 15, borderRadius: 12, gap: 8, marginTop: 10 },
  continueText: { color: '#fff', fontWeight: '700' },
});