"use client";
import { motion } from "framer-motion";
import { useInView } from "@/hooks/use-in-view";

const quoteWords = "True rest is not the absence of motion — it is the presence of peace.".split(" ");

export default function Philosophy() {
  const { ref, inView } = useInView(0.2);
  return (
    <section id="philosophy" className="bg-[#2C1F14] overflow-hidden" ref={ref}>
      <div className="max-w-[1200px] mx-auto grid md:grid-cols-2 min-h-[560px]">
        {/* Left — quote */}
        <div className="px-10 md:px-16 py-20 flex flex-col justify-center">
          <motion.div
            initial={{ scaleX:0 }} animate={inView ? { scaleX:1 } : {}}
            transition={{ duration:0.8, ease:[0.16,1,0.3,1] }}
            className="w-8 h-px bg-[rgba(200,150,122,0.5)] mb-10 origin-left"
          />
          <blockquote>
            <div className="font-display font-light leading-[1.5]"
                 style={{ fontSize:"clamp(1.4rem,2.5vw,2.1rem)", color:"#EDE5D4" }}>
              {quoteWords.map((word, i) => (
                <motion.span
                  key={i}
                  className="inline-block mr-[0.22em]"
                  initial={{ opacity:0, filter:"blur(4px)" }}
                  animate={inView ? { opacity:1, filter:"blur(0px)" } : {}}
                  transition={{ delay:0.2 + i * 0.06, duration:0.6 }}
                >
                  {word}
                </motion.span>
              ))}
            </div>
          </blockquote>
          <motion.p
            initial={{ opacity:0, y:16 }} animate={inView ? { opacity:1, y:0 } : {}}
            transition={{ delay:1.2, duration:0.8 }}
            className="text-[0.85rem] leading-[2] text-[rgba(237,229,212,0.45)] font-light mt-8 max-w-[440px]"
          >
            Sintoria — a word built on <em className="italic text-[rgba(200,150,122,0.7)]">sintonia</em>, the
            Portuguese for attunement. We believe every body carries its own wisdom.
            Our role is to listen, and respond.
          </motion.p>
          <motion.div
            initial={{ opacity:0 }} animate={inView ? { opacity:1 } : {}}
            transition={{ delay:1.5, duration:0.6 }}
            className="flex items-center gap-3 mt-8 text-[0.62rem] tracking-[0.2em] uppercase text-[rgba(200,150,122,0.5)]"
          >
            <span className="w-5 h-px bg-[rgba(200,150,122,0.4)]" />
            Sintoria Bodywork · St. Petersburg
          </motion.div>
        </div>

        {/* Right — visual panel */}
        <div className="relative flex items-center justify-center bg-[#221610] overflow-hidden">
          <div className="absolute inset-0"
               style={{ background:"radial-gradient(ellipse at 50% 50%, rgba(200,150,122,0.08) 0%, transparent 70%)" }} />
          <span className="font-display italic select-none pointer-events-none absolute"
                style={{ fontSize:"clamp(10rem,16vw,20rem)", color:"rgba(200,150,122,0.04)", lineHeight:1 }}>
            S
          </span>
          <motion.div
            animate={{ rotate:360 }}
            transition={{ repeat:Infinity, duration:50, ease:"linear" }}
            className="absolute w-72 h-72 rounded-full border border-[rgba(200,150,122,0.08)]"
          />
          <motion.div
            initial={{ opacity:0, scale:0.9 }} animate={inView ? { opacity:1, scale:1 } : {}}
            transition={{ delay:0.4, duration:1 }}
            className="relative z-10 text-center px-10"
          >
            <div className="font-display italic text-[rgba(200,150,122,0.35)]"
                 style={{ fontSize:"clamp(1rem,2vw,1.3rem)" }}>
              Licensed · Certified · Intentional
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
