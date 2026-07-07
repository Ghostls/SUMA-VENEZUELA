import { motion } from 'framer-motion'
import { Calendar, Clock, Trophy, Ticket, HeartHandshake } from 'lucide-react'

const items = [
  { icon: Calendar, label: 'Fecha', value: 'Sábado 11 de Julio' },
  { icon: Clock, label: 'Hora', value: '5:00 PM – 9:00 PM' },
  { icon: Trophy, label: 'Modalidad', value: 'Americano' },
  { icon: Ticket, label: 'Inscripción', value: '20 USD' },
  { icon: HeartHandshake, label: 'Destino', value: '100% destinado a apoyar a afectados por el terremoto en Venezuela' },
]

export default function EventInfo() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-24">
      <h2 className="display text-4xl md:text-6xl text-center mb-14">El evento</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map((it, i) => (
          <motion.div
            key={it.label}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay: i * 0.08 }}
            className={`glass rounded-2xl p-7 ${i === items.length - 1 ? 'sm:col-span-2 lg:col-span-1' : ''}`}
          >
            <it.icon className="text-gold mb-4" size={26} />
            <p className="text-xs uppercase tracking-widest text-white/40 mb-1">{it.label}</p>
            <p className="text-lg font-semibold">{it.value}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
