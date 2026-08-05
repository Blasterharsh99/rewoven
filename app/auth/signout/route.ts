import { type NextRequest, NextResponse } from "next/server"
import { deleteSession } from "@/lib/auth/session"

export async function POST(request: NextRequest) {
  await deleteSession()
  return NextResponse.redirect(new URL("/", request.url))
}
