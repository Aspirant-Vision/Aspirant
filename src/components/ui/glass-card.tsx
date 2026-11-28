import * as React from "react";
import { cn } from "@/lib/utils";

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverLift?: boolean;
}

export function GlassCard({
  className,
  hoverLift = false,
  children,
  ...props
}: GlassCardProps) {
  return (
    <div
      className={cn(
        "glass-card rounded-2xl shadow-card transition-colors duration-200",
        hoverLift && "hover:border-red-200/80",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
