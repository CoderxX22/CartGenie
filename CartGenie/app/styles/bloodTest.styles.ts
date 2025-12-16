import { StyleSheet } from 'react-native';
import { AppColors } from '@/components/appThemeProvider';
import { createAuthStyles } from './LoginScreen.styles'; // שימוש חוזר ב-Card הבסיסי

export const createBloodTestStyles = (c: AppColors) => {
  const base = createAuthStyles(c);

  return StyleSheet.create({
    ...base, // יורש container, card, title, etc.
    
    subtitle: {
      fontSize: 13,
      color: c.subtitle,
      marginBottom: 15,
      textAlign: 'center',
    },
    
    // --- Custom UI for this screen ---
    
    // Username Banner
    usernameBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 5,
      backgroundColor: 'rgba(0, 150, 199, 0.1)', // Light accent
      padding: 10,
      borderRadius: 8,
      marginBottom: 15,
    },
    usernameText: {
      fontWeight: '600',
      color: c.text,
    },

    // Drop Zone
    dropZone: {
      borderStyle: 'dashed',
      borderWidth: 2,
      borderColor: '#ccc',
      borderRadius: 12,
      padding: 24,
      alignItems: 'center',
      gap: 12,
      marginBottom: 20,
      backgroundColor: c.background,
    },
    dropTitle: { fontWeight: '700', color: c.text },
    fileName: { fontSize: 12, color: c.subtitle },
    
    // Buttons (Specific Overrides)
    browseBtn: {
      flexDirection: 'row',
      gap: 6,
      backgroundColor: 'rgba(0, 150, 199, 0.1)',
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 8,
    },
    browseText: { color: '#0096c7', fontWeight: '700', fontSize: 13 },
    
    manualBtn: { 
      flexDirection: 'row', 
      justifyContent: 'center', 
      alignItems: 'center', 
      gap: 5, 
      padding: 12, 
      borderRadius: 12, 
      borderWidth: 1, 
      borderColor: '#0096c7',
      backgroundColor: 'transparent',
      marginTop: 8
    },
    manualBtnText: { color: '#0096c7', fontWeight: '600' },

    saveSuccessBtn: {
        backgroundColor: '#10b981', // Green for success
        flexDirection: 'row', 
        justifyContent: 'center', 
        alignItems: 'center', 
        padding: 16, 
        borderRadius: 12, 
        gap: 8, 
        marginTop: 10 
    },

    // Results Area
    resultsContainer: { marginTop: 20, marginBottom: 10 },
    divider: { height: 1, backgroundColor: c.inputBorder, marginBottom: 15 },
    resultsTitle: { fontSize: 16, fontWeight: '700', marginBottom: 10, color: c.text },
    tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 15 },
    
    diagnosisTag: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      backgroundColor: '#fef2f2',
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: '#fecaca',
    },
    diagnosisText: { color: '#b91c1c', fontWeight: '600', fontSize: 12 },
    healthyText: { color: '#15803d', fontStyle: 'italic' },
    // הוסף את אלו לאובייקט ה-StyleSheet הקיים שלך:

successBanner: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#ECFDF5', // רקע ירקרק בהיר
  padding: 12,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: '#10B981', // מסגרת ירוקה
  marginBottom: 16,
  gap: 12,
},
successTitle: {
  fontSize: 16,
  fontWeight: 'bold',
  color: '#064E3B',
},
successSubtitle: {
  fontSize: 14,
  color: '#065F46',
  marginTop: 2,
},
  });
};