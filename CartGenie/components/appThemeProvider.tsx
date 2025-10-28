import React, { createContext, useContext, useMemo, PropsWithChildren } from 'react';
import { useColorScheme } from 'react-native';
import {
  Theme,
  DarkTheme as NavDark,
  DefaultTheme as NavLight,
  ThemeProvider as NavThemeProvider,
} from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';

export type AppColors = {
  background: string;
  card: string;
  text: string;
  subtitle: string;
  inputBg: string;
  inputBorder: string;
  accent: string;
  overlay: string;
};

const LightColors: AppColors = {
  background: '#F3F6FA',
  card: '#FFFFFF',
  text: '#0F172A',
  subtitle: '#6B7280',
  inputBg: '#F9FAFB',
  inputBorder: '#E5E7EB',
  accent: '#0096c7',
  overlay: 'rgba(17,24,39,0.35)',
};

const DarkColors: AppColors = {
  background: '#0F172A',
  card: '#1E293B',
  text: '#F8FAFC',
  subtitle: '#CBD5E1',
  inputBg: '#334155',
  inputBorder: '#475569',
  accent: '#0096c7',
  overlay: 'rgba(0,0,0,0.45)',
};

const ColorsCtx = createContext<AppColors>(LightColors);
export const useAppColors = () => useContext(ColorsCtx);

// אופציונלי: יצירת סטיילים דינמיים בקלות
export function useThemedStyles<T>(factory: (c: AppColors) => T) {
  const c = useAppColors();
  return useMemo(() => factory(c), [c]);
}

export default function AppThemeProvider({ children }: PropsWithChildren) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = isDark ? DarkColors : LightColors;

  const navTheme: Theme = useMemo(() => {
    const base = isDark ? NavDark : NavLight;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: colors.accent,
        background: colors.background,
        card: colors.card,
        text: colors.text,
        border: colors.inputBorder,
      },
    };
  }, [isDark, colors]);

  return (
    <NavThemeProvider value={navTheme}>
      <ColorsCtx.Provider value={colors}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        {children}
      </ColorsCtx.Provider>
    </NavThemeProvider>
  );
}
