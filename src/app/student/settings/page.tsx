import React from "react";
import { requireAuth, getCurrentProfile } from "@/lib/auth/session";
import { SettingsClientView } from "@/components/student/settings-client-view";

export default async function StudentSettingsPage() {
  const user = await requireAuth();
  const profile = await getCurrentProfile();

  return (
    <SettingsClientView
      email={user.email || ""}
      fullName={profile?.fullName || "Student"}
      emailConfirmed={Boolean(user.isVerified)}
    />
  );
}
