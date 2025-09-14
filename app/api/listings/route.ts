import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)

  const search = searchParams.get("search")
  const type = searchParams.get("type")
  const city = searchParams.get("city")
  const available = searchParams.get("available")

  try {
    console.log("[v0] Fetching listings with params:", { search, type, city, available })

    let query = supabase.from("clothing_listings").select(`
        *,
        profiles!clothing_listings_apartment_id_fkey(name, city, state, contact_person, phone)
      `)

    // Apply filters
    if (available !== null) {
      query = query.eq("available", available === "true")
    } else {
      query = query.eq("available", true)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    if (type && type !== "all") {
      query = query.eq("clothing_type", type)
    }

    if (city) {
      query = query.eq("profiles.city", city)
    }

    const { data, error } = await query.order("created_at", { ascending: false })

    if (error) {
      console.log("[v0] Error fetching listings:", error)
      throw error
    }

    console.log("[v0] Successfully fetched listings:", data?.length || 0)
    return NextResponse.json({ data, success: true })
  } catch (error) {
    console.log("[v0] Failed to fetch listings:", error)
    return NextResponse.json({ error: "Failed to fetch listings", success: false }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  try {
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) {
      return NextResponse.json({ error: "Unauthorized", success: false }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, clothing_type, quantity, condition, size_range, pickup_instructions } = body

    console.log("[v0] Creating listing for user:", user.user.id, "with data:", body)

    // Validate required fields
    if (!title || !clothing_type || !quantity || !condition) {
      return NextResponse.json({ error: "Missing required fields", success: false }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("clothing_listings")
      .insert({
        apartment_id: user.user.id,
        title,
        description: description || null,
        clothing_type,
        quantity: Number.parseInt(quantity),
        condition,
        size_range: size_range || null,
        pickup_instructions: pickup_instructions || null,
        available: true,
      })
      .select()
      .single()

    if (error) {
      console.log("[v0] Error creating listing:", error)
      throw error
    }

    console.log("[v0] Successfully created listing:", data.id)
    return NextResponse.json({ data, success: true }, { status: 201 })
  } catch (error) {
    console.log("[v0] Failed to create listing:", error)
    return NextResponse.json({ error: "Failed to create listing", success: false }, { status: 500 })
  }
}
