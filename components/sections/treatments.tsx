"use client";
import { motion } from "framer-motion";
import { useInView } from "@/hooks/use-in-view";

const treatments = [
  { num:"01", name:"Hot Stone Ritual",     price:"$135", dur:"75–90 min", featured:true,
    desc:"Heated basalt stones melt tension at the cellular level while grounding your energy in deep, meditative warmth." },
  { num:"02", name:"Swedish Relaxation",   price:"$95",  dur:"60–90 min",
    desc:"Long, flowing strokes orchestrated to ease tension, improve circulation, and invite profound rest." },
  { num:"03", name:"Deep Tissue Therapy",  price:"$110", dur:"60–90 min",
    desc:"Targeted, intentional pressure that reaches deep muscle strata — breaking adhesions held for years." },
  { num:"04", name:"Aromatherapy Bliss",   price:"$105", dur:"60 min",
    desc:"Curated organic essential oils and gentle techniques for a full sensory journey — body, mind, and the spaces between." },
  { num:"05", name:"Prenatal Care",        price:"$100", dur:"60 min",
    desc:"Specialist techniques honouring the sacred journey of pregnancy — gentle, supportive, trimester-tailored." },
  { num:"06", name:"Couples Sanctuary",    price:"$220", dur:"60–90 min",
    desc:"Two therapists, one tranquil room — a shared ritual of healing designed to restore harmony between two people." },
];

export default function Treatments() {
  const { ref, inView } = useInView();
  return (
    <section id="treatments" className="bg-[#F5F0E8] py-24 px-6 md:px-12">
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <div ref={ref} className="flex items-end justify-between mb-14">
          <motion.div
            initial={{ opacity:0, y:24 }} animate={inView ? { opacity:1, y:0 } : {}}
            transition={{ duration:0.8 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="w-6 h-px bg-[#A0522D]" />
              <span className="text-[0.6rem] tracking-[0.28em] uppercase text-[#A0522D]">Our Treatments</span>
            </div>
            <h2 className="font-display font-light text-[#2C1F14] leading-[1.1]"
                style={{ fontSize:"clamp(2.2rem,4vw,3.8rem)" }}>
              Crafted for <em className="italic text-[#A0522D]">Your Body</em>
            </h2>
          </motion.div>
          <span className="hidden md:block font-display italic text-[#A0522D] select-none pointer-events-none"
                style={{ fontSize:"clamp(5rem,9vw,10rem)", color:"rgba(160,82,45,0.07)", lineHeight:1 }}>
            06
          </span>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[rgba(160,82,45,0.1)]">
          {treatments.map((t, i) => (
            <motion.article
              key={t.num}
              initial={{ opacity:0, y:24 }}
              animate={inView ? { opacity:1, y:0 } : {}}
              transition={{ delay: i * 0.08, duration:0.7 }}
              className={`relative p-8 md:p-10 group transition-colors duration-300 cursor-default
                ${t.featured ? "bg-[#EDE5D4]" : "bg-[#F5F0E8] hover:bg-[#EDE5D4]"}`}
            >
              {t.featured && (
                <span className="absolute top-5 right-5 text-[0.55rem] tracking-[0.14em] uppercase bg-[#A0522D] text-[#F5F0E8] px-2.5 py-1">
                  Most Loved
                </span>
              )}
              <div className="font-display italic text-[2.5rem] leading-none mb-4"
                   style={{ color:"rgba(160,82,45,0.14)" }}>
                {t.num}
              </div>
              <h3 className="font-display font-light text-xl text-[#2C1F14] mb-3 leading-snug">{t.name}</h3>
              <p className="text-[0.82rem] leading-[1.85] text-[#7A6A5A] mb-6">{t.desc}</p>
              <div className="flex items-center justify-between pt-4 border-t border-[rgba(160,82,45,0.12)]">
                <span className="font-display text-xl text-[#A0522D]">{t.price}</span>
                <span className="text-[0.62rem] tracking-[0.12em] uppercase text-[#A89880]">{t.dur}</span>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
