// screens/HomeScreen.styles.ts
import { StyleSheet, Platform } from 'react-native';
import { COLORS, LAYOUT } from '../../constants/theme';

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.black,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoBg: {
    ...StyleSheet.absoluteFillObject,
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.scrim,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 36,
    paddingHorizontal: 20,
    paddingBottom: LAYOUT.windowHeight * 0.14,
  },
  card: {
    width: '90%',
    maxWidth: LAYOUT.cardMax,
    borderRadius: 20,
    paddingHorizontal: 22,
    paddingVertical: 24,
    borderWidth: 1.5,
    borderColor: COLORS.glassBorder,
    alignSelf: 'center',
    overflow: 'hidden', // חשוב ל-BlurView באנדרואיד לעיתים
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
    width: Math.min(LAYOUT.windowWidth * 0.68, 320),
    height: Math.min(LAYOUT.windowWidth * 0.68, 320),
  },
  tagline: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    color: COLORS.white,
    marginTop: 14,
    lineHeight: 32,
    letterSpacing: 0.4,
    textShadowColor: COLORS.scrim,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  highlight: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  button: {
    width: '100%',
    backgroundColor: COLORS.primary,
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
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginRight: 8,
  },
  icon: { marginTop: 2 },
});