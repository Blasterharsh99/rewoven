import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)

  const status = searchParams.get("status")
  const ngo_id = searchParams.get("ngo_id")
  const apartment_id = searchParams.get("apartment_id")

  try {
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) {
      return NextResponse.json({ error: "Unauthorized", success: false }, { status: 401 })
    }

    let query = supabase.from("clothing_requests").select(`
        *,
        clothing_listings!inner(title, apartment_id),
        ngo_profiles:profiles!clothing_requests_ngo_id_fkey(name, contact_person),
        apartment_profiles:profiles!clothing_listings_apartment_id_fkey(name, contact_person)
      `)

    // Apply filters
    if (status) {
      query = query.eq("status", status)
    }

    if (ngo_id) {
      query = query.eq("ngo_id", ngo_id)
    }

    if (apartment_id) {
      query = query.eq("clothing_listings.apartment_id", apartment_id)
    }

    const { data, error } = await query.order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json({ data, success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch requests", success: false }, { status: 500 })
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
    const { listing_id, requested_quantity, message } = body

    // Validate required fields
    if (!listing_id || !requested_quantity) {
      return NextResponse.json({ error: "Missing required fields", success: false }, { status: 400 })
    }

    // Check if listing exists and is available
    const { data: listing } = await supabase
      .from("clothing_listings")
      .select("quantity, available")
      .eq("id", listing_id)
      .single()

    if (!listing || !listing.available) {
      return NextResponse.json({ error: "Listing not available", success: false }, { status: 400 })
    }

    if (requested_quantity > listing.quantity) {
      return NextResponse.json(
        { error: "Requested quantity exceeds available quantity", success: false },
        { status: 400 },
      )
    }

    // Check if user already has a request for this listing
    const { data: existingRequest } = await supabase
      .from("clothing_requests")
      .select("id")
      .eq("ngo_id", user.user.id)
      .eq("listing_id", listing_id)
      .single()

    if (existingRequest) {
      return NextResponse.json({ error: "You have already requested this listing", success: false }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("clothing_requests")
      .insert({
        ngo_id: user.user.id,
        listing_id,
        requested_quantity: Number.parseInt(requested_quantity),
        message: message || null,
        status: "pending",
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data, success: true }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create request", success: false }, { status: 500 })
  }
}
