import { cn } from "@/lib/utils";
import { type SelectHTMLAttributes, forwardRef } from "react";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          "h-11 w-full rounded-md border bg-surface px-3.5 text-sm text-ink transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary",
          error ? "border-danger" : "border-line",
          className
        )}
        {...props}
      >
        {children}
      </select>
    );
  }
);
Select.displayName = "Select";

export { Select };
