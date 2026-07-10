import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { useState, useEffect } from 'react'

import heroBg from '@/assets/fondo-suma.png'

/**
 * Hero.tsx — v4.1 (Nadbrio en la posición correcta según imagen)
 * - Bloque Nadbrio movido justo después de aliados y antes de botones.
 * - Logo 19 excluido del carrusel.
 * - Resto del código idéntico a v3.5.
 */

const fade = (d: number) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.9, delay: d, ease: 'easeOut' as const },
})

// Logos 1–18 excluyendo el 13 (Valkyron)
const sponsorLogos = Array.from({ length: 18 }, (_, i) => {
  const num = i + 1
  if (num === 13) return null
  return new URL(`/src/assets/${num}.png`, import.meta.url).href
}).filter(Boolean) as string[]

const valkyronLogo = new URL('/src/assets/13.png', import.meta.url).href
const nadbrioLogo = new URL('/src/assets/19.png', import.meta.url).href

const SMALL_LOGO_INDEX = 14

export default function Hero() {
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    const style = document.createElement('style')
    style.innerHTML = `
      @keyframes marqueeScroll {
        0%   { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
      .marquee-track {
        display: flex;
        width: max-content;
        animation: marqueeScroll 45s linear infinite;
        will-change: transform;
      }
      @media (min-width: 768px) {
        .marquee-track { animation-duration: 35s; }
      }
      .marquee-paused {
        animation-play-state: paused;
      }
      .marquee-mask {
        -webkit-mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent);
        mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent);
      }
      .hero-minh {
        min-height: 100vh;
        min-height: 100dvh;
      }
      .hero-title {
        font-size: clamp(2.2rem, 7vw + 0.5rem, 5rem);
        line-height: 1.06;
        text-shadow: 0 2px 24px rgba(0,0,0,0.45);
      }
      .hero-subtitle {
        font-size: clamp(1.2rem, 3.8vw, 2.4rem);
        line-height: 1.15;
      }
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
      .hero-vignette {
        background: radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%);
      }
      @keyframes pulseDot {
        0%, 100% { opacity: 1; transform: scale(1); }
        50%       { opacity: 0.45; transform: scale(0.8); }
      }
      .pulse-dot { animation: pulseDot 2s ease-in-out infinite; }
      .cta-lift { transition: transform 0.2s ease, box-shadow 0.2s ease; }
      .cta-lift:hover  { transform: translateY(-2px); }
      .cta-lift:active { transform: translateY(0) scale(0.98); }
      @media (prefers-reduced-motion: reduce) {
        .marquee-track  { animation: none; flex-wrap: wrap; justify-content: center; }
        .kenburns       { animation: none !important; }
        .pulse-dot      { animation: none; }
        .cta-lift,
        .cta-lift:hover,
        .cta-lift:active { transform: none; transition: none; }
      }
    `
    document.head.appendChild(style)
    return () => { document.head.removeChild(style) }
  }, [])

  const renderLogosWithDots = (logos: string[]) =>
    logos.map((src, index) => (
      <span
        key={index}
        className="flex items-center flex-shrink-0 gap-3 md:gap-5 px-2 md:px-3"
      >
        <img
          src={src}
          alt="Logo aliado"
          loading="lazy"
          draggable={false}
          className={`w-auto object-contain opacity-90 select-none flex-shrink-0 ${
            index === SMALL_LOGO_INDEX
              ? 'h-9 md:h-12'
              : 'h-7 md:h-10'
          }`}
          onError={(e) => {
            e.currentTarget.style.visibility = 'hidden'
          }}
        />
        {index < logos.length - 1 && (
          <span className="text-white/20 text-base md:text-xl select-none flex-shrink-0">·</span>
        )}
      </span>
    ))

  return (
    <section className="relative hero-minh overflow-hidden flex items-center justify-center bg-black">
      <div
        className="absolute inset-0 bg-cover bg-center kenburns"
        style={{ backgroundImage: `url('${heroBg}')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/45 to-black/95 md:from-black/70 md:via-black/40 md:to-black/90" />
      <div className="absolute inset-0 hero-vignette" />
      <div className="hero-glow" aria-hidden="true" />

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

        {/* Carrusel de aliados — 17 logos (1–18 sin el 13) */}
        <motion.div
          {...fade(0.95)}
          className="relative mt-6 md:mt-8 mx-auto max-w-4xl rounded-2xl md:rounded-3xl px-3 py-3 md:px-4 md:py-4 bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl overflow-hidden"
        >
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{ background: 'linear-gradient(to right, transparent, rgba(212,160,23,0.6), transparent)' }}
            aria-hidden="true"
          />
          <p className="text-[9px] md:text-xs uppercase tracking-[0.25em] md:tracking-[0.3em] text-white/50 mb-2 md:mb-3">
            Aliados del evento
          </p>
          <div className="relative overflow-hidden marquee-mask">
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

        {/* ⭐ BLOQUE NADBRIO — justo después de aliados, antes de botones (según tu imagen) */}
        <motion.div
          {...fade(1.1)}
          className="mt-6 md:mt-8 mx-auto max-w-3xl rounded-2xl bg-white/5 backdrop-blur-md border border-gold/30 shadow-lg shadow-gold/10 p-4 md:p-5 flex flex-col sm:flex-row items-center gap-4 md:gap-6"
        >
          <div className="flex-shrink-0">
            <img
              src={nadbrioLogo}
              alt="Nadbrio"
              loading="lazy"
              draggable={false}
              className="h-12 md:h-16 w-auto object-contain select-none"
              onError={(e) => { e.currentTarget.style.visibility = 'hidden' }}
            />
          </div>
          <div className="text-left text-white/90">
            <h3 className="text-xs md:text-sm uppercase tracking-widest text-gold/80 font-semibold">
              Gracias por ser parte de esencial de la reconstrucción de Venezuela.
            </h3>
            <p className="text-[11px] md:text-sm leading-relaxed mt-0.5 text-white/70">
              Contar con el compromiso social de la Fundación Nadbio no es solo un apoyo,
              es una reafirmación de nuestra misión, trabajar unidos por la reconstrucción
              y el bienestar de nuestro país

            </p>
          </div>
        </motion.div>

        {/* Botones — ahora debajo del bloque Nadbrio */}
        <motion.div
          {...fade(1.25)}
          className="mt-6 md:mt-8 flex flex-col sm:flex-row gap-3 md:gap-4 justify-center max-w-xs sm:max-w-none mx-auto"
        >
          <Link to="/registro" className="btn-primary cta-lift w-full sm:w-auto text-center">
            Inscribirme
          </Link>
          <a href="#participacion" className="btn-ghost cta-lift w-full sm:w-auto text-center">
            Ver participantes
          </a>
        </motion.div>

        {/* Powered by Valkyron — se mantiene al final */}
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
            onError={(e) => { e.currentTarget.style.visibility = 'hidden' }}
          />
        </motion.div>
      </div>

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