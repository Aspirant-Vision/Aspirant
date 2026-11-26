import React from "react";
import { getCurrentProfile, requireAuth } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/student/profile-form";
import { ShieldCheck, UserCheck } from "lucide-react";

export default async function StudentProfilePage() {
  const user = await requireAuth();
  const profile = await getCurrentProfile();
  const supabase = await createClient();

  // Fetch full student profile with Phase 8 extended columns
  const { data: dbProfile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const initialData = {
    fullName: dbProfile?.full_name || profile?.fullName || "",
    phone: dbProfile?.phone || profile?.phone || "",
    alternatePhone: (dbProfile as any)?.alternate_phone || "",
    dateOfBirth: (dbProfile as any)?.date_of_birth || "",
    gender: (dbProfile as any)?.gender || null,
    city: dbProfile?.city || profile?.city || "",
    state: dbProfile?.state || profile?.state || "",
    country: (dbProfile as any)?.country || "India",
    pinCode: (dbProfile as any)?.pin_code || "",
    avatarUrl: dbProfile?.avatar_url || profile?.avatarUrl || "",
    email: user.email || "",
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Personal Profile</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Manage your personal details, contact coordinates, and location info used for college admissions.
        </p>
      </div>

      {/* Main Profile Form Card */}
      <ProfileForm initialData={initialData} />
    </div>
  );
}
