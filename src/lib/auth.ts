import { createClient } from "@/supabase/client"
import type { User, Profile } from "@/types"

export function mapSupabaseUser(supabaseUser: {
  id: string
  email?: string | null
  created_at?: string
  updated_at?: string
}): User {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email ?? "",
    createdAt: supabaseUser.created_at ?? new Date().toISOString(),
    updatedAt: supabaseUser.updated_at ?? new Date().toISOString(),
  }
}

export function mapProfile(row: Record<string, unknown>): Profile {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    fullName: row.full_name as string,
    avatarUrl: row.avatar_url as string | undefined,
    currency: row.currency as Profile["currency"],
    timezone: row.timezone as string,
    locale: row.locale as string,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

export async function getBrowserSession() {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session
}

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const supabase = createClient()
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .single()

  if (!data) return null

  return mapProfile(data as Record<string, unknown>)
}
