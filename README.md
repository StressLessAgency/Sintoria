# Sintonia Bodywork

A luxury therapeutic bodywork landing page built with **Next.js 14**, **Framer Motion**, **shadcn/ui**, and **Tailwind CSS**.

> "Sintonia" means *attunement* in Portuguese — the art of coming back into harmony with yourself.

## Tech Stack

- **Next.js 14** (App Router, TypeScript)
- **Framer Motion 11** — scroll-triggered reveals, blur stagger, spring physics
- **shadcn/ui** — Card, Button, Badge, Separator components
- **Tailwind CSS 3** — custom terracotta palette, fluid type scale
- **Cormorant Garamond** (display) + **Satoshi** (body)
- **21st.dev** component patterns — animated gradient CTA, blur-reveal hero

## Project Structure

```
sintonia-bodywork/
├── app/
│   ├── layout.tsx        # Root layout, fonts, metadata
│   ├── page.tsx          # Home page (imports all sections)
│   └── globals.css       # Design tokens, base styles, component classes
├── components/
│   ├── ui/               # shadcn-style components (Badge, Button, Card, Separator)
│   ├── logo.tsx          # Custom inline SVG logo (S letterform in circle)
│   ├── nav.tsx           # Sticky nav with dark mode toggle + mobile menu
│   ├── hero.tsx          # Full-screen hero with blur-stagger animations
│   ├── treatments.tsx    # 6-service grid with scroll-triggered stagger
│   ├── philosophy.tsx    # Dark quote section with animated line reveals
│   ├── stats.tsx         # 4-stat bar with scroll-reveal counters
│   ├── testimonials.tsx  # 3-card staggered testimonials
│   ├── new-client.tsx    # Terracotta CTA with 20% off offer
│   └── footer.tsx        # Minimal dark footer
├── lib/
│   └── utils.ts          # cn() utility (clsx + tailwind-merge)
├── tailwind.config.ts
├── package.json
└── README.md
```

## Quick Start

```bash
npm install
npm run dev
# → http://localhost:3000
```

## Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit — Sintonia Bodywork"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/sintonia-bodywork.git
git push -u origin main
```

## Deploy to Vercel

```bash
# Connect GitHub repo at vercel.com/new — zero config, auto-detects Next.js
```

## Customization

| What | Where |
|------|-------|
| Brand name / copy | `components/hero.tsx`, `components/nav.tsx`, `components/footer.tsx` |
| Colors | `tailwind.config.ts` + `app/globals.css` `:root` |
| Fonts | `app/layout.tsx` (next/font) + `globals.css` |
| Services content | `components/treatments.tsx` → `SERVICES` array |
| Testimonials | `components/testimonials.tsx` → `TESTIMONIALS` array |
| Stats | `components/stats.tsx` → `STATS` array |
