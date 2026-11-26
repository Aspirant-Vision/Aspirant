"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { TopNavBar } from "@/components/layout/top-nav-bar";
import { Footer } from "@/components/layout/footer";
import { FloatingWhatsApp } from "@/components/layout/floating-whatsapp";
import { StickyConsultationTab } from "@/components/layout/sticky-consultation-tab";
import { CounselingModalProvider } from "@/components/forms/counseling-modal-context";

interface PublicShellProps {
  children: React.ReactNode;
}

/**
 * PublicShell separates public marketing pages from dedicated authenticated portals.
 * When a user visits /admin/* or /student/*, public headers, footers, and floating
 * marketing widgets are completely omitted, giving the portals a pure, full-screen canvas.
 */
export function PublicShell({ children }: PublicShellProps) {
  const pathname = usePathname();

  const authRoutes = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
    "/accept-invite",
  ];

  const isAdminPortal = pathname?.startsWith("/admin");
  const isStudentPortal = pathname?.startsWith("/student");
  const isAuthPage = authRoutes.some(
    (route) => pathname === route || pathname?.startsWith(route + "/")
  );
  const isDedicatedPortal = isAdminPortal || isStudentPortal || isAuthPage;

  if (isDedicatedPortal) {
    return <div className="min-h-screen w-full bg-[#F8FAFC]">{children}</div>;
  }

  return (
    <CounselingModalProvider>
      <TopNavBar />
      <main className="flex-grow pt-[64px] sm:pt-[72px] overflow-x-hidden w-full">{children}</main>
      <Footer />
      <FloatingWhatsApp />
      <StickyConsultationTab />
    </CounselingModalProvider>
  );
}
