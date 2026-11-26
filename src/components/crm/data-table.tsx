import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DataTablePaginationProps {
  page: number;
  pageSize: number;
  totalCount: number;
  onPageChange?: (page: number) => void;
}

export function DataTablePagination({
  page,
  pageSize,
  totalCount,
  onPageChange,
}: DataTablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const startItem = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalCount);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-3.5 border-t border-gray-200/80 bg-gray-50/50 text-xs text-gray-500">
      <div>
        Showing <span className="font-semibold text-gray-900">{startItem}</span> to{" "}
        <span className="font-semibold text-gray-900">{endItem}</span> of{" "}
        <span className="font-semibold text-gray-900">{totalCount}</span> entries
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange && onPageChange(page - 1)}
          className="h-8 px-2.5 text-xs text-gray-600 disabled:opacity-40"
        >
          <ChevronLeft className="w-3.5 h-3.5 mr-1" />
          <span>Previous</span>
        </Button>
        <span className="text-xs font-medium text-gray-700 px-2">
          Page {page} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange && onPageChange(page + 1)}
          className="h-8 px-2.5 text-xs text-gray-600 disabled:opacity-40"
        >
          <span>Next</span>
          <ChevronRight className="w-3.5 h-3.5 ml-1" />
        </Button>
      </div>
    </div>
  );
}

interface DataTableContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function DataTableContainer({ children, className }: DataTableContainerProps) {
  return (
    <div
      className={cn(
        "bg-white border border-gray-200/90 rounded-2xl shadow-xs overflow-hidden",
        className
      )}
    >
      <div className="overflow-x-auto w-full">{children}</div>
    </div>
  );
}
