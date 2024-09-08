"use client"
import { useState, useEffect, useMemo } from "react";
import { ThemeProvider } from "@mui/material/styles";

export default function CustomThemeProvider({ lightTheme, darkTheme, children }) {
  const [mode, setMode] = useState('dark');

  useEffect(() => {
    if (!window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    setMode(mediaQuery.matches ? 'dark' : 'light');

    const handleChange = (e) => {
      setMode(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const theme = useMemo(() => (mode === 'dark' ? darkTheme : lightTheme), [mode, darkTheme, lightTheme]);

  return (
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  );
}