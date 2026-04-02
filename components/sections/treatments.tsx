"use client";
import { motion } from "framer-motion";
import { useInView } from "@/hooks/use-in-view";

const treatments = [
  { num:"01", name:"The 10-Series",            price:"$1,650", dur:"10 × 75 min", featured:true,
    desc:"The foundational protocol. Ten sessions, each building on the last — systematically reorganizing your fascia to bring your structure into balance with gravity." },
  { num:"02", name:"Structural Single Session", price:"$185",   dur:"75 min",
    desc:"Targeted structural work for a specific area of restriction or compensation. Ideal for maintenance or focused problem-solving between series." },
  { num:"03", name:"Postural Assessment",       price:"$95",    dur:"45 min",
    desc:"A detailed reading of your structure — identifying imbalances, compensation patterns, and the relationships between where you feel pain and where it originates." },
  { num:"04", name:"Movement Integration",      price:"$145",   dur:"60 min",
    desc:"Hands-on fascial work paired with guided movement cues — retraining your nervous system to sustain the structural changes made in session." },
  { num:"05", name:"Post-Surgical Recovery",    price:"$165",   dur:"60 min",
    desc:"Specialized work with scar tissue and compensatory patterns that develop after surgery — restoring mobility and resolving fascial adhesions." },
  { num:"06", name:"Athletic Optimization",     price:"$185",   dur:"75 min",
    desc:"Structural work tailored for runners, cyclists, and movement athletes — addressing the fascial patterns that limit range, power, and recovery." },
];

export default function Treatments() {
  const { ref, inView } = useInView();
  return (
    <section id="services" className="bg-[#F5F0E8] py-24 px-6 md:px-12">
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <div ref={ref} className="flex items-end justify-between mb-14">
          <motion.div
            initial={{ opacity:0, y:24 }} animate={inView ? { opacity:1, y:0 } : {}}
            transition={{ duration:0.8 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="w-6 h-px bg-[#A0522D]" />
              <span className="text-[0.6rem] tracking-[0.28em] uppercase text-[#A0522D]">Services</span>
            </div>
            <h2 className="font-display font-light text-[#2C1F14] leading-[1.1]"
                style={{ fontSize:"clamp(2.2rem,4vw,3.8rem)" }}>
              The Work <em className="italic text-[#A0522D]">We Do</em>
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
