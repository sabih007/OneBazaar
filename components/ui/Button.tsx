import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-primary text-ink shadow-[var(--shadow-card)] hover:bg-primary-hover hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)] active:translate-y-0 active:shadow-[var(--shadow-card)]",
  secondary:
    "bg-surface text-ink border border-line hover:border-primary/40 hover:bg-primary-light hover:text-primary-text hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)] active:translate-y-0 active:shadow-none",
  ghost: "bg-transparent text-ink hover:bg-primary-light hover:text-primary-text",
  danger:
    "bg-danger text-white shadow-[var(--shadow-card)] hover:bg-danger/90 hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)] active:translate-y-0 active:shadow-[var(--shadow-card)]",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-md font-body font-medium transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none disabled:translate-y-0 disabled:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
