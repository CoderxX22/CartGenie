import { StyleSheet } from 'react-native';
import { AppColors } from '@/components/appThemeProvider';
import { createAuthStyles } from './LoginScreen.styles'; 

export const createIllnessesStyles = (c: AppColors) => {
  const base = createAuthStyles(c);

  return StyleSheet.create({
    ...base, // ירושה של container, card, title וכו'

    // 👇 הוספתי את ה-Subtitle שהיה חסר
    subtitle: {
      fontSize: 13,
      color: c.subtitle,
      marginBottom: 14,
      textAlign: 'center',
    },

    // Search
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

    // Actions Row (Pills)
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
    
    // Chips Grid
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
    
    // Other Input Field wrapper
    field: { marginTop: 4, marginBottom: 12 },
  });
};