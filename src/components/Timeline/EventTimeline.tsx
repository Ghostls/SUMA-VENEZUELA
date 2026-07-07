import { motion } from 'framer-motion'

const events = [
  { time: '5 PM', label: 'Inicio' },
  { time: '6 PM', label: 'Primera ronda' },
  { time: '7 PM', label: 'Segunda ronda' },
  { time: '8 PM', label: 'Finales' },
  { time: '9 PM', label: 'Entrega simbólica' },
]

export default function EventTimeline() {
  return (
    <section className="py-24">
      <h2 className="display text-4xl md:text-6xl text-center mb-14 px-6">Una noche de pádel</h2>
      <div className="overflow-x-auto pb-6">
        <div className="flex gap-5 px-6 min-w-max mx-auto md:justify-center">
          {events.map((e, i) => (
            <motion.div
              key={e.time}
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass rounded-2xl px-8 py-6 w-44 text-center relative"
            >
              <p className="display text-3xl text-gold">{e.time}</p>
              <p className="text-white/60 text-sm mt-2">{e.label}</p>
              {i < events.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-5 w-5 h-px bg-gradient-to-r from-gold/60 to-transparent" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
