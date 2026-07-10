import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import * as XLSX from 'xlsx'
import { Search, Download, CheckCircle2, XCircle, RotateCcw, Users, DollarSign, Shield, MapPin, Globe, ImageIcon, ChevronDown, ChevronUp } from 'lucide-react'
import { useParticipants } from '@/hooks/useParticipants'
import { updateParticipant } from '@/services/participants'
import { CITY, CLUBS, INSCRIPTION_USD } from '@/services/dashboard'
import TasaCambio from '@/pages/TasaCambio'
import { supabase } from '@/lib/supabase'
import type { Participant } from '@/lib/supabase'

/**
 * Admin.tsx — v4.1 (Evolución sin Destrucción)
 * - NUEVO v4.1: exportXLSX con SheetJS — una hoja por categoría +
 *   hoja "Global" con todos los participantes del tab activo.
 *   Cada hoja tiene duplas agrupadas (J1 + J2 juntos), headers en dorado,
 *   y columna "Compañero/a (Cédula)" para identificar la pareja.
 * - v4.0: duplas agrupadas en tabla, segmentación por categoría
 * - v3.1: comprobantes expandibles, URLs firmadas
 * - v3.0: pestañas por club, KPIs, TasaCambio
 */

const ADMIN_PIN = 'SUMA2026'

// ── Cabeceras del Excel ───────────────────────────────────────────────────────
const HEADERS = ['#Dupla','Jugador','Nombre','Apellido','Cédula','Compañero/a','Email','Teléfono','Sexo','Edad','Ciudad','Club','Categoría','Ref. Bancaria','Pago','Estatus','Fecha']

// ── Construir filas para el Excel ─────────────────────────────────────────────
function buildRows(duplas: { p1: Participant; p2: Participant | null }[], startIndex = 1) {
  const rows: (string | number)[][] = []
  duplas.forEach(({ p1, p2 }, i) => {
    const num = startIndex + i
    const toRow = (p: Participant, jugador: string) => [
      num,
      jugador,
      p.first_name ?? '',
      p.last_name ?? '',
      p.cedula ?? '',
      p.partner_cedula ?? '',
      p.email ?? '',
      p.phone ?? '',
      p.gender === 'M' ? 'Masculino' : 'Femenino',
      p.age ?? '',
      p.city ?? '',
      p.club ?? '',
      p.category ?? '',
      p.ref_bancaria ?? '',
      p.payment_status === 'verificado' ? 'Verificado' : 'Pendiente',
      p.registration_status === 'anulado' ? 'Anulado' : 'Activo',
      p.created_at ? new Date(p.created_at).toLocaleDateString('es-VE') : '',
    ]
    rows.push(toRow(p1, 'J1'))
    if (p2) rows.push(toRow(p2, 'J2'))
  })
  return rows
}

// ── Crear una hoja con estilo ─────────────────────────────────────────────────
function makeSheet(
  duplas: { p1: Participant; p2: Participant | null }[],
  startIndex = 1
): XLSX.WorkSheet {
  const rows = buildRows(duplas, startIndex)
  const data = [HEADERS, ...rows]
  const ws = XLSX.utils.aoa_to_sheet(data)

  // Ancho de columnas
  ws['!cols'] = [
    { wch: 7 },  // #Dupla
    { wch: 8 },  // Jugador
    { wch: 16 }, // Nombre
    { wch: 16 }, // Apellido
    { wch: 14 }, // Cédula
    { wch: 14 }, // Compañero/a
    { wch: 24 }, // Email
    { wch: 14 }, // Teléfono
    { wch: 10 }, // Sexo
    { wch: 6 },  // Edad
    { wch: 14 }, // Ciudad
    { wch: 22 }, // Club
    { wch: 12 }, // Categoría
    { wch: 16 }, // Ref. Bancaria
    { wch: 12 }, // Pago
    { wch: 10 }, // Estatus
    { wch: 12 }, // Fecha
  ]

  return ws
}

// ── Exportar XLSX completo ────────────────────────────────────────────────────
function exportXLSX(
  groupedByCategory: [string, { p1: Participant; p2: Participant | null }[]][],
  allDuplas: { p1: Participant; p2: Participant | null }[],
  tabName: string,
  isGlobal: boolean
) {
  const wb = XLSX.utils.book_new()

  // Hoja Global con todas las duplas del tab activo
  const wsGlobal = makeSheet(allDuplas)
  XLSX.utils.book_append_sheet(wb, wsGlobal, 'Global')

  // Una hoja por categoría
  groupedByCategory.forEach(([category, duplas]) => {
    // Nombre de hoja: máx 31 chars (límite Excel)
    const sheetName = category.slice(0, 31)
    const ws = makeSheet(duplas)
    XLSX.utils.book_append_sheet(wb, ws, sheetName)
  })

  const suffix = isGlobal ? 'global' : tabName.toLowerCase().replace(/\s+/g, '-')
  const filename = `suma-venezuela-${suffix}-${new Date().toISOString().slice(0, 10)}.xlsx`
  XLSX.writeFile(wb, filename)
}

