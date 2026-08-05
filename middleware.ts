import { getSessionFromRequest } from "@/lib/auth/session"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

export async function middleware(request: NextRequest) {
  const session = await getSessionFromRequest(request)

  const { pathname } = request.nextUrl

  // Public paths that don't require authentication
  const publicPaths = ["/", "/auth/login", "/auth/signup", "/auth/signup-success"]
  const isPublicPath = publicPaths.some((p) => pathname === p) || pathname.startsWith("/auth/") || pathname.startsWith("/api/auth/")

  if (!session && !isPublicPath) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
