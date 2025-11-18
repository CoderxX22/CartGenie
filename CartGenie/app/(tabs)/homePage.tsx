import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ScrollView,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';

import Navbar from '@/components/navBar';
import { useAppColors, AppColors } from '@/components/appThemeProvider';
import { useAllergies } from '@/hooks/useAllergies';

const ACCENT = '#0096c7';
const CARD_MAX = 520;
const BLOOD_KEY = 'BLOOD_TEST_LAST_UPLOAD';

const DAILY_TIPS: string[] = [
  'Add at least one colorful vegetable to every meal to increase fiber and micronutrients.',
  'Try to drink a glass of water before each meal to support hydration and appetite control.',
  'Replace one sugary drink today with water, tea, or sparkling water without added sugar.',
  'Include a source of protein in each meal to help you stay full for longer.',
  'Swap refined grains (white bread, white rice) for whole grains when possible.',
  'Add a handful of nuts or seeds as a healthy snack rich in good fats and minerals.',
  'Plan at least one meat-free meal this week using beans, lentils, or tofu.',
  'Aim to fill half of your plate with vegetables at lunch or dinner.',
  'Check the label of one product today and look for added sugars or trans fats.',
  'Eat slowly and mindfully – it can help you notice fullness and enjoy food more.',
];

function formatShortDate(d: Date) {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export default function HomePage() {
  const router = useRouter();
  const col = useAppColors();

  // Allergies status
  const { hasSelection, loading: allergiesLoading } = useAllergies([]);

  // Blood test date
  const [lastBloodTest, setLastBloodTest] = useState<Date | null>(null);
  const [bloodLoading, setBloodLoading] = useState(true);

  useEffect(() => {
    const loadBloodDate = async () => {
      try {
        const raw = await SecureStore.getItemAsync(BLOOD_KEY);
        if (raw) {
          const d = new Date(raw);
          if (!isNaN(d.getTime())) setLastBloodTest(d);
        }
      } catch (e) {
        console.warn('Failed to load blood test date', e);
      } finally {
        setBloodLoading(false);
      }
    };
    loadBloodDate();
  }, []);

  const tip = useMemo(
    () => DAILY_TIPS[Math.floor(Math.random() * DAILY_TIPS.length)],
    []
  );

  const bloodStatus = useMemo(() => {
    if (bloodLoading) {
      return {
        icon: 'ellipse-outline',
        text: 'Blood test status: loading…',
        color: col.subtitle,
      };
    }
    if (!lastBloodTest) {
      return {
        icon: 'ellipse-outline',
        text: 'Blood test not uploaded yet',
        color: col.subtitle,
      };
    }

    const now = new Date();
    const diff = (now.getTime() - lastBloodTest.getTime()) / (1000 * 60 * 60 * 24);
    const formatted = formatShortDate(lastBloodTest);

    if (diff > 365) {
      return {
        icon: 'alert-circle',
        text: `Blood test outdated (last updated: ${formatted})`,
        color: '#f97316',
      };
    }

    return {
      icon: 'checkmark-circle',
      text: `Blood test up to date (last updated: ${formatted})`,
      color: '#22c55e',
    };
  }, [bloodLoading, lastBloodTest]);

  const styles = useMemo(() => makeStyles(col), [col]);

  return (
    <>
      <Stack.Screen options={{ title: 'Home', headerShown: false }} />

      <ScrollView
        contentContainerStyle={[styles.container, { paddingBottom: 96 }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          {/* Logo + texts */}
          <View style={styles.logoRow}>
            <View style={styles.logoCircle}>
              <Ionicons name="cart-outline" size={20} color="#fff" />
              <Ionicons
                name="sparkles-outline"
                size={16}
                color="#FFEDD5"
                style={{ position: 'absolute', right: -4, top: -2 }}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Hi Alex, ready to make your cart healthier?</Text>
              <Text style={styles.subtitle}>
                Analyze your receipts, blood tests and allergies to give you smarter grocery
                feedback.
              </Text>
            </View>
          </View>

          {/* Status */}
          <View style={styles.statusCard}>
            <Text style={styles.statusTitle}>Profile status</Text>

            <View style={styles.statusRow}>
              <Ionicons name="checkmark-circle" size={18} color="#22c55e" />
              <Text style={styles.statusText}>Personal info completed</Text>
            </View>

            <View style={styles.statusRow}>
              <Ionicons name="checkmark-circle" size={18} color="#22c55e" />
              <Text style={styles.statusText}>Body measures completed</Text>
            </View>

            <View style={styles.statusRow}>
              <Ionicons
                name={
                  allergiesLoading
                    ? 'ellipse-outline'
                    : hasSelection
                    ? 'checkmark-circle'
                    : 'alert-circle'
                }
                size={18}
                color={
                  allergiesLoading
                    ? col.subtitle
                    : hasSelection
                    ? '#22c55e'
                    : '#f97316'
                }
              />
              <Text style={styles.statusText}>
                {allergiesLoading
                  ? 'Allergies: loading…'
                  : hasSelection
                  ? 'Allergies saved'
                  : 'Allergies missing'}
              </Text>
            </View>

            <View style={styles.statusRow}>
              <Ionicons name={bloodStatus.icon as any} size={18} color={bloodStatus.color} />
              <Text style={[styles.statusText, { color: bloodStatus.color }]}>
                {bloodStatus.text}
              </Text>
            </View>
          </View>

          {/* Primary Actions */}
          <Text style={styles.sectionTitle}>Quick actions</Text>

          <TouchableOpacity
            style={styles.primaryFull}
            activeOpacity={0.9}
            onPress={() => router.push('/scanReceipt')}
          >
            <View style={styles.primaryIconCircle}>
              <Ionicons name="document-text-outline" size={22} color="#fff" />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.primaryTitle}>Scan receipt</Text>
              <Text style={styles.primarySubtitle}>
                Upload or scan your grocery receipt to get instant feedback.
              </Text>
            </View>

            <Ionicons name="chevron-forward" size={20} color="#E0F2FE" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.primaryFullSecondary}
            activeOpacity={0.9}
            onPress={() => router.push('/scanProduct')}
          >
            <View style={styles.secondaryIconCircle}>
              <Ionicons name="barcode-outline" size={22} color={ACCENT} />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.secondaryTitle}>Scan product barcode</Text>
              <Text style={styles.secondarySubtitle}>
                Check if a single product fits your profile before buying.
              </Text>
            </View>

            <Ionicons name="chevron-forward" size={20} color={col.subtitle} />
          </TouchableOpacity>

          {/* Daily Tip */}
          <View style={styles.tip}>
            <View style={styles.tipIconCircle}>
              <Ionicons name="bulb-outline" size={18} color="#facc15" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.tipLabel}>Today’s tip</Text>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <Navbar />
    </>
  );
}

