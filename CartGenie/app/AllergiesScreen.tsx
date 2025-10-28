import React from 'react';
import { Stack, useRouter } from 'expo-router';
import { View, StyleSheet, Text, TextInput, TouchableOpacity, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAllergies } from '@/hooks/useAllergies';
import { saveAllergies } from '@/utils/allergiesStorage';


const ACCENT = '#0096c7';
const CARD_MAX = 520;

const ALLERGENS = [
  'Cereals containing gluten','Crustaceans','Eggs','Fish','Peanuts','Soybeans',
  'Milk','Tree nuts','Celery','Mustard','Sesame seeds','Sulphur dioxide & sulphites',
  'Lupin','Molluscs',
];

export default function AllergiesScreen() {
  const router = useRouter();
  const {
    loading, selected, other, setOther,
    toggle, clearAll,
    selectionPreview, hasSelection,
  } = useAllergies(ALLERGENS);
  
  const handleNothingPress = async () => {
    // אין אלרגיות: נשמור ריק וממשיכים
    await saveAllergies({ selected: [], other: '' });
    router.push('/bloodTestUploadScreen');
  };
  return (
    <>
      <Stack.Screen options={{ title: 'Allergies' }} />
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Select Allergies</Text>
          <Text style={styles.subtitle}>
            You can select more than one option. This will help us tailor food recommendations.
          </Text>

          {/* Quick actions */}
          <View style={styles.actionsRow}>
          <TouchableOpacity
              style={[styles.pillButton, styles.pillPrimary]}
              activeOpacity={0.9}
              onPress={handleNothingPress}
              disabled={loading}
            >
              <Ionicons name="checkmark-done" size={16} color="#fff" />
              <Text style={styles.pillPrimaryText}>Nothing</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.pillButton} onPress={clearAll} activeOpacity={0.9} disabled={loading}>
              <Ionicons name="close-circle-outline" size={16} color="#111827" />
              <Text style={styles.pillButtonText}>Clear All</Text>
            </TouchableOpacity>
          </View>

          {/* Chips list */}
          <ScrollView contentContainerStyle={styles.chipsWrap} showsVerticalScrollIndicator={false}>
            {ALLERGENS.map((item) => {
              const isOn = selected.has(item);
              return (
                <TouchableOpacity
                  key={item}
                  onPress={() => toggle(item)}
                  activeOpacity={0.9}
                  style={[styles.chip, isOn ? styles.chipOn : styles.chipOff]}
                  disabled={loading}
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
          </ScrollView>

          {/* "Other" field */}
          <View style={styles.field}>
            <Text style={styles.label}>Other (not listed)</Text>
            <TextInput
              placeholder="Type another allergy..."
              placeholderTextColor="#9AA0A6"
              style={styles.input}
              value={other}
              onChangeText={setOther}
              editable={!loading}
            />
          </View>

          {/* Selection summary */}
          {selectionPreview.length > 0 && (
            <View style={styles.summaryBox}>
              <Ionicons name="alert-circle-outline" size={16} color="#64748B" />
              <Text style={styles.summaryText} numberOfLines={2}>
                Selected: {selectionPreview.join(', ')}
              </Text>
            </View>
          )}

          {/* Continue */}
          <TouchableOpacity
            style={[styles.cta, !hasSelection && { opacity: 0.6 }]}
            onPress={() => router.push('/bloodTestUploadScreen')}
            activeOpacity={0.92}
            disabled={!hasSelection || loading}
          >
            <Text style={styles.ctaText}>Continue</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
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
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 14,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
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
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingVertical: 6,
    marginBottom: 12,
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
});
