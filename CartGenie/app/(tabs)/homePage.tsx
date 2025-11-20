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
import { useAllergies } from '@/hooks/useAllergies';
import { routeToScreen } from 'expo-router/build/useScreens';

const ACCENT = '#0096c7';
const CARD_MAX = 520;
const BLOOD_KEY = 'BLOOD_TEST_LAST_UPLOAD';

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
  
  const firstName = typeof params.firstName === 'string' ? params.firstName : 'Guest';
  const username = typeof params.username ==='string'? params.username : "";
  const col = useAppColors();
  const styles = useMemo(() => makeStyles(col), [col]);

  // --- State ---
  const { hasSelection, loading: allergiesLoading } = useAllergies([]);
  const [lastBloodTest, setLastBloodTest] = useState<Date | null>(null);
  const [bloodLoading, setBloodLoading] = useState(true);
  
  // State לתפריט הצד
  const [menuVisible, setMenuVisible] = useState(false);

  // --- Effects ---
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

  // --- Logic ---
  const tip = useMemo(
    () => DAILY_TIPS[Math.floor(Math.random() * DAILY_TIPS.length)],
    []
  );

  const bloodStatus = useMemo(() => {
    if (bloodLoading) return { icon: 'ellipse-outline', text: 'Loading...', color: col.subtitle };
    if (!lastBloodTest) return { icon: 'ellipse-outline', text: 'Not uploaded yet', color: col.subtitle };

    const now = new Date();
    const diff = (now.getTime() - lastBloodTest.getTime()) / (1000 * 60 * 60 * 24);
    const formatted = formatShortDate(lastBloodTest);

    if (diff > 365) return { icon: 'alert-circle', text: `Outdated (${formatted})`, color: '#f97316' };
    return { icon: 'checkmark-circle', text: `Up to date (${formatted})`, color: '#22c55e' };
  }, [bloodLoading, lastBloodTest, col.subtitle]);

  // --- Handlers לתפריט ---
  const handleUpdateInfo = () => {
    setMenuVisible(false);
    router.push({
      pathname: '/bodyMeasures',
      params: { 
        username, 
      }
    });  
  };

  const handleHelp = () => {
    setMenuVisible(false);
    router.push({pathname: '/(tabs)/helpScreen'});
  };

  const handleLogout = () => {
    setMenuVisible(false);
    Alert.alert('Logout', 'Are you sure you want to logout?', [
        { text: 'Cancel', style: 'cancel' },
        { 
            text: 'Logout', 
            style: 'destructive',
            onPress: () => {
              router.push({pathname: '/login'});
            }
        }
    ]);
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Home', headerShown: false }} />

      {/* --- תפריט צד (Modal) --- */}
      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <View style={styles.modalOverlay}>
            {/* לחיצה על הרקע השקוף סוגרת את התפריט */}
            <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
                <View style={styles.modalBackdrop} />
            </TouchableWithoutFeedback>

            {/* תוכן התפריט */}
            <View style={styles.menuContainer}>
                <View style={styles.menuHeader}>
                    <Text style={styles.menuTitle}>Menu</Text>
                    <TouchableOpacity onPress={() => setMenuVisible(false)}>
                        <Ionicons name="close" size={24} color={col.text} />
                    </TouchableOpacity>
                </View>

                <View style={styles.menuItems}>
                    <TouchableOpacity style={styles.menuItem} onPress={handleUpdateInfo}>
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
                        <Text style={[styles.menuItemText, { color: '#ef4444' }]}>Logout</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
      </Modal>

      <ScrollView
        contentContainerStyle={[styles.container, { paddingBottom: 96 }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          {/* Logo + Menu Button */}
          <View style={styles.logoRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
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
                <Text style={styles.title}>
                    Hi {firstName}
                </Text>
                <Text style={styles.subtitle}>Let's make your cart healthier.</Text>
                </View>
            </View>
            
            {/* כפתור המבורגר לפתיחת התפריט */}
            <TouchableOpacity 
                style={styles.menuButton} 
                onPress={() => setMenuVisible(true)}
            >
                <Ionicons name="menu" size={28} color={col.text} />
            </TouchableOpacity>
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
                name={allergiesLoading ? 'ellipse-outline' : hasSelection ? 'checkmark-circle' : 'alert-circle'}
                size={18}
                color={allergiesLoading ? col.subtitle : hasSelection ? '#22c55e' : '#f97316'}
              />
              <Text style={styles.statusText}>
                {allergiesLoading ? 'Loading...' : hasSelection ? 'Allergies saved' : 'Allergies missing'}
              </Text>
            </View>
            <View style={styles.statusRow}>
              <Ionicons name={bloodStatus.icon as any} size={18} color={bloodStatus.color} />
              <Text style={[styles.statusText, { color: bloodStatus.color }]}>
                {bloodStatus.text}
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
              <Text style={styles.primarySubtitle}>Upload or scan grocery receipt.</Text>
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
              <Text style={styles.secondarySubtitle}>Check single product details.</Text>
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
    
    // --- Menu Modal Styles ---
    modalOverlay: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-start', // תפריט מצד שמאל
        backgroundColor: 'rgba(0,0,0,0.5)', // רקע חצי שקוף
    },
    modalBackdrop: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
    },
    menuContainer: {
        width: '75%', // רוחב התפריט
        maxWidth: 300,
        backgroundColor: c.card,
        height: '100%',
        paddingVertical: 40,
        paddingHorizontal: 20,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 2, height: 0 }, shadowOpacity: 0.25, shadowRadius: 5 },
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