import React, { useMemo, useState } from 'react';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  Modal,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppColors, AppColors } from '@/components/appThemeProvider';

const CARD_MAX = 520;
const ACCENT = '#0096c7';

// Product constraints for human measurements (metric):
// - Height: 40–250 cm
// - Weight: 30–300 kg
// - Waist:  30–200 cm
const HEIGHT_MIN_CM = 40;
const HEIGHT_MAX_CM = 250;
const WEIGHT_MIN_KG = 30;
const WEIGHT_MAX_KG = 300;
const WAIST_MIN_CM = 30;
const WAIST_MAX_CM = 200;

type Errors = {
  height?: string;
  weight?: string;
  waist?: string;
};

export default function BodyMeasuresScreen() {
  const router = useRouter();
  const col = useAppColors();

  // Carry forward any params from previous steps (e.g., username, firstName, etc.).
  const params = useLocalSearchParams();

  // Raw text inputs for height / weight / waist.
  const [heightText, setHeightText] = useState('');
  const [weightText, setWeightText] = useState('');
  const [waistText, setWaistText] = useState('');

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  // Info modals for BMI and WHtR.
  const [showBmiInfo, setShowBmiInfo] = useState(false);
  const [showWhtrInfo, setShowWhtrInfo] = useState(false);

  const styles = useMemo(() => makeStyles(col), [col]);

  /**
   * Normalize numeric input:
   *  - allow only digits and one decimal separator (dot or comma),
   *  - merge multiple separators into a single ".".
   * This does NOT clamp values; it only cleans formatting.
   */
  const normalizeNumericInput = (value: string) => {
    const cleaned = value.replace(/[^0-9.,]/g, '');
    const parts = cleaned.split(/[.,]/);
    if (parts.length <= 1) return cleaned;
    return `${parts[0]}.${parts.slice(1).join('')}`;
  };

  /**
   * Convert a normalized numeric string into a number.
   * Returns undefined for empty or invalid values.
   */
  const toNumber = (value: string) => {
    if (!value) return undefined;
    const normalized = value.replace(',', '.');
    const parsed = parseFloat(normalized);
    return Number.isNaN(parsed) ? undefined : parsed;
  };

  const heightCm = toNumber(heightText);
  const weightKg = toNumber(weightText);
  const waistCm = toNumber(waistText);

  // Derived metrics.
  const bmi =
    heightCm && weightKg && heightCm >= HEIGHT_MIN_CM
      ? weightKg / Math.pow(heightCm / 100, 2)
      : undefined;

  const whtr =
    heightCm && waistCm && heightCm >= HEIGHT_MIN_CM
      ? waistCm / heightCm
      : undefined;

  // Human-readable status for BMI (used only for display).
  const bmiStatus = useMemo(() => {
    if (!bmi) {
      return { label: '', bg: 'transparent', text: col.subtitle };
    }
    if (bmi < 18.5) {
      return {
        label: 'Underweight',
        bg: '#f9731633', // orange, semi-transparent
        text: '#9a3412',
      };
    }
    if (bmi < 25) {
      return {
        label: 'Healthy',
        bg: '#22c55e33', // green
        text: '#15803d',
      };
    }
    if (bmi < 30) {
      return {
        label: 'Overweight',
        bg: '#fbbf2433', // amber
        text: '#92400e',
      };
    }
    return {
      label: 'Obesity',
      bg: '#ef444433', // red
      text: '#b91c1c',
    };
  }, [bmi, col.subtitle]);

  // Human-readable status for WHtR (used only for display).
  const whtrStatus = useMemo(() => {
    if (!whtr) {
      return { label: '', bg: 'transparent', text: col.subtitle };
    }
    if (whtr < 0.40) {
      return {
        label: 'Below range',
        bg: '#38bdf833', // light blue
        text: '#0369a1',
      };
    }
    if (whtr < 0.50) {
      return {
        label: 'Healthy',
        bg: '#22c55e33',
        text: '#15803d',
      };
    }
    if (whtr < 0.60) {
      return {
        label: 'Increased risk',
        bg: '#fbbf2433',
        text: '#92400e',
      };
    }
    return {
      label: 'High risk',
      bg: '#ef444433',
      text: '#b91c1c',
    };
  }, [whtr, col.subtitle]);

  /**
   * Basic validation for numeric presence and defined ranges.
   * Does not modify the input values; only sets error messages and red borders.
   */
  const validate = () => {
    const e: Errors = {};

    if (!heightCm) {
      e.height = 'Height is required';
    } else if (heightCm < HEIGHT_MIN_CM || heightCm > HEIGHT_MAX_CM) {
      e.height = `Height must be between ${HEIGHT_MIN_CM} and ${HEIGHT_MAX_CM} cm`;
    }

    if (!weightKg) {
      e.weight = 'Weight is required';
    } else if (weightKg < WEIGHT_MIN_KG || weightKg > WEIGHT_MAX_KG) {
      e.weight = `Weight must be between ${WEIGHT_MIN_KG} and ${WEIGHT_MAX_KG} kg`;
    }

    if (!waistCm) {
      e.waist = 'Waist circumference is required';
    } else if (waistCm < WAIST_MIN_CM || waistCm > WAIST_MAX_CM) {
      e.waist = `Waist must be between ${WAIST_MIN_CM} and ${WAIST_MAX_CM} cm`;
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /**
   * Continue to the next step (blood test upload screen)
   * and forward all collected measurements.
   * We also log a backend-style payload to the console for debugging.
   */
  const onContinue = async () => {
    if (loading) return;
    if (!validate()) return;

    try {
      setLoading(true);

      // Build a backend-oriented payload preview (uses height/weight/waist names).
      const payloadForBackendPreview = {
        ...(params as any),
        height: heightCm !== undefined ? String(heightCm) : '',
        weight: weightKg !== undefined ? String(weightKg) : '',
        waist: waistCm !== undefined ? String(waistCm) : '',
        bmi: bmi ? bmi.toFixed(1) : '',
        whtr: whtr ? whtr.toFixed(3) : '',
      };

      // Console preview – what could be sent to backend later.
      console.log(
        'BodyMeasures – payload for backend preview:',
        payloadForBackendPreview,
      );

      // Placeholder for persisting body measures (backend integration ready later).
      await new Promise((r) => setTimeout(r, 500));

      router.push({
        pathname: '/bloodTestUploadScreen',
        // For the next screen (and eventually backend), we pass the legacy field names
        // to keep the contract intact: height, weight, waist, bmi, whtr.
        params: payloadForBackendPreview,
      });
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = loading || !heightCm || !weightKg || !waistCm;

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
          title: 'Body measures',
        }}
      />

      <View style={styles.container}>
        <ScrollView
          style={{ width: '100%' }}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <Text style={styles.title}>Body Measurements</Text>
            <Text style={styles.subtitle}>
              Please enter your measurements in metric units. These values are used to
              compute your BMI and waist-to-height ratio.
            </Text>

            {/* Height */}
            <View style={styles.fieldRow}>
              <View style={styles.fieldIconWrapper}>
                <Ionicons
                  // Vertical arrows to represent height measurement.
                  name="swap-vertical-outline"
                  size={22}
                  color={col.accent ?? ACCENT}
                />
              </View>
              <View style={styles.fieldContent}>
                <Text style={styles.label}>Height (cm)</Text>
                <TextInput
                  placeholder="Enter your height in cm"
                  style={[styles.input, errors.height && styles.inputError]}
                  placeholderTextColor={col.subtitle}
                  keyboardType="numeric"
                  value={heightText}
                  onChangeText={(value) => {
                    const v = normalizeNumericInput(value);
                    setHeightText(v);
                    if (errors.height) {
                      setErrors((prev) => ({ ...prev, height: undefined }));
                    }
                  }}
                  returnKeyType="next"
                />
                {!!errors.height && (
                  <Text style={styles.errorText}>{errors.height}</Text>
                )}
              </View>
            </View>

            {/* Weight */}
            <View style={styles.fieldRow}>
              <View style={styles.fieldIconWrapper}>
                <Ionicons
                  name="scale-outline"
                  size={22}
                  color={col.accent ?? ACCENT}
                />
              </View>
              <View style={styles.fieldContent}>
                <Text style={styles.label}>Weight (kg)</Text>
                <TextInput
                  placeholder="Enter your weight in kg"
                  style={[styles.input, errors.weight && styles.inputError]}
                  placeholderTextColor={col.subtitle}
                  keyboardType="numeric"
                  value={weightText}
                  onChangeText={(value) => {
                    const v = normalizeNumericInput(value);
                    setWeightText(v);
                    if (errors.weight) {
                      setErrors((prev) => ({ ...prev, weight: undefined }));
                    }
                  }}
                  returnKeyType="next"
                />
                {!!errors.weight && (
                  <Text style={styles.errorText}>{errors.weight}</Text>
                )}
              </View>
            </View>

            {/* Waist */}
            <View style={styles.fieldRow}>
              <View style={styles.fieldIconWrapper}>
                <Ionicons
                  // Icon representing a person (waist / body focus).
                  name="accessibility-outline"
                  size={22}
                  color={col.accent ?? ACCENT}
                />
              </View>
              <View style={styles.fieldContent}>
                <Text style={styles.label}>Waist circumference (cm)</Text>
                <TextInput
                  placeholder="Enter your waist in cm"
                  style={[styles.input, errors.waist && styles.inputError]}
                  placeholderTextColor={col.subtitle}
                  keyboardType="numeric"
                  value={waistText}
                  onChangeText={(value) => {
                    const v = normalizeNumericInput(value);
                    setWaistText(v);
                    if (errors.waist) {
                      setErrors((prev) => ({ ...prev, waist: undefined }));
                    }
                  }}
                  returnKeyType="done"
                />
                {!!errors.waist && (
                  <Text style={styles.errorText}>{errors.waist}</Text>
                )}
              </View>
            </View>

            {/* Derived metrics: BMI & WHtR */}
            <View style={styles.metricsCard}>
              {/* BMI */}
              <View style={styles.metricRow}>
                <View style={styles.metricLabelRow}>
                  <Text style={styles.metricLabel}>BMI</Text>
                  <TouchableOpacity
                    onPress={() => setShowBmiInfo(true)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons
                      name="information-circle-outline"
                      size={18}
                      color={col.accent ?? ACCENT}
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.metricValueColumn}>
                  <Text style={styles.metricValue}>
                    {bmi ? bmi.toFixed(1) : '--'}
                  </Text>
                  {bmiStatus.label ? (
                    <Text
                      style={[
                        styles.metricBadge,
                        { backgroundColor: bmiStatus.bg, color: bmiStatus.text },
                      ]}
                    >
                      {bmiStatus.label}
                    </Text>
                  ) : null}
                </View>
              </View>

              {/* WHtR */}
              <View style={styles.metricRow}>
                <View style={styles.metricLabelRow}>
                  <Text style={styles.metricLabel}>WHtR</Text>
                  <TouchableOpacity
                    onPress={() => setShowWhtrInfo(true)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons
                      name="information-circle-outline"
                      size={18}
                      color={col.accent ?? ACCENT}
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.metricValueColumn}>
                  <Text style={styles.metricValue}>
                    {whtr ? whtr.toFixed(3) : '--'}
                  </Text>
                  {whtrStatus.label ? (
                    <Text
                      style={[
                        styles.metricBadge,
                        { backgroundColor: whtrStatus.bg, color: whtrStatus.text },
                      ]}
                    >
                      {whtrStatus.label}
                    </Text>
                  ) : null}
                </View>
              </View>
            </View>

            {/* Continue */}
            <TouchableOpacity
              style={[styles.continueButton, isDisabled && { opacity: 0.5 }]}
              onPress={onContinue}
              disabled={isDisabled}
              activeOpacity={0.9}
              accessibilityState={{ disabled: isDisabled, busy: loading }}
            >
              {loading ? (
                <>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text style={[styles.continueButtonText, { marginLeft: 8 }]}>
                    Saving…
                  </Text>
                </>
              ) : (
                <Text style={styles.continueButtonText}>Continue</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      {/* BMI Info Modal */}
      <Modal
        visible={showBmiInfo}
        transparent
        animationType="fade"
        onRequestClose={() => setShowBmiInfo(false)}
      >
        <View style={styles.infoOverlay}>
          <View style={styles.infoContainer}>
            <Text style={styles.infoTitle}>What is BMI?</Text>
            <Text style={styles.infoText}>
              Body Mass Index (BMI) is a simple index of weight-for-height used to
              classify underweight, normal weight, overweight and obesity.
            </Text>
            <Text style={styles.infoText}>
              Formula: BMI = weight (kg) / [height (m)]²
            </Text>
            <TouchableOpacity
              style={styles.infoCloseButton}
              onPress={() => setShowBmiInfo(false)}
            >
              <Text style={styles.infoCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* WHtR Info Modal */}
      <Modal
        visible={showWhtrInfo}
        transparent
        animationType="fade"
        onRequestClose={() => setShowWhtrInfo(false)}
      >
        <View style={styles.infoOverlay}>
          <View style={styles.infoContainer}>
            <Text style={styles.infoTitle}>What is WHtR?</Text>
            <Text style={styles.infoText}>
              Waist-to-Height Ratio (WHtR) is the ratio of your waist circumference to
              your height. It is often used to estimate central fat distribution and
              cardiometabolic risk.
            </Text>
            <Text style={styles.infoText}>
              Formula: WHtR = waist circumference (cm) / height (cm)
            </Text>
            <TouchableOpacity
              style={styles.infoCloseButton}
              onPress={() => setShowWhtrInfo(false)}
            >
              <Text style={styles.infoCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const makeStyles = (c: AppColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.background,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 20,
      paddingVertical: 24,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center', // vertically center the card like on previous screens
      alignItems: 'center',
      paddingBottom: 32,
    },
    card: {
      width: '100%',
      maxWidth: CARD_MAX,
      backgroundColor: c.card,
      borderRadius: 18,
      paddingHorizontal: 20,
      paddingVertical: 24,
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
      marginBottom: 8,
      letterSpacing: 0.2,
    },
    subtitle: {
      fontSize: 13,
      color: c.subtitle,
      marginBottom: 18,
      lineHeight: 18,
    },

    fieldRow: {
      flexDirection: 'row',
      alignItems: 'center', // center content in row vertically
      marginBottom: 16,
    },
    fieldIconWrapper: {
      width: 32,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 10, // lower icon a bit so it's visually centered with the input
    },
    fieldContent: {
      flex: 1,
      marginLeft: 8,
    },

    label: {
      fontSize: 13,
      color: c.subtitle,
      marginBottom: 6,
      letterSpacing: 0.2,
    },
    input: {
      width: '100%',
      backgroundColor: c.inputBg,
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 14,
      fontSize: 16,
      color: c.text,
      borderWidth: 1,
      borderColor: c.inputBorder,
    },
    inputError: {
      borderColor: '#ef4444',
    },
    errorText: {
      marginTop: 6,
      fontSize: 12,
      color: '#ef4444',
    },

    metricsCard: {
      marginTop: 8,
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderRadius: 14,
      backgroundColor: c.background,
      borderWidth: 1,
      borderColor: c.inputBorder,
    },
    metricRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginVertical: 4,
    },
    metricLabelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    metricLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: c.text,
    },
    metricValueColumn: {
      alignItems: 'flex-end',
    },
    metricValue: {
      fontSize: 16,
      fontWeight: '700',
      color: c.text,
    },
    metricBadge: {
      marginTop: 4,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 999,
      fontSize: 11,
      fontWeight: '600',
      overflow: 'hidden',
    },

    continueButton: {
      width: '100%',
      backgroundColor: c.accent ?? ACCENT,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 18,
      flexDirection: 'row',
      justifyContent: 'center',
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
    continueButtonText: {
      color: '#FFFFFF',
      fontSize: 17,
      fontWeight: '700',
      letterSpacing: 0.3,
    },

    // Info modals
    infoOverlay: {
      flex: 1,
      backgroundColor: 'rgba(15,23,42,0.6)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 24,
    },
    infoContainer: {
      width: '100%',
      maxWidth: 420,
      backgroundColor: c.card,
      borderRadius: 18,
      paddingHorizontal: 20,
      paddingVertical: 18,
      borderWidth: 1,
      borderColor: c.inputBorder,
    },
    infoTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: c.text,
      marginBottom: 8,
    },
    infoText: {
      fontSize: 13,
      color: c.text,
      marginBottom: 6,
      lineHeight: 18,
    },
    infoCloseButton: {
      alignSelf: 'center',
      marginTop: 10,
      backgroundColor: c.accent ?? ACCENT,
      paddingVertical: 10,
      paddingHorizontal: 26,
      borderRadius: 999,
    },
    infoCloseButtonText: {
      color: '#fff',
      fontWeight: '700',
      letterSpacing: 0.2,
    },
  });
