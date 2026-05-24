import { createBrowserClient } from "@supabase/ssr";
import { publicEnv } from "@/config/env";

export function createClient() {
  return createBrowserClient(
    publicEnv.supabase.url,
    publicEnv.supabase.anonKey,
  );
}
