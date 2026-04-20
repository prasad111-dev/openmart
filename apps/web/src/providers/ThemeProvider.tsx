import { useEffect, type ReactNode } from 'react'

interface ThemeProviderProps {
  children: ReactNode
  defaultTheme?: 'dark' | 'light'
}

export function ThemeProvider({ children, defaultTheme = 'dark' }: ThemeProviderProps) {
  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('dark', 'light')
    root.classList.add(defaultTheme)
  }, [defaultTheme])

  return <>{children}</>
}
