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
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { Video, ResizeMode } from 'expo-av';
import { BlurView } from 'expo-blur';


const { height, width } = Dimensions.get('window');
const ACCENT = '#0096c7';
const CARD_MAX = 520;

export default function HomeScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Welcome', headerShown: false }} />
      <View style={styles.root}>
        {/* Video background */}
        <Video
          source={require('../assets/videos/cartGenie_video.mp4')}
          style={styles.videoBg}
          resizeMode={ResizeMode.COVER}
          isLooping
          shouldPlay
          isMuted
          volume={0}
          {...({ playsInSilentModeIOS: true } as any)}
        />

        <View style={styles.scrim} pointerEvents="none" />
        <BlurView intensity={40} tint="light" style={styles.card}>
          <ScrollView contentContainerStyle={styles.container}>
            {/* Logo and tagline */}
            <View style={styles.logoContainer}>
              <Image
                source={require('@/assets/images/CartGenie_logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={styles.tagline}>
                Control Your <Text style={styles.highlight}>Health</Text>
                {'\n'}With <Text style={styles.highlight}>Food</Text>
              </Text>
            </View>

            {/* Get Started Button */}
            <TouchableOpacity style={styles.button} onPress={() => router.push('./login')}>
              <Text style={styles.buttonText}>Get Started</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" style={styles.icon} />
            </TouchableOpacity>
          </ScrollView>
        </BlurView>

      </View>
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoBg: {
    ...StyleSheet.absoluteFillObject,
  },
  // שכבת כהות מעט חזקה יותר כדי לשפר קריאות
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },

  // תוכן פנימי של המסגרת
  container: {
    flexGrow: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 36,
    paddingHorizontal: 20,
    paddingBottom: height * 0.14,
  },

  // כרטיס "זכוכית" אלגנטי
  card: {
    width: '90%',
    maxWidth: CARD_MAX,
    borderRadius: 20,
    paddingHorizontal: 22,
    paddingVertical: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',            // מסגרת שקופה אלגנטית
    alignSelf: 'center',
    
    // הפרדת תוכן עדינה מהרקע – שאדו רך
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.18,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 10 },
      },
      android: { elevation: 8 },
    }),
  },

  logoContainer: {
    alignItems: 'center',
    marginTop: 28,
  },
  logo: {
    width: Math.min(width * 0.68, 320),
    height: Math.min(width * 0.68, 320),
  },

  // טיפוגרפיה קריאה על גבי וידאו + זוהר עדין
  tagline: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    color: '#fff',
    marginTop: 14,
    lineHeight: 32,
    letterSpacing: 0.4,
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  highlight: {
    color: ACCENT,
    fontWeight: '800',
  },

  // כפתור קרדינלי עם תחושה מוצקה
  button: {
    width: '100%',
    backgroundColor: ACCENT,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#0369A1',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.22,
        shadowRadius: 8,
      },
      android: { elevation: 3 },
    }),
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginRight: 8,
  },
  icon: { marginTop: 2 },
});
