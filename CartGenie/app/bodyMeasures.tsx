import React, { useMemo, useState, useEffect } from 'react';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// final (DO NOT CHANGE)
const ACCENT = '#0096c7';
const CARD_MAX = 520;

// Ranges (edit if needed)
const WEIGHT_MIN = 30;
const WEIGHT_MAX = 300;
const HEIGHT_MIN = 100;
const HEIGHT_MAX = 250;
const WAIST_MIN  = 40;
const WAIST_MAX  = 200;

type Errors = {
  weight?: string;
  height?: string;
  waist?: string;
};

function sanitizeNumber(input: string, allowDecimal = true) {
  let s = input.replace(',', '.').replace(/[^0-9.]/g, '');
  if (!allowDecimal) {
    s = s.replace(/\./g, '');
  } else {
    const firstDot = s.indexOf('.');
    if (firstDot !== -1) {
      s = s.slice(0, firstDot + 1) + s.slice(firstDot + 1).replace(/\./g, '');
    }
  }
  return s;
}

function getBmiInfo(bmiStr: string) {
  const bmi = parseFloat(bmiStr);
  if (!isFinite(bmi)) return { label: '—', color: '#6B7280' };

  if (bmi < 18.5)  return { label: 'Underweight', color: '#ef4444' };    // red
  if (bmi < 25)    return { label: 'Normal',      color: '#22c55e' };    // green
  if (bmi < 30)    return { label: 'Overweight',  color: '#f59e0b' };    // amber
  return              { label: 'Obesity',      color: '#f43f5e' };       // rose
}

