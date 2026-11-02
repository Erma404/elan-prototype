import { create } from 'zustand'

export type EventName = 'eligibilite_demarree' | 'eligibilite_resultat' | 'pieces_ecran_vu' | 'piece_deposee' | 'piece_a_corriger' | 'aide_ia_utilisee' | 'envoi_clique' | 'envoi_reussi'
export type LogEvent = { id: number; name: EventName; at: number; detail?: string }

type S = { events: LogEvent[]; log: (name: EventName, detail?: string) => void; clear: () => void }
let n = 0
export const useEvents = create<S>((set) => ({
  events: [],
  log: (name, detail) => set((s) => ({ events: [{ id: ++n, name, at: Date.now(), detail }, ...s.events].slice(0, 200) })),
  clear: () => set({ events: [] }),
}))
export const track = (name: EventName, detail?: string) => useEvents.getState().log(name, detail)
