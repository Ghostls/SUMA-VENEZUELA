import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string

// Sin credenciales el cliente queda en null: la app funciona en modo demo (localStorage).
export const supabase = url && key ? createClient(url, key) : null

export interface Participant {
  id?: string
  created_at?: string
  first_name: string
  last_name: string
  cedula: string
  email: string
  phone: string
  gender: 'M' | 'F'
  age: number
  city: string
  club: string
  category: string
  level?: string
  payment_status?: 'pendiente' | 'verificado'
  registration_status?: 'activo' | 'anulado'
  comprobante_url?: string
  ref_bancaria?: string
  notes?: string
  partner_cedula?: string   // ← dupla: cédula del compañero
}