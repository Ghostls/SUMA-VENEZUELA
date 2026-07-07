import { motion } from 'framer-motion'
import { Users, User, UserRound, MapPin, Shield, DollarSign, Target } from 'lucide-react'
import type { DashboardStats } from '@/services/dashboard'
import Counter from '@/components/Sections/Counter'

export default function NationalDashboard({ stats }: { stats: DashboardStats }) {
  const cards = [
    { icon: Users, label: 'Inscritos', value: stats.total },
    { icon: User, label: 'Jugadores', value: stats.male },
    { icon: UserRound, label: 'Jugadoras', value: stats.female },
    { icon: MapPin, label: 'Estados activos', value: stats.activeStates },
    { icon: Shield, label: 'Clubes activos', value: stats.activeClubs },
    { icon: DollarSign, label: 'Recaudación estimada', value: stats.raised, prefix: '$' },
  ]
  return (
    <section className="max-w-6xl mx-auto px-6 py-24">
      <h2 className="display text-4xl md:text-6xl text-center mb-3">Dashboard nacional</h2>
      <p className="text-white/50 text-center mb-14">Datos en tiempo real de todo el país.</p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
        {cards.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: i * 0.05 }}
            className="glass rounded-2xl p-6"
          >
            <c.icon className="text-energy mb-3" size={22} />
            <p className="display text-4xl"><Counter value={c.value} prefix={c.prefix} /></p>
            <p className="text-xs uppercase tracking-widest text-white/40 mt-1">{c.label}</p>
          </motion.div>
        ))}
      </div>
      <div className="glass rounded-2xl p-6 mt-5">
        <div className="flex items-center justify-between mb-3">
          <p className="flex items-center gap-2 text-sm uppercase tracking-widest text-white/50"><Target size={16} className="text-gold" /> Meta nacional</p>
          <p className="display text-2xl text-gold">{stats.goalPct}%</p>
        </div>
        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-energy to-gold"
            initial={{ width: 0 }}
            whileInView={{ width: `${stats.goalPct}%` }}
            viewport={{ once: true }}
            transition={{ duration: 1.2 }}
          />
        </div>
      </div>
    </section>
  )
}
