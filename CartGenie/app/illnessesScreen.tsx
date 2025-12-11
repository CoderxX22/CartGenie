import React, { useState, useMemo } from 'react';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIllnesses } from '@/hooks/useIllnesses';
import UserDataService from '@/components/userDataServices';
// 👇 תוספת: ייבוא AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCENT = '#0096c7';
const CARD_MAX = 520;

const ILLNESSES = [
  'High blood pressure (Hypertension)',
  'Low blood pressure (Hypotension)',
  'Diabetes Type 1',
  'Diabetes Type 2',
  'High cholesterol',
  'Obesity',
  'Underweight',
  'Gastric ulcer (Stomach ulcer)',
  'Acid reflux (GERD)',
  'Irritable bowel syndrome (IBS)',
  'Celiac disease (Gluten intolerance)',
  'Lactose intolerance',
  'Kidney disease',
  'Liver disease (Fatty liver / Hepatitis)',
  'Anemia (Iron deficiency)',
  'Thyroid disorder (Hypo / Hyperthyroidism)',
  'Heart disease (Cardiovascular)',
  'Osteoporosis',
  'Gout (Uric acid buildup)',
  'Depression / Anxiety (affecting appetite)',
];

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

export default function IllnessesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  const params = useLocalSearchParams<SearchParams>();
  const { 
    username, firstName, lastName, birthDate, ageYears, sex,
    height, weight, waist, bmi, whtr 
  } = params;

  const {
    selected,
    other,
    setOther,
    toggle,
    clearAll,
    hasSelection,
    loading 
  } = useIllnesses(ILLNESSES);

  const [query, setQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleToggle = (item: string) => {
    toggle(item);
    Haptics.selectionAsync();
  };

  const handleClearAll = () => {
    clearAll();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ILLNESSES;
    return ILLNESSES.filter((a) => a.toLowerCase().includes(q));
  }, [query]);

  // 👇 הפונקציה המעודכנת עם לוגיקת השמירה המקומית
  const saveDataAndNavigate = async (illnessesList: string[], otherText: string) => {
    setIsSaving(true);
    try {
      const payload: any = {
        illnesses: illnessesList,
        otherIllnesses: otherText,
      };

      if (username) payload.username = username;
      if (firstName) payload.firstName = firstName;
      if (lastName) payload.lastName = lastName;
      if (birthDate) payload.birthDate = birthDate;
      if (sex) payload.sex = sex;

      if (ageYears) payload.ageYears = String(ageYears);
      if (weight) payload.weight = String(weight);
      if (height) payload.height = String(height);
      if (waist) payload.waist = String(waist);
      if (bmi) payload.bmi = String(bmi);
      if (whtr) payload.whtr = String(whtr);

      console.log('💾 Saving profile to Server DB...');
      
      // 1. שמירה בשרת (DB)
      await UserDataService.saveUserProfile(payload);

      // 2. 👇 שמירה בזיכרון המקומי (כדי שהסורק יזהה את המשתמש)
      if (payload.username) {
          await AsyncStorage.setItem('loggedInUser', payload.username);
          console.log('✅ Username saved locally:', payload.username);
      }

      // 3. מעבר לדף הבית
      router.push({
        pathname: '/(tabs)/homePage',
        params: {
          ...(params as any),
          illnesses: JSON.stringify(illnessesList),
          otherIllnesses: otherText,
        },
      });

    } catch (error: any) {
      console.error("Save Error:", error);
      Alert.alert(
        'Save Error', 
        error.message || 'Could not save your profile. Please check your connection.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const confirmNothing = () => {
    Alert.alert(
      'No conditions?',
      'This will confirm you have no known health conditions.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm & Save',
          style: 'default',
          onPress: handleNothingPress,
        },
      ],
      { cancelable: true }
    );
  };

  const handleNothingPress = async () => {
    await Haptics.selectionAsync();
    const emptyList: string[] = []; 
    await saveDataAndNavigate(emptyList, '');
  };

  const handleContinue = async () => {
    if (isSaving) return;
    await Haptics.selectionAsync();
    
    const currentList = Array.from(selected) as string[];
    const currentOther = other.trim();
    
    await saveDataAndNavigate(currentList, currentOther);
  };

  if (loading) {
    return (
      <View style={[styles.screen, styles.container]}>
        <ActivityIndicator size="large" color={ACCENT} />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Health Conditions' }} />
      <View style={styles.screen}>
        <ScrollView
          contentContainerStyle={[
            styles.container,
            { paddingTop: insets.top + 8 },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <Text style={styles.title}>Select Health Conditions</Text>
            <Text style={styles.subtitle}>
              Choose any health issues that may affect your nutrition.
            </Text>

            <View style={styles.searchRow}>
              <Ionicons name="search" size={16} color="#64748B" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search conditions..."
                placeholderTextColor="#9AA0A6"
                value={query}
                onChangeText={setQuery}
              />
            </View>

            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={[styles.pillButton, styles.pillPrimary]}
                activeOpacity={0.9}
                onPress={confirmNothing}
                disabled={isSaving}
              >
                <Ionicons name="checkmark-done" size={16} color="#fff" />
                <Text style={styles.pillPrimaryText}>Nothing</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.pillButton}
                onPress={handleClearAll}
                activeOpacity={0.9}
                disabled={isSaving}
              >
                <Ionicons name="close-circle-outline" size={16} color="#111827" />
                <Text style={styles.pillButtonText}>Clear All</Text>
              </TouchableOpacity>

              <View style={styles.counterPill}>
                <Ionicons name="list-circle-outline" size={16} color="#0F172A" />
                <Text style={styles.counterPillText}>
                  Selected: {selected.size + (other.trim() ? 1 : 0)}
                </Text>
              </View>
            </View>

            <View style={styles.chipsWrap}>
              {filtered.map((item) => {
                const isOn = selected.has(item);
                return (
                  <TouchableOpacity
                    key={item}
                    style={[styles.chip, isOn ? styles.chipOn : styles.chipOff]}
                    onPress={() => handleToggle(item)}
                    activeOpacity={0.9}
                    disabled={isSaving}
                  >
                    <Text style={[styles.chipText, isOn ? styles.chipTextOn : styles.chipTextOff]}>
                      {item}
                    </Text>
                    <Ionicons
                      name={isOn ? 'checkmark-circle' : 'ellipse-outline'}
                      size={18}
                      color={isOn ? '#fff' : '#64748B'}
                      style={{ marginLeft: 6 }}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Other (free text)</Text>
              <TextInput
                placeholder="Type another condition..."
                placeholderTextColor="#9AA0A6"
                style={styles.input}
                value={other}
                onChangeText={setOther}
                maxLength={80}
                onBlur={() => setOther(other.trim())}
                editable={!isSaving}
              />
            </View>

            <TouchableOpacity
              style={[styles.cta, (!hasSelection || isSaving) && { opacity: 0.6 }]}
              onPress={handleContinue}
              disabled={!hasSelection || isSaving}
              activeOpacity={0.92}
            >
              {isSaving ? (
                <>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text style={[styles.ctaText, { marginLeft: 8 }]}>Saving Profile...</Text>
                </>
              ) : (
                <>
                  <Text style={styles.ctaText}>Finish & Save</Text>
                  <Ionicons name="checkmark-circle" size={20} color="#fff" style={{ marginLeft: 8 }} />
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F3F6FA' },
  container: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, paddingVertical: 24 },
  card: { width: '100%', maxWidth: CARD_MAX, backgroundColor: '#FFFFFF', borderRadius: 18, paddingHorizontal: 20, paddingVertical: 22, borderWidth: 1, borderColor: '#EEF2F7', ...Platform.select({ ios: { shadowColor: '#0F172A', shadowOpacity: 0.08, shadowRadius: 14, shadowOffset: { width: 0, height: 8 } }, android: { elevation: 5 } }) },
  title: { fontSize: 22, fontWeight: '800', color: '#0F172A', marginBottom: 6, textAlign: 'center' },
  subtitle: { fontSize: 13, color: '#6B7280', marginBottom: 14, textAlign: 'center' },
  searchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 10, gap: 8 },
  searchInput: { flex: 1, color: '#111827', padding: 0, margin: 0 },
  actionsRow: { flexDirection: 'row', gap: 10, marginBottom: 12, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' },
  pillButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  pillPrimary: { backgroundColor: ACCENT, borderColor: ACCENT },
  pillButtonText: { marginLeft: 6, color: '#111827', fontWeight: '600' },
  pillPrimaryText: { marginLeft: 6, color: '#fff', fontWeight: '700' },
  counterPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E2E8F0', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8, gap: 6 },
  counterPillText: { color: '#0F172A', fontWeight: '700', fontSize: 12 },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingVertical: 6, marginBottom: 12, justifyContent: 'center' },
  chip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 999, borderWidth: 1 },
  chipOn: { backgroundColor: ACCENT, borderColor: ACCENT },
  chipOff: { backgroundColor: '#F8FAFC', borderColor: '#E5E7EB' },
  chipText: { fontSize: 14 },
  chipTextOn: { color: '#fff', fontWeight: '700' },
  chipTextOff: { color: '#111827', fontWeight: '600' },
  field: { marginTop: 4, marginBottom: 12 },
  label: { fontSize: 13, color: '#6B7280', marginBottom: 6 },
  input: { width: '100%', backgroundColor: '#F9FAFB', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 14, fontSize: 16, color: '#111827', borderWidth: 1, borderColor: '#E5E7EB' },
  cta: { width: '100%', backgroundColor: ACCENT, paddingVertical: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
  ctaText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700', letterSpacing: 0.3 },
});