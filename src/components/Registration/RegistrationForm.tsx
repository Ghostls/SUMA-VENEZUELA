import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { CheckCircle2, PartyPopper, Upload, X, FileImage } from 'lucide-react'
import { STATES, CLUBS, CATEGORIES, LEVELS } from '@/services/dashboard'
import { createParticipant } from '@/services/participants'
import { supabase } from '@/lib/supabase'

const initial = {
  first_name: '', last_name: '', cedula: '', email: '', phone: '',
  gender: '' as '' | 'M' | 'F', age: '', state: '', club: '',
  category: '', level: '', ref_bancaria: '', accept: false,
}

async function uploadComprobante(file: File, cedula: string): Promise<string | null> {
  if (!supabase) return null
  const ext  = file.name.split('.').pop()
  const path = `${cedula}-${Date.now()}.${ext}`
  const { error } = await supabase.storage
    .from('comprobantes')
    .upload(path, file, { upsert: true })
  if (error) { console.error('Upload error:', error); return null }
  return path // guardamos el path, el admin genera URL firmada
}

export default function RegistrationForm() {
  const [form, setForm]         = useState(initial)
  const [file, setFile]         = useState<File | null>(null)
  const [preview, setPreview]   = useState<string | null>(null)
  const [sending, setSending]   = useState(false)
  const [done, setDone]         = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const fileRef                 = useRef<HTMLInputElement>(null)

  const set = (k: keyof typeof initial, v: string | boolean) =>
    setForm(f => ({ ...f, [k]: v, ...(k === 'gender' ? { category: '' } : {}) }))

  const handleFile = (f: File | null) => {
    if (!f) { setFile(null); setPreview(null); return }
    if (f.size > 5 * 1024 * 1024) { setError('El archivo no puede superar 5 MB.'); return }
    setFile(f)
    setError(null)
    const reader = new FileReader()
    reader.onload = e => setPreview(e.target?.result as string)
    reader.readAsDataURL(f)
  }

  const valid =
    form.first_name && form.last_name && form.cedula && form.email && form.phone &&
    form.gender && form.age && form.state && form.club && form.category && form.level && form.accept

  const submit = async () => {
    if (!valid || sending) return
    setSending(true)
    setError(null)

    // 1. Subir comprobante si existe
    let comprobante_url: string | undefined
    if (file) {
      const path = await uploadComprobante(file, form.cedula.replace(/\//g, '-'))
      if (path) comprobante_url = path
    }

    // 2. Registrar participante
    const { error: err } = await createParticipant({
      first_name:      form.first_name.trim(),
      last_name:       form.last_name.trim(),
      cedula:          form.cedula.trim(),
      email:           form.email.trim(),
      phone:           form.phone.trim(),
      gender:          form.gender as 'M' | 'F',
      age:             Number(form.age),
      state:           form.state,
      club:            form.club,
      category:        form.category,
      level:           form.level,
      ref_bancaria:    form.ref_bancaria.trim() || undefined,
      comprobante_url,
    })

    setSending(false)
    if (err) setError('No se pudo registrar la inscripción. Verifica los datos e intenta de nuevo.')
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
          <p className="text-white/70 mb-10">Tu inscripción ha sido registrada exitosamente.</p>
          <Link to="/" className="btn-primary">Volver al inicio</Link>
        </motion.div>
      ) : (
        <motion.div
          key="form"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl p-6 md:p-12"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div><label>Nombre</label>
              <input value={form.first_name} onChange={e => set('first_name', e.target.value)} placeholder="María" />
            </div>
            <div><label>Apellido</label>
              <input value={form.last_name} onChange={e => set('last_name', e.target.value)} placeholder="González" />
            </div>
            <div><label>Cédula</label>
              <input value={form.cedula} onChange={e => set('cedula', e.target.value)} placeholder="V-12345678" />
            </div>
            <div><label>Edad</label>
              <input type="number" min={12} max={90} value={form.age} onChange={e => set('age', e.target.value)} placeholder="28" />
            </div>
            <div><label>Sexo</label>
              <select value={form.gender} onChange={e => set('gender', e.target.value)}>
                <option value="">Selecciona</option>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
              </select>
            </div>
            <div><label>Correo</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="tu@correo.com" />
            </div>
            <div><label>Teléfono</label>
              <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="0414-0000000" />
            </div>
            <div><label>Estado</label>
              <select value={form.state} onChange={e => set('state', e.target.value)}>
                <option value="">Selecciona</option>
                {STATES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div><label>Club</label>
              <select value={form.club} onChange={e => set('club', e.target.value)}>
                <option value="">Selecciona</option>
                {CLUBS.map(c => <option key={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div><label>Nivel</label>
              <select value={form.level} onChange={e => set('level', e.target.value)}>
                <option value="">Selecciona</option>
                {LEVELS.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div className="md:col-span-2"><label>Categoría</label>
              <select value={form.category} onChange={e => set('category', e.target.value)} disabled={!form.gender}>
                <option value="">{form.gender ? 'Selecciona' : 'Primero selecciona el sexo'}</option>
                {form.gender && CATEGORIES[form.gender as 'M' | 'F'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* ── Pago ─────────────────────────────────────────────────── */}
          <div
            className="mt-8 rounded-2xl p-5"
            style={{
              background: 'linear-gradient(135deg,rgba(212,160,23,0.1),rgba(249,115,22,0.06))',
              border: '1px solid rgba(212,160,23,0.25)',
            }}
          >
            <p className="text-xs uppercase tracking-widest text-gold mb-4">Información de pago — 20 USD</p>

            <div className="mb-4">
              <label>Referencia bancaria / número de confirmación</label>
              <input
                value={form.ref_bancaria}
                onChange={e => set('ref_bancaria', e.target.value)}
                placeholder="Ej: 00123456789 · Zelle · Pago Móvil"
              />
            </div>

            {/* Upload comprobante */}
            <label>Comprobante de pago <span className="text-white/30 normal-case tracking-normal">(opcional · JPG, PNG o PDF · máx 5 MB)</span></label>

            {!preview ? (
              <div
                onClick={() => fileRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0] ?? null) }}
                className="mt-1 cursor-pointer rounded-xl border border-dashed border-white/20 hover:border-gold/50 transition-colors p-8 flex flex-col items-center gap-3 text-center"
              >
                <Upload size={28} className="text-white/30" />
                <p className="text-sm text-white/50">Arrastra tu comprobante aquí o <span className="text-gold">haz clic para seleccionar</span></p>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,application/pdf"
                  className="hidden"
                  onChange={e => handleFile(e.target.files?.[0] ?? null)}
                />
              </div>
            ) : (
              <div className="mt-1 relative rounded-xl overflow-hidden border border-gold/30">
                <img src={preview} alt="Comprobante" className="w-full max-h-52 object-contain bg-black/40" />
                <button
                  onClick={() => { setFile(null); setPreview(null) }}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 flex items-center justify-center text-white hover:bg-red-500/80 transition-colors"
                >
                  <X size={14} />
                </button>
                <div className="flex items-center gap-2 px-3 py-2 bg-black/40">
                  <FileImage size={14} className="text-gold" />
                  <span className="text-xs text-white/60 truncate">{file?.name}</span>
                </div>
              </div>
            )}
          </div>

          <label className="flex items-start gap-3 mt-6 cursor-pointer normal-case tracking-normal text-sm text-white/70">
            <input
              type="checkbox"
              className="!w-auto mt-0.5"
              checked={form.accept}
              onChange={e => set('accept', e.target.checked)}
            />
            Acepto los términos del evento y autorizo el uso de mis datos para la organización del torneo.
          </label>

          {error && <p className="text-red-400 text-sm mt-4">{error}</p>}

          <button
            onClick={submit}
            disabled={!valid || sending}
            className="btn-primary w-full mt-8 disabled:opacity-40 disabled:hover:scale-100"
          >
            <CheckCircle2 size={18} />
            {sending ? 'Registrando…' : 'Quiero participar'}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}