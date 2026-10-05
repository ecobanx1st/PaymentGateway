"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useServerInsertedHTML } from "next/navigation";

const THEME_KEY = "ecobanx-theme";
const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");
  const [mounted, setMounted] = useState(false);

  useServerInsertedHTML(() => {
    return (
      <script
        id="theme-init"
        dangerouslySetInnerHTML={{
          __html: `(function(){
            try {
              var key = 'ecobanx-theme';
              var stored = localStorage.getItem(key);
              var theme = stored === 'dark' ? 'dark' : 'light';
              document.documentElement.dataset.theme = theme;
              document.documentElement.style.colorScheme = theme;
            } catch (e) {}
          })();`
        }}
      />
    );
  });

  useEffect(() => {
    let resolvedTheme = "light";
    try {
      if (window.localStorage.getItem(THEME_KEY) === "dark") {
        resolvedTheme = "dark";
      }
    } catch {
      // Keep light mode when browser storage is unavailable.
    }

    document.documentElement.dataset.theme = resolvedTheme;
    document.documentElement.style.colorScheme = resolvedTheme;

    // Hydrate React state from the same persisted theme applied by the pre-hydration script.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(resolvedTheme);
    setMounted(true);
  }, []);

  const setThemeMode = (nextTheme) => {
    document.documentElement.dataset.theme = nextTheme;
    document.documentElement.style.colorScheme = nextTheme;
    try {
      window.localStorage.setItem(THEME_KEY, nextTheme);
    } catch {
      // Theme switching still works when the preference cannot be saved.
    }
    setTheme(nextTheme);
  };

  const value = useMemo(
    () => ({
      theme,
      isDark: theme === "dark",
      mounted,
      setTheme: setThemeMode,
      toggleTheme: () => setThemeMode(theme === "dark" ? "light" : "dark"),
    }),
    [mounted, theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
}
