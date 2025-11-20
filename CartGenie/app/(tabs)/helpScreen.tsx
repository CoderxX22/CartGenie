import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function HelpScreen() {
  
  const handleContact = () => {
    // פתיחת אפליקציית המייל
    Linking.openURL('mailto:support@healthcart.com');
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Help & Support', headerBackTitle: 'Back' }} />
      
      <ScrollView contentContainerStyle={styles.container}>
        
        <View style={styles.header}>
          <Text style={styles.title}>We are here to help</Text>
          <Text style={styles.subtitle}>
            Have questions? Find answers below or contact our support team.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>FAQ</Text>
          
          <View style={styles.faqItem}>
            <Text style={styles.question}>• How do I upload a blood test?</Text>
            <Text style={styles.answer}>
              Currently, you can upload blood tests during the initial setup. We are working on a feature to add new tests later!
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.question}>• How do I scan a product?</Text>
            <Text style={styles.answer}>
              Go to the Home screen and click "Scan Product". Use your camera to scan the barcode.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.question}>• How do I change my diet preferences?</Text>
            <Text style={styles.answer}>
              Go to "Update Personal Info" in the main menu to adjust your allergies and preferences.
            </Text>
          </View>
        </View>

        {/* כרטיס יצירת קשר */}
        <View style={styles.card}>
            <Text style={styles.cardTitle}>Still need help?</Text>
            <Text style={styles.text}>
                Our team is available to assist you with any issue.
            </Text>
            
            <TouchableOpacity style={styles.button} onPress={handleContact}>
                <Ionicons name="mail-outline" size={20} color="#fff" />
                <Text style={styles.buttonText}>Contact Support</Text>
            </TouchableOpacity>
        </View>

      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F3F6FA',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0F172A',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    maxWidth: '80%',
    lineHeight: 22,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    // צל עדין
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
  },
  faqItem: {
    marginBottom: 16,
  },
  question: {
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 4,
  },
  answer: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    paddingLeft: 8,
  },
  text: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#0096c7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});