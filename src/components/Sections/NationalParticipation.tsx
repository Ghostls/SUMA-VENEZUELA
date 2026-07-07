import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { STATES } from '@/services/dashboard'
import Counter from './Counter'

const STATE_GOAL = 32

export default function NationalParticipation({ byState }: { byState: Record<string, number> }) {
  return (
    <section id="participacion" className="max-w-6xl mx-auto px-6 py-24">
      <h2 className="display text-4xl md:text-6xl text-center mb-3">Venezuela juega unida</h2>
      <p className="text-white/50 text-center mb-14">Seis ciudades activas en simultáneo.</p>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
        {STATES.map((s, i) => {
          const n = byState[s] || 0
          const pct = Math.min(100, Math.round((n / STATE_GOAL) * 100))
          return (
            <motion.div
              key={s}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className="glass rounded-2xl p-6 text-center"
            >
              <p className="uppercase tracking-widest text-xs text-white/40 mb-2">{s}</p>
              <p className="display text-4xl md:text-5xl text-gold"><Counter value={n} /></p>
              <p className="text-white/50 text-sm mt-1">Meta: {STATE_GOAL} · {pct}%</p>
            </motion.div>
          )
        })}
      </div>
      <div className="text-center mt-10">
        <Link to="/registro" className="btn-ghost">Ver participantes</Link>
      </div>
    </section>
  )
}
