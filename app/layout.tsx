import type { Metadata } from 'next'
import { Cormorant_Garamond } from 'next/font/google'
import './globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Sintonia Bodywork — Therapeutic Bodywork',
  description:
    'Sintonia — attunement in Portuguese — is the art of coming back into harmony with yourself. Every session is crafted to bring you back to yourself through skilled hands and intentional space.',
  openGraph: {
    title: 'Sintonia Bodywork — Therapeutic Bodywork',
    description: 'Skilled hands. Intentional space. The kind of quiet only the body can offer the mind.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cormorant.variable} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
