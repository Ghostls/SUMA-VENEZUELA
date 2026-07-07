import { motion } from 'framer-motion'
import { Utensils, Pill, HeartHandshake, Hammer } from 'lucide-react'

const items = [
  { icon: Utensils, label: 'Alimentación' },
  { icon: Pill, label: 'Medicinas' },
  { icon: HeartHandshake, label: 'Ayuda humanitaria' },
  { icon: Hammer, label: 'Reconstrucción' },
]

export default function Impact() {
  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0" style={{ background: 'radial-gradient(800px 400px at 50% 0%, rgba(212,160,23,0.12), transparent 70%)' }} />
      <div className="relative max-w-5xl mx-auto px-6 text-center">
        <h2 className="display text-4xl md:text-6xl mb-4">Cada inscripción ayuda</h2>
        <p className="text-white/60 max-w-2xl mx-auto mb-14">
          El 100% de lo recaudado se destinará a apoyar a las familias afectadas por el terremoto en Venezuela.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {items.map((it, i) => (
            <motion.div
              key={it.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="glass rounded-2xl p-8 flex flex-col items-center gap-4"
            >
              <it.icon className="text-energy" size={30} />
              <p className="font-semibold">{it.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
