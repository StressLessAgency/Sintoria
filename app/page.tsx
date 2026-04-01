import MotionBackground from '@/components/motion-bg'
import Nav from '@/components/nav'
import Hero from '@/components/hero'
import Treatments from '@/components/treatments'
import Philosophy from '@/components/philosophy'
import Stats from '@/components/stats'
import Testimonials from '@/components/testimonials'
import FAQ from '@/components/faq'
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
        <FAQ />
        <NewClient />
      </main>
      <Footer />
    </>
  )
}
