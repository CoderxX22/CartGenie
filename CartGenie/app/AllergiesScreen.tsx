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
  Modal,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAllergies } from '@/hooks/useAllergies';
import { saveAllergies } from '@/utils/allergiesStorage';

const ACCENT = '#0096c7';
const CARD_MAX = 520;

const ALLERGENS = [
  'Cereals containing gluten', 'Crustaceans', 'Eggs', 'Fish', 'Peanuts', 'Soybeans',
  'Milk', 'Tree nuts', 'Celery', 'Mustard', 'Sesame seeds', 'Sulphur dioxide & sulphites',
  'Lupin', 'Molluscs',
];

// Simple debounce effect
function useDebouncedEffect(fn: () => void, deps: any[], delay = 400) {
  React.useEffect(() => {
    const id = setTimeout(fn, delay);
    return () => clearTimeout(id);
  }, deps);
}

type Severity = 'mild' | 'moderate' | 'severe';
const SEVERITY_COLORS: Record<Severity, string> = {
  mild: '#22c55e',
  moderate: '#f59e0b',
  severe: '#ef4444',
};

const Chip = React.memo(function Chip({
  label,
  isOn,
  disabled,
  severity,
  onToggle,
  onShowSeverity,
}: {
  label: string;
  isOn: boolean;
  disabled?: boolean;
  severity?: Severity;
  onToggle: () => void;
  onShowSeverity: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onToggle}
      onLongPress={onShowSeverity}
      delayLongPress={180}
      activeOpacity={0.9}
      style={[styles.chip, isOn ? styles.chipOn : styles.chipOff]}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ selected: isOn }}
      accessibilityLabel={label}
      accessibilityHint={isOn ? 'Double tap to change severity' : 'Double tap to select'}
    >
      <Text style={[styles.chipText, isOn ? styles.chipTextOn : styles.chipTextOff]}>
        {label}
      </Text>

      {isOn && (
        <Pressable
          onPress={onShowSeverity}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel={`Change severity for ${label}`}
          style={[
            styles.severityBadge,
            { borderColor: SEVERITY_COLORS[severity || 'moderate'], backgroundColor: `${SEVERITY_COLORS[severity || 'moderate']}22` },
          ]}
        >
          <Text style={[styles.severityBadgeText, { color: SEVERITY_COLORS[severity || 'moderate'] }]}>
            {severity === 'mild' ? 'Mild' : severity === 'severe' ? 'Severe' : 'Moderate'}
          </Text>
        </Pressable>
      )}

      <Ionicons
        name={isOn ? 'checkmark-circle' : 'ellipse-outline'}
        size={18}
        color={isOn ? '#fff' : '#64748B'}
        style={{ marginLeft: 6 }}
      />
    </TouchableOpacity>
  );
});

