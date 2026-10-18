import { createContext, useContext, useEffect, useState } from 'react'

export type Theme = 'light' | 'dark' | 'system'
type Ctx = { theme: Theme; resolved: 'light' | 'dark'; setTheme: (t: Theme) => void }

const ThemeContext = createContext<Ctx | null>(null)
const STORAGE_KEY = 'sg-theme'

function leerTema(): Theme {
  try {
    const t = localStorage.getItem(STORAGE_KEY)
    if (t === 'light' || t === 'dark' || t === 'system') return t
  } catch {}
  return 'system'
}

function sistemaOscuro() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(leerTema)
  const [systemDark, setSystemDark] = useState(sistemaOscuro)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => setSystemDark(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const resolved = theme === 'system' ? (systemDark ? 'dark' : 'light') : theme

  useEffect(() => {
    document.documentElement.classList.toggle('dark', resolved === 'dark')
    document.documentElement.style.colorScheme = resolved
  }, [resolved])

  function setTheme(t: Theme) {
    setThemeState(t)
    try { localStorage.setItem(STORAGE_KEY, t) } catch {}
  }

  return <ThemeContext.Provider value={{ theme, resolved, setTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme debe usarse dentro de ThemeProvider')
  return ctx
}
