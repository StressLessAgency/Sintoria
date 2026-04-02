"use client";
import { motion } from "framer-motion";
import { useInView } from "@/hooks/use-in-view";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Booking() {
  const { ref, inView } = useInView();
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <section id="reserve" className="bg-[#3D4A30] grid md:grid-cols-2">
      {/* Left CTA */}
      <div ref={ref} className="px-10 md:px-16 py-20 flex flex-col justify-center">
        <motion.div initial={{ opacity:0, y:24 }} animate={inView ? { opacity:1, y:0 } : {}} transition={{ duration:0.8 }}>
          <div className="flex items-center gap-3 mb-6">
            <span className="w-6 h-px bg-[rgba(138,152,120,0.7)]" />
            <span className="text-[0.6rem] tracking-[0.28em] uppercase text-[rgba(138,152,120,0.85)]">Schedule Your Assessment</span>
          </div>

          {/* 21st.dev-style animated badge */}
          <div className="inline-flex items-center gap-2 bg-[rgba(200,150,122,0.15)] border border-[rgba(200,150,122,0.25)] px-4 py-1.5 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C8967A] animate-pulse" />
            <span className="text-[0.62rem] tracking-[0.16em] uppercase text-[#C8967A]">Complimentary assessment · New clients</span>
          </div>

          <h2 className="font-display font-light text-[#F5F0E8] leading-[1.1] mb-6"
              style={{ fontSize:"clamp(2.5rem,4vw,4rem)" }}>
            Let's Assess Your <em className="italic text-[rgba(237,229,212,0.7)]">Structure</em>
          </h2>
          <p className="text-[0.85rem] leading-[2] text-[rgba(237,229,212,0.45)] font-light mb-8 max-w-[360px]">
            Every body tells a different story. Your first session begins with a structural assessment — so we build a plan around what your body actually needs.
          </p>
          <ul className="flex flex-col gap-3">
            {["Complimentary postural assessment","Certified structural integration practitioner","Customized session-by-session progression","Private, dedicated treatment room","Free cancellation up to 24h prior"].map(perk => (
              <li key={perk} className="flex items-start gap-3 text-[0.8rem] text-[rgba(237,229,212,0.55)] font-light">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8A9878] flex-shrink-0 mt-1.5" />
                {perk}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* Right form */}
      <motion.div
        initial={{ opacity:0, x:24 }} animate={inView ? { opacity:1, x:0 } : {}}
        transition={{ delay:0.15, duration:0.8 }}
        className="bg-[#EDE5D4] px-10 md:px-16 py-20 flex flex-col justify-center"
      >
        {submitted ? (
          <motion.div initial={{ opacity:0, scale:0.96 }} animate={{ opacity:1, scale:1 }} className="text-center">
            <div className="font-display italic text-[2.2rem] text-[#A0522D] mb-4">We'll be in touch.</div>
            <div className="text-[0.85rem] text-[#7A6A5A]">Your reservation request has been received.<br/>Expect a confirmation within 2 hours.</div>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-0" aria-label="Booking form">
            {[
              { id:"name",  label:"Full Name",       type:"text",  auto:"name" },
              { id:"email", label:"Email Address",   type:"email", auto:"email" },
              { id:"phone", label:"Phone (optional)",type:"tel",   auto:"tel" },
            ].map(f => (
              <div key={f.id} className="relative border-b border-[rgba(160,82,45,0.18)] first:border-t focus-within:border-[#A0522D] transition-colors group">
                <input id={f.id} type={f.type} autoComplete={f.auto} placeholder=" " required={f.id !== "phone"}
                       className="peer w-full bg-transparent border-none outline-none px-3 pt-6 pb-2 text-[0.88rem] text-[#2C1F14] font-light" />
                <label htmlFor={f.id}
                       className="absolute left-3 top-4 text-[0.65rem] tracking-[0.12em] uppercase text-[#A89880] pointer-events-none transition-all peer-focus:-translate-y-2 peer-focus:scale-[0.85] peer-focus:text-[#A0522D] peer-[:not(:placeholder-shown)]:-translate-y-2 peer-[:not(:placeholder-shown)]:scale-[0.85] origin-left">
                  {f.label}
                </label>
              </div>
            ))}

            {/* Service select */}
            <div className="relative border-b border-[rgba(160,82,45,0.18)] focus-within:border-[#A0522D] transition-colors">
              <select required defaultValue=""
                      className="w-full bg-transparent border-none outline-none px-3 pt-6 pb-2 text-[0.88rem] text-[#2C1F14] font-light cursor-pointer appearance-none">
                <option value="" disabled />
                {["The 10-Series — $1,650","Structural Single Session — $185","Postural Assessment — $95","Movement Integration — $145","Post-Surgical Recovery — $165","Athletic Optimization — $185"].map(s => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              <label className="absolute left-3 top-4 text-[0.65rem] tracking-[0.12em] uppercase text-[#A89880] pointer-events-none">
                Select Service
              </label>
            </div>

            <Button variant="primary" type="submit" className="mt-6 w-full">
              Book Your Session
            </Button>
            <p className="text-[0.65rem] text-[#A89880] text-center mt-3 leading-relaxed">
              sintoriabodywork.com · St. Petersburg, FL<br/>Mon–Sat 9am–6pm · By appointment only
            </p>
          </form>
        )}
      </motion.div>
    </section>
  );
}
