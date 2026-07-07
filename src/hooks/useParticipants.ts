import { useCallback, useEffect, useState } from 'react'
import type { Participant } from '@/lib/supabase'
import { fetchParticipants, subscribeParticipants } from '@/services/participants'
import { computeStats, type DashboardStats } from '@/services/dashboard'

export function useParticipants() {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    try {
      setLoading(true)  // ← resetea loading en cada recarga (importante para Realtime)
      const data = await fetchParticipants()
      setParticipants(data)
      setError(null)
    } catch (err) {
      console.error('useParticipants error:', err)  // ← log para diagnosticar
      setError('No se pudieron cargar los participantes.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    reload()
    const unsub = subscribeParticipants(reload)
    return () => unsub()  // ← cleanup explícito más seguro
  }, [reload])

  const stats: DashboardStats = computeStats(participants)
  return { participants, stats, loading, error, reload }
}