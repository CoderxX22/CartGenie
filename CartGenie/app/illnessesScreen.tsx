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
import { useAppColors, AppColors } from '@/components/appThemeProvider';

const ACCENT = '#0096c7';
const CARD_MAX = 520;

// Static list of supported illnesses / conditions.
// NOTE: rendering order on screen is alphabetical (see sortedIllnesses below).
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
  const col = useAppColors();

  // All params passed from previous steps (login + personal details + body measures).
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

  // Backend currently treats these fields as required for a "full" profile.
  const hasBaseIdentity =
    !!firstName && !!lastName && !!birthDate && !!sex;

  // Debug: preview incoming params in Metro console.
  console.log('IllnessesScreen – received params:', params);

  // Illnesses state is managed in a dedicated hook:
  // - selected: Set<string> of chosen illnesses
  // - other: free-text illness
  // - hasSelection: whether user provided any condition (chip or free text)
  // - loading: initial loading state for this hook (e.g., restoring previous selection)
  const {
    selected,
    other,
    setOther,
    toggle,
    clearAll,
    hasSelection,
    loading,
  } = useIllnesses(ILLNESSES);

  const [query, setQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const styles = useMemo(() => makeStyles(col), [col]);

  // Alphabetically sorted illnesses for display (independent of hook internals).
  const sortedIllnesses = useMemo(
    () => [...ILLNESSES].sort((a, b) => a.localeCompare(b)),
    [],
  );

  /**
   * Filter illnesses according to the search query (case-insensitive).
   * The base list is already alphabetical.
   */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sortedIllnesses;
    return sortedIllnesses.filter((a) => a.toLowerCase().includes(q));
  }, [query, sortedIllnesses]);

  /**
   * Toggle the selected state of a specific illness item,
   * with light haptic feedback for a more tactile UX.
   */
  const handleToggle = (item: string) => {
    toggle(item);
    Haptics.selectionAsync();
  };

  /**
   * Clear all current illnesses and provide a short success haptic feedback.
   */
  const handleClearAll = () => {
    clearAll();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  /**
   * Soft profile save:
   * - builds payload with illnesses and any available profile fields
   * - sends it to backend only if core identity fields exist
   * - NEVER blocks navigation: errors are logged, not re-thrown
   */
  const saveProfileSoft = async (
    illnessesList: string[],
    otherText: string,
  ) => {
    try {
      const payload: any = {
        illnesses: illnessesList,
        otherIllnesses: otherText,
      };

      // Identity and demographic information
      if (username) payload.username = username;
      if (firstName) payload.firstName = firstName;
      if (lastName) payload.lastName = lastName;
      if (birthDate) payload.birthDate = birthDate;
      if (sex) payload.sex = sex;
      if (ageYears) payload.ageYears = String(ageYears);

      // Body measures (kept exactly as your original implementation)
      if (weight) payload.weight = String(weight);
      if (height) payload.height = String(height);
      if (waist) payload.waist = String(waist);
      if (bmi) payload.bmi = String(bmi);
      if (whtr) payload.whtr = String(whtr);

      if (hasBaseIdentity) {
        // Console preview of what is being sent to backend (do not remove).
        console.log('IllnessesScreen – payload for backend:', payload);

        await UserDataService.saveUserProfile(payload);
        console.log('IllnessesScreen – profile saved successfully');
      } else {
        // We intentionally skip calling backend when core identity is missing.
        console.log(
          'IllnessesScreen – skipping DB save (missing base identity fields)',
          {
            firstName,
            lastName,
            birthDate,
            sex,
            partialPayload: payload,
          },
        );
      }
    } catch (error: any) {
      // Soft error: log to console, but do not block navigation.
      console.error('IllnessesScreen – save error:', error);
    }
  };

  /**
   * Ask the user to confirm they really have "Nothing"
   * to avoid accidental one-tap confirmation.
   */
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
      { cancelable: true },
    );
  };

  /**
   * When user confirms "Nothing":
   * - we save an empty illnesses list (soft, non-blocking)
   * - then always navigate to home
   */
  const handleNothingPress = async () => {
    await Haptics.selectionAsync();

    const emptyList: string[] = [];

    setIsSaving(true);
    await saveProfileSoft(emptyList, '');

    router.push({
      pathname: '/(tabs)/homePage',
      params: {
        ...(params as any),
        illnesses: JSON.stringify(emptyList),
        otherIllnesses: '',
      },
    });

    setIsSaving(false);
  };

  /**
   * Main "Finish & Save" action:
   * - collects current selected illnesses + "other" free text
   * - tries to save them to backend (soft)
   * - always navigates to home, even if backend rejects
   */
  const handleContinue = async () => {
    if (isSaving) return;
    await Haptics.selectionAsync();

    const currentList = Array.from(selected) as string[];
    const currentOther = other.trim();

    setIsSaving(true);
    await saveProfileSoft(currentList, currentOther);

    router.push({
      pathname: '/(tabs)/homePage',
      params: {
        ...(params as any),
        illnesses: JSON.stringify(currentList),
        otherIllnesses: currentOther,
      },
    });

    setIsSaving(false);
  };

  if (loading) {
    return (
      <View style={[styles.screen, styles.container]}>
        <ActivityIndicator size="large" color={col.accent ?? ACCENT} />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Health Conditions',
          headerShown: false,
        }}
      />
      <View className="screen" style={styles.screen}>
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

            {/* Search field for quickly filtering the illnesses list */}
            <View style={styles.searchRow}>
              <Ionicons name="search" size={16} color={col.subtitle} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search conditions..."
                placeholderTextColor={col.subtitle}
                value={query}
                onChangeText={setQuery}
              />
            </View>

            {/* Quick actions row: Nothing, Clear All, and selected counter */}
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={[
                  styles.pillButton,
                  styles.pillPrimary,
                  isSaving && { opacity: 0.6 },
                ]}
                activeOpacity={0.9}
                onPress={confirmNothing}
                disabled={isSaving}
              >
                <Ionicons name="checkmark-done" size={16} color="#fff" />
                <Text style={styles.pillPrimaryText}>Nothing</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.pillButton, isSaving && { opacity: 0.6 }]}
                onPress={handleClearAll}
                activeOpacity={0.9}
                disabled={isSaving}
              >
                <Ionicons
                  name="close-circle-outline"
                  size={16}
                  color={col.text}
                />
                <Text style={styles.pillButtonText}>Clear All</Text>
              </TouchableOpacity>

              <View style={styles.counterPill}>
                <Ionicons
                  name="list-circle-outline"
                  size={16}
                  color={col.text}
                />
                <Text style={styles.counterPillText}>
                  Selected: {selected.size + (other.trim() ? 1 : 0)}
                </Text>
              </View>
            </View>

            {/* Illnesses rendered as a vertical multi-select list (alphabetical) */}
            <View style={styles.illnessList}>
              {filtered.map((item) => {
                const isOn = selected.has(item);
                return (
                  <TouchableOpacity
                    key={item}
                    style={[
                      styles.illnessRow,
                      isOn && styles.illnessRowOn,
                      isSaving && { opacity: 0.6 },
                    ]}
                    onPress={() => handleToggle(item)}
                    activeOpacity={0.9}
                    disabled={isSaving}
                  >
                    <View style={styles.illnessRowLeft}>
                      <Ionicons
                        name={isOn ? 'checkbox' : 'square-outline'}
                        size={20}
                        color={isOn ? col.accent ?? ACCENT : col.subtitle}
                      />
                      <Text
                        style={[
                          styles.illnessText,
                          isOn && styles.illnessTextOn,
                        ]}
                      >
                        {item}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Free-text field for any condition not covered by the list */}
            <View style={styles.field}>
              <Text style={styles.label}>Other (free text)</Text>
              <TextInput
                placeholder="Type another condition..."
                placeholderTextColor={col.subtitle}
                style={styles.input}
                value={other}
                onChangeText={setOther}
                maxLength={80}
                onBlur={() => setOther(other.trim())}
                editable={!isSaving}
              />
            </View>

            {/* Final CTA: finish onboarding and save the full profile (soft) */}
            <TouchableOpacity
              style={[
                styles.cta,
                (!hasSelection || isSaving) && { opacity: 0.6 },
              ]}
              onPress={handleContinue}
              disabled={!hasSelection || isSaving}
              activeOpacity={0.92}
            >
              {isSaving ? (
                <>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text style={[styles.ctaText, { marginLeft: 8 }]}>
                    Saving Profile...
                  </Text>
                </>
              ) : (
                <>
                  <Text style={styles.ctaText}>Finish & Save</Text>
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color="#fff"
                    style={{ marginLeft: 8 }}
                  />
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </>
  );
}

const makeStyles = (c: AppColors) =>
  StyleSheet.create({
    // Root background follows global theme (supports dark / light).
    screen: {
      flex: 1,
      backgroundColor: c.background,
    },
    // Centers the main card on screen, same pattern as other onboarding screens.
    container: {
      flexGrow: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 20,
      paddingVertical: 24,
    },
    // Main card wrapper with elevation / shadow.
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
      fontSize: 22,
      fontWeight: '800',
      color: c.text,
      marginBottom: 6,
      textAlign: 'center',
      letterSpacing: 0.2,
    },
    subtitle: {
      fontSize: 13,
      color: c.subtitle,
      marginBottom: 14,
      textAlign: 'center',
    },

    // Search bar for filtering illnesses
    searchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.inputBg,
      borderWidth: 1,
      borderColor: c.inputBorder,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
      marginBottom: 10,
      gap: 8,
    },
    searchInput: {
      flex: 1,
      color: c.text,
      padding: 0,
      margin: 0,
    },

    // Row with quick actions ("Nothing", "Clear All", and counter)
    actionsRow: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 12,
      alignItems: 'center',
      flexWrap: 'wrap',
      justifyContent: 'center',
    },
    pillButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.inputBg,
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: c.inputBorder,
    },
    pillPrimary: {
      backgroundColor: c.accent ?? ACCENT,
      borderColor: c.accent ?? ACCENT,
    },
    pillButtonText: {
      marginLeft: 6,
      color: c.text,
      fontWeight: '600',
    },
    pillPrimaryText: {
      marginLeft: 6,
      color: '#fff',
      fontWeight: '700',
    },
    counterPill: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.background,
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 8,
      gap: 6,
      borderWidth: 1,
      borderColor: c.inputBorder,
    },
    counterPillText: {
      color: c.text,
      fontWeight: '700',
      fontSize: 12,
    },

    // Illness list (vertical multi-select)
    illnessList: {
      marginBottom: 12,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.inputBorder,
      backgroundColor: c.inputBg,
      overflow: 'hidden',
    },
    illnessRow: {
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: c.inputBorder,
    },
    illnessRowOn: {
      backgroundColor: (c.accent ?? ACCENT) + '22', // light accent overlay
    },
    illnessRowLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    illnessText: {
      flex: 1,
      fontSize: 14,
      color: c.text,
    },
    illnessTextOn: {
      fontWeight: '700',
    },

    // "Other" free-text field
    field: {
      marginTop: 4,
      marginBottom: 12,
    },
    label: {
      fontSize: 13,
      color: c.subtitle,
      marginBottom: 6,
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

    // Main CTA button (Finish & Save)
    cta: {
      width: '100%',
      backgroundColor: c.accent ?? ACCENT,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      marginTop: 4,
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
    ctaText: {
      color: '#FFFFFF',
      fontSize: 17,
      fontWeight: '700',
      letterSpacing: 0.3,
    },
  });
