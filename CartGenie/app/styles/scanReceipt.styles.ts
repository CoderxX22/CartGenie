import { StyleSheet, Platform } from 'react-native';
import { AppColors } from '@/components/appThemeProvider';

export const createScanReceiptStyles = (c: AppColors) =>
  StyleSheet.create({
    container: {
      padding: 20,
      alignItems: 'center',
      paddingBottom: 50,
      backgroundColor: c.background,
      flexGrow: 1
    },

    // Image Preview Area
    imageContainer: {
      width: '100%',
      height: 350,
      backgroundColor: c.card,
      borderRadius: 16,
      borderWidth: 2,
      borderColor: c.inputBorder,
      borderStyle: 'dashed',
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
      marginBottom: 24
    },
    previewImage: {
      width: '100%',
      height: '100%'
    },
    placeholder: {
      alignItems: 'center',
      gap: 10
    },
    placeholderText: {
      color: c.subtitle,
      fontSize: 16
    },

    // Source Buttons Row (Documents / Gallery / Camera)
    buttonRow: {
      flexDirection: 'row',
      gap: 12,
      width: '100%',
      marginBottom: 20
    },
    actionBtn: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      paddingHorizontal: 10,
      borderRadius: 12,
      ...Platform.select({
        ios: {
          shadowColor: '#0F172A',
          shadowOpacity: 0.06,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 6 }
        },
        android: { elevation: 2 }
      })
    },
    actionBtnContent: {
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6
    },
    actionBtnText: {
      fontWeight: '700',
      fontSize: 13,
      textAlign: 'center'
    },

    primaryBtn: {
      backgroundColor: c.accent || '#0096c7'
    },
    secondaryBtn: {
      backgroundColor: c.inputBg,
      borderWidth: 1,
      borderColor: c.accent || '#0096c7'
    },

    // Analyze Button (primary-style)
    scanBtn: {
      width: '100%',
      backgroundColor: c.accent || '#0096c7',
      paddingVertical: 16,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 8,
      marginBottom: 30,
      ...Platform.select({
        ios: {
          shadowColor: '#0369A1',
          shadowOffset: { width: 0, height: 5 },
          shadowOpacity: 0.22,
          shadowRadius: 8
        },
        android: { elevation: 4 }
      })
    },
    scanBtnText: {
      color: '#fff',
      fontSize: 17,
      fontWeight: '700',
      letterSpacing: 0.3
    }
  });
