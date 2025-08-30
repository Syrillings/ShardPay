import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const inputVariants = cva(
  "flex w-full rounded-xl border bg-input px-4 py-3 text-sm transition-all duration-300 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-border focus-visible:border-primary hover:border-primary/50",
        glow: "border-primary/50 shadow-glow focus-visible:shadow-glow",
        error: "border-destructive focus-visible:border-destructive",
        success: "border-success focus-visible:border-success",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface MyInputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {}

const MyInput = React.forwardRef<HTMLInputElement, MyInputProps>(
  ({ className, variant, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ variant, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
MyInput.displayName = "MyInput"

export { MyInput, inputVariants }