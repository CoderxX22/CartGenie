import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useAppColors } from '@/components/appThemeProvider';
import { createHelpStyles } from '../styles/help.styles';
import { useHelpLogic } from '../../hooks/useHelpLogic';
import { FAQ_DATA } from '../../data/helpData';

const FaqItem = ({ question, answer, styles }: { question: string; answer: string; styles: any }) => (
  <View style={styles.faqItem}>
    <Text style={styles.question}>• {question}</Text>
    <Text style={styles.answer}>{answer}</Text>
  </View>
);

export default function HelpScreen() {
  const router = useRouter();
  const col = useAppColors();
  const styles = useMemo(() => createHelpStyles(col), [col]);

  const { handleContact } = useHelpLogic();

  const goHome = () => {
    // Deterministic navigation: avoids stack-dependent back behavior
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
          headerLeft: () => (
            <TouchableOpacity
              onPress={goHome}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, paddingHorizontal: 12 }}
              activeOpacity={0.85}
            >
              <Ionicons name="home-outline" size={18} color={col.text} />
              <Text style={{ color: col.text, fontSize: 16, fontWeight: '600' }}>Home</Text>
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Ionicons name="help-buoy-outline" size={60} color={col.accent || '#0096c7'} />
          <Text style={styles.title}>We are here to help</Text>
          <Text style={styles.subtitle}>
            Have questions? Find answers below or contact our support team.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>FAQ</Text>
          {FAQ_DATA.map((item, index) => (
            <FaqItem key={index} question={item.question} answer={item.answer} styles={styles} />
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Still need help?</Text>
          <Text style={styles.text}>
            Our team is available to assist you with any issue regarding the app or your account.
          </Text>

          <TouchableOpacity style={styles.button} onPress={handleContact} activeOpacity={0.9}>
            <Ionicons name="call-outline" size={20} color="#fff" />
            <Text style={styles.buttonText}>Contact Support</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
}
