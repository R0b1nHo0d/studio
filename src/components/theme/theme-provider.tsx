
"use client";

import React, { useEffect } from 'react';
import { useTheme } from '@/hooks/use-theme';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  // The useTheme hook handles applying the theme class and persisting it.
  // This provider's main role is to ensure the hook runs.
  useTheme();

  return <>{children}</>;
}
