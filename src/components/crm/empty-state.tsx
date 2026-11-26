import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "py-10 sm:py-12 px-4 text-center flex flex-col items-center justify-center space-y-3",
        className
      )}
    >
      <div className="w-11 h-11 rounded-2xl bg-slate-50 border border-slate-200/80 text-slate-400 flex items-center justify-center shadow-xs">
        <Icon className="w-5 h-5 stroke-[1.75]" />
      </div>

      <div className="max-w-sm space-y-1">
        <h3 className="text-sm font-bold text-slate-800 tracking-tight">
          {title}
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          {description}
        </p>
      </div>

      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}
