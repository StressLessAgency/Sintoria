import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[8px] text-sm font-medium transition-all duration-[180ms] ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terra focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer border-none',
  {
    variants: {
      variant: {
        default:
          'bg-terra text-white shadow-[0_1px_3px_rgba(181,90,58,0.3)] hover:bg-terra-dark hover:shadow-[0_4px_14px_rgba(181,90,58,0.38)] hover:-translate-y-px',
        ghost:
          'bg-transparent text-charcoal-muted border border-charcoal/15 hover:bg-black/5 hover:border-charcoal/25',
        outline:
          'border border-terra/30 bg-transparent text-terra hover:bg-terra/8',
        white:
          'bg-white text-terra font-semibold shadow-[0_4px_20px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(0,0,0,0.22)]',
      },
      size: {
        default: 'h-10 px-6 py-2',
        sm: 'h-8 px-4 text-xs',
        lg: 'h-12 px-8 text-[15px] rounded-[10px]',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
