import { type NextRequest } from "next/server"
import { updateSession } from "@/supabase/middleware"

const publicRoutes = new Set(["/login", "/signup", "/auth/callback"])

export async function proxy(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request)
  const { pathname } = request.nextUrl

  if (user && publicRoutes.has(pathname)) {
    const dashboardUrl = new URL("/dashboard", request.url)
    return Response.redirect(dashboardUrl)
  }

  if (!user && !publicRoutes.has(pathname)) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return Response.redirect(loginUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
