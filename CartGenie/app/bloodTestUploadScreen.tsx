import React, { useMemo } from 'react';
import { Stack } from 'expo-router';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useAppColors } from '@/components/appThemeProvider';
import { useBloodTestLogic } from '../hooks/useBloodTestLogic';
import { createBloodTestStyles } from '../app/styles/bloodTest.styles';

const ACCENT = '#0096c7';
const SUCCESS_COLOR = '#10B981';

export default function BloodTestUploadScreen() {
  const col = useAppColors();
  const styles = useMemo(() => createBloodTestStyles(col), [col]);
  const { state, actions } = useBloodTestLogic();

  // 👇 תיקון 1: מושכים את files (מערך) ולא file
  const { files, isAnalyzing, isSaving, analysisResults, firstName } = state;

  return (
    <>
      <Stack.Screen options={{ title: 'Upload Blood Test' }} />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Blood Test Upload</Text>
          <Text style={styles.subtitle}>
            Upload your files for a better matching of products.
          </Text>

          {/* User Banner */}
          {firstName && (
            <View style={styles.usernameBanner}>
              <Ionicons name="person-circle" size={20} color={ACCENT} />
              <Text style={styles.usernameText}>{firstName}</Text>
            </View>
          )}

          {/* File Drop Zone */}
          <View style={styles.dropZone}>
            <View style={{ alignItems: 'center', gap: 6 }}>
              <Text style={styles.dropTitle}>
                {files.length > 0 ? `${files.length} File(s) Selected` : 'Select Files'}
              </Text>
              
              {/* 👇 תיקון 2: הצגת רשימת הקבצים */}
              {files.length > 0 && (
                <View style={{ alignItems: 'center' }}>
                  {files.map((f, index) => (
                    <Text key={index} style={styles.fileName} numberOfLines={1}>
                      📄 {f.name}
                    </Text>
                  ))}
                </View>
              )}
            </View>

            <TouchableOpacity 
                style={styles.browseBtn} 
                onPress={actions.chooseSource} 
                disabled={isAnalyzing || isSaving}
            >
              <Ionicons name="cloud-upload-outline" size={18} color={ACCENT} />
              <Text style={styles.browseText}>
                {files.length > 0 ? 'Add More' : 'Select'}
              </Text>
            </TouchableOpacity>
            
            {/* כפתור ניקוי אופציונלי - אם תרצה להוסיף */}
             {files.length > 0 && !isAnalyzing && (
                <TouchableOpacity onPress={actions.clearFiles} style={{ marginTop: 10 }}>
                    <Text style={{ color: 'red', fontSize: 12 }}>Clear Selection</Text>
                </TouchableOpacity>
             )}
          </View>

          {/* Action Button: Analyze */}
          <TouchableOpacity
            style={[
                styles.primaryButton, 
                // 👇 תיקון 3: בדיקת אורך המערך
                (files.length === 0 || isAnalyzing || isSaving) && { opacity: 0.6 }
            ]}
            onPress={actions.onAnalyze}
            // 👇 תיקון 4: בדיקת אורך המערך
            disabled={files.length === 0 || isAnalyzing || isSaving}
          >
            {isAnalyzing ? (
              <>
                <ActivityIndicator color="#fff" />
                <Text style={[styles.primaryButtonText, { marginLeft: 8 }]}>Analyzing...</Text>
              </>
            ) : (
              <Text style={styles.primaryButtonText}>
                {analysisResults ? 'Analyze Again' : `Analyze ${files.length > 0 ? `(${files.length})` : ''}`}
              </Text>
            )}
          </TouchableOpacity>

          {/* Manual Select Option */}
          {!analysisResults && !isAnalyzing && (
            <TouchableOpacity style={styles.manualBtn} onPress={actions.onManualSelect} disabled={isSaving}>
              <Text style={styles.manualBtnText}>No file? Select Illnesses Manually</Text>
              <Ionicons name="chevron-forward" size={16} color={ACCENT} />
            </TouchableOpacity>
          )}

          {/* Results Section */}
          {analysisResults && (
            <View style={styles.resultsContainer}>
              <View style={styles.divider} />
              
              <View style={styles.successBanner}>
                <Ionicons name="checkmark-circle" size={24} color={SUCCESS_COLOR} />
                <View style={{flex: 1}}>
                    <Text style={styles.successTitle}>Analysis Successful!</Text>
                </View>
              </View>

              {/* Save & Continue Button */}
              <TouchableOpacity 
                  style={[styles.saveSuccessBtn, isSaving && { opacity: 0.7 }]} 
                  onPress={actions.onSaveAndContinue}
                  disabled={isSaving}
              >
                  {isSaving ? (
                       <ActivityIndicator color="#fff" />
                  ) : (
                      <>
                          <Text style={styles.primaryButtonText}>Save & Finish</Text>
                          <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                      </>
                  )}
              </TouchableOpacity>
            </View>
          )}

        </View>
      </ScrollView>
    </>
  );
}