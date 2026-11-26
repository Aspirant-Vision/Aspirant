import React from "react";
import { redirect } from "next/navigation";
import { requireAuth, getCurrentProfile } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { StudentShell } from "@/components/student/student-shell";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth("/login");
  const profile = await getCurrentProfile();

  if (profile?.accountStatus === "suspended") {
    redirect("/login?error=Your+account+has+been+suspended.+Please+contact+support.");
  }

  // Count unread notifications
  const supabase = await createClient();
  const { count } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("recipient_id", user.id)
    .eq("is_read", false);

  const displayName = profile?.fullName || user.email?.split("@")[0] || "Student";
  const userEmail = user.email || "";
  const avatarUrl = profile?.avatarUrl || null;

  return (
    <StudentShell
      userId={user.id}
      displayName={displayName}
      userEmail={userEmail}
      avatarUrl={avatarUrl}
      unreadCount={count || 0}
    >
      {children}
    </StudentShell>
  );
}
