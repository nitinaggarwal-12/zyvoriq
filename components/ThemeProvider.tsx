"use client";

import React, { createContext, useContext, useEffect } from "react";

export type ThemeMode = "light";

interface ThemeContextType {
  theme: ThemeMode;
  resolvedTheme: "light";
  setTheme: () => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark");
    root.classList.add("light");
    root.style.colorScheme = "light";
    localStorage.setItem("zyvoriq_theme", "light");
  }, []);

  return (
    <ThemeContext.Provider
      value={{ theme: "light", resolvedTheme: "light", setTheme: () => {}, toggleTheme: () => {} }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return (
    useContext(ThemeContext) || {
      theme: "light" as const,
      resolvedTheme: "light" as const,
      setTheme: () => {},
      toggleTheme: () => {},
    }
  );
}
