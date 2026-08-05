import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { getProfileById } from "@/lib/db/queries"

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized", success: false },
        { status: 401 }
      )
    }

    const profile = await getProfileById(session.userId)

    return NextResponse.json({
      success: true,
      data: {
        id: session.userId,
        email: session.email,
        user_type: session.userType,
        profile,
      },
    })
  } catch (error) {
    console.error("[auth/me] Error:", error)
    return NextResponse.json(
      { error: "Failed to get user info", success: false },
      { status: 500 }
    )
  }
}
