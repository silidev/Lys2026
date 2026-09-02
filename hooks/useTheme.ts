const FILE_PATH = 'hooks/useTheme.ts';
import { useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import storageService from '../common/services/storageService.ts';

export type Theme = 'light' | 'dark' | 'system';

export function useTheme(): [Theme, (theme: Theme) => void] {
  const [theme, setTheme] = useLocalStorage<Theme>('theme', 'dark');

  useEffect(() => {
    const root = window.document.documentElement;
    const isDark =
      theme === 'dark' ||
      (theme === 'system' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);

    root.classList.toggle('dark', isDark);

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = (e: MediaQueryListEvent) => {
        // Only change if the theme is still 'system'
        const currentTheme = storageService.getItem<Theme>('theme');
        if (currentTheme === 'system') {
            root.classList.toggle('dark', e.matches);
        }
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  return [theme, setTheme];
}