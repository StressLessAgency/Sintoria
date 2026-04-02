"use client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const words = ["Where", "the", "Body", "Finds", "Its", "Center."];

export default function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center overflow-hidden bg-[#F5F0E8]"
      aria-labelledby="hero-heading"
    >
      {/* Grain texture overlay */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.025]"
           style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")", backgroundSize: "256px" }} />

      {/* Radial glow */}
      <div className="pointer-events-none absolute right-0 top-0 w-1/2 h-full"
           style={{ background: "radial-gradient(ellipse 70% 60% at 80% 40%, rgba(200,150,122,0.13) 0%, transparent 70%)" }} />

      <div className="max-w-[1200px] mx-auto w-full px-6 md:px-12 grid md:grid-cols-2 gap-16 pt-32 pb-20 items-center">

        {/* Left — typography hero */}
        <div>
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.7 }}
            className="flex items-center gap-3 mb-8"
          >
            <span className="w-8 h-px bg-[#A0522D]" />
            <span className="text-[0.62rem] tracking-[0.3em] uppercase text-[#A0522D] font-light">
              St. Petersburg, FL · Est. 2019
            </span>
          </motion.div>

          {/* Word-by-word stagger heading — 21st.dev style */}
          <h1 id="hero-heading"
              className="font-display font-light leading-[1.05] text-[#2C1F14] mb-8"
              style={{ fontSize: "clamp(3.2rem,6.5vw,6.5rem)" }}>
            {words.map((word, i) => (
              <motion.span
                key={i}
                className={`inline-block mr-[0.2em] ${i === 4 ? "italic text-[#A0522D]" : ""}`}
                initial={{ opacity: 0, y: 40, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              >
                {word}
              </motion.span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.7 }}
            className="text-[0.93rem] leading-[1.95] text-[#7A6A5A] font-light max-w-[400px] mb-10"
          >
            Therapeutic bodywork crafted around your body's unique language.
            Each session is a conversation between skilled hands and the wisdom your body already holds.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.15, duration: 0.7 }}
            className="flex flex-wrap items-center gap-5"
          >
            <Button variant="gradient" asChild>
              <a href="#reserve">Book a Session</a>
            </Button>
            <Button variant="ghost" asChild>
              <a href="#treatments" className="flex items-center gap-2">
                View Treatments
                <motion.span
                  animate={{ x: [0, 4, 0] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                >
                  <ArrowRight size={14} />
                </motion.span>
              </a>
            </Button>
          </motion.div>

          {/* Stats strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.8 }}
            className="flex gap-8 mt-14 pt-8 border-t border-[rgba(160,82,45,0.12)]"
          >
            {[["500+","Sessions"], ["4.98","Rating"], ["6 yrs","Experience"]].map(([n, l]) => (
              <div key={l}>
                <div className="font-display text-2xl font-light text-[#A0522D]">{n}</div>
                <div className="text-[0.62rem] tracking-[0.16em] uppercase text-[#A89880] mt-0.5">{l}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right — editorial visual panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="hidden md:flex relative items-center justify-center h-[600px]"
        >
          {/* Background panel */}
          <div className="absolute inset-0 bg-[#EDE5D4] rounded-sm"
               style={{ background: "radial-gradient(ellipse at 40% 55%, rgba(200,150,122,0.18) 0%, #EDE5D4 60%)" }} />

          {/* Large italic ghost letter */}
          <span className="absolute font-display italic select-none pointer-events-none"
                style={{ fontSize: "clamp(14rem,22vw,26rem)", color: "rgba(160,82,45,0.06)", lineHeight: 1, top: "50%", left: "50%", transform: "translate(-50%,-50%)" }}>
            S
          </span>

          {/* Floating pill — 21st.dev floating card pattern */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
            className="relative z-10 bg-[rgba(245,240,232,0.95)] border border-[rgba(160,82,45,0.18)] px-5 py-4 shadow-lg backdrop-blur-sm"
          >
            <div className="text-[#A0522D] text-sm mb-1">★★★★★</div>
            <div className="font-display italic text-[#2C1F14] text-lg leading-snug">
              "Utterly transformative."
            </div>
            <div className="text-[0.62rem] tracking-[0.14em] uppercase text-[#A89880] mt-1.5">
              Sarah M. · Regular client
            </div>
          </motion.div>

          {/* Orbiting ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
            className="absolute w-64 h-64 rounded-full border border-[rgba(160,82,45,0.15)]"
          />
          <div className="absolute w-52 h-52 rounded-full border border-[rgba(160,82,45,0.08)]" />
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        aria-hidden="true"
      >
        <div className="w-px h-10 bg-[rgba(160,82,45,0.2)] overflow-hidden relative">
          <motion.div
            className="absolute inset-0 bg-[#A0522D]"
            animate={{ y: ["-100%", "100%"] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
          />
        </div>
        <span className="text-[0.58rem] tracking-[0.2em] uppercase text-[#A89880]">Scroll</span>
      </motion.div>
    </section>
  );
}
