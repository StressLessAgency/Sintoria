import Nav         from "@/components/sections/nav";
import Hero        from "@/components/sections/hero";
import MarqueeBand from "@/components/sections/marquee-band";
import Treatments  from "@/components/sections/treatments";
import Philosophy  from "@/components/sections/philosophy";
import Stats       from "@/components/sections/stats";
import Testimonials from "@/components/sections/testimonials";
import Booking     from "@/components/sections/booking";
import Footer      from "@/components/sections/footer";

export default function Home() {
  return (
    <main>
      <Nav />
      <Hero />
      <MarqueeBand />
      <Treatments />
      <Philosophy />
      <Stats />
      <Testimonials />
      <Booking />
      <Footer />
    </main>
  );
}
