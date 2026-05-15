import React, { createContext, useContext } from 'react';
import { useAppStore } from '../store/appStore';
import { colors as lightColors, darkColors, Colors } from '../constants/colors';

interface ThemeContextValue {
  colors: Colors;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
  colors: lightColors,
  isDark: false,
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isDarkMode = useAppStore((s) => s.isDarkMode);
  return (
    <ThemeContext.Provider value={{ colors: isDarkMode ? darkColors : lightColors, isDark: isDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
