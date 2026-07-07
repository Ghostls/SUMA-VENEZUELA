import { motion } from 'framer-motion'
import { Eye, RefreshCw, MapPin, Shield, DollarSign } from 'lucide-react'

const points = [
  { icon: Eye, text: 'Inscritos en tiempo real' },
  { icon: MapPin, text: 'Participantes por estado' },
  { icon: Shield, text: 'Clubes registrados' },
  { icon: DollarSign, text: 'Recaudación estimada' },
  { icon: RefreshCw, text: 'Actualización automática' },
]

export default function Transparency() {
  return (
    <section className="max-w-5xl mx-auto px-6 py-24">
      <h2 className="display text-4xl md:text-6xl text-center mb-4">Transparencia del evento</h2>
      <p className="text-white/60 text-center max-w-2xl mx-auto mb-14">
        Esta plataforma muestra los datos del torneo de manera abierta, para que cada participante y donante pueda verificar el alcance del movimiento.
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        {points.map((p, i) => (
          <motion.div
            key={p.text}
            initial={{ opacity: 0, scale: 0.94 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
            className="glass rounded-full px-6 py-3 flex items-center gap-3"
          >
            <p.icon size={16} className="text-gold" />
            <span className="text-sm text-white/80">{p.text}</span>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
