import { StyleSheet, Platform } from 'react-native';
import Colors from './Colors';
import { Typography } from './typography';
import { Layout } from './layout';

const globalStyles = StyleSheet.create({
  container: {
    ...Layout.container,
    backgroundColor: Colors.background,
  },
  title: {
    ...Typography.title,
    marginTop: 50,
    marginBottom: 50,
  },
  input: {
    width: '100%',
    backgroundColor: '#f7f7f7',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#000',
    marginBottom: 18,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  button: {
    width: '100%',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: { elevation: 4 },
    }),
  },
  buttonText: {
    ...Typography.buttonText,
  },
});

export default globalStyles;
