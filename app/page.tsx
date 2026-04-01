import MotionBackground from '@/components/motion-bg'
import Nav from '@/components/nav'
import Hero from '@/components/hero'
import Treatments from '@/components/treatments'
import Philosophy from '@/components/philosophy'
import Stats from '@/components/stats'
import Testimonials from '@/components/testimonials'
import NewClient from '@/components/new-client'
import Footer from '@/components/footer'

export default function Home() {
  return (
    <>
      <MotionBackground />
      <Nav />
      <main>
        <Hero />
        <Treatments />
        <Philosophy />
        <Stats />
        <Testimonials />
        <NewClient />
      </main>
      <Footer />
    </>
  )
}
