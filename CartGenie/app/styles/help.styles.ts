import { StyleSheet, Platform } from 'react-native';
import { AppColors } from '@/components/appThemeProvider';

export const createHelpStyles = (c: AppColors) => StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: c.background,
    padding: 20,
  },

  // Header
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: c.text,
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: c.subtitle,
    textAlign: 'center',
    maxWidth: '85%',
    lineHeight: 22,
  },

  // Card
  card: {
    backgroundColor: c.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: c.inputBorder,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
      android: { elevation: 2 },
    }),
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: c.text,
    marginBottom: 16,
  },

  // FAQ Item
  faqItem: {
    marginBottom: 16,
  },
  question: {
    fontSize: 15,
    fontWeight: '600',
    color: c.text,
    marginBottom: 4,
  },
  answer: {
    fontSize: 14,
    color: c.subtitle,
    lineHeight: 20,
    paddingLeft: 8,
  },

  // Contact Section
  text: {
    fontSize: 14,
    color: c.subtitle,
    marginBottom: 16,
    lineHeight: 20,
  },
  button: {
    backgroundColor: c.accent || '#0096c7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    padding: 18,
    justifyContent: 'center',
  },
  modalCard: {
    backgroundColor: c.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: c.inputBorder,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.12,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 10 },
      },
      android: { elevation: 6 },
    }),
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: c.text,
  },
  modalCloseBtn: {
    padding: 6,
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: c.subtitle,
    marginBottom: 6,
    marginTop: 8,
  },
  modalInput: {
    width: '100%',
    backgroundColor: c.inputBg,
    borderWidth: 1,
    borderColor: c.inputBorder,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: c.text,
    fontSize: 15,
  },
  modalDescHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  counterText: {
    fontSize: 12,
    color: c.subtitle,
  },
  modalTextarea: {
    width: '100%',
    minHeight: 120,
    backgroundColor: c.inputBg,
    borderWidth: 1,
    borderColor: c.inputBorder,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: c.text,
    fontSize: 15,
  },
  sendBtn: {
    marginTop: 14,
    backgroundColor: c.accent || '#0096c7',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  sendBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
