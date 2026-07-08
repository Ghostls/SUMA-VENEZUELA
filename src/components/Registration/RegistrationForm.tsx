import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { CheckCircle2, PartyPopper, Upload, X, FileImage, Copy, Check, Landmark, Users } from 'lucide-react'
import { STATES, CLUBS, CATEGORIES } from '@/services/dashboard'
import { createParticipant } from '@/services/participants'
import { getTasaBCV } from '@/services/Config'
import { supabase } from '@/lib/supabase'

/**
 * RegistrationForm.tsx — v3.1 (Evolución sin Destrucción) — FUSIÓN v3.0 + v2.2
 * - De v3.0 (tuya): arquitectura de dupla completa, PlayerFields reutilizable,
 *   dos inserts separados, partner_cedula cruzado, divider visual
 * - De v2.2 (mía): dos slots de comprobante independientes (uno por jugador),
 *   ComprobanteSlot reutilizable, sufijos -1/-2 en storage
 * - FIX fusión: STATES → CITY (la constante se llama CITY en dashboard.ts),
 *   form.state → city en ambos payloads, partner.state → city
 */

const razonSocialLogo = new URL('/src/assets/9.png', import.meta.url).href

const BANK_DATA = {
  banco: 'Banesco',
  tipoCuenta: 'Cuenta Corriente',
  numeroCuenta: '01340176481763006820',
  rif: 'J-30044432-5',
}

const PRECIO_USD = 20

// ── Helpers ───────────────────────────────────────────────────────────────────
const emptyPlayer = () => ({
  first_name: '', last_name: '', cedula: '', email: '', phone: '',
  gender: '' as '' | 'M' | 'F', age: '', city: '', club: '', category: '',
})

async function uploadComprobante(file: File, cedula: string, suffix = ''): Promise<string | null> {
  if (!supabase) return null
  const ext  = file.name.split('.').pop()
  const path = `${cedula}-${Date.now()}${suffix}.${ext}`
  const { error } = await supabase.storage
    .from('comprobantes')
    .upload(path, file, { upsert: true })
  if (error) { console.error('Upload error:', error); return null }
  return path
}

// ── BankRow ───────────────────────────────────────────────────────────────────
function BankRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = value
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="flex items-center justify-between gap-3 py-2.5 border-b border-white/10 last:border-b-0">
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-widest text-white/40">{label}</p>
        <p className={`text-sm md:text-base text-white/90 truncate ${mono ? 'font-mono tracking-wide' : ''}`}>{value}</p>
      </div>
      <button
        type="button"
        onClick={copy}
        aria-label={`Copiar ${label}`}
        className="flex-shrink-0 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs bg-white/10 hover:bg-gold/20 border border-white/15 hover:border-gold/40 text-white/70 hover:text-gold transition-colors"
      >
        {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
        {copied ? 'Copiado' : 'Copiar'}
      </button>
    </div>
  )
}

// ── PlayerFields ──────────────────────────────────────────────────────────────
interface PlayerFieldsProps {
  values: ReturnType<typeof emptyPlayer>
  onChange: (k: keyof ReturnType<typeof emptyPlayer>, v: string) => void
  prefix: string
}

