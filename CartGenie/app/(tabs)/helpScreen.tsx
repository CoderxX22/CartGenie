import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useAppColors, AppColors } from '@/components/appThemeProvider';
import { createHelpStyles } from '../styles/help.styles';
import { useHelpLogic } from '../../hooks/useHelpLogic';
import { FAQ_DATA } from '../../data/helpData';

// --- Sub Component (DRY) ---
const FaqItem = ({ question, answer, styles }: { question: string; answer: string; styles: any }) => (
  <View style={styles.faqItem}>
    <Text style={styles.question}>• {question}</Text>
    <Text style={styles.answer}>{answer}</Text>
  </View>
);

// --- Main Screen ---
export default function HelpScreen() {
  const col = useAppColors();
  const styles = useMemo(() => createHelpStyles(col), [col]);
  const { handleContact } = useHelpLogic();

  return (
    <>
      <Stack.Screen options={{ title: 'Help & Support', headerBackTitle: 'Back' }} />
      
      <ScrollView contentContainerStyle={styles.container}>
        
        {/* Header Section */}
        <View style={styles.header}>
          {/* 👇 תיקון האייקון כאן */}
          <Ionicons name="help-buoy-outline" size={60} color={col.accent || '#0096c7'} />
          <Text style={styles.title}>We are here to help</Text>
          <Text style={styles.subtitle}>
            Have questions? Find answers below or contact our support team.
          </Text>
        </View>

        {/* FAQ Section */}
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

        {/* Contact Section */}
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
                <Ionicons name="mail-outline" size={20} color="#fff" />
                <Text style={styles.buttonText}>Contact Support</Text>
            </TouchableOpacity>
        </View>

      </ScrollView>
    </>
  );
}