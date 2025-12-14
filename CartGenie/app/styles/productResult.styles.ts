import { StyleSheet, Platform } from 'react-native';
import { AppColors } from '@/components/appThemeProvider';

const ACCENT = '#0096c7';

export const createProductResultStyles = (c: AppColors) => StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 100, 
    backgroundColor: c.background,
    minHeight: '100%',
  },
  
  // Loading & Error States
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: c.background,
    padding: 20,
  },
  loadingText: { marginTop: 12, color: c.text, fontSize: 18, fontWeight: '600' },
  subLoadingText: { marginTop: 8, color: c.subtitle, fontSize: 14 },
  errorText: { fontSize: 18, fontWeight: '700', color: c.text, marginTop: 16, textAlign: 'center', marginBottom: 10 },
  
  // Barcode Box
  barcodeBox: { backgroundColor: c.inputBg, padding: 8, borderRadius: 6, marginBottom: 20 },
  barcodeText: { fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', color: c.text },
  
  // Product Mini Card
  miniProductCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: c.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: c.inputBorder,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3 },
      android: { elevation: 1 }
    }),
  },
  productName: { fontSize: 16, fontWeight: '700', color: c.text },
  brandName: { fontSize: 13, color: c.subtitle },
  barcodeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: c.inputBg, padding: 6, borderRadius: 6 },
  badgeText: { fontSize: 12, color: c.subtitle },

  // AI Card
  aiCard: {
    backgroundColor: c.card,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    marginBottom: 24,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
      android: { elevation: 4 }
    }),
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
  },
  statusTitle: { color: '#fff', fontSize: 20, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  aiBody: { padding: 20 },
  aiLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  aiLabel: { fontSize: 14, fontWeight: '700', color: ACCENT, textTransform: 'uppercase' },
  aiReasonText: { fontSize: 16, lineHeight: 24, color: c.text },

  // Alternatives
  altContainer: { marginTop: 16, backgroundColor: '#F0FDFA', padding: 12, borderRadius: 8 },
  altTitle: { fontSize: 14, fontWeight: '700', color: '#0F766E', marginBottom: 8 },
  altItem: { flexDirection: 'row', gap: 6, marginBottom: 4 },
  altText: { fontSize: 13, color: '#134E4A', flex: 1 },

  // Buttons
  actionBtn: { backgroundColor: '#0F172A', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 30 },
  actionBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  
  // Try Again Button (Error State)
  btn: { backgroundColor: ACCENT, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12 },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 16 },

  // Nutrition Facts
  nutritionContainer: { alignItems: 'center', opacity: 0.7 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: c.subtitle, marginBottom: 4 },
  factsText: { fontSize: 14, color: c.subtitle },

  // Footer
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: c.card, padding: 20, borderTopWidth: 1, borderTopColor: c.inputBorder },
  doneBtn: { backgroundColor: ACCENT, paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  doneBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});