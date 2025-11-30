import React from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIllnesses } from '@/hooks/useIllnesses';

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

export default function IllnessesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();

  const {
    loading,
    selected,
    other,
    setOther,
    toggle,
    clearAll,
    selectionPreview,
    hasSelection,
  } = useIllnesses(ILLNESSES);

  const [query, setQuery] = React.useState('');
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ILLNESSES;
    return ILLNESSES.filter((a) => a.toLowerCase().includes(q));
  }, [query]);

  const confirmNothing = () => {
    Alert.alert(
      'No illnesses?',
      'This will clear your selection and continue.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          style: 'destructive',
          onPress: handleNothingPress,
        },
      ],
      { cancelable: true }
    );
  };

  // 👉 Теперь кнопка "Nothing" ведёт на HomePage
  const handleNothingPress = async () => {
    Haptics.selectionAsync();
    router.push({
      pathname: '/(tabs)/homePage',
      params: {
        ...params,
        illnesses: JSON.stringify([]),
        otherIllnesses: '',
      },
    });
  };

  // 👉 И кнопка "Continue" — тоже на HomePage
  const handleContinue = async () => {
    Haptics.selectionAsync();
    router.push({
      pathname: '/(tabs)/homePage',
      params: {
        ...params,
        illnesses: JSON.stringify(Array.from(selected)),
        otherIllnesses: other.trim(),
      },
    });
  };

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
                disabled={loading}
              >
                <Ionicons name="checkmark-done" size={16} color="#fff" />
                <Text style={styles.pillPrimaryText}>Nothing</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.pillButton}
                onPress={clearAll}
                activeOpacity={0.9}
                disabled={loading}
              >
                <Ionicons
                  name="close-circle-outline"
                  size={16}
                  color="#111827"
                />
                <Text style={styles.pillButtonText}>Clear All</Text>
              </TouchableOpacity>

              <View style={styles.counterPill}>
                <Ionicons
                  name="list-circle-outline"
                  size={16}
                  color="#0F172A"
                />
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
                    onPress={() => toggle(item)}
                    activeOpacity={0.9}
                    disabled={loading}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        isOn ? styles.chipTextOn : styles.chipTextOff,
                      ]}
                    >
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
                editable={!loading}
              />
            </View>

            <TouchableOpacity
              style={[styles.cta, !hasSelection && { opacity: 0.6 }]}
              onPress={handleContinue}
              disabled={!hasSelection || loading}
              activeOpacity={0.92}
            >
              <Text style={styles.ctaText}>Continue</Text>
              <Ionicons
                name="arrow-forward"
                size={20}
                color="#fff"
                style={{ marginLeft: 8 }}
              />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F3F6FA' },
  container: {
    flexGrow: 1,
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
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 14,
    textAlign: 'center',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    gap: 8,
  },
  searchInput: { flex: 1, color: '#111827', padding: 0, margin: 0 },
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
    backgroundColor: '#F1F5F9',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pillPrimary: { backgroundColor: ACCENT, borderColor: ACCENT },
  pillButtonText: { marginLeft: 6, color: '#111827', fontWeight: '600' },
  pillPrimaryText: { marginLeft: 6, color: '#fff', fontWeight: '700' },
  counterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E2E8F0',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  counterPillText: { color: '#0F172A', fontWeight: '700', fontSize: 12 },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingVertical: 6,
    marginBottom: 12,
    justifyContent: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipOn: { backgroundColor: ACCENT, borderColor: ACCENT },
  chipOff: { backgroundColor: '#F8FAFC', borderColor: '#E5E7EB' },
  chipText: { fontSize: 14 },
  chipTextOn: { color: '#fff', fontWeight: '700' },
  chipTextOff: { color: '#111827', fontWeight: '600' },
  field: { marginTop: 4, marginBottom: 12 },
  label: { fontSize: 13, color: '#6B7280', marginBottom: 6 },
  input: {
    width: '100%',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    fontSize: 16,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cta: {
    width: '100%',
    backgroundColor: ACCENT,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
