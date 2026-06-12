import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

// الألوان الفاتحة (Light Mode)
import colors from "@constants/colors";

export const lightColors = {
  primary: colors.primary,
  primaryDark: colors.primaryDark,
  primaryLight: colors.primaryLight,
  primarySoft: colors.primarySoft,
  secondary: colors.secondary,
  secondaryDark: colors.secondaryDark,
  secondaryLight: colors.secondaryLight,
  secondarySoft: colors.secondarySoft,
  background: "#F8FAFC",
  card: "#FFFFFF",
  text: "#0F172A",
  textSecondary: "#64748B",
  border: "#E2E8F0",
  success: "#10B981",
  error: "#EF4444",
  warning: "#F59E0B",
  white: "#FFFFFF",
  black: "#0F172A",
  gray: "#64748B",
  grayLight: "#94A3B8",
  graySoft: "#E2E8F0",
};

// الألوان الداكنة (Dark Mode)
export const darkColors = {
  primary: "#FF9F4A",
  primaryDark: "#FF6B00",
  primaryLight: "#FFB86C",
  primarySoft: "#3D2A1A",
  secondary: "#60A5FA",
  secondaryDark: "#3B82F6",
  secondaryLight: "#93C5FD",
  secondarySoft: "#1E2A3A",
  background: "#0F172A",
  card: "#1E293B",
  text: "#F8FAFC",
  textSecondary: "#94A3B8",
  border: "#334155",
  success: "#34D399",
  error: "#F87171",
  warning: "#FBBF24",
  white: "#F8FAFC",
  black: "#0F172A",
  gray: "#94A3B8",
  grayLight: "#64748B",
  graySoft: "#334155",
};

type ThemeType = "light" | "dark";

interface ThemeContextType {
  theme: ThemeType;
  colors: typeof lightColors;
  toggleTheme: () => void;
  setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setThemeState] = useState<ThemeType>("light");

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem("theme");
      if (savedTheme === "dark") {
        setThemeState("dark");
      }
    } catch (error) {
      console.error("Failed to load theme", error);
    }
  };

  const setTheme = async (newTheme: ThemeType) => {
    setThemeState(newTheme);
    await AsyncStorage.setItem("theme", newTheme);
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
  };

  const colors = theme === "light" ? lightColors : darkColors;

  return (
    <ThemeContext.Provider value={{ theme, colors, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
