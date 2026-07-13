import { cn } from "@/lib/utils";
import { type InputHTMLAttributes, forwardRef } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "h-11 w-full rounded-md border bg-surface px-3.5 text-sm text-ink placeholder:text-ink-muted transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary",
          error ? "border-danger" : "border-line",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
