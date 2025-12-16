import React, { useMemo } from 'react';
import { Stack } from 'expo-router';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppColors } from '@/components/appThemeProvider';
import { useIllnessesScreenLogic } from '../hooks/useIllnessesScreen';
import { IllnessChip, ActionPill } from '../components/IllnessesComponents';
import { InputField } from '../components/InputField';

const ACCENT = '#0096c7';

export default function IllnessesScreen() {
  const insets = useSafeAreaInsets();
  const col = useAppColors();

  // 1. הגנה מקריסה: אם ערכת הנושא עדיין לא נטענה, אל תנסה ליצור סטיילים
  if (!col) {
    return <View style={{ flex: 1, backgroundColor: '#fff' }} />;
  }

  // יצירת הסטיילים עם Memo
  const styles = useMemo(() => createResponsiveStyles(col, insets), [col, insets]);
  
  // 2. שליפת הלוגיקה בצורה בטוחה
  const logic = useIllnessesScreenLogic();
  const { state, actions } = logic || {}; // הגנה אם ה-Hook מחזיר undefined

  // 3. פירוק משתנים עם ערכי ברירת מחדל (מונע קריסה של "Cannot read property")
  const { 
    query = '', 
    selected = new Set(), 
    other = '', 
    filteredIllnesses = [], 
    isSaving = false, 
    loadingIllnesses = false, 
    hasSelection = false, 
    selectedCount = 0 
  } = state || {};

  if (loadingIllnesses) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={ACCENT} />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Health Conditions' }} />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <Text style={styles.title}>Select Health Conditions</Text>
            <Text style={styles.subtitle}>
              Choose any health issues that may affect your nutrition.
            </Text>

            {/* Search Bar */}
            <View style={styles.searchRow}>
              <Ionicons name="search" size={20} color={col.subtitle} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search conditions..."
                placeholderTextColor={col.subtitle}
                value={query}
                onChangeText={actions?.setQuery}
              />
            </View>

            {/* Action Pills */}
            <View style={styles.actionsRow}>
              <ActionPill 
                label="Nothing" 
                icon="checkmark-done" 
                isPrimary 
                onPress={actions?.onConfirmNothing} 
                colors={col} 
              />
              <ActionPill 
                label="Clear" 
                icon="close-circle-outline" 
                onPress={actions?.handleClearAll} 
                colors={col} 
              />
              <View style={[styles.pillButton, { backgroundColor: col.inputBorder }]}>
                 <Text style={styles.pillButtonText}>{selectedCount}</Text>
              </View>
            </View>

            {/* Chips Grid */}
            <View style={styles.chipsWrap}>
              {/* הגנה נוספת: מוודאים שהמערך קיים לפני שעושים עליו map */}
              {Array.isArray(filteredIllnesses) && filteredIllnesses.map((item) => (
                <IllnessChip
                  key={item}
                  label={item}
                  isSelected={selected?.has(item)}
                  onPress={() => actions?.handleToggle(item)}
                  colors={col}
                />
              ))}
            </View>

            {/* Other Input */}
            <View style={styles.inputContainer}>
                <InputField 
                    label="Other (free text)"
                    placeholder="Type another condition..."
                    value={other}
                    onChangeText={actions?.setOther}
                    colors={col}
                    maxLength={80}
                />
            </View>

            {/* Finish Button */}
            <TouchableOpacity
              style={[styles.primaryButton, (!hasSelection || isSaving) && { opacity: 0.6 }]}
              onPress={actions?.onFinish}
              disabled={!hasSelection || isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.primaryButtonText}>Finish & Save</Text>
              )}
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

// --- Styles Definition ---
const createResponsiveStyles = (col: any, insets: any) => StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: col?.background || '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: col?.background || '#fff',
  },
  scrollContent: {
    paddingTop: insets?.top ? insets.top + 10 : 20,
    paddingBottom: 40,
    paddingHorizontal: 16,
  },
  card: {
    width: '100%',
    alignSelf: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: col?.text || '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: col?.subtitle || '#666',
    marginBottom: 24,
    lineHeight: 22,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: col?.card || col?.background || '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: col?.inputBorder || '#ccc',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: col?.text || '#000',
    height: '100%',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 10,
  },
  pillButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: col?.text || '#000',
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap', // רספונסיביות
    gap: 10,
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 30,
  },
  primaryButton: {
    backgroundColor: '#0096c7',
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});