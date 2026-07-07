import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { useState, useEffect } from 'react'

/**
 * Hero.tsx — v2.0 (Evolución sin Destrucción)
 * - Mobile-first: 100dvh, clamp() typography, touch-pause marquee
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
      /* Altura real de viewport en móvil (barra del navegador) */
      .hero-dvh {
        height: 100vh;
        height: 100dvh;
      }
      /* Tipografía fluida: escala suave entre 360px y 1440px */
      .hero-title {
        font-size: clamp(2.5rem, 9vw + 0.5rem, 6.5rem);
        line-height: 1.05;
      }
      .hero-subtitle {
        font-size: clamp(1.35rem, 4.5vw, 3rem);
        line-height: 1.15;
      }
      /* Accesibilidad: respetar reduced motion */
      @media (prefers-reduced-motion: reduce) {
        .marquee-track { animation: none; flex-wrap: wrap; justify-content: center; }
        .kenburns { animation: none !important; }
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
    <section className="relative hero-dvh overflow-hidden flex items-center justify-center">
      {/* Imagen de fondo */}
      <div
        className="absolute inset-0 bg-cover bg-center kenburns"
        style={{
          backgroundImage: "url('/src/assets/FONDO PROVISIONAL SUMAVZLA.png')",
        }}
      />

      {/* Overlay cinematográfico — más denso abajo en móvil para legibilidad */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/45 to-black/95 md:from-black/70 md:via-black/40 md:to-black/90" />

      {/* Contenido */}
      <div className="relative z-10 w-full max-w-6xl px-5 sm:px-6 text-center pt-6 pb-16 md:pt-0 md:pb-0">
        <motion.div {...fade(0.1)}>
          <span className="inline-flex items-center rounded-full px-4 py-1.5 md:px-5 md:py-2 mb-5 md:mb-8 text-[10px] md:text-xs tracking-[0.25em] md:tracking-[0.35em] uppercase text-gold bg-white/10 backdrop-blur-xl border border-white/20">
            🇻🇪 Evento nacional a beneficio
          </span>
        </motion.div>

        <motion.h1 {...fade(0.3)} className="display hero-title">
          Torneo Americano
          <br />
          de Pádel
        </motion.h1>

        <motion.h2 {...fade(0.55)} className="display hero-subtitle mt-3 md:mt-5">
          A beneficio ·
          <span className="ml-2 text-transparent bg-clip-text bg-gradient-to-r from-energy to-gold">
            Suma Venezuela
          </span>
        </motion.h2>

        <motion.p
          {...fade(0.8)}
          className="text-white/80 mt-4 md:mt-6 text-sm sm:text-base md:text-xl max-w-md sm:max-w-2xl mx-auto"
        >
          El deporte une al país para ayudar a quienes más lo necesitan.
        </motion.p>

        {/* Carrusel de logos aliados */}
        <motion.div
          {...fade(0.95)}
          className="mt-6 md:mt-10 mx-auto max-w-4xl rounded-2xl md:rounded-3xl px-3 py-3 md:px-4 md:py-4 bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl"
        >
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
          className="mt-6 md:mt-10 flex flex-col sm:flex-row gap-3 md:gap-4 justify-center max-w-xs sm:max-w-none mx-auto"
        >
          <Link to="/registro" className="btn-primary w-full sm:w-auto text-center">
            Inscribirme
          </Link>
          <a href="#participacion" className="btn-ghost w-full sm:w-auto text-center">
            Ver participantes
          </a>
        </motion.div>

        {/* Powered by Valkyron */}
        <motion.div
          {...fade(1.4)}
          className="mt-6 md:mt-10 flex flex-col items-center opacity-70"
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
        className="absolute bottom-5 md:bottom-8 left-1/2 -translate-x-1/2 text-white/40"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        aria-hidden="true"
      >
        <ChevronDown />
      </motion.div>
    </section>
  )
}