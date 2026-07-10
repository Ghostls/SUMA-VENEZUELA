import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, X, Upload, FileImage, Check, Copy, Landmark, ChevronRight, Star, Sparkles } from 'lucide-react'
import { createDonation, fetchDonationStats } from '@/services/donations'
import { supabase } from '@/lib/supabase'

/**
 * DonationSection.tsx — v2.0 (Evolución sin Destrucción)
 * - NUEVO v2.0: liquid glassmorphism — burbujas de fondo animadas,
 *   blob de luz que sigue el cursor en desktop, modal con efecto
 *   de vidrio líquido, partículas flotantes en el fondo de la sección,
 *   animación de pulso expandido en el corazón CTA
 * - FIX v2.0: id="donacion" para que el scroll del Navbar funcione
 * - v1.0: montos sugeridos, datos bancarios Banesco, upload comprobante,
 *   stats de donaciones verificadas, submit a Supabase
 */

const BANK_DATA = {
  banco:      'Banesco',
  tipoCuenta: 'Cuenta Corriente',
  numero:     '01340176481763006820',
  rif:        'J-30044432-5',
}

const SUGGESTED = [1, 5, 10, 20]

const razonSocialLogo = new URL('/src/assets/9.png', import.meta.url).href

// ── Upload comprobante ────────────────────────────────────────────────────────
async function uploadComprobante(file: File, email: string): Promise<string | null> {
  if (!supabase) return null
  const ext  = file.name.split('.').pop()
  const path = `donacion-${email.replace(/[@.]/g, '-')}-${Date.now()}.${ext}`
  const { error } = await supabase.storage
    .from('comprobantes')
    .upload(path, file, { upsert: true })
  if (error) { console.error('Upload donación error:', error); return null }
  return path
}

// ── BankRow con copiar ────────────────────────────────────────────────────────
function BankRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try { await navigator.clipboard.writeText(value) } catch {
      const ta = document.createElement('textarea')
      ta.value = value; document.body.appendChild(ta); ta.select()
      document.execCommand('copy'); document.body.removeChild(ta)
    }
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="flex items-center justify-between gap-3 py-2.5 border-b border-white/10 last:border-b-0">
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-widest text-white/40">{label}</p>
        <p className={`text-sm text-white/90 truncate ${mono ? 'font-mono tracking-wide' : ''}`}>{value}</p>
      </div>
      <button
        type="button"
        onClick={copy}
        className="flex-shrink-0 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs bg-white/10 hover:bg-gold/20 border border-white/15 hover:border-gold/40 text-white/70 hover:text-gold transition-colors"
      >
        {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
        {copied ? 'Copiado' : 'Copiar'}
      </button>
    </div>
  )
}

