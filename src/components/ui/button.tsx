import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "accent" | "outline" | "ghost" | "whatsapp";
  size?: "sm" | "md" | "lg" | "xl";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-semibold transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

    const variants = {
      primary:
        "bg-primary text-white hover:bg-primary-light shadow-sm focus:ring-primary",
      secondary:
        "border border-primary text-primary bg-transparent hover:bg-surface-container focus:ring-primary",
      accent:
        "bg-secondary text-primary hover:bg-secondary-light font-bold shadow-sm focus:ring-secondary",
      outline:
        "border border-outline-variant text-primary bg-white hover:bg-surface-container focus:ring-outline",
      ghost:
        "bg-transparent text-primary hover:bg-surface-container/60 focus:ring-primary",
      whatsapp:
        "bg-[#25D366] text-white hover:bg-[#20ba59] shadow-md focus:ring-[#25D366]",
    };

    const sizes = {
      sm: "text-xs px-3.5 py-1.5 rounded-lg gap-1.5",
      md: "text-sm px-5 py-2.5 rounded-xl gap-2",
      lg: "text-base px-6 py-3.5 rounded-xl gap-2.5",
      xl: "text-lg px-8 py-4 rounded-2xl gap-3 font-bold",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
