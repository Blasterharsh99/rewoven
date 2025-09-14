import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()

  try {
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) {
      return NextResponse.json({ error: "Unauthorized", success: false }, { status: 401 })
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select(`
        *,
        apartment_details(*),
        ngo_details(*)
      `)
      .eq("id", user.user.id)
      .single()

    if (error) throw error

    return NextResponse.json({ data: profile, success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch profile", success: false }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const supabase = await createClient()

  try {
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) {
      return NextResponse.json({ error: "Unauthorized", success: false }, { status: 401 })
    }

    const body = await request.json()
    const { profile_data, details_data } = body

    // Update main profile
    if (profile_data) {
      const { error: profileError } = await supabase.from("profiles").update(profile_data).eq("id", user.user.id)
    }

    // Update user type specific details
    if (details_data) {
      const { data: profile } = await supabase.from("profiles").select("user_type").eq("id", user.user.id).single()

      if (profile?.user_type === "apartment") {
        await supabase.from("apartment_details").upsert({ profile_id: user.user.id, ...details_data })
      } else if (profile?.user_type === "ngo") {
        await supabase.from("ngo_details").upsert({ profile_id: user.user.id, ...details_data })
      }
    }

    // Fetch updated profile
    const { data: updatedProfile, error } = await supabase
      .from("profiles")
      .select(`
        *,
        apartment_details(*),
        ngo_details(*)
      `)
      .eq("id", user.user.id)
      .single()

    if (error) throw error

    return NextResponse.json({ data: updatedProfile, success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update profile", success: false }, { status: 500 })
  }
}
