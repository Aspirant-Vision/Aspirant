import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

// Load .env.local manually if not in process.env
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

async function verifyConnection() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  console.log("Testing Supabase connection to:", url);

  // 1. Test Anon Client
  const anonClient = createClient(url, anonKey);
  const { data: anonData, error: anonError } = await anonClient.from("colleges").select("count").limit(1);
  console.log("Anon Client Colleges Query:", anonError ? `Error: ${anonError.message} (code: ${anonError.code})` : "Success!");

  // 2. Test Admin Service Role Client
  const adminClient = createClient(url, serviceKey);
  const { data: adminData, error: adminError } = await adminClient.from("profiles").select("count").limit(1);
  console.log("Admin Client Profiles Query:", adminError ? `Error: ${adminError.message} (code: ${adminError.code})` : "Success!");

  // 3. Test Auth Endpoint
  const { data: authData, error: authError } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 1 });
  console.log("Auth Admin Endpoint:", authError ? `Error: ${authError.message}` : `Success! (${authData?.users?.length || 0} users found)`);
}

verifyConnection().catch(console.error);
