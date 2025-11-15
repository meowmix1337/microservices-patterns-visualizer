import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

export type Theme = 'dark' | 'brutalism'

export interface ThemeContextValue {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

export interface ThemeProviderProps {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    // Get theme from localStorage or default to 'dark'
    const storedTheme = localStorage.getItem('theme')
    return (storedTheme === 'dark' || storedTheme === 'brutalism') ? storedTheme : 'dark'
  })

  useEffect(() => {
    // Save theme to localStorage whenever it changes
    localStorage.setItem('theme', theme)
    // Apply theme to document root
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const toggleTheme = (): void => {
    setTheme(prev => prev === 'dark' ? 'brutalism' : 'dark')
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
