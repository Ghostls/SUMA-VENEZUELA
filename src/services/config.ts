import { supabase } from '@/lib/supabase'

/**
 * config.ts — Servicio de configuración del evento
 * Lee/escribe pares clave-valor en event_config (Supabase)
 */

export async function getTasaBCV(): Promise<number | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('event_config')
    .select('value')
    .eq('key', 'tasa_bcv')
    .single()
  if (error || !data) { console.error('getTasaBCV error:', error); return null }
  const n = parseFloat(data.value)
  return isNaN(n) || n <= 0 ? null : n
}

export async function setTasaBCV(tasa: number): Promise<boolean> {
  if (!supabase) return false
  const { error } = await supabase
    .from('event_config')
    .update({ value: String(tasa), updated_at: new Date().toISOString() })
    .eq('key', 'tasa_bcv')
  if (error) { console.error('setTasaBCV error:', error); return false }
  return true
}