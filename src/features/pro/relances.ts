import { create } from 'zustand'
export type Relance = { id: number; date: string; type: 'relance' | 'correction' | 'instruction' | 'modification'; texte: string }
let n = 0
export const useRelances = create<{ items: Relance[]; add: (type: Relance['type'], texte: string) => void; clear: () => void }>((set) => ({
  items: [], add: (type, texte) => set((s) => ({ items: [{ id: ++n, date: new Date().toISOString(), type, texte }, ...s.items] })), clear: () => set({ items: [] }),
}))
