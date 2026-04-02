"use client";
const items = ["Structural Integration","10-Series Protocol","Fascial Release","Postural Assessment","Movement Education","Scar Tissue Work","Athletic Optimization"];

export default function MarqueeBand() {
  const doubled = [...items, ...items];
  return (
    <div className="bg-[#3D4A30] overflow-hidden py-4 border-y border-[rgba(255,255,255,0.07)]" aria-hidden="true">
      <div className="flex w-max animate-marquee">
        {doubled.map((item, i) => (
          <span key={i} className="flex items-center gap-4 px-6">
            <span className="text-[0.6rem] tracking-[0.28em] uppercase text-[rgba(245,240,232,0.55)] font-light whitespace-nowrap">
              {item}
            </span>
            <span className="w-1 h-1 rounded-full bg-[rgba(200,150,122,0.5)]" />
          </span>
        ))}
      </div>
    </div>
  );
}
