// styles/auth.styles.ts
import { StyleSheet, Platform } from 'react-native';
import { AppColors } from '@/components/appThemeProvider';
import { LAYOUT } from '../../constants/theme';

const ACCENT = '#0096c7';

export const createAuthStyles = (c: AppColors) => StyleSheet.create({
  // --- Layout הכללי ---
  container: {
    flex: 1,
    backgroundColor: c.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  card: {
    width: '100%',
    maxWidth: LAYOUT.cardMax,
    backgroundColor: c.card,
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderWidth: 1,
    borderColor: c.inputBorder,
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOpacity: 0.08,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 8 },
      },
      android: { elevation: 5 },
    }),
  },
  
  // --- טקסטים ---
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: c.text,
    marginBottom: 22,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  label: {
    fontSize: 13,
    color: c.subtitle,
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  
  // --- כפתור ראשי (Login / Sign Up) ---
  primaryButton: {
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
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // --- כפתור גוגל (החלק שהיה חסר) ---
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.card,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: c.inputBorder,
    width: '100%',
    justifyContent: 'center',
    marginTop: 14, // הוספתי ריווח עליון קטן
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
      },
      android: { elevation: 2 },
    }),
  },
  googleButtonText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '600',
    color: c.text,
  },
  
  // --- קישורים וטקסט תחתון ---
  footerText: {
    fontSize: 14,
    color: c.subtitle,
    marginTop: 16,
    textAlign: 'center',
  },
  linkText: {
    fontWeight: '700',
    color: '#023e8a',
    textDecorationLine: 'underline',
  },
  
  // --- קווי הפרדה (Divider) ---
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: c.inputBorder,
  },
  dividerText: {
    marginHorizontal: 10,
    color: c.subtitle,
    fontSize: 13,
  },
});