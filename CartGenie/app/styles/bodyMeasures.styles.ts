// styles/bodyMeasures.styles.ts
import { StyleSheet } from 'react-native';
import { AppColors } from '@/components/appThemeProvider';
import { createAuthStyles } from './LoginScreen.styles';

export const createBodyMeasuresStyles = (c: AppColors) => {
  const base = createAuthStyles(c);
  
  return StyleSheet.create({
    ...base, // ירושה
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingBottom: 32,
    },
    subtitle: {
      fontSize: 13,
      color: c.subtitle,
      marginBottom: 18,
      lineHeight: 18,
    },
    // Metrics Card
    metricsCard: {
      marginTop: 8,
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderRadius: 14,
      backgroundColor: c.background,
      borderWidth: 1,
      borderColor: c.inputBorder,
    },
    metricRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginVertical: 4,
    },
    metricLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    metricLabel: { fontSize: 14, fontWeight: '600', color: c.text },
    metricValueColumn: { alignItems: 'flex-end' },
    metricValue: { fontSize: 16, fontWeight: '700', color: c.text },
    metricBadge: {
      marginTop: 4,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 999,
      fontSize: 11,
      fontWeight: '600',
      overflow: 'hidden',
    },
    // Info Modals (specific tweaks)
    infoOverlay: {
      flex: 1,
      backgroundColor: 'rgba(15,23,42,0.6)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 24,
    },
    infoContainer: {
      width: '100%',
      maxWidth: 420,
      backgroundColor: c.card,
      borderRadius: 18,
      padding: 20,
      borderWidth: 1,
      borderColor: c.inputBorder,
    },
    infoTitle: { fontSize: 18, fontWeight: '700', color: c.text, marginBottom: 8 },
    infoText: { fontSize: 13, color: c.text, marginBottom: 6, lineHeight: 18 },
  });
};