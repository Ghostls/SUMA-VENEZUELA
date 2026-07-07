import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, Download, CheckCircle2, XCircle, RotateCcw, Users, DollarSign, Shield, MapPin } from 'lucide-react'
import { useParticipants } from '@/hooks/useParticipants'
import { updateParticipant } from '@/services/participants'
import { STATES, CLUBS, INSCRIPTION_USD } from '@/services/dashboard'
import type { Participant } from '@/lib/supabase'

const ADMIN_PIN = 'SUMA2026' // TODO: reemplazar por Supabase Auth + roles en producción

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

function AdminPanel() {
  const { participants, stats, loading, error, reload } = useParticipants()
  const [q, setQ] = useState('')
  const [fState, setFState] = useState('')
  const [fClub, setFClub] = useState('')
  const [fPay, setFPay] = useState('')

  const filtered = useMemo(() => participants.filter(p => {
    const text = `${p.first_name} ${p.last_name} ${p.cedula} ${p.email} ${p.phone}`.toLowerCase()
    return (!q || text.includes(q.toLowerCase()))
      && (!fState || p.state === fState)
      && (!fClub || p.club === fClub)
      && (!fPay || p.payment_status === fPay)
  }), [participants, q, fState, fClub, fPay])

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
    const head = ['Nombre','Apellido','Cédula','Email','Teléfono','Sexo','Edad','Estado','Club','Categoría','Nivel','Pago','Estatus','Fecha']
    const rows = filtered.map(p => [p.first_name,p.last_name,p.cedula,p.email,p.phone,p.gender,p.age,p.state,p.club,p.category,p.level,p.payment_status,p.registration_status,p.created_at]
      .map(v => `"${String(v ?? '').replace(/"/g,'""')}"`).join(','))
    const blob = new Blob(['\uFEFF' + [head.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `suma-venezuela-inscritos-${new Date().toISOString().slice(0,10)}.csv`
    a.click()
  }

  const verified = participants.filter(p => p.payment_status === 'verificado' && p.registration_status !== 'anulado').length

  const kpis = [
    { icon: Users, label: 'Inscritos activos', value: stats.total },
    { icon: DollarSign, label: 'Recaudación estimada', value: `$${stats.raised}` },
    { icon: CheckCircle2, label: 'Pagos verificados', value: `${verified} ($${verified * INSCRIPTION_USD})` },
    { icon: MapPin, label: 'Estados activos', value: stats.activeStates },
    { icon: Shield, label: 'Clubes activos', value: stats.activeClubs },
  ]

  return (
    <main className="min-h-screen px-4 md:px-8 py-8 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="display text-3xl md:text-4xl">Panel <span className="text-gold">Admin</span></h1>
        <div className="flex gap-3">
          <button onClick={exportCSV} className="btn-ghost !px-5 !py-2 text-xs"><Download size={14} /> Exportar CSV</button>
          <Link to="/" className="btn-ghost !px-5 !py-2 text-xs">Ver sitio</Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {kpis.map(k => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5">
            <k.icon size={18} className="text-energy mb-2" />
            <p className="display text-2xl">{k.value}</p>
            <p className="text-[10px] uppercase tracking-widest text-white/40 mt-1">{k.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="glass rounded-2xl p-4 mb-6 grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input className="!pl-10" placeholder="Buscar nombre, cédula, email…" value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <select value={fState} onChange={e => setFState(e.target.value)}>
          <option value="">Todos los estados</option>
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

      {loading && <p className="text-white/40 text-center py-12">Cargando participantes…</p>}
      {error && <p className="text-red-400 text-center py-12">{error}</p>}
      {!loading && !error && filtered.length === 0 && (
        <p className="text-white/40 text-center py-12">No hay inscripciones que coincidan con los filtros.</p>
      )}

      {filtered.length > 0 && (
        <div className="glass rounded-2xl overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-widest text-white/40 border-b border-white/10">
                {['Participante','Cédula','Contacto','Estado / Club','Categoría','Pago','Acciones'].map(h => (
                  <th key={h} className="px-4 py-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className={`border-b border-white/5 ${p.registration_status === 'anulado' ? 'opacity-40' : ''}`}>
                  <td className="px-4 py-3">
                    <p className="font-semibold">{p.first_name} {p.last_name}</p>
                    <p className="text-white/40 text-xs">{p.gender === 'M' ? 'Masculino' : 'Femenino'} · {p.age} años · {p.level}</p>
                  </td>
                  <td className="px-4 py-3 text-white/70">{p.cedula}</td>
                  <td className="px-4 py-3 text-white/70">
                    <p>{p.email}</p><p className="text-xs text-white/40">{p.phone}</p>
                  </td>
                  <td className="px-4 py-3 text-white/70"><p>{p.state}</p><p className="text-xs text-white/40">{p.club}</p></td>
                  <td className="px-4 py-3"><span className="glass rounded-full px-3 py-1 text-xs">{p.category}</span></td>
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
                      <button title={p.registration_status === 'anulado' ? 'Reactivar' : 'Anular inscripción'} onClick={() => toggleReg(p)} className="text-red-400 hover:scale-110 transition">
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
