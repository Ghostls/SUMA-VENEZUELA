import Navbar from '@/components/Layout/Navbar'
import Footer from '@/components/Layout/Footer'
import RegistrationForm from '@/components/Registration/RegistrationForm'
import { motion } from 'framer-motion'

export default function Register() {
  return (
    <>
      <Navbar />
      <main className="pt-32 pb-16 px-6 max-w-3xl mx-auto min-h-screen">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <p className="uppercase tracking-[0.4em] text-gold text-xs mb-4">Inscripción oficial</p>
          <h1 className="display text-4xl md:text-6xl">Únete al movimiento</h1>
          <p className="text-white/60 mt-4">Sábado 11 de Julio · 5:00 PM · Inscripción 20 USD · 100% a beneficio</p>
        </motion.div>
        <RegistrationForm />
      </main>
      <Footer />
    </>
  )
}
