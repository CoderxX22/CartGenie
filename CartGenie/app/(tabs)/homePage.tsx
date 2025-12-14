import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import Navbar from '@/components/navBar';
import { useAppColors } from '@/components/appThemeProvider';
import { useHomePageLogic } from '../../hooks/useHomePageLogic';
import { createHomeStyles } from '../styles/homePage.styles';

// DRY Components
import { SideMenu } from '../../components/home/SideMenu';
import { QuickAction } from '../../components/home/QuickAction';
import { StatusCard } from '../../components/home/statusCard';

export default function HomePage() {
  const col = useAppColors();
  const styles = useMemo(() => createHomeStyles(col), [col]);
  
  // Logic Hook
  const { state, actions } = useHomePageLogic();
  const { greetingName, tip, menuVisible, status } = state;

  return (
    <>
      <Stack.Screen options={{ title: 'Home', headerShown: false, gestureEnabled: false, headerLeft: () => null }} />

      {/* Side Menu Component */}
      <SideMenu 
        visible={menuVisible} 
        onClose={() => actions.toggleMenu(false)}
        onUpdateInfo={actions.onUpdateInfo}
        onHelp={actions.onHelp}
        onLogout={actions.onLogout}
        colors={col}
      />

      <ScrollView contentContainerStyle={[styles.container, { paddingBottom: 96 }]} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          
          {/* Header */}
          <View style={styles.logoRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
              <View style={styles.logoCircle}>
                <Ionicons name="cart-outline" size={20} color="#fff" />
                <Ionicons name="sparkles-outline" size={16} color="#FFEDD5" style={{ position: 'absolute', right: -4, top: -2 }} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>Hi, {greetingName}!</Text>
                <Text style={styles.subtitle}>Let&apos;s make your cart healthier.</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.menuButton} onPress={() => actions.toggleMenu(true)}>
              <Ionicons name="menu" size={28} color={col.text} />
            </TouchableOpacity>
          </View>

          {/* Status Card Component */}
          <StatusCard 
            personalCompleted={status.personalCompleted}
            bodyMeasuresCompleted={status.bodyMeasuresCompleted}
            hasAnyIllnesses={status.hasAnyIllnesses}
            illnessesLoading={status.illnessesLoading}
            bloodStatus={status.bloodStatus as any}
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