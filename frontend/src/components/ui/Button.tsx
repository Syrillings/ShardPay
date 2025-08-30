import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-2xl text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-gradient-primary text-primary-foreground shadow-soft hover:shadow-glow active:scale-95",
        hero: "bg-card border-2 border-primary/30 text-foreground shadow-soft hover:border-primary hover:shadow-glow hover:bg-card-elevated active:scale-95",
        secondary: "bg-secondary text-secondary-foreground shadow-soft hover:shadow-elevated active:scale-95",
        destructive: "bg-destructive text-destructive-foreground shadow-soft hover:opacity-90 active:scale-95",
        outline: "border-2 border-border bg-transparent text-foreground hover:bg-muted hover:border-primary active:scale-95",
        ghost: "text-foreground hover:bg-muted hover:text-foreground active:scale-95",
        glow: "bg-gradient-primary text-primary-foreground shadow-glow animate-glow active:scale-95",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-10 px-4 text-xs",
        lg: "h-14 px-8 text-base",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }