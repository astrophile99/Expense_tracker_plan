import { createClient } from "@supabase/supabase-js"
import { env } from "@/config/env"

export function createServiceRoleClient() {
  return createClient(env.supabase.url, env.supabase.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
