"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, Loader2, Building2, BookOpen, Inbox, Users, ArrowRight, X } from "lucide-react";
import { searchGlobalAction, SearchResultItem } from "@/lib/crm/search";

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Global hotkey: Cmd+K / Ctrl+K focuses the search input
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      const res = await searchGlobalAction(trimmed);
      if (res.success) {
        setResults(res.data);
      }
      setIsLoading(false);
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const categoryIcons = {
    Colleges: Building2,
    Courses: BookOpen,
    Leads: Inbox,
    Students: Users,
    Applications: ArrowRight,
  };

  return (
    <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md" ref={containerRef}>
      {/* Search Input Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search colleges, courses, leads, students..."
          className="w-full pl-9 pr-16 py-1.5 sm:py-2 text-xs bg-gray-100/80 hover:bg-gray-100 focus:bg-white border border-gray-200/80 focus:border-red-500 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
        />

        {/* Clear or Keyboard Shortcut badge */}
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {query ? (
            <button
              onClick={() => {
                setQuery("");
                setResults([]);
              }}
              className="text-gray-400 hover:text-gray-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-semibold text-gray-400 bg-white border border-gray-200 rounded shadow-2xs">
              <span>⌘</span>K
            </kbd>
          )}
        </div>
      </div>

      {/* Results Popover */}
      {isOpen && query.trim().length >= 2 && (
        <div className="absolute left-0 right-0 mt-2 rounded-2xl bg-white border border-gray-200 shadow-xl py-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-100 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-6 text-center text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin mx-auto text-primary" />
              <p className="mt-2 text-xs">Searching database...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="p-6 text-center text-gray-400">
              <p className="text-xs font-semibold text-gray-700">No records found</p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                No matching colleges, courses, leads, or students found for &quot;{query}&quot;.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {results.map((item) => {
                const Icon = categoryIcons[item.category] || ArrowRight;
                return (
                  <Link
                    key={`${item.category}-${item.id}`}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-gray-100 text-gray-600 group-hover:bg-red-50 group-hover:text-primary flex items-center justify-center shrink-0 transition-colors">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-900 truncate">
                          {item.title}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 truncate mt-0.5">
                        {item.subtitle}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
