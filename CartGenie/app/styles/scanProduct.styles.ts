import { StyleSheet } from 'react-native';
import { AppColors } from '@/components/appThemeProvider';

export const createScanScreenStyles = (c: AppColors) => StyleSheet.create({
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  headerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 4,
  },
});