import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useAppColors } from '@/components/appThemeProvider';
import { createHelpStyles } from '../styles/help.styles';
import { useHelpLogic } from '../../hooks/useHelpLogic';
import { FAQ_DATA } from '../../data/helpData';

export default function HelpScreen() {
  const router = useRouter();
  const col = useAppColors();
  const styles = useMemo(() => createHelpStyles(col), [col]);

  const { handleContact } = useHelpLogic();

  const goHome = () => {
    // Replace prevents stacking "Help" on top of "Home" repeatedly
    router.replace('/(tabs)/homePage');
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Help & Support',
          headerShadowVisible: false,
          headerBackVisible: false,
          gestureEnabled: false,
          headerLeft: () => <HomeButton onPress={goHome} color={col.text} />,
        }}
      />

      <ScrollView contentContainerStyle={styles.container}>
        
        {/* Header Section */}
        <View style={styles.header}>
          <Ionicons name="help-buoy-outline" size={60} color={col.accent || '#0096c7'} />
          <Text style={styles.title}>We are here to help</Text>
          <Text style={styles.subtitle}>
            Have questions? Find answers below or contact our support team.
          </Text>
        </View>

        {/* FAQ List */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>FAQ</Text>
          {FAQ_DATA.map((item, index) => (
            <FaqItem 
              key={index} 
              question={item.question} 
              answer={item.answer} 
              styles={styles} 
            />
          ))}
        </View>

        {/* Contact Support Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Still need help?</Text>
          <Text style={styles.text}>
            Our team is available to assist you with any issue regarding the app or your account.
          </Text>

          <TouchableOpacity 
            style={styles.button} 
            onPress={handleContact} 
            activeOpacity={0.9}
          >
            <Ionicons name="call-outline" size={20} color="#fff" />
            <Text style={styles.buttonText}>Contact Support</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </>
  );
}

// --- Sub-Components ---

interface FaqItemProps {
  question: string;
  answer: string;
  styles: any;
}

const FaqItem = ({ question, answer, styles }: FaqItemProps) => (
  <View style={styles.faqItem}>
    <Text style={styles.question}>• {question}</Text>
    <Text style={styles.answer}>{answer}</Text>
  </View>
);

const HomeButton = ({ onPress, color }: { onPress: () => void; color: string }) => (
  <TouchableOpacity
    onPress={onPress}
    style={localStyles.homeBtn}
    activeOpacity={0.85}
  >
    <Ionicons name="home-outline" size={18} color={color} />
    <Text style={{ color, fontSize: 16, fontWeight: '600' }}>Home</Text>
  </TouchableOpacity>
);

// --- Local Styles ---
const localStyles = StyleSheet.create({
  homeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
});