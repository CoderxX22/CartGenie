import { StyleSheet, Platform } from 'react-native';
import { AppColors } from '@/components/appThemeProvider';

export const createFeedbackHistoryStyles = (c: AppColors) => {
  const ACCENT = c.accent || '#0096c7';

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.background, // צבע רקע דינמי
    },
    
    // --- Tabs ---
    tabContainer: {
      flexDirection: 'row',
      backgroundColor: c.card, // שינוי ל-c.card לתמיכה ב-Dark Mode
      padding: 6,
      marginHorizontal: 16,
      marginTop: 10,
      marginBottom: 10,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.inputBorder,
      // Shadow
      ...Platform.select({
        ios: { shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 3, shadowOffset: { width: 0, height: 2 } },
        android: { elevation: 1 },
      }),
    },
    tabBtn: {
      flex: 1,
      paddingVertical: 10,
      alignItems: 'center',
      borderRadius: 8,
    },
    activeTabBtn: {
      backgroundColor: ACCENT,
    },
    tabText: {
      fontSize: 14,
      fontWeight: '600',
      color: c.subtitle, // צבע טקסט משני
    },
    activeTabText: {
      color: '#fff',
      fontWeight: '700',
    },
    
    // --- Content ---
    contentArea: {
      flex: 1,
    }
  });
};