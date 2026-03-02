import React, { createContext, useContext, useMemo, useState } from "react";
import { useColorScheme } from "react-native";

type AppThemeMode = "light" | "dark";

type ThemeContextType = {
  mode: AppThemeMode;
  isDark: boolean;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  mode: "light",
  isDark: false,
  toggleTheme: () => {},
});

export const AppThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemColorScheme = useColorScheme();
  const initialMode: AppThemeMode = systemColorScheme === "dark" ? "dark" : "light";
  const [mode, setMode] = useState<AppThemeMode>(initialMode);

  const value = useMemo(
    () => ({
      mode,
      isDark: mode === "dark",
      toggleTheme: () => setMode((prev) => (prev === "dark" ? "light" : "dark")),
    }),
    [mode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useAppTheme = () => useContext(ThemeContext);
