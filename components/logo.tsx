import { cn } from '@/lib/utils'

interface LogoProps {
  size?: number
  className?: string
}

export function Logo({ size = 30, className }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      aria-label="Sintonia Bodywork"
      className={cn(className)}
    >
      {/* Outer circle */}
      <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="1.2" />
      {/* S letterform — two arcs forming an S */}
      <path
        d="M25 14.5 C25 14.5 23 12.5 20 12.5 C17 12.5 15 14.2 15 16.5 C15 18.8 17 19.8 20 20.5 C23 21.2 25 22.4 25 24.5 C25 26.6 23 27.5 20 27.5 C17 27.5 15 25.5 15 25.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
