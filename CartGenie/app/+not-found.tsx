import React, { useEffect } from 'react';
import { StyleSheet, Dimensions, Text } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { Stack, useRouter, useRootNavigationState } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';

const { width } = Dimensions.get('window');

export default function NotFoundScreen() {
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();

  useEffect(() => {
    if (!rootNavigationState?.key) return;
    const timeout = setTimeout(() => {
      router.replace('/');
    }, 2000);
    return () => clearTimeout(timeout);
  }, [rootNavigationState, router]);

  return (
    <>
      <Stack.Screen options={{ title: '' }} />
      <ThemedView style={styles.container}>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  video: { width: width * 0.6, height: width * 0.6 },
  text: { marginTop: 20, fontSize: 18, fontWeight: '500', color: '#333' },
});
