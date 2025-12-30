import { StyleSheet, Platform } from 'react-native';
import { AppColors } from '@/components/appThemeProvider';

export const createReceiptStyles = (c: AppColors) => {
  // אם אין צבע מודגש בתמה, נשתמש בכחול ברירת מחדל
  const ACCENT = c.accent || '#0096c7';

  return StyleSheet.create({
    container: { 
      flex: 1, 
      backgroundColor: c.background // רקע דינמי (שחור בחושך, לבן באור)
    },
    scrollContent: { 
      padding: 20, 
      paddingBottom: 120 // רווח נוסף למטה כדי שהפוטר לא יסתיר תוכן
    },

    // --- Loading / Error States ---
    centerContainer: { 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center', 
      padding: 20, 
      backgroundColor: c.background 
    },
    loadingText: { 
      marginTop: 16, 
      fontSize: 18, 
      fontWeight: '600', 
      color: c.text 
    },
    subLoadingText: { 
      marginTop: 8, 
      fontSize: 14, 
      color: c.subtitle, 
      textAlign: 'center' 
    },
    errorText: { 
      fontSize: 18, 
      fontWeight: '700', 
      color: c.text, 
      marginTop: 16, 
      textAlign: 'center', 
      marginBottom: 20 
    },

    // --- Score Header ---
    scoreHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 10,
      paddingHorizontal: 2
    },
    scoreHeaderTitle: {
      fontSize: 20,
      fontWeight: '800',
      color: c.text // טקסט לבן בחושך
    },
    infoBtn: {
      padding: 6,
      borderRadius: 999
    },

    // --- Score Card ---
    scoreCard: {
      backgroundColor: c.card, // רקע כהה בחושך
      borderRadius: 20,
      padding: 24,
      alignItems: 'center',
      marginBottom: 24,
      borderWidth: 1,
      borderColor: c.inputBorder, // גבול עדין שנראה גם בחושך
      ...Platform.select({ 
        ios: { shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, shadowOffset: { width: 0, height: 2 } }, 
        android: { elevation: 3 } 
      })
    },
    scoreTitle: { 
      fontSize: 18, 
      fontWeight: '700', 
      color: c.text, 
      marginBottom: 16 
    },
    scoreCircle: { 
      width: 100, 
      height: 100, 
      borderRadius: 50, 
      borderWidth: 8, 
      justifyContent: 'center', 
      alignItems: 'center', 
      marginBottom: 12 
      // הצבעים של העיגול נקבעים בקומפוננטה עצמה
    },
    scoreNumber: { 
      fontSize: 36, 
      fontWeight: '800' 
    },
    scoreSubtitle: { 
      fontSize: 13, 
      color: c.subtitle 
    },

    // --- Save Button (Primary Action) ---
    saveBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: ACCENT,
      paddingVertical: 16,
      borderRadius: 16,
      marginBottom: 24,
      gap: 8,
      ...Platform.select({
        ios: {
          shadowColor: ACCENT, // צללית בצבע הכפתור
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8
        },
        android: { elevation: 4 }
      })
    },
    // עיצוב למצב שהכפתור כבר נשמר (הופך לירוק)
    saveBtnDisabled: { 
      backgroundColor: '#10B981', // ירוק הצלחה
      opacity: 1,
      shadowOpacity: 0,
      elevation: 0
    },
    saveBtnText: { 
      color: '#fff', 
      fontWeight: '700', 
      fontSize: 16, 
      letterSpacing: 0.5 
    },

    // --- Items List ---
    section: { marginBottom: 20 },
    sectionTitle: { 
      fontSize: 18, 
      fontWeight: '700', 
      color: c.text, 
      marginBottom: 12 
    },
    itemsList: { gap: 12 },

    // --- Item Row ---
    itemRow: { 
      padding: 16, 
      borderRadius: 16, 
      borderWidth: 1 
      // צבעי רקע וגבול נקבעים דינמית בקומפוננטה ReceiptItemRow
    },
    itemHeader: { 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      alignItems: 'flex-start', 
      marginBottom: 8 
    },
    itemName: { 
      fontSize: 16, 
      fontWeight: '700', 
      color: c.text, 
      flex: 1, 
      marginRight: 8 
    },
    badgeContainer: { 
      flexDirection: 'row', 
      marginBottom: 8 
    },
    badge: { 
      paddingHorizontal: 8, 
      paddingVertical: 2, 
      borderRadius: 6, 
      borderWidth: 1, 
      backgroundColor: 'transparent' // הרקע נקבע על ידי השורה כולה
    },
    badgeText: { 
      fontSize: 11, 
      fontWeight: '700' 
    },
    reasonText: { 
      fontSize: 14, 
      color: c.subtitle || c.text, // שימוש ב-subtitle לקריאות טובה יותר
      lineHeight: 20, 
      opacity: 0.9 
    },

    // --- Retry Button ---
    retryBtn: { 
      marginTop: 20, 
      paddingVertical: 12, 
      paddingHorizontal: 24, 
      backgroundColor: c.inputBg, 
      borderRadius: 8,
      borderWidth: 1,
      borderColor: c.inputBorder
    },
    retryBtnText: { 
      fontWeight: '600', 
      color: c.text 
    },

    // --- Footer ---
    footer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: c.card, // רקע כהה בחושך
      padding: 20,
      paddingBottom: Platform.OS === 'ios' ? 34 : 20, // התאמה לאייפון חדש
      borderTopWidth: 1,
      borderTopColor: c.inputBorder
    },
    // שינוי עיצוב כפתור "Done" למשני (Secondary)
    doneBtn: { 
      backgroundColor: c.inputBg, // רקע אפור/שקוף
      paddingVertical: 16, 
      borderRadius: 16, 
      alignItems: 'center',
      borderWidth: 1,
      borderColor: c.inputBorder
    },
    doneBtnText: { 
      color: c.text, // טקסט שמתהפך (שחור/לבן)
      fontWeight: '600', 
      fontSize: 16 
    }
  });
};