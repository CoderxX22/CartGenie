import React from 'react';
import {
  View,
  StyleSheet,
  Image,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';  // <--- added
import { router, Stack } from 'expo-router';

const { height, width } = Dimensions.get('window');
const ACCENT_COLOR = '#1D7DDC';

export default function HomeScreen() {
  return (
    <>
    <Stack.Screen options={{ title: 'Welcome' }} /><View style={styles.root}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Logo and tagline */}
        <View style={styles.logoContainer}>
          <Image
            source={require('@/assets/images/CartGenie_logo.png')}
            style={styles.logo}
            resizeMode="contain" />
          <Text style={styles.tagline}>
            Control Your <Text style={styles.highlight}>Health</Text>
            {"\n"}With <Text style={styles.highlight}>Food</Text>
          </Text>
        </View>

        {/* Get Started Button */}
        <TouchableOpacity style={styles.button} onPress={() => router.push('./login')}>
          <Text style={styles.buttonText}>Get Started</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" style={styles.icon} />
        </TouchableOpacity>
      </ScrollView>
    </View></>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flexGrow: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    paddingBottom: height * 0.15,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  logo: {
    width: width * 0.7,
    height: width * 0.7,
  },
  tagline: {
    fontSize: 24,
    fontWeight: '500',
    textAlign: 'center',
    color: '#333',
    marginTop: 16,
    lineHeight: 32,
    letterSpacing: 0.5,
  },
  highlight: {
    color: ACCENT_COLOR,
    fontWeight: '700',
  },
  button: {
    flexDirection: 'row',       // <--- added for text & icon
    alignItems: 'center',       // center icon vertically
    justifyContent: 'center',
    backgroundColor: '#000',
    paddingVertical: 16,
    paddingHorizontal: 90,
    borderRadius: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: Platform.OS === 'ios' ? 0.2 : 0.4,
    shadowRadius: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginRight: 8,             // <--- spacing between text and icon
  },
  icon: {
    marginTop: 2,               // small vertical adjust
  },
});
