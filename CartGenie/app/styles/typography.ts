import { Platform, TextStyle } from 'react-native';

export const Typography: { [key: string]: TextStyle } = {
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#222',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
    color: '#fff',
  },
  platformFont: Platform.select<TextStyle>({
    ios: { fontFamily: 'Helvetica' },
    android: { fontFamily: 'Roboto' },
  }) ?? {},
};
