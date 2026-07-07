import { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield } from 'lucide-react'
import { CLUBS } from '@/services/dashboard'

export default function Clubs({ byClub }: { byClub: Record<string, number> }) {
  const [hovered, setHovered] = useState<string | null>(null)

  return (
    <section className="max-w-6xl mx-auto px-6 py-24">
      <h2 className="display text-4xl md:text-6xl text-center mb-3">Clubes participantes</h2>
      <p className="text-white/50 text-center mb-14">Ocho clubes, un solo objetivo.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {CLUBS.map((club, i) => {
          const n = byClub[club.name] || 0
          const pct = Math.min(100, Math.round((n / club.goal) * 100))
          const isHovered = hovered === club.name

          return (
            <motion.div
              key={club.name}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.55, delay: i * 0.055, ease: 'easeOut' }}
              onHoverStart={() => setHovered(club.name)}
              onHoverEnd={() => setHovered(null)}
              style={{
                background: isHovered
                  ? 'linear-gradient(135deg, rgba(249,115,22,0.18) 0%, rgba(212,160,23,0.14) 50%, rgba(255,255,255,0.06) 100%)'
                  : 'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: isHovered
                  ? '1px solid rgba(212,160,23,0.45)'
                  : '1px solid rgba(255,255,255,0.10)',
                boxShadow: isHovered
                  ? '0 8px 40px rgba(249,115,22,0.18), inset 0 1px 0 rgba(255,255,255,0.15)'
                  : '0 4px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.07)',
                transition: 'all 0.35s ease',
              }}
              className="relative rounded-2xl p-6 overflow-hidden cursor-default"
            >
              {/* Specular highlight top-left */}
              <div
                className="pointer-events-none absolute -top-px left-4 right-4 h-px"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)' }}
              />

              {/* Inner glow when hovered */}
              <motion.div
                className="pointer-events-none absolute inset-0 rounded-2xl"
                animate={{ opacity: isHovered ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                style={{ background: 'radial-gradient(circle at 30% 20%, rgba(249,115,22,0.12), transparent 65%)' }}
              />

              {/* Header */}
              <div className="relative flex items-center gap-3 mb-5">
                <motion.div
                  animate={{ scale: isHovered ? 1.08 : 1 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    background: 'linear-gradient(135deg, rgba(249,115,22,0.35), rgba(212,160,23,0.25))',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(212,160,23,0.3)',
                    boxShadow: isHovered ? '0 0 16px rgba(249,115,22,0.35)' : 'none',
                    transition: 'box-shadow 0.3s ease',
                  }}
                  className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                >
                  <Shield className="text-gold" size={20} />
                </motion.div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm leading-tight truncate">{club.name}</p>
                  <p className="text-[10px] uppercase tracking-widest text-white/40 mt-0.5">{club.state}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="relative flex justify-between items-baseline text-sm mb-3">
                <span className="text-white/55">{n} inscritos</span>
                <motion.span
                  animate={{ color: isHovered ? '#F97316' : '#D4A017' }}
                  transition={{ duration: 0.3 }}
                  className="font-semibold tabular-nums"
                >
                  {pct}%
                </motion.span>
              </div>

              {/* Progress bar */}
              <div
                className="relative h-1.5 rounded-full overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.08)' }}
              >
                {/* Track glow */}
                <motion.div
                  className="absolute inset-0 rounded-full"
                  animate={{ opacity: isHovered ? 1 : 0 }}
                  style={{ background: 'rgba(249,115,22,0.15)', filter: 'blur(3px)' }}
                />
                <motion.div
                  className="h-full rounded-full"
                  initial={{ width: 0 }}
                  whileInView={{ width: `${pct}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.1, delay: 0.25 + i * 0.04, ease: 'easeOut' }}
                  style={{
                    background: 'linear-gradient(90deg, #F97316, #D4A017)',
                    boxShadow: isHovered ? '0 0 8px rgba(249,115,22,0.7)' : '0 0 4px rgba(212,160,23,0.4)',
                  }}
                />
              </div>

              {/* Meta label */}
              <p className="text-[10px] text-white/25 mt-2 text-right">Meta: {club.goal}</p>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}