// ── URL firmada para ver comprobante ──────────────────────────────────────────
async function getSignedUrl(path: string): Promise<string | null> {
  if (!supabase || !path) return null
  const { data, error } = await supabase.storage
    .from('comprobantes')
    .createSignedUrl(path, 60 * 5)
  if (error) { console.error('signedUrl error:', error); return null }
  return data.signedUrl
}

// ── Panel de comprobantes expandible ─────────────────────────────────────────
function ComprobantesPanel({ p }: { p: Participant }) {
  const [open, setOpen]       = useState(false)
  const [url1, setUrl1]       = useState<string | null>(null)
  const [url2, setUrl2]       = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const hasAny = p.comprobante_url || p.comprobante_url_2

  const load = async () => {
    if (open) { setOpen(false); return }
    setOpen(true)
    if (url1 || url2) return
    setLoading(true)
    const [u1, u2] = await Promise.all([
      p.comprobante_url   ? getSignedUrl(p.comprobante_url)   : Promise.resolve(null),
      p.comprobante_url_2 ? getSignedUrl(p.comprobante_url_2) : Promise.resolve(null),
    ])
    setUrl1(u1); setUrl2(u2); setLoading(false)
  }

  if (!hasAny) return <span className="text-white/20 text-xs">Sin comprobante</span>

  return (
    <div>
      <button onClick={load} className="flex items-center gap-1.5 text-xs text-gold hover:text-gold/80 transition-colors">
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

// ── Fila de participante ──────────────────────────────────────────────────────
function ParticipantRow({
  p, isPartner, setPay, toggleReg,
}: {
  p: Participant
  isPartner: boolean
  setPay: (p: Participant, s: 'pendiente' | 'verificado') => void
  toggleReg: (p: Participant) => void
}) {
  return (
    <tr className={`border-b border-white/5 ${p.registration_status === 'anulado' ? 'opacity-40' : ''} ${isPartner ? 'bg-white/[0.02]' : ''}`}>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          {isPartner && <div className="w-px h-8 bg-gold/30 rounded-full flex-shrink-0" />}
          <div>
            <p className="font-semibold">{p.first_name} {p.last_name}</p>
            <p className="text-white/40 text-xs">
              {p.gender === 'M' ? 'Masculino' : 'Femenino'} · {p.age} años
              {isPartner && <span className="ml-1 text-gold/50">· compañero/a</span>}
            </p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-white/70">{p.cedula}</td>
      <td className="px-4 py-3 text-white/70">
        <p>{p.email}</p>
        <p className="text-xs text-white/40">{p.phone}</p>
      </td>
      <td className="px-4 py-3 text-white/70">
        <p>{p.city}</p>
        <p className="text-xs text-white/40">{p.club}</p>
      </td>
      <td className="px-4 py-3">
        <span className="glass rounded-full px-3 py-1 text-xs">{p.category}</span>
      </td>
      <td className="px-4 py-3"><ComprobantesPanel p={p} /></td>
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
  )
}

// ── Auth gate ─────────────────────────────────────────────────────────────────
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
  const [q, setQ]           = useState('')
  const [fState, setFState] = useState('')
  const [fPay, setFPay]     = useState('')
  const [tab, setTab]       = useState<string>(GLOBAL_TAB)

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

  // ── Construir duplas y agrupar por categoría ──────────────────────────────
  const { groupedByCategory, allDuplas } = useMemo(() => {
    const cedToP: Record<string, Participant> = {}
    for (const p of filtered) { if (p.cedula) cedToP[p.cedula] = p }

    const seen = new Set<string>()
    const duplas: { p1: Participant; p2: Participant | null }[] = []

    for (const p of filtered) {
      if (seen.has(p.cedula)) continue
      seen.add(p.cedula)
      const partner = p.partner_cedula ? cedToP[p.partner_cedula] : null
      if (partner && !seen.has(partner.cedula)) {
        seen.add(partner.cedula)
        duplas.push({ p1: p, p2: partner })
      } else {
        duplas.push({ p1: p, p2: null })
      }
    }

    const map: Record<string, typeof duplas> = {}
    for (const d of duplas) {
      const cat = d.p1.category || 'Sin categoría'
      if (!map[cat]) map[cat] = []
      map[cat].push(d)
    }

    return {
      allDuplas: duplas,
      groupedByCategory: Object.entries(map).sort(([a], [b]) => a.localeCompare(b)),
    }
  }, [filtered])

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

  const tabActive   = tabParticipants.filter(p => p.registration_status !== 'anulado')
  const tabVerified = tabActive.filter(p => p.payment_status === 'verificado').length
  const tabCities   = new Set(tabActive.map(p => p.city)).size
  const tabDuplas   = allDuplas.length

  const kpis = isGlobal
    ? [
        { icon: Users,         label: 'Inscritos activos',    value: stats.total },
        { icon: DollarSign,    label: 'Recaudación estimada', value: `$${stats.raised}` },
        { icon: CheckCircle2,  label: 'Pagos verificados',    value: `${tabVerified} ($${tabVerified * INSCRIPTION_USD})` },
        { icon: MapPin,        label: 'Ciudades activas',     value: stats.activeStates },
        { icon: Shield,        label: 'Clubes activos',       value: stats.activeClubs },
      ]
    : [
        { icon: Users,         label: 'Inscritos del club',   value: tabActive.length },
        { icon: Users,         label: 'Duplas',               value: tabDuplas },
        { icon: CheckCircle2,  label: 'Pagos verificados',    value: `${tabVerified} ($${tabVerified * INSCRIPTION_USD})` },
        { icon: MapPin,        label: 'Ciudades del club',    value: tabCities },
        { icon: Shield,        label: 'Pagos pendientes',     value: tabActive.length - tabVerified },
      ]

  return (
    <main className="min-h-screen px-4 md:px-8 py-8 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="display text-3xl md:text-4xl">Panel <span className="text-gold">Admin</span></h1>
        <div className="flex gap-3">
          <button
            onClick={() => exportXLSX(groupedByCategory, allDuplas, tab, isGlobal)}
            className="btn-ghost !px-5 !py-2 text-xs"
          >
            <Download size={14} /> Exportar Excel {isGlobal ? '(Global)' : `(${tab})`}
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
            <button key={c.name} onClick={() => setTab(c.name)}
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

      {/* ── KPIs ─────────────────────────────────────────────────── */}
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

      {/* ── Filtros ──────────────────────────────────────────────── */}
      <div className="glass rounded-2xl p-4 mb-6 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input className="!pl-10" placeholder="Buscar nombre, cédula, email…" value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <select value={fState} onChange={e => setFState(e.target.value)}>
          <option value="">Todas las ciudades</option>
          {CITY.map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={fPay} onChange={e => setFPay(e.target.value)}>
          <option value="">Todos los pagos</option>
          <option value="pendiente">Pago pendiente</option>
          <option value="verificado">Pago verificado</option>
        </select>
      </div>

      {loading && <p className="text-white/40 text-center py-12">Cargando participantes…</p>}
      {error   && <p className="text-red-400 text-center py-12">{error}</p>}
      {!loading && !error && filtered.length === 0 && (
        <p className="text-white/40 text-center py-12">
          {isGlobal ? 'No hay inscripciones que coincidan.' : `No hay inscripciones de ${tab} que coincidan.`}
        </p>
      )}

      {/* ── Tabla segmentada por categoría con duplas agrupadas ──── */}
      {groupedByCategory.length > 0 && (
        <div className="space-y-6">
          {groupedByCategory.map(([category, duplas]) => (
            <div key={category} className="glass rounded-2xl overflow-hidden">
              <div
                className="flex items-center justify-between px-5 py-3 border-b border-white/10"
                style={{ background: 'linear-gradient(135deg,rgba(212,160,23,0.1),rgba(249,115,22,0.05))' }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-gold text-xs uppercase tracking-widest font-semibold">{category}</span>
                  <span className="text-white/30 text-xs">·</span>
                  <span className="text-white/50 text-xs">{duplas.length} dupla{duplas.length !== 1 ? 's' : ''}</span>
                  <span className="text-white/30 text-xs">·</span>
                  <span className="text-white/50 text-xs">{duplas.reduce((acc, d) => acc + (d.p2 ? 2 : 1), 0)} jugadores</span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[980px]">
                  <thead>
                    <tr className="text-left text-[10px] uppercase tracking-widest text-white/40 border-b border-white/10">
                      {['Participante','Cédula','Contacto','Ciudad / Club','Categoría','Comprobantes','Pago','Acciones'].map(h => (
                        <th key={h} className="px-4 py-3 font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {duplas.map(({ p1, p2 }, di) => (
                      <>
                        {di > 0 && (
                          <tr key={`sep-${p1.id}`}>
                            <td colSpan={8} className="px-4 py-0"><div className="h-px bg-white/5" /></td>
                          </tr>
                        )}
                        <ParticipantRow key={p1.id} p={p1} isPartner={false} setPay={setPay} toggleReg={toggleReg} />
                        {p2 && <ParticipantRow key={p2.id} p={p2} isPartner={true} setPay={setPay} toggleReg={toggleReg} />}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}