import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-700 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        primary:
          "bg-gold-500 text-navy-950 hover:bg-gold-400 shadow-[0_8px_20px_-10px_rgba(7,21,37,0.45)] hover:shadow-[0_12px_28px_-10px_rgba(7,21,37,0.5)] hover:-translate-y-0.5",
        secondary:
          "bg-navy-900 text-white hover:bg-navy-800 hover:-translate-y-0.5",
        outline:
          "border border-white/30 text-white hover:bg-white/10 hover:-translate-y-0.5",
        outlineNavy:
          "border border-navy-900/20 text-navy-900 hover:bg-navy-900/5",
        ghost: "text-navy-900 hover:bg-navy-900/5",
        link: "text-gold-600 underline-offset-4 hover:underline p-0 h-auto rounded-none",
      },
      size: {
        default: "h-12 px-6",
        sm: "h-10 px-4 text-sm",
        lg: "h-14 px-8 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
