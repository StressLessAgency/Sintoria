"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const links = ["Treatments", "Philosophy", "Stories", "Reserve"];

// Sintoria SVG logo mark — geometric leaf/spine mark
function SintoriaLogo() {
  return (
    <svg aria-label="Sintoria Bodywork" viewBox="0 0 120 36" fill="none"
         className="h-7 w-auto" xmlns="http://www.w3.org/2000/svg">
      {/* Leaf / spine mark */}
      <path d="M8 18 C8 10 14 4 20 4 C14 4 8 10 8 18 C8 26 14 32 20 32 C14 32 8 26 8 18Z"
            stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.7"/>
      <path d="M20 4 C26 4 32 10 32 18 C32 26 26 32 20 32"
            stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.4"/>
      <line x1="20" y1="4" x2="20" y2="32" stroke="currentColor" strokeWidth="0.6" opacity="0.5"/>
      {/* Wordmark */}
      <text x="40" y="21" fontFamily="'Cormorant Garamond', serif" fontSize="14"
            fontWeight="400" letterSpacing="2.5" fill="currentColor">SINTORIA</text>
      <text x="40" y="30" fontFamily="'Jost', sans-serif" fontSize="6.5"
            fontWeight="300" letterSpacing="3.5" fill="currentColor" opacity="0.55">BODYWORK</text>
    </svg>
  );
}

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handle = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handle, { passive: true });
    return () => window.removeEventListener("scroll", handle);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 transition-all duration-500 ${
          scrolled
            ? "py-4 bg-[rgba(245,240,232,0.94)] backdrop-blur-xl border-b border-[rgba(160,82,45,0.1)]"
            : "py-7 bg-transparent"
        }`}
      >
        <Link href="/" aria-label="Sintoria Bodywork home">
          <SintoriaLogo />
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-10 list-none">
          {links.slice(0, 3).map((l) => (
            <li key={l}>
              <a href={`#${l.toLowerCase()}`}
                 className="text-[0.67rem] tracking-[0.2em] uppercase text-[#7A6A5A] hover:text-[#A0522D] transition-colors duration-300">
                {l}
              </a>
            </li>
          ))}
          <li>
            <a href="#reserve"
               className="text-[0.67rem] tracking-[0.18em] uppercase bg-[#A0522D] text-[#F5F0E8] px-6 py-2.5 hover:bg-[#7A3A1A] transition-colors duration-300">
              Reserve
            </a>
          </li>
        </ul>

        {/* Mobile burger */}
        <button
          className="md:hidden text-[#2C1F14] p-1"
          aria-label="Toggle menu"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </motion.nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-[#F5F0E8] flex flex-col items-center justify-center gap-10 md:hidden"
          >
            {links.map((l, i) => (
              <motion.a
                key={l}
                href={`#${l.toLowerCase()}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                onClick={() => setOpen(false)}
                className="font-display text-3xl font-light text-[#2C1F14] hover:text-[#A0522D] transition-colors"
              >
                {l}
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
