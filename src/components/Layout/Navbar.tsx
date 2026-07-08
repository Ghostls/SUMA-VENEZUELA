import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import navLogo from '@/assets/11.png'

/**
 * Navbar.tsx — v2.1 (Evolución sin Destrucción)
 * - FIX v2.1: import ES directo del logo (fix pantalla negra / logo roto en producción)
 * - v2.0: logo 11.png reemplaza texto, fallback al texto si falla
 */

export default function Navbar() {
  const { pathname } = useLocation()
  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 inset-x-0 z-50"
    >
      <div className="tricolor" />
      <nav className="glass !border-x-0 !border-t-0 flex items-center justify-between px-5 md:px-10 py-3">
        <Link to="/" className="flex items-center" aria-label="Suma Venezuela — inicio">
          <img
            src={navLogo}
            alt="Suma Venezuela"
            draggable={false}
            className="h-9 md:h-11 w-auto object-contain select-none"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
              const fallback = e.currentTarget.nextElementSibling as HTMLElement | null
              if (fallback) fallback.style.display = 'inline'
            }}
          />
          <span className="display text-xl md:text-2xl" style={{ display: 'none' }}>
            SUMA <span className="text-gold">VENEZUELA</span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          {pathname !== '/registro' && (
            <Link to="/registro" className="btn-primary !px-5 !py-2 text-xs">Inscribirme</Link>
          )}
        </div>
      </nav>
    </motion.header>
  )
}