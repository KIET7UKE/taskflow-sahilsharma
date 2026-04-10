import { createContext, useContext, useEffect, useState } from "react"

/**
 * Valid theme options.
 */
type Theme = "dark" | "light" | "system"

/**
 * Interface for the ThemeProvider context state.
 */
interface ThemeProviderState {
  theme: Theme
  setTheme: (theme: Theme) => void
}

/**
 * Initial state for the ThemeProvider context.
 */
const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
}

/**
 * Context for managing the application theme.
 */
const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

/**
 * ThemeProvider Props.
 */
interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

/**
 * ThemeProvider Component.
 * Manages the application theme (dark/light/system) and persists it to localStorage.
 * Automatically applies the theme to the <html> element.
 */
export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  )

  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove("light", "dark")

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light"

      root.classList.add(systemTheme)
      return
    }

    root.classList.add(theme)
  }, [theme])

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme)
      setTheme(theme)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

/**
 * Custom hook to access the current theme and theme setter.
 */
export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
