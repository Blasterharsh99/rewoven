import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { getUserByEmail, getProfileById } from "@/lib/db/queries"
import { createSession } from "@/lib/auth/session"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required", success: false },
        { status: 400 }
      )
    }

    // Find user
    const user = await getUserByEmail(email)
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password", success: false },
        { status: 401 }
      )
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password_hash)
    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Invalid email or password", success: false },
        { status: 401 }
      )
    }

    // Get profile for user_type
    const profile = await getProfileById(user.id)

    // Create session
    await createSession({
      userId: user.id,
      userType: profile?.user_type ?? "apartment",
      email: user.email,
    })

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        user_type: profile?.user_type,
      },
    })
  } catch (error) {
    console.error("[auth/login] Error:", error)
    return NextResponse.json(
      { error: "Login failed. Please try again.", success: false },
      { status: 500 }
    )
  }
}
