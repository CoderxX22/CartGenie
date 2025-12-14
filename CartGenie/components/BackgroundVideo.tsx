import React from 'react';
import { StyleSheet } from 'react-native';
import { Video, ResizeMode } from 'expo-av';

interface BackgroundVideoProps {
  source: any;
}

export const BackgroundVideo = ({ source }: BackgroundVideoProps) => {
  return (
    <Video
      source={source}
      style={StyleSheet.absoluteFill}
      resizeMode={ResizeMode.COVER}
      isLooping
      shouldPlay
      isMuted
      volume={0}
      // @ts-ignore
      playsInSilentModeIOS={true}
    />
  );
};