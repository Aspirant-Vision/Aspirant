import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "match" | "success" | "primary" | "secondary" | "neutral" | "outline";
}

export function Badge({
  className,
  variant = "match",
  children,
  ...props
}: BadgeProps) {
  const variants = {
    match:
      "bg-secondary-container text-on-secondary-container font-extrabold text-[11px] tracking-wider uppercase px-3 py-1 rounded-full shadow-sm",
    success:
      "bg-emerald-100 text-emerald-800 font-bold text-xs px-2.5 py-0.5 rounded-full",
    primary:
      "bg-primary text-white font-bold text-xs px-3 py-1 rounded-full uppercase tracking-widest",
    secondary:
      "bg-secondary-fixed text-on-secondary-fixed font-semibold text-xs px-3 py-1 rounded-full",
    neutral:
      "bg-surface-container text-on-surface-variant font-medium text-xs px-2.5 py-1 rounded-lg",
    outline:
      "border border-white/20 text-white font-medium text-xs px-3 py-1 rounded-lg",
  };

  return (
    <span
      className={cn("inline-flex items-center gap-1", variants[variant], className)}
      {...props}
    >
      {children}
    </span>
  );
}
