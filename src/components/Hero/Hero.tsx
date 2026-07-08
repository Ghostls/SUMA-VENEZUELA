import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { useState, useEffect } from 'react'

// ── Fondo del hero: import ES directo (Vite SIEMPRE lo procesa) ──
// Requiere que el archivo exista como src/assets/fondo-suma.png (sin espacios).
// Si el nombre no coincide, Vite fallará al compilar con un error claro.
import heroBg from '@/assets/fondo-suma.png'

/**
 * Hero.tsx — v3.2 (Evolución sin Destrucción) — FUSIÓN v3.0 + v3.1
 * - De v3.1: import ES del fondo (fix definitivo pantalla negra),
 *   min-height (el contenido nunca se recorta tras el navbar),
 *   pt-24/pt-28 para el navbar fijo, clamp() con techo 5rem
 * - De v3.0: overlay responsivo (más denso en móvil para legibilidad),
 *   glow dorado, viñeta cinematográfica, borde dorado en aliados,
 *   punto pulsante en badge, CTAs con lift, comentarios completos
 * - v2.0: mobile-first, touch-pause marquee, reduced motion
 * - Toda la lógica v1 preservada: logos 1–12, Valkyron 13, fades, pausa
 */

const fade = (d: number) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.9, delay: d, ease: 'easeOut' as const },
})

// Cargar logos 1–12 desde assets usando rutas absolutas con import.meta.url
const sponsorLogos = Array.from({ length: 12 }, (_, i) => {
  const num = i + 1
  return new URL(`/src/assets/${num}.png`, import.meta.url).href
})

// Logo 13 para "Powered by Valkyron"
const valkyronLogo = new URL('/src/assets/13.png', import.meta.url).href

