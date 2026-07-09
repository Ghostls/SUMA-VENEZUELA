/**
 * Footer.tsx — v2.0 (Evolución sin Destrucción)
 * - NUEVO v2.0: logos reales para Suma Venezuela (11), Rayocero (1),
 *   Fundana (9) y VTP (10) en vez de texto plano
 * - v1.0: partners como texto, tricolor, info del evento
 */

// Logos via import.meta.url — mismo patrón del Hero (funciona en producción)
const logoSuma     = new URL('/src/assets/11.png', import.meta.url).href
const logoRayocero = new URL('/src/assets/1.png',  import.meta.url).href
const logoFundana  = new URL('/src/assets/9.png',  import.meta.url).href
const logoVTP      = new URL('/src/assets/10.png', import.meta.url).href

const PARTNER_LOGOS = [
  { src: logoSuma,     alt: 'Suma Venezuela'  },
  { src: logoRayocero, alt: 'RayoCero'        },
  { src: logoFundana,  alt: 'Fundana'         },
  { src: logoVTP,      alt: 'VTP'             },
]

export default function Footer() {
  return (
    <footer className="border-t border-white/10 mt-24">
      <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col items-center gap-8">

        {/* Logo principal Suma Venezuela */}
        <img
          src={logoSuma}
          alt="Suma Venezuela"
          draggable={false}
          className="h-12 md:h-14 w-auto object-contain select-none"
          onError={e => {
            e.currentTarget.style.display = 'none'
            const fallback = e.currentTarget.nextElementSibling as HTMLElement | null
            if (fallback) fallback.style.display = 'inline'
          }}
        />
        {/* Fallback texto si el logo falla */}
        <p className="display text-2xl text-center" style={{ display: 'none' }}>
          SUMA <span className="text-gold">VENEZUELA</span>
        </p>

        {/* Logos de partners */}
        <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-5 md:gap-x-12">
          {PARTNER_LOGOS.map(({ src, alt }) => (
            <img
              key={alt}
              src={src}
              alt={alt}
              draggable={false}
              loading="lazy"
              className="h-8 md:h-10 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity select-none"
              onError={e => {
                // Fallback: mostrar nombre en texto si el logo no carga
                const span = document.createElement('span')
                span.textContent = alt
                span.className = 'text-white/40 uppercase tracking-widest text-xs'
                e.currentTarget.replaceWith(span)
              }}
            />
          ))}
        </div>

        <div className="tricolor w-40 rounded-full" />

        <p className="text-white/30 text-xs text-center max-w-md">
          Torneo Americano de Pádel a Beneficio · Sábado 11 de Julio · 100% del recaudo destinado a los afectados por el terremoto en Venezuela.
        </p>

      </div>
    </footer>
  )
}