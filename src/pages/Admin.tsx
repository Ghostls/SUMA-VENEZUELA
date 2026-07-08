import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Download, CheckCircle2, XCircle, RotateCcw,
  Users, DollarSign, Shield, MapPin, Receipt, X, ExternalLink,
} from 'lucide-react'
import { useParticipants } from '@/hooks/useParticipants'
import { updateParticipant, getComprobanteUrl } from '@/services/participants'
import { STATES, CLUBS, INSCRIPTION_USD } from '@/services/dashboard'
import type { Participant } from '@/lib/supabase'

const ADMIN_PIN = 'SUMA2026'

// ── Modal comprobante ─────────────────────────────────────────────────────────
function ComprobanteModal({ path, onClose }: { path: string; onClose: () => void }) {
  const [url, setUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  useState(() => { getComprobanteUrl(path).then(u => { setUrl(u); setLoading(false) }) })
  const isPdf = path.toLowerCase().endsWith('.pdf')
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}>
      <motion.div initial={{ scale: 0.93 }} animate={{ scale: 1 }}
        onClick={e => e.stopPropagation()}
        className="glass rounded-2xl p-5 w-full max-w-lg flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt size={15} className="text-gold" />
            <span className="text-xs uppercase tracking-widest text-gold">Comprobante de pago</span>
          </div>
          <div className="flex items-center gap-3">
            {url && <a href={url} target="_blank" rel="noreferrer"
              className="flex items-center gap-1 text-xs text-white/50 hover:text-gold transition-colors">
              <ExternalLink size={13} /> Abrir
            </a>}
            <button onClick={onClose}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
              <X size={14} />
            </button>
          </div>
        </div>
        <div className="rounded-xl overflow-hidden bg-black/40 flex items-center justify-center min-h-56">
          {loading && <p className="text-white/30 text-sm animate-pulse">Cargando…</p>}
          {!loading && !url && <p className="text-red-400/60 text-sm">No se pudo cargar el archivo.</p>}
          {!loading && url && isPdf && <iframe src={url} className="w-full h-96" title="Comprobante PDF" />}
          {!loading && url && !isPdf && <img src={url} alt="Comprobante" className="w-full max-h-[65vh] object-contain" />}
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Login ─────────────────────────────────────────────────────────────────────
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

// ── Helpers ───────────────────────────────────────────────────────────────────
interface Dupla { id: string; j1: Participant; j2: Participant | null }

function buildDuplas(list: Participant[]): Dupla[] {
  const map = new Map<string, Participant>()
  list.forEach(p => map.set(p.cedula, p))
  const seen = new Set<string>()
  const duplas: Dupla[] = []
  for (const p of list) {
    if (seen.has(p.cedula)) continue
    seen.add(p.cedula)
    const partner = p.partner_cedula ? map.get(p.partner_cedula) ?? null : null
    if (partner) seen.add(partner.cedula)
    duplas.push({ id: p.id ?? p.cedula, j1: p, j2: partner })
  }
  return duplas
}

// ── Card de un jugador dentro de la dupla ────────────────────────────────────
function PlayerCard({ p, onVerify, onPending, onToggleReg, onComprobante }: {
  p: Participant
  onVerify: () => void
  onPending: () => void
  onToggleReg: () => void
  onComprobante: () => void
}) {
  const anulado = p.registration_status === 'anulado'
  return (
    <div className={`flex items-start justify-between gap-4 p-4 ${anulado ? 'opacity-40' : ''}`}>
      {/* Info principal */}
      <div className="flex-1 min-w-0 grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-1">
        {/* Nombre */}
        <div className="col-span-2 md:col-span-1">
          <p className="font-semibold text-sm text-white">{p.first_name} {p.last_name}</p>
          <p className="text-white/40 text-xs mt-0.5">
            {p.gender === 'M' ? 'Masculino' : 'Femenino'} · {p.age} años · {p.cedula}
          </p>
        </div>

        {/* Contacto */}
        <div>
          <p className="text-[10px] uppercase tracking-widest text-white/30 mb-0.5">Contacto</p>
          <p className="text-xs text-white/70 truncate">{p.email}</p>
          <p className="text-xs text-white/40">{p.phone}</p>
        </div>

        {/* Club */}
        <div>
          <p className="text-[10px] uppercase tracking-widest text-white/30 mb-0.5">Club</p>
          <p className="text-xs text-white/70">{p.city}</p>
          <p className="text-xs text-white/40">{p.club}</p>
        </div>

        {/* Categoría + pago */}
        <div className="flex flex-col gap-1">
          <span className="inline-flex w-fit rounded-full px-2.5 py-0.5 text-[11px] bg-white/10 text-white/70">
            {p.category}
          </span>
          <span className={`inline-flex w-fit rounded-full px-2.5 py-0.5 text-[11px] ${p.payment_status === 'verificado' ? 'bg-green-500/15 text-green-400' : 'bg-yellow-500/15 text-yellow-400'}`}>
            {p.payment_status === 'verificado' ? 'Verificado' : 'Pendiente'}
          </span>
          {p.comprobante_url && (
            <button onClick={onComprobante}
              className="inline-flex items-center gap-1 w-fit text-[10px] text-gold/60 hover:text-gold transition-colors mt-0.5">
              <Receipt size={10} /> Ver comprobante
            </button>
          )}
        </div>
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-2 shrink-0 pt-0.5">
        {p.payment_status !== 'verificado' ? (
          <button title="Verificar pago" onClick={onVerify}
            className="text-green-400 hover:text-green-300 hover:scale-110 transition">
            <CheckCircle2 size={20} />
          </button>
        ) : (
          <button title="Marcar pendiente" onClick={onPending}
            className="text-yellow-400 hover:text-yellow-300 hover:scale-110 transition">
            <RotateCcw size={18} />
          </button>
        )}
        <button title={anulado ? 'Reactivar' : 'Anular'} onClick={onToggleReg}
          className="text-red-400 hover:text-red-300 hover:scale-110 transition">
          <XCircle size={20} />
        </button>
      </div>
    </div>
  )
}

// ── Panel principal ───────────────────────────────────────────────────────────
function AdminPanel() {
  const { participants, stats, loading, error, reload } = useParticipants()
  const [q, setQ]           = useState('')
  const [fState, setFState] = useState('')
  const [fClub, setFClub]   = useState('')
  const [fPay, setFPay]     = useState('')
  const [comprobantePath, setComprobantePath] = useState<string | null>(null)

  const duplas = useMemo(() => {
    const filtered = participants.filter(p => {
      const text = `${p.first_name} ${p.last_name} ${p.cedula} ${p.email} ${p.phone}`.toLowerCase()
      return (!q      || text.includes(q.toLowerCase()))
        && (!fState || p.city   === fState)
        && (!fClub  || p.club   === fClub)
        && (!fPay   || p.payment_status === fPay)
    })
    return buildDuplas(filtered)
  }, [participants, q, fState, fClub, fPay])

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
    const head = ['Jugador','Apellido','Cédula','Compañero/a','Email','Teléfono','Sexo','Edad','Ciudad','Club','Categoría','Pago','Estatus','Referencia','Fecha']
    const rows: string[] = []
    duplas.forEach(d => {
      [d.j1, d.j2].forEach(p => {
        if (!p) return
        const partner = p === d.j1 ? d.j2 : d.j1
        rows.push([p.first_name, p.last_name, p.cedula,
          partner ? `${partner.first_name} ${partner.last_name}` : '—',
          p.email, p.phone, p.gender, p.age, p.city, p.club,
          p.category, p.payment_status, p.registration_status, p.ref_bancaria ?? '', p.created_at,
        ].map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
      })
    })
    const blob = new Blob(['\uFEFF' + [head.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `suma-venezuela-duplas-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
  }

  const verified = participants.filter(p => p.payment_status === 'verificado' && p.registration_status !== 'anulado').length

  const kpis = [
    { icon: Users,        label: 'Inscritos activos',    value: stats.total },
    { icon: DollarSign,   label: 'Recaudación estimada', value: `$${stats.raised}` },
    { icon: CheckCircle2, label: 'Pagos verificados',    value: `${verified} / $${verified * INSCRIPTION_USD}` },
    { icon: MapPin,       label: 'Ciudades activas',     value: stats.activeStates },
    { icon: Shield,       label: 'Clubes activos',       value: stats.activeClubs },
  ]

  return (
    <main className="min-h-screen px-4 md:px-8 py-8 max-w-6xl mx-auto">

      <AnimatePresence>
        {comprobantePath && (
          <ComprobanteModal path={comprobantePath} onClose={() => setComprobantePath(null)} />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="display text-3xl md:text-4xl">Panel <span className="text-gold">Admin</span></h1>
        <div className="flex gap-3">
          <button onClick={exportCSV} className="btn-ghost !px-5 !py-2 text-xs flex items-center gap-1.5">
            <Download size={13} /> Exportar CSV
          </button>
          <Link to="/" className="btn-ghost !px-5 !py-2 text-xs">Ver sitio</Link>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
        {kpis.map(k => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-4">
            <k.icon size={16} className="text-energy mb-2" />
            <p className="display text-2xl leading-none">{k.value}</p>
            <p className="text-[10px] uppercase tracking-widest text-white/35 mt-1.5">{k.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Filtros */}
      <div className="glass rounded-2xl p-4 mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input className="!pl-9" placeholder="Buscar nombre, cédula, email…"
            value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <select value={fState} onChange={e => setFState(e.target.value)}>
          <option value="">Todas las ciudades</option>
          {STATES.map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={fClub} onChange={e => setFClub(e.target.value)}>
          <option value="">Todos los clubes</option>
          {CLUBS.map(c => <option key={c.name}>{c.name}</option>)}
        </select>
        <select value={fPay} onChange={e => setFPay(e.target.value)}>
          <option value="">Todos los pagos</option>
          <option value="pendiente">Pago pendiente</option>
          <option value="verificado">Pago verificado</option>
        </select>
      </div>

      {loading && <p className="text-white/40 text-center py-16">Cargando participantes…</p>}
      {error   && <p className="text-red-400 text-center py-16">{error}</p>}
      {!loading && !error && duplas.length === 0 && (
        <p className="text-white/40 text-center py-16">No hay inscripciones que coincidan.</p>
      )}

      {/* Lista de duplas como cards */}
      {duplas.length > 0 && (
        <div className="flex flex-col gap-3">
          {duplas.map(d => (
            <div key={d.id} className="glass rounded-2xl overflow-hidden">

              {/* Header dupla */}
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/8 bg-white/[0.02]">
                <Users size={12} className="text-gold/50" />
                <span className="text-[10px] uppercase tracking-widest text-gold/50">
                  Dupla{d.j1.ref_bancaria ? ` · Ref: ${d.j1.ref_bancaria}` : ''}
                </span>
              </div>

              {/* Jugador 1 */}
              <PlayerCard
                p={d.j1}
                onVerify={() => setPay(d.j1, 'verificado')}
                onPending={() => setPay(d.j1, 'pendiente')}
                onToggleReg={() => toggleReg(d.j1)}
                onComprobante={() => d.j1.comprobante_url && setComprobantePath(d.j1.comprobante_url)}
              />

              {/* Divisor entre jugadores */}
              {(d.j2 || true) && <div className="mx-4 h-px bg-white/[0.06]" />}

              {/* Jugador 2 o placeholder */}
              {d.j2 ? (
                <PlayerCard
                  p={d.j2}
                  onVerify={() => setPay(d.j2!, 'verificado')}
                  onPending={() => setPay(d.j2!, 'pendiente')}
                  onToggleReg={() => toggleReg(d.j2!)}
                  onComprobante={() => d.j2!.comprobante_url && setComprobantePath(d.j2!.comprobante_url)}
                />
              ) : (
                <div className="px-4 py-3">
                  <span className="text-xs text-white/25 italic">Compañero/a pendiente de registro</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  )
}