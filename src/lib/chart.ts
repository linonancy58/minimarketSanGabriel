import { useTheme } from './theme'

// Paleta categórica validada (orden fijo, CVD-safe en series adyacentes).
// Cada entidad conserva su color por posición estable, nunca por ranking.
const SERIES = {
  light: ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#6250d6', '#e34948'],
  dark: ['#3987e5', '#d95926', '#199e70', '#c98500', '#d55181', '#008300', '#9085e9', '#e66767'],
}

const CHROME = {
  light: { grid: '#e6e8ec', axis: '#d0d4db', tick: '#6b7280', surface: '#ffffff' },
  dark: { grid: '#1f2633', axis: '#2b3444', tick: '#8b93a3', surface: '#121826' },
}

export function useChartTheme() {
  const { resolved } = useTheme()
  const animate = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  return { series: SERIES[resolved], ...CHROME[resolved], animate }
}
