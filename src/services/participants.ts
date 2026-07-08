import { supabase, type Participant } from '@/lib/supabase'

const DEMO_KEY = 'suma_demo_participants'

function demoList(): Participant[] {
  try { return JSON.parse(localStorage.getItem(DEMO_KEY) || '[]') } catch { return [] }
}

export async function createParticipant(p: Participant) {
  if (!supabase) {
    const list = demoList()
    list.unshift({ ...p, id: crypto.randomUUID(), created_at: new Date().toISOString(), payment_status: 'pendiente', registration_status: 'activo' })
    localStorage.setItem(DEMO_KEY, JSON.stringify(list))
    return { error: null }
  }
  const { error } = await supabase.from('participants').insert({ ...p, payment_status: 'pendiente', registration_status: 'activo' })
  return { error }
}

export async function fetchParticipants(): Promise<Participant[]> {
  if (!supabase) return demoList()
  const { data, error } = await supabase.from('participants').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return (data || []) as Participant[]
}

export async function updateParticipant(id: string, patch: Partial<Participant>) {
  if (!supabase) {
    const list = demoList().map(p => (p.id === id ? { ...p, ...patch } : p))
    localStorage.setItem(DEMO_KEY, JSON.stringify(list))
    return { error: null }
  }
  const { error } = await supabase.from('participants').update(patch).eq('id', id)
  return { error }
}

export function subscribeParticipants(onChange: () => void) {
  if (!supabase) return () => {}
  const channel = supabase
    .channel('participants-rt')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'participants' }, onChange)
    .subscribe()
  return () => { supabase?.removeChannel(channel) }
}

// ── URL firmada para comprobante (bucket: comprobantes, 1 hora) ───────────────
export async function getComprobanteUrl(path: string): Promise<string | null> {
  if (!supabase || !path) return null
  const { data, error } = await supabase.storage
    .from('comprobantes')
    .createSignedUrl(path, 3600) // 1 hora de validez
  if (error) { console.error('getComprobanteUrl:', error); return null }
  return data.signedUrl
}