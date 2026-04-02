import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#1A1410] px-6 md:px-12 pt-16 pb-8">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr] gap-12 mb-12">
          <div>
            <div className="font-display text-[1.6rem] font-light tracking-[0.14em] uppercase text-[#EDE5D4] mb-1">
              Sintoria <span className="text-[#C8967A]">Bodywork</span>
            </div>
            <div className="text-[0.6rem] tracking-[0.18em] text-[rgba(245,240,232,0.28)] mb-4">sintoriabodywork.com</div>
            <p className="font-display italic text-[0.9rem] text-[rgba(245,240,232,0.35)] leading-[1.75] max-w-[220px] mb-6">
              Your body already knows<br/>where it belongs in space.
            </p>
            <div className="flex gap-2">
              {["ig","fb","in"].map(s => (
                <a key={s} href="#" aria-label={s}
                   className="w-8 h-8 border border-[rgba(245,240,232,0.12)] flex items-center justify-center text-[0.65rem] text-[rgba(245,240,232,0.35)] hover:border-[#C8967A] hover:text-[#C8967A] transition-all duration-300">
                  {s.toUpperCase()}
                </a>
              ))}
            </div>
          </div>

          {[
            { title:"Services", links:["The 10-Series","Structural Sessions","Postural Assessment","Movement Integration","Athletic Optimization"] },
            { title:"Practice",  links:["Philosophy","About SI","FAQ","New Clients"] },
            { title:"Visit",     links:["sintoriabodywork.com","St. Petersburg, FL","hello@sintoria.com","Mon–Sat 9am–6pm"] },
          ].map(col => (
            <nav key={col.title} aria-label={col.title}>
              <div className="text-[0.58rem] tracking-[0.24em] uppercase text-[#C8967A] mb-5">{col.title}</div>
              <ul className="flex flex-col gap-3">
                {col.links.map(l => (
                  <li key={l}>
                    <a href="#" className="text-[0.78rem] text-[rgba(245,240,232,0.38)] hover:text-[#EDE5D4] transition-colors duration-300 font-light">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="border-t border-[rgba(245,240,232,0.06)] pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
          <span className="text-[0.62rem] text-[rgba(245,240,232,0.25)] tracking-[0.08em]">© 2026 Sintoria Bodywork. All rights reserved.</span>
          <span className="text-[0.62rem] text-[rgba(245,240,232,0.2)] tracking-[0.08em]">sintoriabodywork.com</span>
        </div>
      </div>
    </footer>
  );
}