// ── Modal de donación ─────────────────────────────────────────────────────────
function DonationModal({ onClose }: { onClose: () => void }) {
  const [amount, setAmount]       = useState<number | ''>(5)
  const [custom, setCustom]       = useState('')
  const [isCustom, setIsCustom]   = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName]   = useState('')
  const [email, setEmail]         = useState('')
  const [ref, setRef]             = useState('')
  const [file, setFile]           = useState<File | null>(null)
  const [preview, setPreview]     = useState<string | null>(null)
  const [sending, setSending]     = useState(false)
  const [done, setDone]           = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const fileRef                   = useRef<HTMLInputElement>(null)

  const finalAmount = isCustom ? parseFloat(custom) || 0 : (amount as number)

  const handleFile = (f: File | null) => {
    if (!f) { setFile(null); setPreview(null); return }
    if (f.size > 5 * 1024 * 1024) { setError('El archivo no puede superar 5 MB.'); return }
    setFile(f); setError(null)
    const reader = new FileReader()
    reader.onload = e => setPreview(e.target?.result as string)
    reader.readAsDataURL(f)
  }

  const valid = firstName && lastName && finalAmount >= 1

  const submit = async () => {
    if (!valid || sending) return
    setSending(true); setError(null)
    let comprobante_url: string | undefined
    if (file) {
      const path = await uploadComprobante(file, email || firstName)
      if (path) comprobante_url = path
    }
    const { error: err } = await createDonation({
      first_name:   firstName.trim(),
      last_name:    lastName.trim(),
      email:        email.trim() || undefined,
      amount_eur:   finalAmount,
      ref_bancaria: ref.trim() || undefined,
      comprobante_url,
    })
    setSending(false)
    if (err) setError('No se pudo registrar tu donación. Intenta de nuevo.')
    else setDone(true)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(16px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 24 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl"
        style={{
          background: 'linear-gradient(145deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 40%, rgba(212,160,23,0.06) 100%)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.15), 0 0 0 1px rgba(212,160,23,0.08)',
        }}
      >
        {/* Blob de fondo líquido dentro del modal */}
        <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
          <motion.div
            animate={{ x: [0, 30, -20, 0], y: [0, -20, 30, 0] }}
            transition={{ repeat: Infinity, duration: 12, ease: 'easeInOut' }}
            style={{
              position: 'absolute', top: '-20%', right: '-10%',
              width: '60%', height: '60%',
              background: 'radial-gradient(ellipse, rgba(212,160,23,0.12) 0%, transparent 70%)',
              filter: 'blur(30px)',
            }}
          />
          <motion.div
            animate={{ x: [0, -20, 30, 0], y: [0, 30, -20, 0] }}
            transition={{ repeat: Infinity, duration: 15, ease: 'easeInOut', delay: 2 }}
            style={{
              position: 'absolute', bottom: '-10%', left: '-10%',
              width: '50%', height: '50%',
              background: 'radial-gradient(ellipse, rgba(249,115,22,0.08) 0%, transparent 70%)',
              filter: 'blur(30px)',
            }}
          />
        </div>

        {/* Línea superior iridiscente */}
        <div className="absolute top-0 left-6 right-6 h-px rounded-full" style={{
          background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.4), rgba(212,160,23,0.6), rgba(255,255,255,0.4), transparent)'
        }} />

        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-white/50 hover:text-white transition-colors z-10"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
        >
          <X size={15} />
        </button>

        <div className="relative z-10 p-6 md:p-8">
          <AnimatePresence mode="wait">
            {done ? (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.1, bounce: 0.5 }}
                  className="relative w-24 h-24 mx-auto mb-6"
                >
                  {/* Anillos de pulso */}
                  {[1, 1.5, 2].map((scale, i) => (
                    <motion.div
                      key={i}
                      className="absolute inset-0 rounded-full border border-gold/30"
                      animate={{ scale: [1, scale], opacity: [0.6, 0] }}
                      transition={{ repeat: Infinity, duration: 2, delay: i * 0.4, ease: 'easeOut' }}
                    />
                  ))}
                  <div className="w-24 h-24 rounded-full flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, rgba(212,160,23,0.2), rgba(249,115,22,0.15))', border: '1px solid rgba(212,160,23,0.4)' }}>
                    <Heart size={40} className="text-gold fill-gold/40" />
                  </div>
                </motion.div>
                <h3 className="display text-2xl md:text-3xl mb-3">
                  ¡Gracias por tu <span className="text-gold">apoyo!</span>
                </h3>
                <p className="text-white/60 text-sm max-w-xs mx-auto mb-6">
                  Tu donación de <span className="text-gold font-semibold">{finalAmount}€</span> ha sido registrada.
                  Venezuela te lo agradece.
                </p>
                <button onClick={onClose} className="btn-primary">Cerrar</button>
              </motion.div>
            ) : (
              <motion.div key="form">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, rgba(212,160,23,0.25), rgba(249,115,22,0.15))', border: '1px solid rgba(212,160,23,0.35)' }}>
                    <Heart size={20} className="text-gold fill-gold/30" />
                  </div>
                  <div>
                    <h3 className="display text-xl md:text-2xl">Donar a Venezuela</h3>
                    <p className="text-white/40 text-xs">100% del recaudo va a los afectados</p>
                  </div>
                </div>

                {/* Montos sugeridos */}
                <div className="mb-5">
                  <p className="text-xs uppercase tracking-widest text-white/40 mb-3">Elige un monto</p>
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    {SUGGESTED.map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => { setAmount(s); setIsCustom(false) }}
                        className="rounded-xl py-3 text-sm font-semibold transition-all relative overflow-hidden"
                        style={!isCustom && amount === s ? {
                          background: 'linear-gradient(135deg, rgba(212,160,23,0.25), rgba(249,115,22,0.15))',
                          border: '1px solid rgba(212,160,23,0.5)',
                          color: '#D4A017',
                          boxShadow: '0 0 16px rgba(212,160,23,0.2)',
                        } : {
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          color: 'rgba(255,255,255,0.6)',
                        }}
                      >
                        {s}€
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCustom(true)}
                    className="w-full rounded-xl py-2.5 text-xs transition-all"
                    style={isCustom ? {
                      background: 'linear-gradient(135deg, rgba(212,160,23,0.2), rgba(249,115,22,0.1))',
                      border: '1px solid rgba(212,160,23,0.4)',
                      color: '#D4A017',
                    } : {
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: 'rgba(255,255,255,0.4)',
                    }}
                  >
                    Otro monto
                  </button>
                  {isCustom && (
                    <div className="mt-2 relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gold text-sm">€</span>
                      <input type="number" min={1} step={0.5} value={custom}
                        onChange={e => setCustom(e.target.value)} placeholder="Ingresa el monto"
                        className="!pl-8" autoFocus />
                    </div>
                  )}
                </div>

                {/* Datos del donante */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div>
                    <label>Nombre</label>
                    <input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="María" />
                  </div>
                  <div>
                    <label>Apellido</label>
                    <input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="González" />
                  </div>
                  <div className="col-span-2">
                    <label>Correo <span className="text-white/30 normal-case tracking-normal">(opcional)</span></label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@correo.com" />
                  </div>
                </div>

                {/* Datos bancarios — liquid glass */}
                <div className="rounded-2xl p-4 mb-4" style={{
                  background: 'linear-gradient(135deg, rgba(212,160,23,0.08), rgba(249,115,22,0.04))',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(212,160,23,0.2)',
                }}>
                  <div className="flex items-center gap-2 mb-3">
                    <Landmark size={14} className="text-gold" />
                    <p className="text-xs uppercase tracking-widest text-gold">
                      Transferir {finalAmount > 0 ? `${finalAmount}€` : ''}
                    </p>
                  </div>
                  <div className="rounded-xl px-3 py-1 mb-3" style={{
                    background: 'rgba(0,0,0,0.25)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}>
                    <div className="flex items-center justify-between py-2.5 border-b border-white/10">
                      <p className="text-[10px] uppercase tracking-widest text-white/40">Razón social</p>
                      <img src={razonSocialLogo} alt="Razón social" className="h-7 w-auto object-contain"
                        onError={e => { e.currentTarget.style.display = 'none' }} />
                    </div>
                    <BankRow label="Banco" value={BANK_DATA.banco} />
                    <BankRow label="Tipo de cuenta" value={BANK_DATA.tipoCuenta} />
                    <BankRow label="Número de cuenta" value={BANK_DATA.numero} mono />
                    <BankRow label="RIF" value={BANK_DATA.rif} mono />
                  </div>

                  <div className="mb-3">
                    <label>Referencia bancaria <span className="text-white/30 normal-case tracking-normal">(opcional)</span></label>
                    <input value={ref} onChange={e => setRef(e.target.value)} placeholder="Ej: 00123456789" />
                  </div>

                  <label className="block mb-1 text-xs uppercase tracking-widest text-white/40">
                    Comprobante <span className="normal-case tracking-normal text-white/30">(opcional · JPG, PNG, PDF · máx 5MB)</span>
                  </label>
                  {!preview ? (
                    <div
                      onClick={() => fileRef.current?.click()}
                      onDragOver={e => e.preventDefault()}
                      onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0] ?? null) }}
                      className="cursor-pointer rounded-xl p-5 flex flex-col items-center gap-2 text-center transition-all"
                      style={{ border: '1px dashed rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.02)' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(212,160,23,0.4)' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.15)' }}
                    >
                      <Upload size={20} className="text-white/25" />
                      <p className="text-xs text-white/40">Arrastra o <span className="text-gold">selecciona</span></p>
                      <input ref={fileRef} type="file" accept="image/jpeg,image/png,application/pdf"
                        className="hidden" onChange={e => handleFile(e.target.files?.[0] ?? null)} />
                    </div>
                  ) : (
                    <div className="relative rounded-xl overflow-hidden" style={{ border: '1px solid rgba(212,160,23,0.3)' }}>
                      <img src={preview} alt="Comprobante" className="w-full max-h-32 object-contain bg-black/40" />
                      <button onClick={() => { setFile(null); setPreview(null) }}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/70 flex items-center justify-center text-white hover:bg-red-500/80 transition-colors">
                        <X size={12} />
                      </button>
                      <div className="flex items-center gap-2 px-2 py-1.5 bg-black/40">
                        <FileImage size={12} className="text-gold flex-shrink-0" />
                        <span className="text-xs text-white/60 truncate">{file?.name}</span>
                      </div>
                    </div>
                  )}
                </div>

                {error && <p className="text-red-400 text-xs mb-3">{error}</p>}

                <button
                  onClick={submit}
                  disabled={!valid || sending}
                  className="btn-primary w-full disabled:opacity-40 disabled:hover:scale-100"
                >
                  <Heart size={16} />
                  {sending ? 'Registrando donación…' : `Donar ${finalAmount > 0 ? `${finalAmount}€` : ''} a Venezuela`}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Sección de donación ───────────────────────────────────────────────────────
