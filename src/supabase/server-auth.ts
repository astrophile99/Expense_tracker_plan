import { createClient } from "./server"
import { mapSupabaseUser, mapProfile } from "@/lib/auth"
import type { User, Profile } from "@/types"

export async function getServerUser(): Promise<{
  user: User | null
  supabaseUser: import("@supabase/supabase-js").User | null
}> {
  const supabase = await createClient()
  const {
    data: { user: supabaseUser },
  } = await supabase.auth.getUser()

  if (!supabaseUser) {
    return { user: null, supabaseUser: null }
  }

  return {
    user: mapSupabaseUser(supabaseUser),
    supabaseUser,
  }
}

export async function getServerProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .single()

  if (!data) return null

  return mapProfile(data as Record<string, unknown>)
}