export default function Hero() {
  const [isPaused, setIsPaused] = useState(false)

  // Inyectar keyframes CSS para el marquee + mejoras responsive
  useEffect(() => {
    const style = document.createElement('style')
    style.innerHTML = `
      @keyframes marqueeScroll {
        0% { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
      .marquee-track {
        display: flex;
        animation: marqueeScroll 28s linear infinite;
        will-change: transform;
      }
      @media (min-width: 768px) {
        .marquee-track { animation-duration: 20s; }
      }
      .marquee-paused {
        animation-play-state: paused;
      }
      /* Máscara de degradado en los bordes del carrusel */
      .marquee-mask {
        -webkit-mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent);
        mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent);
      }
      /* min-height (no height fija): el contenido nunca se recorta.
         Si la pantalla es baja, el hero crece y hace scroll natural.
         dvh = altura real del viewport en móvil (barra del navegador). */
      .hero-minh {
        min-height: 100vh;
        min-height: 100dvh;
      }
      /* Tipografía fluida — techo 5rem para convivir con el navbar fijo */
      .hero-title {
        font-size: clamp(2.2rem, 7vw + 0.5rem, 5rem);
        line-height: 1.06;
        text-shadow: 0 2px 24px rgba(0,0,0,0.45);
      }
      .hero-subtitle {
        font-size: clamp(1.2rem, 3.8vw, 2.4rem);
        line-height: 1.15;
      }
      /* Glow dorado radial detrás del título */
      .hero-glow {
        position: absolute;
        top: 24%;
        left: 50%;
        transform: translateX(-50%);
        width: min(80vw, 640px);
        height: min(50vw, 380px);
        background: radial-gradient(ellipse at center, rgba(212,160,23,0.14) 0%, transparent 65%);
        pointer-events: none;
        filter: blur(10px);
      }
      /* Viñeta lateral cinematográfica */
      .hero-vignette {
        background: radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%);
      }
      /* Punto pulsante del badge */
      @keyframes pulseDot {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.45; transform: scale(0.8); }
      }
      .pulse-dot { animation: pulseDot 2s ease-in-out infinite; }
      /* Micro-interacción de los CTAs */
      .cta-lift { transition: transform 0.2s ease, box-shadow 0.2s ease; }
      .cta-lift:hover { transform: translateY(-2px); }
      .cta-lift:active { transform: translateY(0) scale(0.98); }
      /* Accesibilidad: respetar reduced motion */
      @media (prefers-reduced-motion: reduce) {
        .marquee-track { animation: none; flex-wrap: wrap; justify-content: center; }
        .kenburns { animation: none !important; }
        .pulse-dot { animation: none; }
        .cta-lift, .cta-lift:hover, .cta-lift:active { transform: none; transition: none; }
      }
    `
    document.head.appendChild(style)
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  // Función para renderizar logos con puntos
  const renderLogosWithDots = (logos: string[]) => {
    return logos.map((src, index) => (
      <span
        key={index}
        className="flex items-center flex-shrink-0 gap-3 md:gap-6 px-1.5 md:px-0"
      >
        <img
          src={src}
          alt="Logo aliado"
          loading="lazy"
          draggable={false}
          className="h-7 md:h-10 w-auto object-contain opacity-90 select-none"
          onError={(e) => {
            // Fallback en caso de que no cargue la imagen
            e.currentTarget.style.display = 'none'
          }}
        />
        {index < logos.length - 1 && (
          <span className="text-white/30 text-base md:text-xl select-none">·</span>
        )}
      </span>
    ))
  }

  return (
    <section className="relative hero-minh overflow-hidden flex items-center justify-center bg-black">
      {/* Imagen de fondo — import ES: funciona en dev y producción */}
      <div
        className="absolute inset-0 bg-cover bg-center kenburns"
        style={{ backgroundImage: `url('${heroBg}')` }}
      />

      {/* Overlay cinematográfico — más denso abajo en móvil para legibilidad */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/45 to-black/95 md:from-black/70 md:via-black/40 md:to-black/90" />

      {/* Viñeta lateral */}
      <div className="absolute inset-0 hero-vignette" />

      {/* Glow dorado detrás del título */}
      <div className="hero-glow" aria-hidden="true" />

      {/* Contenido — pt-24/pt-28 respeta el navbar fijo, pb deja aire abajo */}
      <div className="relative z-10 w-full max-w-6xl px-5 sm:px-6 text-center pt-24 md:pt-28 pb-16 md:pb-20">
        <motion.div {...fade(0.1)}>
          <span className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 md:px-5 md:py-2 mb-5 md:mb-7 text-[10px] md:text-xs tracking-[0.25em] md:tracking-[0.35em] uppercase text-gold bg-white/10 backdrop-blur-xl border border-white/20">
            <span className="pulse-dot w-1.5 h-1.5 rounded-full bg-gold inline-block" aria-hidden="true" />
            🇻🇪 Evento nacional a beneficio
          </span>
        </motion.div>

        <motion.h1 {...fade(0.3)} className="display hero-title">
          Torneo Americano
          <br />
          de Pádel
        </motion.h1>

        <motion.h2 {...fade(0.55)} className="display hero-subtitle mt-3 md:mt-4">
          A beneficio ·
          <span className="ml-2 text-transparent bg-clip-text bg-gradient-to-r from-energy to-gold">
            Suma Venezuela
          </span>
        </motion.h2>

        <motion.p
          {...fade(0.8)}
          className="text-white/80 mt-4 md:mt-5 text-sm sm:text-base md:text-lg max-w-md sm:max-w-2xl mx-auto"
        >
          El deporte une al país para ayudar a quienes más lo necesitan.
        </motion.p>

        {/* Carrusel de logos aliados */}
        <motion.div
          {...fade(0.95)}
          className="relative mt-6 md:mt-8 mx-auto max-w-4xl rounded-2xl md:rounded-3xl px-3 py-3 md:px-4 md:py-4 bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl overflow-hidden"
        >
          {/* Borde superior degradado dorado */}
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{ background: 'linear-gradient(to right, transparent, rgba(212,160,23,0.6), transparent)' }}
            aria-hidden="true"
          />

          <p className="text-[9px] md:text-xs uppercase tracking-[0.25em] md:tracking-[0.3em] text-white/50 mb-2 md:mb-3">
            Aliados del evento
          </p>

          <div className="relative overflow-hidden marquee-mask">
            {/* Track con duplicación para efecto infinito */}
            <div
              className={`marquee-track ${isPaused ? 'marquee-paused' : ''}`}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              onTouchStart={() => setIsPaused(true)}
              onTouchEnd={() => setIsPaused(false)}
            >
              {renderLogosWithDots(sponsorLogos)}
              {renderLogosWithDots(sponsorLogos)}
            </div>
          </div>
        </motion.div>

        {/* Botones CTA — full-width en móvil para tap targets grandes */}
        <motion.div
          {...fade(1.15)}
          className="mt-6 md:mt-8 flex flex-col sm:flex-row gap-3 md:gap-4 justify-center max-w-xs sm:max-w-none mx-auto"
        >
          <Link to="/registro" className="btn-primary cta-lift w-full sm:w-auto text-center">
            Inscribirme
          </Link>
          <a href="#participacion" className="btn-ghost cta-lift w-full sm:w-auto text-center">
            Ver participantes
          </a>
        </motion.div>

        {/* Powered by Valkyron */}
        <motion.div
          {...fade(1.4)}
          className="mt-6 md:mt-8 flex flex-col items-center opacity-70"
        >
          <span className="text-[9px] md:text-[10px] uppercase tracking-[0.3em] md:tracking-[0.35em] text-white/50 mb-1.5 md:mb-2">
            Powered by
          </span>
          <img
            src={valkyronLogo}
            alt="Valkyron"
            loading="lazy"
            draggable={false}
            className="h-7 md:h-10 object-contain select-none"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 text-white/40"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        aria-hidden="true"
      >
        <ChevronDown />
      </motion.div>
    </section>
  )
}