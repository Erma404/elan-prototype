import { useEffect, useState } from 'react'

export type ThemeChoice = 'light' | 'dark' | 'system'
const KEY = 'elan:theme'

const read = (): ThemeChoice => {
  try {
    const v = localStorage.getItem(KEY)
    return v === 'light' || v === 'dark' ? v : 'system'
  } catch {
    return 'system'
  }
}

export const resolveTheme = (c: ThemeChoice): 'light' | 'dark' =>
  c === 'system' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : c

export const applyTheme = (c: ThemeChoice = read()) => {
  document.documentElement.dataset.theme = resolveTheme(c)
}

export function useTheme() {
  const [choice, setChoice] = useState<ThemeChoice>(read)
  useEffect(() => {
    applyTheme(choice)
    try {
      if (choice === 'system') localStorage.removeItem(KEY)
      else localStorage.setItem(KEY, choice)
    } catch { /* stockage indisponible */ }
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const on = () => choice === 'system' && applyTheme('system')
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [choice])
  return { choice, setChoice, resolved: resolveTheme(choice) }
}
