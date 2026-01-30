import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { themeNames, type ThemeName, type ThemeMode } from '../../types';

interface ThemeContextType {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  resolvedMode: 'light' | 'dark';
  availableThemes: readonly string[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Get initial theme from localStorage to prevent flash
const getInitialTheme = (): { theme: ThemeName; themeMode: ThemeMode } => {
  if (typeof window === 'undefined') {
    return { theme: 'amethyst-haze', themeMode: 'system' };
  }
  
  try {
    const stored = localStorage.getItem('story-ai-chat-storage');
    if (stored) {
      const parsed = JSON.parse(stored);
      const theme = parsed.state?.settings?.theme;
      const themeMode = parsed.state?.settings?.themeMode;
      return {
        theme: themeNames.includes(theme) ? theme : 'amethyst-haze',
        themeMode: ['light', 'dark', 'system'].includes(themeMode) ? themeMode : 'system',
      };
    }
  } catch {
    // Ignore parsing errors
  }
  
  return { theme: 'amethyst-haze', themeMode: 'system' };
};

// Get resolved mode based on themeMode
const getResolvedMode = (themeMode: ThemeMode): 'light' | 'dark' => {
  if (themeMode === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return themeMode;
};

// Apply theme to document
const applyTheme = (theme: ThemeName, resolvedMode: 'light' | 'dark') => {
  if (typeof document === 'undefined') return;
  
  const root = document.documentElement;
  root.setAttribute('data-theme', theme);
  
  if (resolvedMode === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
};

// Set initial theme immediately to prevent flash
const initial = getInitialTheme();
const initialResolvedMode = typeof window !== 'undefined' ? getResolvedMode(initial.themeMode) : 'light';
applyTheme(initial.theme, initialResolvedMode);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { settings, setSettings } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const theme = settings.theme;
  const themeMode = settings.themeMode;
  const [resolvedMode, setResolvedMode] = useState<'light' | 'dark'>(initialResolvedMode);

  useEffect(() => {
    setMounted(true);
    
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (settings.themeMode === 'system') {
        const newMode = getResolvedMode('system');
        setResolvedMode(newMode);
        applyTheme(theme, newMode);
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [settings.themeMode, theme]);

  useEffect(() => {
    if (mounted) {
      const newResolvedMode = getResolvedMode(themeMode);
      setResolvedMode(newResolvedMode);
      applyTheme(theme, newResolvedMode);
    }
  }, [theme, themeMode, mounted]);

  const setTheme = (newTheme: ThemeName) => {
    setSettings({ theme: newTheme });
  };

  const setThemeMode = (newMode: ThemeMode) => {
    setSettings({ themeMode: newMode });
  };

  return (
    <ThemeContext.Provider 
      value={{ 
        theme, 
        setTheme, 
        themeMode, 
        setThemeMode, 
        resolvedMode, 
        availableThemes: themeNames 
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
