import { useEffect, useState } from 'react'
import { DollarSign, Save, Check, RefreshCw } from 'lucide-react'
import { getTasaBCV, setTasaBCV } from '@/services/Config'

/**
 * TasaCambio.tsx — Panel admin para la tasa USD → Bs (patrón Rayocero)
 * El admin escribe la tasa manualmente; se sincroniza con el RegistrationForm.
 */

const PRECIO_USD = 20

export default function TasaCambio() {
  const [tasa, setTasa]       = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    const t = await getTasaBCV()
    if (t) setTasa(String(t))
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const save = async () => {
    const n = parseFloat(tasa.replace(',', '.'))
    if (isNaN(n) || n <= 0) { setError('Ingresa una tasa válida mayor a 0.'); return }
    setError(null)
    setSaving(true)
    const ok = await setTasaBCV(n)
    setSaving(false)
    if (ok) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } else {
      setError('No se pudo guardar la tasa. Intenta de nuevo.')
    }
  }

  const tasaNum = parseFloat(tasa.replace(',', '.'))
  const totalBs = !isNaN(tasaNum) && tasaNum > 0 ? PRECIO_USD * tasaNum : null

  return (
    <div className="glass rounded-2xl p-5 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <DollarSign size={18} className="text-gold" />
          <h3 className="text-sm uppercase tracking-widest text-gold">Tasa cambiaria (BCV)</h3>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          aria-label="Recargar tasa"
          className="text-white/40 hover:text-gold transition-colors"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
        <div className="flex-1">
          <label>Bs por 1 USD</label>
          <input
            type="text"
            inputMode="decimal"
            value={tasa}
            onChange={e => setTasa(e.target.value)}
            placeholder="Ej: 155.50"
            disabled={loading}
          />
        </div>
        <button
          type="button"
          onClick={save}
          disabled={saving || loading}
          className="btn-primary flex items-center justify-center gap-2 disabled:opacity-40"
        >
          {saved ? <Check size={16} /> : <Save size={16} />}
          {saving ? 'Guardando…' : saved ? 'Guardado' : 'Guardar tasa'}
        </button>
      </div>

      {totalBs !== null && (
        <p className="text-xs text-white/50 mt-3">
          Vista previa: la inscripción de {PRECIO_USD} USD se mostrará como{' '}
          <span className="text-gold font-mono">
            Bs. {totalBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </p>
      )}

      {error && <p className="text-red-400 text-xs mt-3">{error}</p>}
    </div>
  )
}