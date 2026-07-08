import type { Participant } from '@/lib/supabase'

export const INSCRIPTION_USD = 20
export const NATIONAL_GOAL = 200

export const STATES = ['Barquisimeto', 'Caracas', 'Maracay', 'Mérida', 'Lechería', 'Margarita', 'Maturin']

export const CLUBS = [
  { name: 'Victoria Padel Club', state: 'Barquisimeto', goal: 32 },
  { name: 'Capital Sports', state: 'Caracas', goal: 32 },
  { name: 'Olympus Sport Club', state: 'Maracay', goal: 32 },
  { name: 'Metro Atletik', state: 'Caracas', goal: 32 },
  { name: 'Mérida Pádel Tour', state: 'Mérida', goal: 32 },
  { name: 'La Marina Sport Club', state: 'Lechería', goal: 32 },
  { name: 'Margarita Pádel Club', state: 'Margarita', goal: 32 },
  { name: 'Maturín Pádel Club', state: 'Maturín', goal: 32 },
]

export const CATEGORIES: Record<'M' | 'F', string[]> = {
  M: ['Suma 7', 'Suma 11', 'Séptima'],
  F: ['Suma 10'],
}

export const LEVELS = ['Iniciación', 'Intermedio', 'Avanzado', 'Competitivo']

export interface DashboardStats {
  total: number
  male: number
  female: number
  activeStates: number
  activeClubs: number
  raised: number
  goalPct: number
  byState: Record<string, number>
  byClub: Record<string, number>
}

export function computeStats(list: Participant[]): DashboardStats {
  const active = list.filter(p => p.registration_status !== 'anulado')
  const byState: Record<string, number> = {}
  const byClub: Record<string, number> = {}
  let male = 0, female = 0
  for (const p of active) {
    byState[p.city] = (byState[p.city] || 0) + 1   // ← city (columna real)
    byClub[p.club]  = (byClub[p.club]  || 0) + 1
    p.gender === 'M' ? male++ : female++
  }
  const total = active.length
  return {
    total, male, female,
    activeStates: Object.keys(byState).length,
    activeClubs:  Object.keys(byClub).length,
    raised:   total * INSCRIPTION_USD,
    goalPct:  Math.min(100, Math.round((total / NATIONAL_GOAL) * 100)),
    byState, byClub,
  }
}