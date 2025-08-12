// styles/layout.ts
import type { ViewStyle } from 'react-native';

export const Layout = {
  container: {
    flex: 1,
    paddingHorizontal: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-start',
  } as ViewStyle,   // ← key fix
} as const;
