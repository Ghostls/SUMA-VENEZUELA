export default function Footer() {
  const partners = ['Federación Venezolana de Pádel', 'Fundana', 'VPT', 'RayoCero']
  return (
    <footer className="border-t border-white/10 mt-24">
      <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col items-center gap-8">
        <p className="display text-2xl text-center">SUMA <span className="text-gold">VENEZUELA</span></p>
        <div className="flex flex-wrap justify-center gap-x-10 gap-y-4">
          {partners.map(p => (
            <span key={p} className="text-white/40 uppercase tracking-widest text-xs">{p}</span>
          ))}
        </div>
        <div className="tricolor w-40 rounded-full" />
        <p className="text-white/30 text-xs text-center">
          Torneo Americano de Pádel a Beneficio · Sábado 11 de Julio · 100% del recaudo destinado a los afectados por el terremoto en Venezuela.
        </p>
      </div>
    </footer>
  )
}
