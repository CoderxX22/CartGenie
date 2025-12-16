import { StyleSheet } from 'react-native';
import { EdgeInsets } from 'react-native-safe-area-context';
import { AppColors } from '@/components/appThemeProvider';
import { createAuthStyles } from './LoginScreen.styles'; 

// --- פונקציה 1: הסגנון הישן (אם עדיין בשימוש) ---
export const createIllnessesStyles = (c: AppColors) => {
  const base = createAuthStyles(c);

  return StyleSheet.create({
    ...base, 
    subtitle: {
      fontSize: 13,
      color: c.subtitle,
      marginBottom: 14,
      textAlign: 'center',
    },
    searchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.inputBg,
      borderWidth: 1,
      borderColor: c.inputBorder,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
      marginBottom: 10,
      gap: 8,
    },
    searchInput: { flex: 1, color: c.text, padding: 0, margin: 0 },
    actionsRow: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 12,
      alignItems: 'center',
      flexWrap: 'wrap',
      justifyContent: 'center',
    },
    pillButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.background,
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: c.inputBorder,
    },
    pillPrimary: {
      backgroundColor: c.accent || '#0096c7',
      borderColor: c.accent || '#0096c7',
    },
    pillButtonText: { marginLeft: 6, color: c.text, fontWeight: '600', fontSize: 13 },
    pillPrimaryText: { marginLeft: 6, color: '#fff', fontWeight: '700', fontSize: 13 },
    chipsWrap: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      paddingVertical: 6,
      marginBottom: 12,
      justifyContent: 'center',
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 999,
      borderWidth: 1,
    },
    chipText: { fontSize: 14 },
    field: { marginTop: 4, marginBottom: 12 },
  });
}; // <--- סוגר את הפונקציה הראשונה

// --- פונקציה 2: הסגנון החדש והרספונסיבי ---
// שים לב: הוצאתי אותה החוצה והשתמשתי ב-AppColors
export const createResponsiveStyles = (col: AppColors, insets: EdgeInsets) => StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: col.background,
  },
  container: {
    flex: 1,
    backgroundColor: col.background,
  },
  scrollContent: {
    paddingTop: insets?.top ? insets.top + 10 : 20,
    paddingBottom: 40,
    paddingHorizontal: 16,
  },
  card: {
    width: '100%',
    alignSelf: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: col.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: col.subtitle,
    marginBottom: 24,
    lineHeight: 22,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: col.card || col.background, // fallback אם אין card
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: col.inputBorder,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: col.text,
    height: '100%',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 10,
  },
  pillButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: col.text,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap', // קריטי לרספונסיביות
    gap: 10,
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 30,
  },
  primaryButton: {
    backgroundColor: '#0096c7',
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});