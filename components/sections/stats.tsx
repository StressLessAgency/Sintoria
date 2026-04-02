"use client";
import { motion } from "framer-motion";
import { useInView } from "@/hooks/use-in-view";

const stats = [
  { n:"500+", l:"Sessions Delivered" },
  { n:"4.98", l:"Average Rating" },
  { n:"6",    l:"Years in Practice" },
  { n:"100%", l:"Organic Products" },
];

export default function Stats() {
  const { ref, inView } = useInView();
  return (
    <div ref={ref} className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[rgba(160,82,45,0.15)]"
         role="region" aria-label="Studio statistics">
      {stats.map((s, i) => (
        <motion.div key={s.l}
          initial={{ opacity:0, y:16 }} animate={inView ? { opacity:1, y:0 } : {}}
          transition={{ delay:i*0.1, duration:0.7 }}
          className="bg-[#A0522D] py-10 px-8 md:px-12 text-center"
        >
          <div className="font-display font-light text-[#F5F0E8] mb-2"
               style={{ fontSize:"clamp(2.5rem,4vw,4rem)" }}>
            {s.n}
          </div>
          <div className="text-[0.62rem] tracking-[0.2em] uppercase text-[rgba(245,240,232,0.6)]">{s.l}</div>
        </motion.div>
      ))}
    </div>
  );
}