export default function AllergiesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // 📥 קליטת כל הנתונים מהמסכים הקודמים
  const params = useLocalSearchParams();
  const {
    username,
    firstName,
    lastName,
    birthDate,
    ageYears,
    sex,
    // מהמסך השני - Body Measures
    weight,
    height,
    waist,
    bmi,
  } = params;

  // הצגת הנתונים שהתקבלו (לדיבאג)
  React.useEffect(() => {
    console.log('🎯 All data received in Allergies Screen:');
    console.log('=== Personal Info ===');
    console.log('Name:', firstName, lastName);
    console.log('Age:', ageYears);
    console.log('Sex:', sex);
    console.log('=== Body Measures ===');
    console.log('Weight:', weight, 'kg');
    console.log('Height:', height, 'cm');
    console.log('Waist:', waist, 'cm');
    console.log('BMI:', bmi);
  }, [firstName, lastName, ageYears, sex, weight, height, waist, bmi]);

  const {
    loading, selected, other, setOther,
    toggle, clearAll,
    selectionPreview,
  } = useAllergies(ALLERGENS);

  // search
  const [query, setQuery] = React.useState('');
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ALLERGENS;
    return ALLERGENS.filter(a => a.toLowerCase().includes(q));
  }, [query]);

  // severity map: allergen -> severity
  const [severity, setSeverity] = React.useState<Record<string, Severity>>({});
  const [severityModal, setSeverityModal] = React.useState<{ visible: boolean; item?: string }>({ visible: false });

  // has selection (selected OR other text)
  const actuallyHasSelection = selected.size > 0 || other.trim().length > 0;

  const handleNothingPress = async () => {
    await saveAllergies({ selected: [], other: '', severity: {} });
    
    // 📤 העברת כל הנתונים למסך הבא
    router.push({
      pathname: '/bloodTestUploadScreen',
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
        // נתונים מהמסך הזה (ללא אלרגיות)
        allergies: JSON.stringify([]),
        otherAllergies: '',
        allergySeverity: JSON.stringify({}),
      },
    });
  };

  const confirmNothing = () => {
    Alert.alert(
      'No allergies?',
      'This will clear your selection and continue.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Continue', style: 'destructive', onPress: handleNothingPress },
      ],
      { cancelable: true }
    );
  };

  const onToggle = React.useCallback(async (name: string) => {
    const isSelected = selected.has(name);
    toggle(name);

    // Haptics
    try { await Haptics.selectionAsync(); } catch {}

    // default severity on select; cleanup on deselect
    setSeverity(prev => {
      const next = { ...prev };
      if (!isSelected) {
        if (!next[name]) next[name] = 'moderate';
      } else {
        delete next[name];
      }
      return next;
    });
  }, [toggle, selected]);

  const openSeverityFor = (name: string) => {
    if (!selected.has(name)) return; // ignore for unselected
    setSeverityModal({ visible: true, item: name });
  };

  const chooseSeverity = (level: Severity) => {
    const item = severityModal.item;
    if (!item) return;
    setSeverity(prev => ({ ...prev, [item]: level }));
    setSeverityModal({ visible: false });
  };

  // autosave (debounced) — includes severity
  useDebouncedEffect(() => {
    saveAllergies({
      selected: Array.from(selected),
      other: other.trim(),
      severity, // extra field; safe if storage ignores it
    });
  }, [selected, other, severity], 400);

  // פונקציית המשך עם כל הנתונים
  const handleContinue = async () => {
    // 📤 העברת כל הנתונים למסך הבא
    router.push({
      pathname: '/bloodTestUploadScreen',
      params: {
        // נתונים מהמסכים הקודמים
        firstName,
        lastName,
        birthDate,
        ageYears,
        sex,
        weight,
        height,
        waist,
        bmi,
        // נתונים חדשים מהמסך הזה
        allergies: JSON.stringify(Array.from(selected)),
        otherAllergies: other.trim(),
        allergySeverity: JSON.stringify(severity),
      },
    });
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Allergies' }} />
      <View style={styles.screen}>
        <ScrollView
          contentContainerStyle={[styles.container, { paddingTop: insets.top + 8 }]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <Text style={styles.title}>Select Allergies</Text>
            <Text style={styles.subtitle}>
              You can select multiple options and set severity (mild / moderate / severe) for each.
            </Text>

            {/* הצגת מידע על המשתמש אם קיים */}
            {firstName && (
              <View style={styles.userInfoBanner}>
                <Ionicons name="person-circle-outline" size={20} color={ACCENT} />
                <Text style={styles.userInfoText}>
                  {firstName} {lastName} • {ageYears} years • BMI: {bmi}
                </Text>
              </View>
            )}

            {/* Search */}
            <View style={styles.searchRow}>
              <Ionicons name="search" size={16} color="#64748B" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search allergens..."
                placeholderTextColor="#9AA0A6"
                value={query}
                onChangeText={setQuery}
                returnKeyType="search"
                accessibilityLabel="Search allergens"
              />
            </View>

            {/* Quick actions */}
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={[styles.pillButton, styles.pillPrimary]}
                activeOpacity={0.9}
                onPress={confirmNothing}
                disabled={loading}
                accessibilityLabel="I have no allergies"
                accessibilityHint="Clears selection and continues"
              >
                <Ionicons name="checkmark-done" size={16} color="#fff" />
                <Text style={styles.pillPrimaryText}>Nothing</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.pillButton}
                onPress={() => { clearAll(); setSeverity({}); }}
                activeOpacity={0.9}
                disabled={loading}
                accessibilityLabel="Clear all selected allergens"
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

            {/* Chips list */}
            <View style={styles.chipsWrap}>
              {filtered.map((item) => {
                const isOn = selected.has(item);
                return (
                  <Chip
                    key={item}
                    label={item}
                    isOn={isOn}
                    severity={isOn ? severity[item] || 'moderate' : undefined}
                    onToggle={() => onToggle(item)}
                    onShowSeverity={() => openSeverityFor(item)}
                    disabled={loading}
                  />
                );
              })}
            </View>

            {/* "Other" field */}
            <View style={styles.field}>
              <Text style={styles.label}>Other (free text)</Text>
              <TextInput
                placeholder="Type another allergy..."
                placeholderTextColor="#9AA0A6"
                style={styles.input}
                value={other}
                onChangeText={setOther}
                editable={!loading}
                maxLength={80}
                onBlur={() => setOther(other.trim())}
                accessibilityLabel="Other allergy text input"
              />
            </View>

            {/* Selection summary */}
            {(selectionPreview.length > 0 || other.trim()) && (
              <View style={styles.summaryBox}>
                <Ionicons name="alert-circle-outline" size={16} color="#64748B" />
                <Text style={styles.summaryText} numberOfLines={3}>
                  Selected: {[
                    ...selectionPreview.map(n => {
                      const sev = severity[n];
                      return sev ? `${n} (${sev})` : n;
                    }),
                    ...(other.trim() ? [other.trim()] : []),
                  ].join(', ')}
                </Text>
              </View>
            )}

            {/* Continue */}
            <TouchableOpacity
              style={[styles.cta, !actuallyHasSelection && { opacity: 0.6 }]}
              onPress={handleContinue}
              activeOpacity={0.92}
              disabled={!actuallyHasSelection || loading}
              accessibilityRole="button"
              accessibilityState={{ disabled: !actuallyHasSelection || loading }}
            >
              <Text style={styles.ctaText}>Continue</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      {/* Severity Bottom Sheet */}
      <Modal
        visible={severityModal.visible}
        transparent
        animationType="slide"
        onRequestClose={() => setSeverityModal({ visible: false })}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>
              Severity for {severityModal.item}
            </Text>

            {(['mild', 'moderate', 'severe'] as Severity[]).map((lvl) => (
              <TouchableOpacity
                key={lvl}
                style={styles.sevRow}
                onPress={() => chooseSeverity(lvl)}
                activeOpacity={0.9}
              >
                <View style={[styles.sevDot, { backgroundColor: SEVERITY_COLORS[lvl] }]} />
                <Text style={styles.sevText}>
                  {lvl === 'mild' ? 'Mild' : lvl === 'severe' ? 'Severe' : 'Moderate'}
                </Text>
                {severityModal.item && severity[severityModal.item] === lvl && (
                  <Ionicons name="checkmark" size={18} color="#0F172A" style={{ marginLeft: 'auto' }} />
                )}
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSeverityModal({ visible: false })}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F3F6FA',
  },
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
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 14,
    textAlign: 'center',
  },
  userInfoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${ACCENT}15`,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 14,
    gap: 8,
  },
  userInfoText: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '600',
  },

  // search
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
  searchInput: {
    flex: 1,
    color: '#111827',
    padding: 0,
    margin: 0,
  },

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
  pillButtonText: {
    marginLeft: 6,
    color: '#111827',
    fontWeight: '600',
    fontSize: 13,
  },
  pillPrimary: {
    backgroundColor: ACCENT,
    borderColor: ACCENT,
  },
  pillPrimaryText: {
    marginLeft: 6,
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  counterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E2E8F0',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  counterPillText: {
    color: '#0F172A',
    fontWeight: '700',
    fontSize: 12,
  },

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
  chipOn: {
    backgroundColor: ACCENT,
    borderColor: ACCENT,
  },
  chipOff: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E5E7EB',
  },
  chipText: {
    fontSize: 14,
  },
  chipTextOn: {
    color: '#fff',
    fontWeight: '700',
  },
  chipTextOff: {
    color: '#111827',
    fontWeight: '600',
  },
  severityBadge: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
  },
  severityBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },

  field: {
    marginTop: 4,
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 6,
    letterSpacing: 0.2,
  },
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

  summaryBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    gap: 8,
  },
  summaryText: {
    flex: 1,
    fontSize: 13,
    color: '#334155',
  },

  cta: {
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

  // bottom sheet
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(17, 24, 39, 0.35)',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    paddingTop: 8,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modalHandle: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#D1D5DB',
    marginBottom: 10,
  },
  modalTitle: {
    fontWeight: '800',
    fontSize: 16,
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 8,
  },
  sevRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 10,
  },
  sevDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  sevText: {
    fontSize: 15,
    color: '#0F172A',
  },
  closeButton: {
    alignSelf: 'center',
    marginTop: 10,
    backgroundColor: ACCENT,
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: 10,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});