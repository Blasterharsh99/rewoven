import { getSession } from "@/lib/auth/session"
import {
  getFullProfile,
  updateProfile,
  upsertApartmentDetails,
  upsertNgoDetails,
  getProfileById,
} from "@/lib/db/queries"
import { type NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized", success: false }, { status: 401 })
    }

    const profile = await getFullProfile(session.userId)
    if (!profile) throw new Error("Profile not found")

    return NextResponse.json({ data: profile, success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch profile", success: false }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized", success: false }, { status: 401 })
    }

    const body = await request.json()
    const { profile_data, details_data } = body

    // Update main profile
    if (profile_data) {
      await updateProfile(session.userId, profile_data)
    }

    // Update user type specific details
    if (details_data) {
      const profile = await getProfileById(session.userId)

      if (profile?.user_type === "apartment") {
        await upsertApartmentDetails({ profile_id: session.userId, ...details_data })
      } else if (profile?.user_type === "ngo") {
        await upsertNgoDetails({ profile_id: session.userId, ...details_data })
      }
    }

    // Fetch updated profile
    const updatedProfile = await getFullProfile(session.userId)
    if (!updatedProfile) throw new Error("Profile not found after update")

    return NextResponse.json({ data: updatedProfile, success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update profile", success: false }, { status: 500 })
  }
}
