import { redirect } from "next/navigation";
import { getCurrentProfile, getCurrentUser } from "@/lib/auth/session";
import { isStaff } from "@/lib/auth/roles";

export const dynamic = "force-dynamic";

export default async function UniversalNotificationsRedirectPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?next=/notifications");
  }

  const profile = await getCurrentProfile();
  if (profile && isStaff(profile.role)) {
    redirect("/admin/notifications");
  }

  redirect("/student/notifications");
}
