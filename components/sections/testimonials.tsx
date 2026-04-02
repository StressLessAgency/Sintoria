"use client";
import { motion } from "framer-motion";
import { useInView } from "@/hooks/use-in-view";

const reviews = [
  { q:"I came in with fifteen years of lower back pain and a body that felt like it was fighting itself. By session seven, I was standing taller than I had in a decade. This isn't massage — it's reorganization.", a:"David K.", role:"10-series graduate", large:true },
  { q:"As a runner, I'd accepted that hip tightness was just part of the deal. Three sessions in, my stride opened up in a way no stretch ever achieved.", a:"Rachel T.", role:"Marathon runner" },
  { q:"After my shoulder surgery, nothing was getting my range back. The scar tissue work here gave me movement I was told I'd lost permanently.", a:"Mark S.", role:"Post-surgical recovery" },
];

export default function Testimonials() {
  const { ref, inView } = useInView();
  return (
    <section id="stories" className="bg-[#F5F0E8] py-24 px-6 md:px-12">
      <div className="max-w-[1200px] mx-auto">
        <div ref={ref} className="flex items-end justify-between mb-14">
          <motion.div initial={{ opacity:0, y:20 }} animate={inView ? { opacity:1, y:0 } : {}} transition={{ duration:0.8 }}>
            <div className="flex items-center gap-3 mb-4">
              <span className="w-6 h-px bg-[#A0522D]" />
              <span className="text-[0.6rem] tracking-[0.28em] uppercase text-[#A0522D]">Client Stories</span>
            </div>
            <h2 className="font-display font-light text-[#2C1F14] leading-[1.1]"
                style={{ fontSize:"clamp(2.2rem,4vw,3.8rem)" }}>
              What Changes <em className="italic text-[#A0522D]">Look Like</em>
            </h2>
          </motion.div>
          <div className="hidden md:block text-right">
            <div className="text-[#A0522D] text-base tracking-wider">★★★★★</div>
            <div className="text-[0.62rem] tracking-[0.14em] uppercase text-[#A89880] mt-1">4.98 · 500+ clients</div>
          </div>
        </div>

        <div className="grid md:grid-cols-[1.5fr_1fr_1fr] gap-5">
          {reviews.map((r, i) => (
            <motion.div key={i}
              initial={{ opacity:0, y:24 }} animate={inView ? { opacity:1, y:0 } : {}}
              transition={{ delay:i*0.12, duration:0.7 }}
              className="border border-[rgba(160,82,45,0.13)] p-8 md:p-10 bg-[#F5F0E8] hover:bg-[#EDE5D4] hover:border-[rgba(160,82,45,0.28)] transition-all duration-300 group"
            >
              <div className="font-display text-[3.5rem] leading-none text-[rgba(160,82,45,0.15)] mb-4 select-none">"</div>
              <blockquote className={`font-display italic leading-[1.8] text-[#7A6A5A] mb-6 ${r.large ? "text-[1.1rem]" : "text-[0.95rem]"}`}>
                {r.q}
              </blockquote>
              <div className="text-[0.68rem] tracking-[0.14em] uppercase text-[#A0522D]">{r.a}</div>
              <div className="text-[0.68rem] text-[#A89880] mt-0.5">{r.role}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
