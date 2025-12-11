import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ScrollView,
  Modal,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';

import Navbar from '@/components/navBar';
import { useAppColors, AppColors } from '@/components/appThemeProvider';
import { useIllnesses } from '@/hooks/useIllnesses';

const ACCENT = '#0096c7';
const CARD_MAX = 520;
const BLOOD_KEY = 'BLOOD_TEST_LAST_UPLOAD';
const TIME_FORMULA = 1000 * 60 * 60 * 24;
const DAYS_IN_YEAR = 365;

const DAILY_TIPS: string[] = [
  'Add at least one colorful vegetable to every meal.',
  'Drink a glass of water before each meal.',
  'Replace one sugary drink with water or tea.',
  'Include a source of protein in each meal.',
  'Swap refined grains for whole grains.',
  'Add a handful of nuts as a healthy snack.',
  'Plan at least one meat-free meal this week.',
  'Fill half your plate with vegetables.',
  'Check labels for added sugars.',
  'Eat slowly and mindfully.',
];

function formatShortDate(d: Date) {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export default function HomePage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const col = useAppColors();
  const styles = useMemo(() => makeStyles(col), [col]);

  // Extract params (may come from onboarding or profile update flows)
  const firstNameParam = params.firstName as string | undefined;
  const usernameParam = params.username as string | undefined;
  const lastNameParam = params.lastName as string | undefined;
  const birthDateParam = params.birthDate as string | undefined;
  const sexParam = params.sex as string | undefined;
  const heightParam = params.height as string | undefined;
  const weightParam = params.weight as string | undefined;
  const waistParam = params.waist as string | undefined;
  const illnessesParam = params.illnesses as string | undefined;

  const greetingName = firstNameParam || usernameParam || 'there';

  const { hasSelection, loading: illnessesLoading } = useIllnesses([]);
  const [lastBloodTest, setLastBloodTest] = useState<Date | null>(null);
  const [bloodLoading, setBloodLoading] = useState(true);

  const [menuVisible, setMenuVisible] = useState(false);

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

  // Daily tip (stable during component life)
  const tip = useMemo(
    () => DAILY_TIPS[Math.floor(Math.random() * DAILY_TIPS.length)],
    [],
  );

  const bloodStatus = useMemo(() => {
    if (bloodLoading) {
      return {
        icon: 'ellipse-outline',
        text: 'Loading...',
        color: col.subtitle,
      } as const;
    }
    if (!lastBloodTest) {
      return {
        icon: 'ellipse-outline',
        text: 'Not uploaded yet',
        color: col.subtitle,
      } as const;
    }

    const now = new Date();
    const diffDays = (now.getTime() - lastBloodTest.getTime()) / TIME_FORMULA;
    const formatted = formatShortDate(lastBloodTest);

    if (diffDays > DAYS_IN_YEAR) {
      return {
        icon: 'alert-circle',
        text: `Outdated (${formatted})`,
        color: '#f97316',
      } as const;
    }
    return {
      icon: 'checkmark-circle',
      text: `Up to date (${formatted})`,
      color: '#22c55e',
    } as const;
  }, [bloodLoading, lastBloodTest, col.subtitle]);

  // Derived profile completion flags (purely from params / local state)
  const personalCompleted = !!(
    firstNameParam &&
    lastNameParam &&
    birthDateParam &&
    sexParam
  );

  const bodyMeasuresCompleted = !!(
    heightParam &&
    weightParam &&
    waistParam
  );

  const illnessesFromParams =
    !!illnessesParam && illnessesParam !== '[]' && illnessesParam !== 'null';

  const hasAnyIllnesses =
    !illnessesLoading && (hasSelection || illnessesFromParams);

  // --- Handlers for menu ---
  const handleUpdateInfo = () => {
    setMenuVisible(false);
    router.push({
      pathname: '/bodyMeasures',
      params: {
        username: usernameParam,
      },
    });
  };

  const handleHelp = () => {
    setMenuVisible(false);
    router.push({ pathname: '/(tabs)/helpScreen' });
  };

  const handleLogout = () => {
    setMenuVisible(false);
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          router.push({ pathname: '/login' });
        },
      },
    ]);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Home',
          headerShown: false,
          gestureEnabled: false,
          headerLeft: () => null,
        }}
      />

      {/* Side menu (Modal) */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
            <View style={styles.modalBackdrop} />
          </TouchableWithoutFeedback>

          <View style={styles.menuContainer}>
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle}>Menu</Text>
              <TouchableOpacity onPress={() => setMenuVisible(false)}>
                <Ionicons name="close" size={24} color={col.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.menuItems}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleUpdateInfo}
              >
                <Ionicons name="person-outline" size={22} color={ACCENT} />
                <Text style={styles.menuItemText}>Update Personal Info</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem} onPress={handleHelp}>
                <Ionicons name="help-circle-outline" size={22} color={ACCENT} />
                <Text style={styles.menuItemText}>Help</Text>
              </TouchableOpacity>

              <View style={styles.divider} />

              <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={22} color="#ef4444" />
                <Text style={[styles.menuItemText, { color: '#ef4444' }]}>
                  Logout
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingBottom: 96 }, // space for bottom navbar
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          {/* Logo + Menu Button */}
          <View style={styles.logoRow}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                flex: 1,
              }}
            >
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
                <Text style={styles.title}>Hi, {greetingName}!</Text>
                <Text style={styles.subtitle}>
                  Let&apos;s make your cart healthier.
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => setMenuVisible(true)}
            >
              <Ionicons name="menu" size={28} color={col.text} />
            </TouchableOpacity>
          </View>

          {/* Profile status */}
          <View style={styles.statusCard}>
            <Text style={styles.statusTitle}>Profile status</Text>

            <View style={styles.statusRow}>
              <Ionicons
                name={
                  personalCompleted ? 'checkmark-circle' : 'ellipse-outline'
                }
                size={18}
                color={personalCompleted ? '#22c55e' : col.subtitle}
              />
              <Text
                style={[
                  styles.statusText,
                  !personalCompleted && { color: col.subtitle },
                ]}
              >
                {personalCompleted
                  ? 'Personal info completed'
                  : 'Personal info missing'}
              </Text>
            </View>

            <View style={styles.statusRow}>
              <Ionicons
                name={
                  bodyMeasuresCompleted
                    ? 'checkmark-circle'
                    : 'ellipse-outline'
                }
                size={18}
                color={bodyMeasuresCompleted ? '#22c55e' : col.subtitle}
              />
              <Text
                style={[
                  styles.statusText,
                  !bodyMeasuresCompleted && { color: col.subtitle },
                ]}
              >
                {bodyMeasuresCompleted
                  ? 'Body measures completed'
                  : 'Body measures missing'}
              </Text>
            </View>

            <View style={styles.statusRow}>
              <Ionicons
                name={bloodStatus.icon as any}
                size={18}
                color={bloodStatus.color}
              />
              <Text
                style={[
                  styles.statusText,
                  { color: bloodStatus.color },
                ]}
              >
                {bloodStatus.text}
              </Text>
            </View>

            <View style={styles.statusRow}>
              <Ionicons
                name={
                  illnessesLoading
                    ? ('ellipse-outline' as const)
                    : hasAnyIllnesses
                    ? ('checkmark-circle' as const)
                    : ('ellipse-outline' as const)
                }
                size={18}
                color={
                  illnessesLoading
                    ? col.subtitle
                    : hasAnyIllnesses
                    ? '#22c55e'
                    : col.subtitle
                }
              />
              <Text
                style={[
                  styles.statusText,
                  !hasAnyIllnesses && { color: col.subtitle },
                ]}
              >
                {illnessesLoading
                  ? 'Health conditions loading...'
                  : hasAnyIllnesses
                  ? 'Health conditions selected'
                  : 'Health conditions not selected yet'}
              </Text>
            </View>
          </View>

          {/* Quick Actions */}
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
                Upload or scan grocery receipt.
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
              <Text style={styles.secondaryTitle}>Scan product</Text>
              <Text style={styles.secondarySubtitle}>
                Check single product details.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={col.subtitle} />
          </TouchableOpacity>

          {/* Tip */}
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
      flexGrow: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 16,
      paddingVertical: 24,
      backgroundColor: c.background,
    },
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
    logoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 18,
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
    menuButton: {
      padding: 4,
    },

    // Status card uses theme colors (works in dark mode)
    statusCard: {
      marginTop: 4,
      marginBottom: 18,
      paddingVertical: 12,
      paddingHorizontal: 12,
      borderRadius: 14,
      backgroundColor: c.background,
      borderWidth: 1,
      borderColor: c.inputBorder,
    },
    statusTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: c.text,
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
      color: c.text,
    },

    sectionTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: c.text,
      marginBottom: 8,
    },
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

    // Menu Modal Styles
    modalOverlay: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'flex-start',
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalBackdrop: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    },
    menuContainer: {
      width: '75%',
      maxWidth: 300,
      backgroundColor: c.card,
      height: '100%',
      paddingVertical: 40,
      paddingHorizontal: 20,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 2, height: 0 },
          shadowOpacity: 0.25,
          shadowRadius: 5,
        },
        android: { elevation: 5 },
      }),
    },
    menuHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 30,
      paddingBottom: 20,
      borderBottomWidth: 1,
      borderBottomColor: c.inputBorder,
    },
    menuTitle: {
      fontSize: 22,
      fontWeight: '800',
      color: c.text,
    },
    menuItems: {
      gap: 16,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      paddingVertical: 12,
    },
    menuItemText: {
      fontSize: 16,
      fontWeight: '500',
      color: c.text,
    },
    divider: {
      height: 1,
      backgroundColor: c.inputBorder,
      marginVertical: 10,
    },
  });
