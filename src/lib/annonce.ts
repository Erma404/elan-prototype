import { create } from 'zustand'
/** Région aria-live : les statuts de dépôt sont annoncés aux lecteurs d'écran. */
export const useAnnonce = create<{ msg: string; say: (m: string) => void }>((set) => ({
  msg: '',
  say: (msg) => { set({ msg: '' }); setTimeout(() => set({ msg }), 30) },
}))
export const say = (m: string) => useAnnonce.getState().say(m)
