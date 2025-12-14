// constants/theme.ts
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const COLORS = {
  primary: '#0096c7', // ACCENT
  white: '#fff',
  black: '#000',
  glassBorder: 'rgba(255,255,255,0.15)',
  scrim: 'rgba(0,0,0,0.35)',
};

export const LAYOUT = {
  windowWidth: width,
  windowHeight: height,
  cardMax: 520,
};