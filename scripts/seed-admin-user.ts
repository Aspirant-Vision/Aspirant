import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

// Load .env.local manually
const envPath = path.resolve(__dirname, "../.env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const idx = trimmed.indexOf("=");
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim();
        process.env[key] = val;
      }
    }
  }
}

async function seedAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  const adminClient = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const adminEmail = "admin@aspirantvision.com";
  const adminPassword = "AdminPassword@2026";

  console.log(`Checking if ${adminEmail} already exists...`);
  const { data: usersData } = await adminClient.auth.admin.listUsers();
  const existingUser = usersData?.users?.find((u) => u.email === adminEmail);

  let userId: string;

  if (existingUser) {
    console.log(`User ${adminEmail} already exists. Updating password...`);
    userId = existingUser.id;
    await adminClient.auth.admin.updateUserById(userId, {
      password: adminPassword,
      email_confirm: true,
      user_metadata: { full_name: "Super Admin", role: "super_admin" },
    });
  } else {
    console.log(`Creating new Admin user ${adminEmail}...`);
    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: { full_name: "Super Admin", role: "super_admin" },
    });

    if (createError || !newUser?.user) {
      console.error("Failed to create admin auth user:", createError);
      process.exit(1);
    }
    userId = newUser.user.id;
  }

  console.log(`Ensuring Super Admin role in public.profiles and public.user_roles for user ID: ${userId}...`);

  // Ensure in public.profiles
  const { error: profileError } = await adminClient
    .from("profiles")
    .upsert({
      id: userId,
      email: adminEmail,
      full_name: "Super Admin",
      role: "super_admin",
      account_status: "active",
      is_verified: true,
      updated_at: new Date().toISOString(),
    });

  if (profileError) {
    console.error("Profile upsert error:", profileError);
  } else {
    console.log("Profile updated to super_admin successfully.");
  }

  // Ensure in public.user_roles
  const { error: roleError } = await adminClient
    .from("user_roles")
    .upsert(
      {
        user_id: userId,
        role: "super_admin",
      },
      { onConflict: "user_id,role" }
    );

  if (roleError) {
    console.error("User roles upsert error:", roleError);
  } else {
    console.log("User role super_admin assigned successfully.");
  }

  console.log("\n========================================================");
  console.log("SUPER ADMIN CREDENTIALS GENERATED SUCCESSFULLY:");
  console.log("========================================================");
  console.log(`Portal URL: http://localhost:3000/admin/login`);
  console.log(`Email:      ${adminEmail}`);
  console.log(`Password:   ${adminPassword}`);
  console.log("Role:       super_admin");
  console.log("========================================================\n");
}

seedAdmin().catch(console.error);
