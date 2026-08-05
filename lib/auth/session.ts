import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"
import type { NextRequest } from "next/server"

const COOKIE_NAME = "rewoven_session"
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error(
      "JWT_SECRET environment variable is not set. Please add a random secret string."
    )
  }
  return new TextEncoder().encode(secret)
}

export interface SessionPayload {
  userId: string
  userType: string
  email: string
}

/**
 * Signs a JWT and stores it as an HttpOnly cookie.
 */
export async function createSession(payload: SessionPayload): Promise<void> {
  const secret = getJwtSecret()

  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret)

  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  })
}

/**
 * Reads and verifies the session JWT cookie.
 * Works in Server Components / Route Handlers via next/headers cookies().
 */
export async function getSession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(COOKIE_NAME)?.value
    if (!token) return null

    const { payload } = await jwtVerify(token, getJwtSecret())
    return payload as unknown as SessionPayload
  } catch {
    return null
  }
}

/**
 * Reads and verifies the session JWT from a NextRequest object.
 * Use this in middleware where next/headers is not available.
 */
export async function getSessionFromRequest(
  request: NextRequest
): Promise<SessionPayload | null> {
  try {
    const token = request.cookies.get(COOKIE_NAME)?.value
    if (!token) return null

    const { payload } = await jwtVerify(token, getJwtSecret())
    return payload as unknown as SessionPayload
  } catch {
    return null
  }
}

/**
 * Deletes the session cookie.
 */
export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}
