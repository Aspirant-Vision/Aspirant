import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  breadcrumbs?: BreadcrumbItem[];
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  breadcrumbs,
  title,
  description,
  children,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("space-y-2 pb-6 border-b border-gray-200/80 mb-6", className)}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
          <Link href="/admin/dashboard" className="hover:text-gray-900 transition-colors">
            Admin
          </Link>
          {breadcrumbs.map((item, idx) => (
            <React.Fragment key={idx}>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              {item.href ? (
                <Link href={item.href} className="hover:text-gray-900 transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span className="font-semibold text-gray-900">{item.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      {/* Main Title & Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-xs sm:text-sm text-gray-500 max-w-3xl leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {children && (
          <div className="flex items-center gap-2.5 shrink-0">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
