'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type SgcsTheme = 'dark' | 'light';

interface ThemeContextValue {
  theme: SgcsTheme;
  setTheme: (theme: SgcsTheme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  setTheme: () => {},
  toggleTheme: () => {},
});

const STORAGE_KEY = 'sgcs-theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<SgcsTheme>('dark');

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY) as SgcsTheme | null;
      const initial: SgcsTheme = saved === 'light' || saved === 'dark' ? saved : 'dark';
      setThemeState(initial);
      applyThemeToDocument(initial);
    } catch {
      applyThemeToDocument('dark');
    }
  }, []);

  const applyThemeToDocument = (nextTheme: SgcsTheme) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(nextTheme);
    root.setAttribute('data-theme', nextTheme);
  };

  const setTheme = (nextTheme: SgcsTheme) => {
    setThemeState(nextTheme);
    applyThemeToDocument(nextTheme);
    try {
      window.localStorage.setItem(STORAGE_KEY, nextTheme);
    } catch {
      // Ignorar errores de almacenamiento en modo privado
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useSgcsTheme() {
  return useContext(ThemeContext);
}
