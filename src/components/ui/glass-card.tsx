import * as React from "react";
import { cn } from "@/lib/utils";

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverLift?: boolean;
}

export function GlassCard({
  className,
  hoverLift = true,
  children,
  ...props
}: GlassCardProps) {
  return (
    <div
      className={cn(
        "glass-card rounded-2xl shadow-card transition-all duration-300",
        hoverLift && "hover:-translate-y-1 hover:shadow-card-hover",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
