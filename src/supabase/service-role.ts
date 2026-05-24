import { createClient } from "@supabase/supabase-js";
import { publicEnv, getServerEnv } from "@/config/env";

export function createServiceRoleClient() {
  const serverEnv = getServerEnv();

  return createClient(
    publicEnv.supabase.url,
    serverEnv.supabase.serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
