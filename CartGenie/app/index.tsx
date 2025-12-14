import React from 'react';
import { View, Image, Text, ScrollView } from 'react-native';
import { router, Stack } from 'expo-router';
import { BlurView } from 'expo-blur';

// Imports from our new layers
import { styles } from '../app/styles/index.styles';
import { BackgroundVideo } from '../components/BackgroundVideo';
import { ActionButton } from '../components/ActionButton';

export default function HomeScreen() {
  
  // Logic Section (Controller)
  const handleGetStarted = () => {
    router.push('./login');
  };

  // UI Section (View)
  return (
    <>
      <Stack.Screen options={{ title: 'Welcome', headerShown: false }} />
      <View style={styles.root}>
        
        {/* Background Layer */}
        <BackgroundVideo source={require('../assets/videos/cartGenie_video.mp4')} />
        <View style={styles.scrim} pointerEvents="none" />

        {/* Content Layer */}
        <BlurView intensity={40} tint="light" style={styles.card}>
          <ScrollView contentContainerStyle={styles.container}>
            
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

            <ActionButton title="Get Started" onPress={handleGetStarted} />
            
          </ScrollView>
        </BlurView>
      </View>
    </>
  );
}