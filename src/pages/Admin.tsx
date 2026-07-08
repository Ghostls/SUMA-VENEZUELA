import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, Download, CheckCircle2, XCircle, RotateCcw, Users, DollarSign, Shield, MapPin, Globe, ImageIcon, ChevronDown, ChevronUp } from 'lucide-react'
import { useParticipants } from '@/hooks/useParticipants'
import { updateParticipant } from '@/services/participants'
import { STATES, CLUBS, INSCRIPTION_USD } from '@/services/dashboard'
import TasaCambio from '@/pages/TasaCambio'
import { supabase } from '@/lib/supabase'
import type { Participant } from '@/lib/supabase'

/**
 * Admin.tsx — v3.1 (Evolución sin Destrucción)
 * - NUEVO v3.1: Visualización de dos comprobantes por participante
 *   (expandible por fila, URLs firmadas desde Supabase Storage)
 * - v3.0: Pestañas por club, KPIs contextuales, TasaCambio
 */

const ADMIN_PIN = 'SUMA2026'

// ── URL firmada para ver un comprobante ──────────────────────
async function getSignedUrl(path: string): Promise<string | null> {
  if (!supabase || !path) return null
  const { data, error } = await supabase.storage
    .from('comprobantes')
    .createSignedUrl(path, 60 * 5) // 5 minutos
  if (error) { console.error('signedUrl error:', error); return null }
  return data.signedUrl
}

// ── Mini panel de comprobantes expandible ────────────────────
function ComprobantesPanel({ p }: { p: Participant }) {
  const [open, setOpen]     = useState(false)
  const [url1, setUrl1]     = useState<string | null>(null)
  const [url2, setUrl2]     = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const hasAny = p.comprobante_url || p.comprobante_url_2

  const load = async () => {
    if (open) { setOpen(false); return }
    setOpen(true)
    if (url1 || url2) return // ya cargados
    setLoading(true)
    const [u1, u2] = await Promise.all([
      p.comprobante_url   ? getSignedUrl(p.comprobante_url)   : Promise.resolve(null),
      p.comprobante_url_2 ? getSignedUrl(p.comprobante_url_2) : Promise.resolve(null),
    ])
    setUrl1(u1)
    setUrl2(u2)
    setLoading(false)
  }

  if (!hasAny) return <span className="text-white/20 text-xs">Sin comprobante</span>

  return (
    <div>
      <button
        onClick={load}
        className="flex items-center gap-1.5 text-xs text-gold hover:text-gold/80 transition-colors"
      >
        <ImageIcon size={13} />
        Ver ({[p.comprobante_url, p.comprobante_url_2].filter(Boolean).length})
        {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>

      {open && (
        <div className="mt-2 flex flex-col gap-2">
          {loading && <p className="text-white/30 text-xs">Cargando…</p>}
          {url1 && (
            <a href={url1} target="_blank" rel="noopener noreferrer">
              <img src={url1} alt="Comprobante J1" className="rounded-lg max-h-40 object-contain border border-white/10 bg-black/40 hover:border-gold/40 transition-colors" />
              <p className="text-[10px] text-white/40 mt-1">Jugador 1</p>
            </a>
          )}
          {url2 && (
            <a href={url2} target="_blank" rel="noopener noreferrer">
              <img src={url2} alt="Comprobante J2" className="rounded-lg max-h-40 object-contain border border-white/10 bg-black/40 hover:border-gold/40 transition-colors" />
              <p className="text-[10px] text-white/40 mt-1">Jugador 2</p>
            </a>
          )}
        </div>
      )}
    </div>
  )
}

export default function Admin() {
  const [authed, setAuthed] = useState(sessionStorage.getItem('suma_admin') === '1')
  const [pin, setPin] = useState('')

  if (!authed) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="glass rounded-3xl p-10 w-full max-w-sm text-center">
          <h1 className="display text-3xl mb-6">Panel <span className="text-gold">Admin</span></h1>
          <label>Código de acceso</label>
          <input type="password" value={pin} onChange={e => setPin(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && pin === ADMIN_PIN) { sessionStorage.setItem('suma_admin', '1'); setAuthed(true) } }}
            placeholder="••••••••" />
          <button className="btn-primary w-full mt-5"
            onClick={() => { if (pin === ADMIN_PIN) { sessionStorage.setItem('suma_admin', '1'); setAuthed(true) } }}>
            Entrar
          </button>
          <Link to="/" className="block text-white/40 text-xs mt-6 hover:text-gold">← Volver al inicio</Link>
        </div>
      </main>
    )
  }
  return <AdminPanel />
}

const GLOBAL_TAB = '__global__'