function PlayerFields({ values, onChange, prefix }: PlayerFieldsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div>
        <label htmlFor={`${prefix}-first_name`}>Nombre</label>
        <input id={`${prefix}-first_name`} value={values.first_name}
          onChange={e => onChange('first_name', e.target.value)} placeholder="María" />
      </div>
      <div>
        <label htmlFor={`${prefix}-last_name`}>Apellido</label>
        <input id={`${prefix}-last_name`} value={values.last_name}
          onChange={e => onChange('last_name', e.target.value)} placeholder="González" />
      </div>
      <div>
        <label htmlFor={`${prefix}-cedula`}>Cédula</label>
        <input id={`${prefix}-cedula`} value={values.cedula}
          onChange={e => onChange('cedula', e.target.value)} placeholder="V-12345678" />
      </div>
      <div>
        <label htmlFor={`${prefix}-age`}>Edad</label>
        <input id={`${prefix}-age`} type="number" min={12} max={90}
          value={values.age} onChange={e => onChange('age', e.target.value)} placeholder="28" />
      </div>
      <div>
        <label htmlFor={`${prefix}-gender`}>Sexo</label>
        <select id={`${prefix}-gender`} value={values.gender}
          onChange={e => onChange('gender', e.target.value)}>
          <option value="">Selecciona</option>
          <option value="M">Masculino</option>
          <option value="F">Femenino</option>
        </select>
      </div>
      <div>
        <label htmlFor={`${prefix}-email`}>Correo</label>
        <input id={`${prefix}-email`} type="email" value={values.email}
          onChange={e => onChange('email', e.target.value)} placeholder="tu@correo.com" />
      </div>
      <div>
        <label htmlFor={`${prefix}-phone`}>Teléfono</label>
        <input id={`${prefix}-phone`} value={values.phone}
          onChange={e => onChange('phone', e.target.value)} placeholder="0414-0000000" />
      </div>
      <div>
        <label htmlFor={`${prefix}-city`}>Ciudad</label>
        <select id={`${prefix}-city`} value={values.city}
          onChange={e => onChange('city', e.target.value)}>
          <option value="">Selecciona</option>
          {STATES.map((s: string) => <option key={s}>{s}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor={`${prefix}-club`}>Club</label>
        <select id={`${prefix}-club`} value={values.club}
          onChange={e => onChange('club', e.target.value)}>
          <option value="">Selecciona</option>
          {CLUBS.map(c => <option key={c.name}>{c.name}</option>)}
        </select>
      </div>
      <div className="md:col-span-2">
        <label htmlFor={`${prefix}-category`}>Categoría</label>
        <select id={`${prefix}-category`} value={values.category}
          onChange={e => onChange('category', e.target.value)} disabled={!values.gender}>
          <option value="">{values.gender ? 'Selecciona' : 'Primero selecciona el sexo'}</option>
          {values.gender && CATEGORIES[values.gender as 'M' | 'F'].map(c => <option key={c}>{c}</option>)}
        </select>
      </div>
    </div>
  )
}

// ── ComprobanteSlot ───────────────────────────────────────────────────────────
function ComprobanteSlot({
  label, file, preview, onFile, onClear,
}: {
  label: string
  file: File | null
  preview: string | null
  onFile: (f: File | null) => void
  onClear: () => void
}) {
  const ref = useRef<HTMLInputElement>(null)
  return (
    <div className="flex-1 min-w-0">
      <p className="text-xs text-white/50 mb-1">{label}</p>
      {!preview ? (
        <div
          onClick={() => ref.current?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); onFile(e.dataTransfer.files[0] ?? null) }}
          className="cursor-pointer rounded-xl border border-dashed border-white/20 hover:border-gold/50 transition-colors p-5 flex flex-col items-center gap-2 text-center"
        >
          <Upload size={22} className="text-white/30" />
          <p className="text-xs text-white/50">Arrastra o <span className="text-gold">selecciona</span></p>
          <input
            ref={ref}
            type="file"
            accept="image/jpeg,image/png,application/pdf"
            className="hidden"
            onChange={e => onFile(e.target.files?.[0] ?? null)}
          />
        </div>
      ) : (
        <div className="relative rounded-xl overflow-hidden border border-gold/30">
          <img src={preview} alt="Comprobante" className="w-full max-h-40 object-contain bg-black/40" />
          <button
            onClick={onClear}
            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/70 flex items-center justify-center text-white hover:bg-red-500/80 transition-colors"
          >
            <X size={12} />
          </button>
          <div className="flex items-center gap-2 px-2 py-1.5 bg-black/40">
            <FileImage size={12} className="text-gold flex-shrink-0" />
            <span className="text-xs text-white/60 truncate">{file?.name}</span>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function RegistrationForm() {
  const [form, setForm]         = useState({ ...emptyPlayer(), ref_bancaria: '', accept: false })
  const [partner, setPartner]   = useState(emptyPlayer())

  // Comprobante jugador 1
  const [file1, setFile1]       = useState<File | null>(null)
  const [preview1, setPreview1] = useState<string | null>(null)
  // Comprobante jugador 2
  const [file2, setFile2]       = useState<File | null>(null)
  const [preview2, setPreview2] = useState<string | null>(null)

  const [sending, setSending]   = useState(false)
  const [done, setDone]         = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [tasa, setTasa]         = useState<number | null>(null)

  useEffect(() => { getTasaBCV().then(setTasa) }, [])

  const totalBs = tasa ? PRECIO_USD * tasa : null

  const setMain = (k: keyof ReturnType<typeof emptyPlayer>, v: string) =>
    setForm(f => ({ ...f, [k]: v, ...(k === 'gender' ? { category: '' } : {}) }))

  const setPartnerField = (k: keyof ReturnType<typeof emptyPlayer>, v: string) =>
    setPartner(p => ({ ...p, [k]: v, ...(k === 'gender' ? { category: '' } : {}) }))

  const handleFile = (
    f: File | null,
    setFile: (f: File | null) => void,
    setPreview: (p: string | null) => void,
  ) => {
    if (!f) { setFile(null); setPreview(null); return }
    if (f.size > 5 * 1024 * 1024) { setError('El archivo no puede superar 5 MB.'); return }
    setFile(f); setError(null)
    const reader = new FileReader()
    reader.onload = e => setPreview(e.target?.result as string)
    reader.readAsDataURL(f)
  }

  const playerValid = (p: ReturnType<typeof emptyPlayer>) =>
    p.first_name && p.last_name && p.cedula && p.email && p.phone &&
    p.gender && p.age && p.city && p.club && p.category

  const valid = playerValid(form) && playerValid(partner) && form.accept

  const submit = async () => {
    if (!valid || sending) return
    setSending(true); setError(null)

    // Subir comprobantes con sufijos distintos en storage
    let comprobante_url: string | undefined
    let comprobante_url_2: string | undefined

    if (file1) {
      const path = await uploadComprobante(file1, form.cedula.replace(/\//g, '-'), '-1')
      if (path) comprobante_url = path
    }
    if (file2) {
      const path = await uploadComprobante(file2, partner.cedula.replace(/\//g, '-'), '-2')
      if (path) comprobante_url_2 = path
    }

    // Insert jugador 1 — lleva comprobante_url (propio) y comprobante_url_2 (del compañero)
    const { error: err1 } = await createParticipant({
      first_name:        form.first_name.trim(),
      last_name:         form.last_name.trim(),
      cedula:            form.cedula.trim(),
      email:             form.email.trim(),
      phone:             form.phone.trim(),
      gender:            form.gender as 'M' | 'F',
      age:               Number(form.age),
      city:              form.city,
      club:              form.club,
      category:          form.category,
      ref_bancaria:      form.ref_bancaria.trim() || undefined,
      comprobante_url,
      comprobante_url_2,
      partner_cedula:    partner.cedula.trim(),
    })

    if (err1) {
      setSending(false)
      setError('No se pudo registrar al Jugador 1. Verifica los datos e intenta de nuevo.')
      return
    }

    // Insert jugador 2 — referencia y comprobantes compartidos, partner_cedula invertido
    const { error: err2 } = await createParticipant({
      first_name:        partner.first_name.trim(),
      last_name:         partner.last_name.trim(),
      cedula:            partner.cedula.trim(),
      email:             partner.email.trim(),
      phone:             partner.phone.trim(),
      gender:            partner.gender as 'M' | 'F',
      age:               Number(partner.age),
      city:              partner.city,
      club:              partner.club,
      category:          partner.category,
      ref_bancaria:      form.ref_bancaria.trim() || undefined,
      comprobante_url:   comprobante_url_2,   // el comprobante del J2 va como principal
      comprobante_url_2: comprobante_url,     // el del J1 como secundario para referencia
      partner_cedula:    form.cedula.trim(),
    })

    setSending(false)
    if (err2) setError('Jugador 1 registrado, pero hubo un error con el Jugador 2. Contáctanos con ambas cédulas.')
    else setDone(true)
  }

  return (
    <AnimatePresence mode="wait">
      {done ? (
        <motion.div
          key="success"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="glass rounded-3xl p-10 md:p-16 text-center"
        >
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}>
            <PartyPopper size={56} className="text-gold mx-auto mb-6" />
          </motion.div>
          <h2 className="display text-3xl md:text-5xl mb-4">
            Gracias por formar parte de <span className="text-gold">Suma Venezuela</span>
          </h2>
          <p className="text-white/70 mb-10">La inscripción de la dupla ha sido registrada exitosamente.</p>
          <Link to="/" className="btn-primary">Volver al inicio</Link>
        </motion.div>
      ) : (
        <motion.div
          key="form"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl p-6 md:p-12 space-y-10"
        >
          {/* ── Jugador 1 ─────────────────────────────────────────────── */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center text-gold text-sm font-bold">1</div>
              <h3 className="text-gold text-sm uppercase tracking-widest font-semibold">Jugador 1</h3>
            </div>
            <PlayerFields values={form} onChange={setMain} prefix="j1" />
          </section>

          {/* ── Divider ───────────────────────────────────────────────── */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-white/10" />
            <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest">
              <Users size={14} />
              <span>Dupla</span>
            </div>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* ── Jugador 2 ─────────────────────────────────────────────── */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white/60 text-sm font-bold">2</div>
              <h3 className="text-white/60 text-sm uppercase tracking-widest font-semibold">Jugador 2 — Compañero/a</h3>
            </div>
            <PlayerFields values={partner} onChange={setPartnerField} prefix="j2" />
          </section>

          {/* ── Pasarela de pago ──────────────────────────────────────── */}
          <div
            className="rounded-2xl p-5 md:p-6"
            style={{
              background: 'linear-gradient(135deg,rgba(212,160,23,0.1),rgba(249,115,22,0.06))',
              border: '1px solid rgba(212,160,23,0.25)',
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Landmark size={16} className="text-gold" />
              <p className="text-xs uppercase tracking-widest text-gold">
                Información de pago — {PRECIO_USD} USD{' '}
                <span className="normal-case tracking-normal text-white/40 text-[11px]">por persona</span>
              </p>
            </div>

            {totalBs !== null ? (
              <div className="inline-flex items-baseline gap-2 mb-2 rounded-lg px-3 py-1.5 bg-gold/10 border border-gold/25">
                <span className="text-lg md:text-xl font-mono text-gold">
                  Bs. {totalBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-white/40">
                  Tasa BCV: {tasa!.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs/USD
                </span>
              </div>
            ) : (
              <div className="inline-flex items-baseline gap-2 mb-2 rounded-lg px-3 py-1.5 bg-white/5 border border-white/10">
                <span className="text-sm text-white/20 animate-pulse">Cargando tasa…</span>
              </div>
            )}

            <p className="text-xs text-white/50 mb-4">
              Realiza la transferencia a la siguiente cuenta y luego registra tu referencia y comprobante.
            </p>

            <div className="rounded-xl bg-black/30 border border-white/10 px-4 py-2 mb-5">
              <div className="flex items-center justify-between gap-3 py-3 border-b border-white/10">
                <p className="text-[10px] uppercase tracking-widest text-white/40">Razón social</p>
                <img
                  src={razonSocialLogo}
                  alt="Razón social"
                  className="h-8 md:h-10 w-auto object-contain"
                  onError={e => { e.currentTarget.style.display = 'none' }}
                />
              </div>
              <BankRow label="Banco" value={BANK_DATA.banco} />
              <BankRow label="Tipo de cuenta" value={BANK_DATA.tipoCuenta} />
              <BankRow label="Número de cuenta" value={BANK_DATA.numeroCuenta} mono />
              <BankRow label="RIF" value={BANK_DATA.rif} mono />
            </div>

            <div className="mb-4">
              <label>Referencia bancaria / número de confirmación</label>
              <input
                value={form.ref_bancaria}
                onChange={e => setForm(f => ({ ...f, ref_bancaria: e.target.value }))}
                placeholder="Ej: 00123456789"
              />
            </div>

            {/* ── Dos slots de comprobante ────────────────────────────── */}
            <label className="block mb-2">
              Comprobante(s) de pago{' '}
              <span className="text-white/30 normal-case tracking-normal">
                (si cada jugador pagó por separado, sube los dos · JPG, PNG o PDF · máx 5 MB c/u)
              </span>
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <ComprobanteSlot
                label="Jugador 1"
                file={file1}
                preview={preview1}
                onFile={f => handleFile(f, setFile1, setPreview1)}
                onClear={() => { setFile1(null); setPreview1(null) }}
              />
              <ComprobanteSlot
                label="Jugador 2 (opcional)"
                file={file2}
                preview={preview2}
                onFile={f => handleFile(f, setFile2, setPreview2)}
                onClear={() => { setFile2(null); setPreview2(null) }}
              />
            </div>
          </div>

          {/* ── Términos ──────────────────────────────────────────────── */}
          <label className="flex items-start gap-3 cursor-pointer normal-case tracking-normal text-sm text-white/70">
            <input
              type="checkbox"
              className="!w-auto mt-0.5"
              checked={form.accept}
              onChange={e => setForm(f => ({ ...f, accept: e.target.checked }))}
            />
            Acepto los términos del evento y autorizo el uso de los datos de la dupla para la organización del torneo.
          </label>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            onClick={submit}
            disabled={!valid || sending}
            className="btn-primary w-full disabled:opacity-40 disabled:hover:scale-100"
          >
            <CheckCircle2 size={18} />
            {sending ? 'Registrando dupla…' : 'Inscribir dupla'}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}