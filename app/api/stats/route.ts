import { getSession } from "@/lib/auth/session"
import { getProfileById, getStats } from "@/lib/db/queries"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized", success: false }, { status: 401 })
    }

    // Check if user is admin
    const profile = await getProfileById(session.userId)
    if (!profile || profile.user_type !== "admin") {
      return NextResponse.json({ error: "Forbidden", success: false }, { status: 403 })
    }

    const stats = await getStats()
    return NextResponse.json({ data: stats, success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch statistics", success: false }, { status: 500 })
  }
}