export default function BodyMeasures() {
  const router = useRouter();
  
  const params = useLocalSearchParams();
  const {
    username,
    firstName,
    lastName,
    birthDate,
    ageYears,
    sex,
  } = params;

  useEffect(() => {
    console.log('Personal details received:');
    console.log('Username:', username);
    console.log('First Name:', firstName);
    console.log('Last Name:', lastName);
    console.log('Birth Date:', birthDate);
    console.log('Age:', ageYears);
    console.log('Sex:', sex);
  }, [username, firstName, lastName, birthDate, ageYears, sex]);

  const [weight, setWeight] = useState<string>(''); // kg
  const [height, setHeight] = useState<string>(''); // cm
  const [waist,  setWaist]  = useState<string>(''); // cm
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);

  // --- Live BMI ---
  const bmi = useMemo(() => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    if (!isFinite(w) || !isFinite(h) || h <= 0) return '';
    if (w < WEIGHT_MIN || w > WEIGHT_MAX) return '';
    if (h < HEIGHT_MIN || h > HEIGHT_MAX) return '';
    const m = h / 100;
    return (w / (m * m)).toFixed(1);
  }, [weight, height]);

  const bmiInfo = useMemo(() => getBmiInfo(bmi), [bmi]);

  // BMI info popup
  const showBmiInfo = () => {
    Alert.alert(
      'BMI categories',
      [
        '• Underweight: < 18.5',
        '• Normal: 18.5 – 24.9',
        '• Overweight: 25.0 – 29.9',
        '• Obesity: ≥ 30.0',
        '',
        'Formula: BMI = weight(kg) / height(m)^2',
      ].join('\n'),
      [{ text: 'OK' }],
      { cancelable: true }
    );
  };

  // --- Live field validation while typing ---
  const validateWeightLive = (val: string) => {
    if (!val) return 'Weight is required';
    const n = parseFloat(val);
    if (!isFinite(n)) return 'Enter a valid number';
    if (n < WEIGHT_MIN || n > WEIGHT_MAX) return `Must be ${WEIGHT_MIN}–${WEIGHT_MAX} kg`;
    return undefined;
  };
  const validateHeightLive = (val: string) => {
    if (!val) return 'Height is required';
    const n = parseFloat(val);
    if (!isFinite(n)) return 'Enter a valid number';
    if (n < HEIGHT_MIN || n > HEIGHT_MAX) return `Must be ${HEIGHT_MIN}–${HEIGHT_MAX} cm`;
    return undefined;
  };
  const validateWaistLive = (val: string) => {
    if (!val) return 'Waist size is required';
    const n = parseFloat(val);
    if (!isFinite(n)) return 'Enter a valid number';
    if (n < WAIST_MIN || n > WAIST_MAX) return `Must be ${WAIST_MIN}–${WAIST_MAX} cm`;
    return undefined;
  };

  const onChangeWeight = (t: string) => {
    const v = sanitizeNumber(t, true);
    setWeight(v);
    setErrors(prev => ({ ...prev, weight: v ? validateWeightLive(v) : 'Weight is required' }));
  };
  const onChangeHeight = (t: string) => {
    const v = sanitizeNumber(t, true);
    setHeight(v);
    setErrors(prev => ({ ...prev, height: v ? validateHeightLive(v) : 'Height is required' }));
  };
  const onChangeWaist = (t: string) => {
    const v = sanitizeNumber(t, true);
    setWaist(v);
    setErrors(prev => ({ ...prev, waist: v ? validateWaistLive(v) : 'Waist size is required' }));
  };

  const validateSubmit = () => {
    const e: Errors = {
      weight: validateWeightLive(weight),
      height: validateHeightLive(height),
      waist:  validateWaistLive(waist),
    };
    setErrors(e);
    return Object.values(e).every(v => v === undefined);
  };

  const onContinue = async () => {
    if (loading) return;
    if (!validateSubmit()) return;

    try {
      setLoading(true);
      await new Promise(r => setTimeout(r, 700));
      Keyboard.dismiss();
      
      router.push({
        pathname: '/AllergiesScreen',
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
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const isDisabled =
    loading ||
    !weight || !!errors.weight ||
    !height || !!errors.height ||
    !waist  || !!errors.waist;

  return (
    <>
      <Stack.Screen options={{ title: 'Body Measures' }} />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.screen}>
          <ScrollView
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.card}>
              <Text style={styles.title}>Body Measures</Text>
              <Text style={styles.des}>
                For better analysis, please provide your physical parameters. Be as accurate as possible.
              </Text>

              {/* הצגת מידע על המשתמש */}
              {username && firstName && (
                <View style={styles.userInfoBanner}>
                  <Ionicons name="person-circle-outline" size={20} color={ACCENT} />
                  <Text style={styles.userInfoText}>
                    @{username} • {firstName} {lastName} • {ageYears} years
                  </Text>
                </View>
              )}

              {/* Weight */}
              <View style={styles.field}>
                <Text style={styles.label}>Weight</Text>
                <View style={[
                  styles.inputRow,
                  errors.weight && { borderColor: '#ef4444' },
                ]}>
                  <TextInput
                    placeholder={`Enter Weight (${WEIGHT_MIN}-${WEIGHT_MAX})`}
                    style={styles.input}
                    placeholderTextColor="#9AA0A6"
                    keyboardType="numeric"
                    inputMode="decimal"
                    value={weight}
                    onChangeText={onChangeWeight}
                    returnKeyType="done"
                    blurOnSubmit
                    onSubmitEditing={() => Keyboard.dismiss()}
                  />
                  <Text style={styles.suffix}>KG</Text>
                </View>
                {!!errors.weight && <Text style={styles.errorText}>{errors.weight}</Text>}
              </View>

              {/* Height */}
              <View style={styles.field}>
                <Text style={styles.label}>Height</Text>
                <View style={[
                  styles.inputRow,
                  errors.height && { borderColor: '#ef4444' },
                ]}>
                  <TextInput
                    placeholder={`Enter Height (${HEIGHT_MIN}-${HEIGHT_MAX})`}
                    style={styles.input}
                    placeholderTextColor="#9AA0A6"
                    keyboardType="numeric"
                    inputMode="decimal"
                    value={height}
                    onChangeText={onChangeHeight}
                    returnKeyType="done"
                    blurOnSubmit
                    onSubmitEditing={() => Keyboard.dismiss()}
                  />
                  <Text style={styles.suffix}>CM</Text>
                </View>
                {!!errors.height && <Text style={styles.errorText}>{errors.height}</Text>}
              </View>

              {/* BMI (read-only with color & label) */}
              <View style={styles.field}>
                <Text style={styles.label}>BMI</Text>
                <View style={styles.inputBlocked}>
                  <TextInput
                    placeholder="Calculated BMI"
                    style={[{ flex: 1, fontWeight: '700' }, { color: bmi ? bmiInfo.color : '#111827' }]}
                    placeholderTextColor="#9AA0A6"
                    editable={false}
                    value={bmi}
                  />
                  <View style={[styles.bmiBadge, { backgroundColor: `${bmiInfo.color}22`, borderColor: bmiInfo.color }]}>
                    <Text style={[styles.bmiBadgeText, { color: bmiInfo.color }]}>
                      {bmi ? bmiInfo.label : '—'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={showBmiInfo}
                    accessibilityRole="button"
                    accessibilityLabel="Show BMI categories"
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="information-circle-outline" size={20} color="#94A3B8" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Waist */}
              <View style={styles.field}>
                <Text style={styles.label}>Waist Size</Text>
                <View style={[
                  styles.inputRow,
                  errors.waist && { borderColor: '#ef4444' },
                ]}>
                  <TextInput
                    placeholder={`Waist Size (${WAIST_MIN}-${WAIST_MAX})`}
                    style={styles.input}
                    placeholderTextColor="#9AA0A6"
                    keyboardType="numeric"
                    inputMode="decimal"
                    value={waist}
                    onChangeText={onChangeWaist}
                    returnKeyType="done"
                    blurOnSubmit
                    onSubmitEditing={() => Keyboard.dismiss()}
                  />
                  <Text style={styles.suffix}>CM</Text>
                </View>
                {!!errors.waist && <Text style={styles.errorText}>{errors.waist}</Text>}
              </View>

              {/* Continue */}
              <TouchableOpacity
                style={[styles.ContinueButton, isDisabled && { opacity: 0.5 }]}
                onPress={onContinue}
                activeOpacity={0.9}
                disabled={isDisabled}
                accessibilityState={{ disabled: isDisabled, busy: loading }}
              >
                {loading ? (
                  <>
                    <ActivityIndicator size="small" color="#fff" />
                    <Text style={[styles.ContinueButtonText, { marginLeft: 8 }]}>Saving…</Text>
                  </>
                ) : (
                  <Text style={styles.ContinueButtonText}>Continue</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
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
    paddingVertical: 24,
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
    marginBottom: 22,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  des: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 6,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  userInfoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${ACCENT}15`,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 12,
    marginBottom: 16,
    gap: 8,
  },
  userInfoText: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '600',
  },
  field: { marginBottom: 16 },
  label: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  inputRow: {
    width: '100%',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    padding: 0,
    margin: 0,
  },
  suffix: {
    marginLeft: 10,
    color: '#6B7280',
    fontSize: 14,
  },
  inputBlocked: {
    width: '100%',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bmiBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  bmiBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  ContinueButton: {
    width: '100%',
    backgroundColor: ACCENT,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#0369A1',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.22,
        shadowRadius: 8,
      },
      android: { elevation: 3 },
    }),
    flexDirection: 'row',
    justifyContent: 'center',
  },
  ContinueButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  errorText: {
    marginTop: 6,
    color: '#ef4444',
    fontSize: 12,
  },
});