function AdminPanel() {
  const { participants, stats, loading, error, reload } = useParticipants()
  const [q, setQ] = useState('')
  const [fState, setFState] = useState('')
  const [fPay, setFPay] = useState('')
  const [tab, setTab] = useState<string>(GLOBAL_TAB)

  const isGlobal = tab === GLOBAL_TAB

  const tabParticipants = useMemo(
    () => isGlobal ? participants : participants.filter(p => p.club === tab),
    [participants, tab, isGlobal]
  )

  const filtered = useMemo(() => tabParticipants.filter(p => {
    const text = `${p.first_name} ${p.last_name} ${p.cedula} ${p.email} ${p.phone}`.toLowerCase()
    return (!q || text.includes(q.toLowerCase()))
      && (!fState || p.city === fState)
      && (!fPay || p.payment_status === fPay)
  }), [tabParticipants, q, fState, fPay])

  const countByClub = useMemo(() => {
    const map: Record<string, number> = {}
    for (const p of participants) {
      if (p.registration_status === 'anulado') continue
      map[p.club] = (map[p.club] ?? 0) + 1
    }
    return map
  }, [participants])

  const setPay = async (p: Participant, status: 'pendiente' | 'verificado') => {
    if (!p.id) return
    await updateParticipant(p.id, { payment_status: status })
    reload()
  }
  const toggleReg = async (p: Participant) => {
    if (!p.id) return
    await updateParticipant(p.id, { registration_status: p.registration_status === 'anulado' ? 'activo' : 'anulado' })
    reload()
  }

  const exportCSV = () => {
    const head = ['Nombre','Apellido','Cédula','Email','Teléfono','Sexo','Edad','Ciudad','Club','Categoría','Pago','Estatus','Fecha']
    const rows = filtered.map(p => [p.first_name,p.last_name,p.cedula,p.email,p.phone,p.gender,p.age,p.city,p.club,p.category,p.payment_status,p.registration_status,p.created_at]
      .map(v => `"${String(v ?? '').replace(/"/g,'""')}"`).join(','))
    const blob = new Blob(['\uFEFF' + [head.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    const suffix = isGlobal ? 'global' : tab.toLowerCase().replace(/\s+/g, '-')
    a.download = `suma-venezuela-${suffix}-${new Date().toISOString().slice(0,10)}.csv`
    a.click()
  }

  const tabActive   = tabParticipants.filter(p => p.registration_status !== 'anulado')
  const tabVerified = tabActive.filter(p => p.payment_status === 'verificado').length
  const tabCities   = new Set(tabActive.map(p => p.city)).size

  const kpis = isGlobal
    ? [
        { icon: Users, label: 'Inscritos activos', value: stats.total },
        { icon: DollarSign, label: 'Recaudación estimada', value: `$${stats.raised}` },
        { icon: CheckCircle2, label: 'Pagos verificados', value: `${tabVerified} ($${tabVerified * INSCRIPTION_USD})` },
        { icon: MapPin, label: 'Ciudades activas', value: stats.activeStates },
        { icon: Shield, label: 'Clubes activos', value: stats.activeClubs },
      ]
    : [
        { icon: Users, label: 'Inscritos del club', value: tabActive.length },
        { icon: DollarSign, label: 'Recaudación estimada', value: `$${tabActive.length * INSCRIPTION_USD}` },
        { icon: CheckCircle2, label: 'Pagos verificados', value: `${tabVerified} ($${tabVerified * INSCRIPTION_USD})` },
        { icon: MapPin, label: 'Ciudades del club', value: tabCities },
        { icon: Shield, label: 'Pagos pendientes', value: tabActive.length - tabVerified },
      ]

  return (
    <main className="min-h-screen px-4 md:px-8 py-8 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="display text-3xl md:text-4xl">Panel <span className="text-gold">Admin</span></h1>
        <div className="flex gap-3">
          <button onClick={exportCSV} className="btn-ghost !px-5 !py-2 text-xs">
            <Download size={14} /> Exportar CSV {isGlobal ? '(Global)' : `(${tab})`}
          </button>
          <Link to="/" className="btn-ghost !px-5 !py-2 text-xs">Ver sitio</Link>
        </div>
      </div>

      {/* ── Pestañas ─────────────────────────────────────────────── */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 -mx-1 px-1">
        <button
          onClick={() => setTab(GLOBAL_TAB)}
          className={`flex-shrink-0 flex items-center gap-2 rounded-full px-4 py-2 text-xs uppercase tracking-widest transition-colors border ${
            isGlobal ? 'bg-gold/20 border-gold/50 text-gold' : 'bg-white/5 border-white/10 text-white/50 hover:text-white/80 hover:border-white/25'
          }`}
        >
          <Globe size={13} />
          Global
          <span className={`rounded-full px-2 py-0.5 text-[10px] ${isGlobal ? 'bg-gold/25' : 'bg-white/10'}`}>
            {participants.filter(p => p.registration_status !== 'anulado').length}
          </span>
        </button>
        {CLUBS.map(c => {
          const active = tab === c.name
          return (
            <button
              key={c.name}
              onClick={() => setTab(c.name)}
              className={`flex-shrink-0 flex items-center gap-2 rounded-full px-4 py-2 text-xs uppercase tracking-widest transition-colors border ${
                active ? 'bg-gold/20 border-gold/50 text-gold' : 'bg-white/5 border-white/10 text-white/50 hover:text-white/80 hover:border-white/25'
              }`}
            >
              <Shield size={13} />
              {c.name}
              <span className={`rounded-full px-2 py-0.5 text-[10px] ${active ? 'bg-gold/25' : 'bg-white/10'}`}>
                {countByClub[c.name] ?? 0}
              </span>
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {kpis.map(k => (
          <motion.div key={`${tab}-${k.label}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5">
            <k.icon size={18} className="text-energy mb-2" />
            <p className="display text-2xl">{k.value}</p>
            <p className="text-[10px] uppercase tracking-widest text-white/40 mt-1">{k.label}</p>
          </motion.div>
        ))}
      </div>

      {isGlobal && <div className="mb-8"><TasaCambio /></div>}

      <div className="glass rounded-2xl p-4 mb-6 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input className="!pl-10" placeholder="Buscar nombre, cédula, email…" value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <select value={fState} onChange={e => setFState(e.target.value)}>
          <option value="">Todas las ciudades</option>
          {STATES.map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={fPay} onChange={e => setFPay(e.target.value)}>
          <option value="">Todos los pagos</option>
          <option value="pendiente">Pago pendiente</option>
          <option value="verificado">Pago verificado</option>
        </select>
      </div>

      {loading && <p className="text-white/40 text-center py-12">Cargando participantes…</p>}
      {error && <p className="text-red-400 text-center py-12">{error}</p>}
      {!loading && !error && filtered.length === 0 && (
        <p className="text-white/40 text-center py-12">
          {isGlobal ? 'No hay inscripciones que coincidan con los filtros.' : `No hay inscripciones de ${tab} que coincidan.`}
        </p>
      )}

      {filtered.length > 0 && (
        <div className="glass rounded-2xl overflow-x-auto">
          <table className="w-full text-sm min-w-[980px]">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-widest text-white/40 border-b border-white/10">
                {['Participante','Cédula','Contacto','Ciudad / Club','Categoría','Comprobantes','Pago','Acciones'].map(h => (
                  <th key={h} className="px-4 py-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className={`border-b border-white/5 ${p.registration_status === 'anulado' ? 'opacity-40' : ''}`}>
                  <td className="px-4 py-3">
                    <p className="font-semibold">{p.first_name} {p.last_name}</p>
                    <p className="text-white/40 text-xs">{p.gender === 'M' ? 'Masculino' : 'Femenino'} · {p.age} años</p>
                  </td>
                  <td className="px-4 py-3 text-white/70">{p.cedula}</td>
                  <td className="px-4 py-3 text-white/70">
                    <p>{p.email}</p><p className="text-xs text-white/40">{p.phone}</p>
                  </td>
                  <td className="px-4 py-3 text-white/70">
                    <p>{p.city}</p><p className="text-xs text-white/40">{p.club}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="glass rounded-full px-3 py-1 text-xs">{p.category}</span>
                  </td>
                  <td className="px-4 py-3">
                    <ComprobantesPanel p={p} />
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-3 py-1 text-xs ${p.payment_status === 'verificado' ? 'bg-green-500/15 text-green-400' : 'bg-yellow-500/15 text-yellow-400'}`}>
                      {p.payment_status === 'verificado' ? 'Verificado' : 'Pendiente'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {p.payment_status !== 'verificado' ? (
                        <button title="Verificar pago" onClick={() => setPay(p, 'verificado')} className="text-green-400 hover:scale-110 transition"><CheckCircle2 size={18} /></button>
                      ) : (
                        <button title="Marcar pendiente" onClick={() => setPay(p, 'pendiente')} className="text-yellow-400 hover:scale-110 transition"><RotateCcw size={16} /></button>
                      )}
                      <button title={p.registration_status === 'anulado' ? 'Reactivar' : 'Anular'} onClick={() => toggleReg(p)} className="text-red-400 hover:scale-110 transition">
                        <XCircle size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}