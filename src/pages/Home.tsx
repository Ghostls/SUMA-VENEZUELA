import Navbar from '@/components/Layout/Navbar'
import Footer from '@/components/Layout/Footer'
import Hero from '@/components/Hero/Hero'
import EventInfo from '@/components/Sections/EventInfo'
import Clubs from '@/components/ClubCards/Clubs'
import NationalParticipation from '@/components/Sections/NationalParticipation'
import NationalDashboard from '@/components/Dashboard/NationalDashboard'
import VenezuelaMap from '@/components/Map/VenezuelaMap'
import EventTimeline from '@/components/Timeline/EventTimeline'
import Impact from '@/components/Sections/Impact'
import Transparency from '@/components/Sections/Transparency'
import DonationSection from '@/components/Sections/DonationSection'
import { useParticipants } from '@/hooks/useParticipants'

export default function Home() {
  const { stats } = useParticipants()
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <EventInfo />
        <Clubs byClub={stats.byClub} />
        <NationalParticipation byState={stats.byState} />
        <NationalDashboard stats={stats} />
        <VenezuelaMap byState={stats.byState} />
        <EventTimeline />
        <Impact />
        <Transparency />
        <DonationSection />
      </main>
      <Footer />
    </>
  )
}