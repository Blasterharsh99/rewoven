import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import {
  getUserByEmail,
  createUser,
  createProfile,
  upsertApartmentDetails,
  upsertNgoDetails,
} from "@/lib/db/queries"
import { createSession } from "@/lib/auth/session"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, metadata } = body

    if (!email || !password || !metadata) {
      return NextResponse.json(
        { error: "Missing required fields", success: false },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists", success: false },
        { status: 409 }
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Create user record
    const user = await createUser(email, passwordHash)

    // Create base profile
    await createProfile({
      id: user.id,
      user_type: metadata.user_type || "apartment",
      name: metadata.name || "",
      contact_person: metadata.contact_person || "",
      email: user.email,
      phone: metadata.phone || null,
      address: metadata.address || "",
      city: metadata.city || "",
      state: metadata.state || "",
      pincode: metadata.pincode || "",
    })

    // Create type-specific details
    if (metadata.user_type === "apartment") {
      await upsertApartmentDetails({
        profile_id: user.id,
        apartment_name: metadata.apartment_name || metadata.name || "",
        total_units: metadata.total_units
          ? parseInt(metadata.total_units)
          : null,
        society_registration_number:
          metadata.society_registration_number || null,
      })
    } else if (metadata.user_type === "ngo") {
      await upsertNgoDetails({
        profile_id: user.id,
        ngo_name: metadata.ngo_name || metadata.name || "",
        registration_number: metadata.ngo_registration_number || "",
        head_office_address: metadata.head_office_address || metadata.address || "",
        website: metadata.website || null,
        focus_areas: Array.isArray(metadata.focus_areas)
          ? metadata.focus_areas
          : null,
      })
    }

    // Create session
    await createSession({
      userId: user.id,
      userType: metadata.user_type || "apartment",
      email: user.email,
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          id: user.id,
          email: user.email,
          user_type: metadata.user_type,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("[auth/signup] Error:", error)
    return NextResponse.json(
      { error: "Signup failed. Please try again.", success: false },
      { status: 500 }
    )
  }
}
