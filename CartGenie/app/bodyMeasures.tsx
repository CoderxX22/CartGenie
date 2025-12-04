import React, { useEffect } from 'react';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ACCENT = '#0096c7';
const CARD_MAX = 520;

export default function BodyMeasuresScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // 📥 קבלת הנתונים מהמסך הקודם (PersonalDetails)
  const params = useLocalSearchParams();
  const { username, firstName, lastName, birthDate, ageYears, sex } = params;

  useEffect(() => {
    // בדיקה שהנתונים עברו (לצורך דיבוג)
    console.log('📋 Data received from PersonalDetails:', { username, firstName, lastName });
  }, []);

  const [height, setHeight] = React.useState('');
  const [weight, setWeight] = React.useState('');
  const [waist, setWaist] = React.useState('');

  // BMI calculation
  const bmi = React.useMemo(() => {
    const h = parseFloat(height);
    const w = parseFloat(weight);
    if (!h || !w) return null;
    return w / Math.pow(h / 100, 2);
  }, [height, weight]);

  const bmiStatus = React.useMemo(() => {
    if (!bmi) return '';
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal weight';
    if (bmi < 30) return 'Overweight';
    return 'Obesity';
  }, [bmi]);

  // Waist-to-Height Ratio (WHtR)
  const whtr = React.useMemo(() => {
    const h = parseFloat(height);
    const wst = parseFloat(waist);
    if (!h || !wst) return null;
    return wst / h;
  }, [height, waist]);

  const whtrStatus = React.useMemo(() => {
    if (!whtr) return '';
    if (whtr < 0.4) return 'Possible malnutrition';
    if (whtr < 0.5) return 'Healthy range';
    if (whtr < 0.6) return 'Increased visceral fat risk';
    return 'High central obesity risk';
  }, [whtr]);

  const whtrColor = React.useMemo(() => {
    if (!whtr) return '#9CA3AF';
    if (whtr < 0.4) return '#3B82F6'; // blue
    if (whtr < 0.5) return '#16A34A'; // green
    if (whtr < 0.6) return '#FACC15'; // yellow
    return '#DC2626'; // red
  }, [whtr]);

  const handleContinue = () => {
    // 📤 איחוד כל הנתונים ושליחה למסך הבא
    router.push({
      pathname: '/bloodTestUploadScreen',
      params: {
        // נתונים היסטוריים
        username,
        firstName,
        lastName,
        birthDate,
        ageYears,
        sex,
        // נתונים חדשים
        height,
        weight,
        waist, // אופציונלי - יכול להיות ריק
        bmi: bmi ? bmi.toFixed(2) : '',
        whtr: whtr ? whtr.toFixed(2) : '',
      },
    });
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Body Measures' }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[
            styles.container,
            { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 24 },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <Text style={styles.title}>Enter Your Body Measures</Text>
            
            {/* הצגת שם המשתמש כאישור ויזואלי שהמידע עבר (אופציונלי) */}
            {firstName && (
              <Text style={styles.greeting}>Hi {firstName}, let's check your metrics.</Text>
            )}
            
            <Text style={styles.subtitle}>
              These values help personalize your health and nutrition recommendations.
            </Text>

            {/* Height */}
            <View style={styles.field}>
              <Text style={styles.label}>Height (cm)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 175"
                keyboardType="numeric"
                value={height}
                onChangeText={setHeight}
                returnKeyType="next"
              />
            </View>

            {/* Weight */}
            <View style={styles.field}>
              <Text style={styles.label}>Weight (kg)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 70"
                keyboardType="numeric"
                value={weight}
                onChangeText={setWeight}
                returnKeyType="next"
              />
            </View>

            {/* Waist */}
            <View style={styles.field}>
              <Text style={styles.label}>Waist circumference (cm)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 85"
                keyboardType="numeric"
                value={waist}
                onChangeText={setWaist}
                returnKeyType="done"
              />
              {whtr && (
                <View style={styles.metricBox}>
                  <Ionicons name="analytics-outline" size={22} color={whtrColor} />
                  <Text style={[styles.resultText, { color: whtrColor }]}>
                    WHtR: {whtr.toFixed(2)} ({whtrStatus})
                  </Text>
                </View>
              )}
            </View>

            {/* WHtR explanation */}
            {whtr && (
              <View style={styles.infoBox}>
                <Text style={styles.infoTitle}>What is WHtR?</Text>
                <Text style={styles.infoText}>
                  The Waist-to-Height Ratio (WHtR) estimates how fat is distributed in your body.
                  A healthy WHtR is below 0.5. Higher values suggest visceral fat and higher risk
                  of metabolic diseases.
                </Text>
                <Text style={styles.infoRanges}>
                  <Text style={{ color: '#3B82F6' }}>{"< 0.4"}</Text> = underfat,{' '}
                  <Text style={{ color: '#16A34A' }}>{"0.4–0.5"}</Text> = healthy,{' '}
                  <Text style={{ color: '#FACC15' }}>{"0.5–0.6"}</Text> = increased risk,{' '}
                  <Text style={{ color: '#DC2626' }}>{"> 0.6"}</Text> = high risk
                </Text>
              </View>
            )}

            {/* BMI result */}
            {bmi && (
              <View style={styles.metricBox}>
                <Ionicons name="body-outline" size={22} color={ACCENT} />
                <Text style={styles.resultText}>
                  BMI: {bmi.toFixed(1)} ({bmiStatus})
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.cta,
                !(height && weight) && { opacity: 0.6 },
              ]}
              onPress={handleContinue}
              disabled={!height || !weight}
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
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
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
  greeting: {
    fontSize: 16,
    fontWeight: '600',
    color: ACCENT,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 14,
    textAlign: 'center',
  },
  field: { marginBottom: 14 },
  label: { fontSize: 14, color: '#475569', marginBottom: 6 },
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
  metricBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 6,
  },
  resultText: {
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 6,
  },
  infoBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    marginBottom: 10,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: '#334155',
    marginBottom: 4,
  },
  infoRanges: {
    fontSize: 12,
    color: '#475569',
    fontStyle: 'italic',
  },
  cta: {
    width: '100%',
    backgroundColor: ACCENT,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 10,
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});