const makeStyles = (c: AppColors) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      padding: 16,
      backgroundColor: c.background,
      minHeight: '100%',
    },
    card: {
      width: '100%',
      maxWidth: CARD_MAX,
      marginTop: 32,
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

    // Logo zone
    logoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 14,
      gap: 12,
    },
    logoCircle: {
      width: 44,
      height: 44,
      borderRadius: 999,
      backgroundColor: ACCENT,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    title: {
      fontSize: 18,
      fontWeight: '800',
      color: c.text,
    },
    subtitle: {
      fontSize: 13,
      color: c.subtitle,
      marginTop: 2,
    },

    // Status box
    statusCard: {
      marginTop: 4,
      marginBottom: 18,
      paddingVertical: 12,
      paddingHorizontal: 12,
      borderRadius: 14,
      backgroundColor: '#E0F2FE',
      borderWidth: 1,
      borderColor: '#BAE6FD',
    },
    statusTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: '#0F172A',
      marginBottom: 6,
    },
    statusRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 4,
    },
    statusText: {
      fontSize: 13,
      color: '#0F172A',
    },

    // Section
    sectionTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: c.text,
      marginBottom: 8,
    },

    // Primary Action Cards
    primaryFull: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      borderRadius: 16,
      backgroundColor: ACCENT,
      paddingVertical: 16,
      paddingHorizontal: 14,
      marginBottom: 10,
    },
    primaryIconCircle: {
      width: 40,
      height: 40,
      borderRadius: 999,
      backgroundColor: '#0369A1',
      alignItems: 'center',
      justifyContent: 'center',
    },
    primaryTitle: {
      fontSize: 15,
      fontWeight: '800',
      color: '#FFFFFF',
    },
    primarySubtitle: {
      fontSize: 13,
      color: '#E0F2FE',
      marginTop: 2,
    },

    primaryFullSecondary: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      borderRadius: 16,
      backgroundColor: c.inputBg,
      paddingVertical: 14,
      paddingHorizontal: 14,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: c.inputBorder,
    },
    secondaryIconCircle: {
      width: 40,
      height: 40,
      borderRadius: 999,
      backgroundColor: '#E0F2FE',
      alignItems: 'center',
      justifyContent: 'center',
    },
    secondaryTitle: {
      fontSize: 15,
      fontWeight: '800',
      color: c.text,
    },
    secondarySubtitle: {
      fontSize: 13,
      color: c.subtitle,
      marginTop: 2,
    },

    // Tip of the day
    tip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      backgroundColor: c.inputBg,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.inputBorder,
      paddingHorizontal: 12,
      paddingVertical: 10,
      marginBottom: 14,
    },
    tipIconCircle: {
      width: 32,
      height: 32,
      borderRadius: 999,
      backgroundColor: '#FEF3C7',
      alignItems: 'center',
      justifyContent: 'center',
    },
    tipLabel: {
      fontSize: 12,
      fontWeight: '700',
      color: '#92400e',
    },
    tipText: {
      fontSize: 13,
      color: c.text,
      marginTop: 2,
    },
  });
