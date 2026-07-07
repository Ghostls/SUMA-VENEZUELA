import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'

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
        <Link to="/" className="display text-xl md:text-2xl">
          SUMA <span className="text-gold">VENEZUELA</span>
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
