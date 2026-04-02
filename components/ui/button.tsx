import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import React from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center font-body text-xs tracking-[0.18em] uppercase transition-all duration-300 cursor-pointer border-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terra",
  {
    variants: {
      variant: {
        primary:   "bg-[#A0522D] text-[#F5F0E8] px-8 py-3.5 hover:bg-[#7A3A1A] hover:-translate-y-0.5",
        secondary: "border border-[rgba(160,82,45,0.35)] text-[#7A6A5A] px-8 py-3.5 hover:border-[#A0522D] hover:text-[#A0522D]",
        ghost:     "text-[#7A6A5A] hover:text-[#A0522D] px-0 gap-2",
        gradient:  "btn-gradient-animate text-[#F5F0E8] px-8 py-3.5 hover:-translate-y-0.5",
      },
    },
    defaultVariants: { variant: "primary" },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, asChild, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp ref={ref} className={cn(buttonVariants({ variant }), className)} {...props} />;
  }
);
Button.displayName = "Button";
