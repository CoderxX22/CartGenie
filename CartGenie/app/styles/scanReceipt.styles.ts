import { StyleSheet } from 'react-native';
import { AppColors } from '@/components/appThemeProvider';

export const createScanReceiptStyles = (c: AppColors) => StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    paddingBottom: 50,
    backgroundColor: c.background,
    flexGrow: 1,
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
    marginBottom: 24,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    alignItems: 'center',
    gap: 10,
  },
  placeholderText: {
    color: c.subtitle,
    fontSize: 16,
  },

  // Action Buttons Row
  buttonRow: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
    marginBottom: 20,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  primaryBtn: {
    backgroundColor: c.accent || '#0096c7',
  },
  secondaryBtn: {
    backgroundColor: c.inputBg,
    borderWidth: 1,
    borderColor: c.accent || '#0096c7',
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  secondaryBtnText: {
    color: c.accent || '#0096c7',
    fontWeight: '700',
    fontSize: 16,
  },

  // Scan / Analyze Button
  scanBtn: {
    width: '100%',
    backgroundColor: '#0F172A', // או צבע כהה אחר מהתמה
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  scanBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});