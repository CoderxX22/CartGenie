import { StyleSheet, Platform } from 'react-native';
import { AppColors } from '@/components/appThemeProvider';
import { createAuthStyles } from './LoginScreen.styles'; // שימוש חוזר בבסיס!

export const createPersonalDetailsStyles = (c: AppColors) => {
  const baseStyles = createAuthStyles(c); // יורש את הסטייל של הכרטיסים והכפתורים
  
  return StyleSheet.create({
    ...baseStyles, // מפיץ את כל הסטיילים הקיימים (container, card, title, primaryButton...)

    // --- תוספות ספציפיות למסך זה ---
    
    usernameBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0, 150, 199, 0.08)', // שקיפות עדינה של ACCENT
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 12,
      marginBottom: 16,
      gap: 8,
    },
    usernameText: {
      fontSize: 14,
      color: c.text,
      fontWeight: '600',
    },
    
    // Modals Styling
    modalOverlay: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(17, 24, 39, 0.35)',
    },
    modalContainer: {
      backgroundColor: c.inputBg,
      paddingTop: 8,
      paddingBottom: 24, // קצת יותר ריווח למטה
      paddingHorizontal: 12,
      borderTopLeftRadius: 18,
      borderTopRightRadius: 18,
      borderWidth: 1,
      borderColor: c.inputBorder,
    },
    modalHandle: {
      alignSelf: 'center',
      width: 44,
      height: 5,
      borderRadius: 3,
      backgroundColor: '#D1D5DB',
      marginBottom: 10,
    },
    
    // כפתור סגירה למודאל (שימוש בסטייל דומה לכפתור ראשי אבל קטן יותר)
    modalButton: {
      alignSelf: 'center',
      marginTop: 12,
      backgroundColor: '#0096c7',
      paddingVertical: 10,
      paddingHorizontal: 28,
      borderRadius: 10,
      flexDirection: 'row',
      alignItems: 'center',
    },
    modalButtonText: {
      color: '#fff',
      fontWeight: '700',
      letterSpacing: 0.3,
    },
  });
};