import { StyleSheet, Platform } from 'react-native';
import { AppColors } from '@/components/appThemeProvider';

export const createHomeStyles = (c: AppColors) => StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 24,
    backgroundColor: c.background,
  },
  card: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: c.card,
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 22,
    borderWidth: 1,
    borderColor: c.inputBorder,
    ...Platform.select({
      ios: { shadowColor: '#0F172A', shadowOpacity: 0.08, shadowRadius: 14, shadowOffset: { width: 0, height: 8 } },
      android: { elevation: 5 },
    }),
  },
  
  // Header / Logo
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  logoCircle: {
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: '#0096c7', // ACCENT
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  title: { fontSize: 18, fontWeight: '800', color: c.text },
  subtitle: { fontSize: 13, color: c.subtitle, marginTop: 2 },
  menuButton: { padding: 4 },

  // Status Card
  statusCard: {
    marginTop: 4,
    marginBottom: 18,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: c.background,
    borderWidth: 1,
    borderColor: c.inputBorder,
  },
  statusTitle: { fontSize: 13, fontWeight: '700', color: c.text, marginBottom: 6 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  statusText: { fontSize: 13, color: c.text },

  // Sections
  sectionTitle: { fontSize: 15, fontWeight: '700', color: c.text, marginBottom: 8 },
  
  // Quick Actions (Generic Styles for reusability)
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  actionIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTitle: { fontSize: 15, fontWeight: '800' },
  actionSubtitle: { fontSize: 13, marginTop: 2 },

  // Tip
  tip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: c.inputBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: c.inputBorder,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
  },
  tipIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 999,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipLabel: { fontSize: 12, fontWeight: '700', color: '#92400e' },
  tipText: { fontSize: 13, color: c.text, marginTop: 2 },

  // Modal
  modalOverlay: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalBackdrop: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 },
  menuContainer: {
    width: '75%',
    maxWidth: 300,
    backgroundColor: c.card,
    height: '100%',
    paddingVertical: 40,
    paddingHorizontal: 20,
    ...Platform.select({
        ios: { shadowColor: '#000', shadowOffset: { width: 2, height: 0 }, shadowOpacity: 0.25, shadowRadius: 5 },
        android: { elevation: 5 },
      }),
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: c.inputBorder,
  },
  menuTitle: { fontSize: 22, fontWeight: '800', color: c.text },
  menuItems: { gap: 16 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12 },
  menuItemText: { fontSize: 16, fontWeight: '500', color: c.text },
  divider: { height: 1, backgroundColor: c.inputBorder, marginVertical: 10 },
});