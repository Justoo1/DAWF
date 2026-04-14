import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, leftIcon, rightIcon, onClick, ...props }, ref) => {
    const handleClick = (e: React.MouseEvent<HTMLInputElement>) => {
      // For date/month inputs, clicking anywhere (even text area) should trigger the picker
      if (
        ["date", "month", "time", "datetime-local"].includes(type || "") &&
        "showPicker" in e.currentTarget
      ) {
        try {
          const input = e.currentTarget as HTMLInputElement & {
            showPicker?: () => void
          }
          input.showPicker?.()
        } catch {
          // Silent catch for unsupported browsers or states
        }
      }
      onClick?.(e)
    }

    const inputElement = (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          leftIcon && "pl-12",
          rightIcon && "pr-10",
          className
        )}
        ref={ref}
        onClick={handleClick}
        {...props}
      />
    )

    if (!leftIcon && !rightIcon) {
      return inputElement
    }

    return (
      <div className="relative w-full">
        {leftIcon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
            {leftIcon}
          </div>
        )}
        {inputElement}
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
            {rightIcon}
          </div>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
