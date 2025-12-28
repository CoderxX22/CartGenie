import React, { useMemo } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  ImageBackground, 
  useColorScheme, 
  StyleSheet,
  ViewStyle 
} from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import Navbar from '@/components/navBar';
import { useAppColors, AppColors } from '@/components/appThemeProvider';
import { useHomePageLogic } from '../../hooks/useHomePageLogic';
import { createHomeStyles } from '../styles/homePage.styles';

// DRY Components
import { SideMenu } from '../../components/home/SideMenu';
import { QuickAction } from '../../components/home/QuickAction';
import { StatusCard } from '../../components/home/statusCard';

const BACKGROUND_IMAGE = require('../../assets/images/Home_page_background_pic.png');

export default function HomePage() {
  const col = useAppColors();
  const styles = useMemo(() => createHomeStyles(col), [col]);
  
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Logic Hook
  const { state, actions } = useHomePageLogic();
  const { greetingName, tip, menuVisible, status } = state;

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Home', 
          headerShown: false, 
          gestureEnabled: false, 
          headerLeft: () => null 
        }} 
      />

      {/* Side Menu Overlay */}
      <SideMenu 
        visible={menuVisible} 
        onClose={() => actions.toggleMenu(false)}
        onUpdateInfo={actions.onUpdateInfo}
        onHelp={actions.onHelp}
        onLogout={actions.onLogout}
        colors={col}
      />

      <ImageBackground 
        source={BACKGROUND_IMAGE} 
        style={localStyles.background}
        resizeMode="cover"
      >
        {/* Dark Mode Overlay for readability */}
        {isDark && <View style={localStyles.darkOverlay} />}

        <ScrollView 
            contentContainerStyle={[styles.container, localStyles.scrollContent]} 
            keyboardShouldPersistTaps="handled"
        >
            <View style={styles.card}>
            
            {/* Header Section */}
            <HomeHeader 
                greeting={greetingName} 
                onMenuPress={() => actions.toggleMenu(true)} 
                styles={styles} 
                colors={col} 
            />

            {/* Status Card */}
            <StatusCard 
                personalCompleted={status.personalCompleted}
                bodyMeasuresCompleted={status.bodyMeasuresCompleted}
                hasAnyIllnesses={status.hasAnyIllnesses}
                illnessesLoading={status.illnessesLoading}
                colors={col}
            />

            {/* Quick Actions */}
            <Text style={styles.sectionTitle}>Quick actions</Text>
            
            <QuickAction 
                title="Scan receipt"
                subtitle="Upload or scan grocery receipt."
                icon="document-text-outline"
                onPress={actions.onScanReceipt}
                colors={col}
                isPrimary
            />
            
            <QuickAction 
                title="Scan product"
                subtitle="Check single product details."
                icon="barcode-outline"
                onPress={actions.onScanProduct}
                colors={col}
            />

            {/* Daily Tip */}
            <DailyTipCard tip={tip} styles={styles} />

            </View>
        </ScrollView>
      </ImageBackground>

      <Navbar />
    </>
  );
}

// --- Sub-Components ---

interface HomeHeaderProps {
  greeting: string;
  onMenuPress: () => void;
  styles: any;
  colors: AppColors;
}

const HomeHeader = ({ greeting, onMenuPress, styles, colors }: HomeHeaderProps) => (
  <View style={styles.logoRow}>
    <View style={localStyles.headerLeftContainer}>
      <View style={styles.logoCircle}>
        <Ionicons name="cart-outline" size={20} color="#fff" />
        <Ionicons 
            name="sparkles-outline" 
            size={16} 
            color="#FFEDD5" 
            style={localStyles.sparkleIcon} 
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>Hi, {greeting}!</Text>
        <Text style={styles.subtitle}>Let&apos;s make your cart healthier.</Text>
      </View>
    </View>
    
    <TouchableOpacity 
        style={styles.menuButton} 
        onPress={onMenuPress}
        activeOpacity={0.7}
    >
      <Ionicons name="menu" size={28} color={colors.text} />
    </TouchableOpacity>
  </View>
);

const DailyTipCard = ({ tip, styles }: { tip: string, styles: any }) => (
  <View style={styles.tip}>
    <View style={styles.tipIconCircle}>
      <Ionicons name="bulb-outline" size={18} color="#facc15" />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={styles.tipLabel}>Today’s tip</Text>
      <Text style={styles.tipText}>{tip}</Text>
    </View>
  </View>
);

// --- Local Styles ---

const localStyles = StyleSheet.create({
  background: {
    flex: 1,
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  scrollContent: {
    paddingBottom: 96, // Space for Navbar
  },
  headerLeftContainer: {
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 12, 
    flex: 1
  },
  sparkleIcon: {
    position: 'absolute', 
    right: -4, 
    top: -2 
  }
});