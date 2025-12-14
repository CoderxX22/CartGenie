import { StyleSheet, Platform } from 'react-native';
import { AppColors } from '@/components/appThemeProvider';

const CARD_MAX = 520;
const ACCENT = '#0096c7';

export const createDiscoverStyles = (c: AppColors) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.background },
  container: { paddingHorizontal: 20, paddingBottom: 16 },
  
  // Header
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: c.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: c.subtitle,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 14,
  },

  // Tabs / Modes
  modeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 8,
  },
  modeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: c.inputBorder,
    backgroundColor: c.card,
  },
  modeBtnActive: {
    borderColor: ACCENT,
    backgroundColor: '#E9F6FB',
  },
  modeText: { fontSize: 13, color: c.subtitle, fontWeight: '600' },
  modeTextActive: { color: '#0F172A', fontWeight: '800' },

  // Search
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.inputBg,
    borderWidth: 1,
    borderColor: c.inputBorder,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    gap: 8,
  },
  searchInput: { flex: 1, color: c.text, padding: 0, margin: 0 },

  // List & Cards
  list: { alignItems: 'center', gap: 12, paddingBottom: 16 },
  card: {
    width: '100%',
    maxWidth: CARD_MAX,
    backgroundColor: c.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: c.inputBorder,
    padding: 14,
    ...Platform.select({
      ios: { shadowColor: '#0F172A', shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } },
      android: { elevation: 2 },
    }),
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: c.text,
    flex: 1,
    marginRight: 8,
  },
  description: { marginTop: 6, fontSize: 13, color: c.text },
  
  // Product Specifics
  allergens: { marginTop: 6, fontSize: 12, color: '#b91c1c' },
  recommended: { marginTop: 4, fontSize: 12, color: '#15803d' },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  badgeText: { fontSize: 11, fontWeight: '700' },

  // Fact Specifics
  factImage: {
    width: '100%',
    height: 140,
    borderRadius: 12,
    marginBottom: 8,
  },

  // News Specifics
  newsMeta: { marginTop: 4, fontSize: 11, color: c.subtitle },
  newsLinkBtn: {
    marginTop: 10,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: c.inputBorder,
    backgroundColor: '#E5E9F5',
  },
  newsLinkText: { fontSize: 13, fontWeight: '700', color: '#0F172A' },

  // Empty State
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  emptyText: {
    color: c.subtitle,
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 12,
  },
});