export default function DonationSection() {
  const [open, setOpen]     = useState(false)
  const [stats, setStats]   = useState({ total: 0, count: 0 })
  const [loaded, setLoaded] = useState(false)
  const sectionRef          = useRef<HTMLDivElement>(null)
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 })

  useEffect(() => {
    fetchDonationStats().then(s => { setStats(s); setLoaded(true) })
  }, [open])

  // Blob que sigue el cursor en desktop
  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = sectionRef.current?.getBoundingClientRect()
    if (!rect) return
    setMousePos({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    })
  }

  return (
    <>
      {/* ── id="donacion" para que el Navbar haga scroll aquí ── */}
      <section
        id="donacion"
        ref={sectionRef}
        onMouseMove={handleMouseMove}
        className="max-w-4xl mx-auto px-6 py-24"
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative rounded-3xl overflow-hidden text-center px-6 md:px-12 py-16"
          style={{
            background: 'linear-gradient(145deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 50%, rgba(212,160,23,0.07) 100%)',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 16px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.15)',
          }}
        >
          {/* Blob que sigue el cursor */}
          <div
            className="absolute pointer-events-none transition-all duration-700 ease-out"
            style={{
              left: `${mousePos.x * 100}%`,
              top: `${mousePos.y * 100}%`,
              transform: 'translate(-50%, -50%)',
              width: '50%',
              height: '50%',
              background: 'radial-gradient(ellipse, rgba(212,160,23,0.12) 0%, transparent 70%)',
              filter: 'blur(30px)',
            }}
          />

          {/* Burbujas flotantes de fondo */}
          {[
            { w: 180, h: 180, x: '5%',  y: '10%', d: 8,  del: 0   },
            { w: 120, h: 120, x: '80%', y: '15%', d: 10, del: 1.5 },
            { w: 90,  h: 90,  x: '60%', y: '70%', d: 7,  del: 0.8 },
            { w: 140, h: 140, x: '15%', y: '65%', d: 12, del: 2.2 },
            { w: 70,  h: 70,  x: '45%', y: '85%', d: 9,  del: 1   },
          ].map((b, i) => (
            <motion.div
              key={i}
              className="absolute pointer-events-none rounded-full"
              style={{
                width: b.w, height: b.h,
                left: b.x, top: b.y,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                backdropFilter: 'blur(4px)',
              }}
              animate={{ y: [0, -16, 0], scale: [1, 1.04, 1] }}
              transition={{ repeat: Infinity, duration: b.d, delay: b.del, ease: 'easeInOut' }}
            />
          ))}

          {/* Línea superior iridiscente */}
          <div className="absolute top-0 left-10 right-10 h-px" style={{
            background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.4), rgba(212,160,23,0.7), rgba(255,255,255,0.4), transparent)'
          }} />

          {/* Partículas pequeñas */}
          {[
            { x: '20%', y: '30%', d: 3, del: 0 },
            { x: '75%', y: '25%', d: 4, del: 1 },
            { x: '50%', y: '75%', d: 3.5, del: 0.5 },
            { x: '85%', y: '60%', d: 5, del: 1.8 },
            { x: '10%', y: '80%', d: 4, del: 0.3 },
          ].map((p, i) => (
            <motion.div
              key={`spark-${i}`}
              className="absolute w-1 h-1 rounded-full pointer-events-none"
              style={{ left: p.x, top: p.y, background: 'rgba(212,160,23,0.6)' }}
              animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0], y: [0, -20, -40] }}
              transition={{ repeat: Infinity, duration: p.d, delay: p.del, ease: 'easeOut' }}
            />
          ))}

          {/* Contenido */}
          <div className="relative z-10">
            {/* Corazón con anillos de pulso */}
            <div className="relative w-20 h-20 mx-auto mb-6">
              {[1.4, 1.8, 2.2].map((scale, i) => (
                <motion.div
                  key={i}
                  className="absolute inset-0 rounded-2xl"
                  style={{ border: '1px solid rgba(212,160,23,0.25)' }}
                  animate={{ scale: [1, scale], opacity: [0.5, 0] }}
                  transition={{ repeat: Infinity, duration: 2.5, delay: i * 0.5, ease: 'easeOut' }}
                />
              ))}
              <motion.div
                animate={{ scale: [1, 1.06, 1] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                className="w-20 h-20 rounded-2xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(212,160,23,0.2), rgba(249,115,22,0.15))',
                  border: '1px solid rgba(212,160,23,0.35)',
                  backdropFilter: 'blur(8px)',
                  boxShadow: '0 0 24px rgba(212,160,23,0.2)',
                }}
              >
                <Heart size={32} className="text-gold fill-gold/30" />
              </motion.div>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-4"
              style={{ background: 'rgba(212,160,23,0.1)', border: '1px solid rgba(212,160,23,0.2)' }}>
              <Sparkles size={12} className="text-gold" />
              <p className="text-xs uppercase tracking-[0.3em] text-gold">¿No juegas pádel?</p>
            </div>

            <h2 className="display text-3xl md:text-5xl mb-4">
              También puedes<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-energy to-gold">
                sumar desde 1€
              </span>
            </h2>

            <p className="text-white/60 max-w-md mx-auto mb-8 text-sm md:text-base leading-relaxed">
              Cada euro cuenta. Tu donación llega directamente a las familias venezolanas afectadas por el terremoto.
            </p>

            {/* Stats de donaciones verificadas */}
            {loaded && stats.count > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-3 rounded-full px-5 py-2.5 mb-8"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <Star size={13} className="text-gold fill-gold/40" />
                <span className="text-sm text-white/70">
                  <span className="text-gold font-semibold">{stats.count}</span> personas ya donaron ·{' '}
                  <span className="text-gold font-semibold">{stats.total.toLocaleString('es-VE', { minimumFractionDigits: 0 })}€</span> recaudados
                </span>
              </motion.div>
            )}

            {/* CTA */}
            <motion.button
              onClick={() => setOpen(true)}
              whileHover={{ scale: 1.04, boxShadow: '0 8px 32px rgba(212,160,23,0.5)' }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2.5 rounded-full px-8 py-4 text-sm font-bold uppercase tracking-widest"
              style={{
                background: 'linear-gradient(135deg, #D4A017 0%, #F97316 100%)',
                boxShadow: '0 4px 24px rgba(212,160,23,0.35)',
                color: '#000',
              }}
            >
              <Heart size={16} className="fill-black/20" />
              Donar aquí
              <ChevronRight size={16} />
            </motion.button>

            <p className="text-white/25 text-xs mt-4">Mínimo 1€ · Transferencia bancaria</p>
          </div>
        </motion.div>
      </section>

      <AnimatePresence>
        {open && <DonationModal onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </>
  )
}