import type { Participant } from '@/lib/supabase'

export const INSCRIPTION_USD = 20
export const NATIONAL_GOAL = 200

// CITY y STATES apuntan al mismo array — CITY es el nombre usado en los forms
// STATES se mantiene por compatibilidad con useParticipants y otros consumidores
export const CITY = [
  'Barquisimeto',
  'Caracas',
  'Maracay',
  'Mérida',
  'Lechería',
  'Margarita',
  'Maturín',
  'Barinas',        // ← nuevo: Padel Sports Barinas
  'San Cristóbal',  // ← nuevo: Smash Padel + Andes Padel
  'Puerto Cabello',
  'Puerto Ordaz', // ← nuevo: Waikiki Beach Padel Club
]

export const STATES = CITY // alias para compatibilidad

export const CLUBS = [
  { name: 'Victoria Padel Club',      state: 'Barquisimeto',  goal: 32 },
  { name: 'Capital Sports',           state: 'Caracas',       goal: 32 },
  { name: 'Olympus Sport Club',       state: 'Maracay',       goal: 32 },
  { name: 'Metro Atletik',            state: 'Mérida',       goal: 32 },
  { name: 'La Marina Sport Club',     state: 'Lechería',      goal: 32 },
  { name: 'Margarita Pádel Club',     state: 'Margarita',     goal: 32 },
  { name: 'Saque Pádel Club',       state: 'Maturín',       goal: 32 },
  { name: 'Padel Sports Barinas',     state: 'Barinas',       goal: 32 }, // ← nuevo
  { name: 'Smash Padel',state: 'San Cristóbal', goal: 32 }, // ← nuevo
  { name: 'Arenas Padel Club',        state: 'Puerto Ordaz',      goal: 32 }, // ← nuevo
  { name: 'Waikiki Beach Padel Club', state: 'Puerto Cabello',      goal: 32 }, // ← nuevo
]

export const CATEGORIES: Record<'M' | 'F', string[]> = {
  M: ['Suma 7', 'Suma 11', 'Séptima'],
  F: ['Suma 10'],
}


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
    byState[p.city] = (byState[p.city] || 0) + 1
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