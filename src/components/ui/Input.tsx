import React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && <label className="text-sm font-semibold text-foreground tracking-tight">{label}</label>}
        <input
          type={type}
          className={cn(
            "flex h-11 w-full rounded-xl border border-border bg-card px-4 py-2 text-sm text-foreground ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all",
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
export default Input
