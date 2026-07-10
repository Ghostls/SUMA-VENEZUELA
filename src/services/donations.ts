import { supabase } from '@/lib/supabase'

export interface Donation {
  id?: string
  created_at?: string
  first_name: string
  last_name: string
  email?: string
  amount_eur: number
  ref_bancaria?: string
  comprobante_url?: string
  status?: 'pendiente' | 'verificado'
}

export async function createDonation(d: Omit<Donation, 'id' | 'created_at' | 'status'>) {
  if (!supabase) return { error: new Error('No supabase') }
  const { error } = await supabase.from('donations').insert(d)
  return { error }
}

export async function fetchDonationStats(): Promise<{ total: number; count: number }> {
  if (!supabase) return { total: 0, count: 0 }
  const { data, error } = await supabase
    .from('donations')
    .select('amount_eur, status')
    .eq('status', 'verificado')
  if (error || !data) return { total: 0, count: 0 }
  return {
    count: data.length,
    total: data.reduce((acc, d) => acc + (d.amount_eur ?? 0), 0),
  }
}