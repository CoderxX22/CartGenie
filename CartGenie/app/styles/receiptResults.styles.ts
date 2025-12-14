import { StyleSheet, Platform } from 'react-native';
import { AppColors } from '@/components/appThemeProvider';

const ACCENT = '#0096c7';

export const createReceiptStyles = (c: AppColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
  scrollContent: { padding: 20, paddingBottom: 100 },
  
  // Center Loading/Error
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: c.background },
  loadingText: { marginTop: 16, fontSize: 18, fontWeight: '600', color: c.text },
  subLoadingText: { marginTop: 8, fontSize: 14, color: c.subtitle, textAlign: 'center' },
  errorText: { fontSize: 18, fontWeight: '700', color: c.text, marginTop: 16, textAlign: 'center', marginBottom: 20 },
  
  // Score Card
  scoreCard: { 
    backgroundColor: c.card, 
    borderRadius: 20, 
    padding: 24, 
    alignItems: 'center', 
    marginBottom: 24, 
    borderWidth: 1,
    borderColor: c.inputBorder,
    ...Platform.select({ ios: { shadowOpacity: 0.05, shadowRadius: 5 }, android: { elevation: 3 } })
  },
  scoreTitle: { fontSize: 18, fontWeight: '700', color: c.text, marginBottom: 16 },
  scoreCircle: { width: 100, height: 100, borderRadius: 50, borderWidth: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  scoreNumber: { fontSize: 36, fontWeight: '800' },
  scoreSubtitle: { fontSize: 13, color: c.subtitle },

  // Save Button
  saveBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: '#0F172A', 
    padding: 12, 
    borderRadius: 12, 
    marginBottom: 24,
    gap: 8 
  },
  saveBtnDisabled: { backgroundColor: '#10B981', opacity: 0.9 },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },

  // Items List
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: c.text, marginBottom: 12 },
  itemsList: { gap: 12 },
  
  // Item Row
  itemRow: { padding: 16, borderRadius: 16, borderWidth: 1 },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  itemName: { fontSize: 16, fontWeight: '700', color: c.text, flex: 1, marginRight: 8 },
  badgeContainer: { flexDirection: 'row', marginBottom: 8 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, borderWidth: 1, backgroundColor: c.card },
  badgeText: { fontSize: 11, fontWeight: '700' },
  reasonText: { fontSize: 14, color: c.text, lineHeight: 20, opacity: 0.8 },

  // Retry Button
  retryBtn: { marginTop: 20, padding: 12, backgroundColor: c.inputBg, borderRadius: 8 },
  retryBtnText: { fontWeight: '600', color: c.text },

  // Raw Text (Debug)
  accordionHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
  debugTitle: { fontSize: 14, fontWeight: '600', color: c.subtitle },
  rawTextContainer: { marginTop: 5, backgroundColor: c.inputBg, padding: 10, borderRadius: 8 },
  rawText: { fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', fontSize: 11, color: c.text },

  // Footer
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: c.card, padding: 20, borderTopWidth: 1, borderTopColor: c.inputBorder },
  doneBtn: { backgroundColor: ACCENT, paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  doneBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});