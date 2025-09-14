import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params

  try {
    const { data, error } = await supabase
      .from("clothing_requests")
      .select(`
        *,
        clothing_listings!inner(title, description, clothing_type, quantity, condition, size_range, apartment_id),
        ngo_profiles:profiles!clothing_requests_ngo_id_fkey(name, contact_person, phone, address, city, state),
        apartment_profiles:profiles!clothing_listings_apartment_id_fkey(name, contact_person, phone, address, city, state),
        ngo_details!inner(ngo_name, registration_number, focus_areas, website)
      `)
      .eq("id", id)
      .single()

    if (error) throw error

    return NextResponse.json({ data, success: true })
  } catch (error) {
    return NextResponse.json({ error: "Request not found", success: false }, { status: 404 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params

  try {
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) {
      return NextResponse.json({ error: "Unauthorized", success: false }, { status: 401 })
    }

    const body = await request.json()
    const { status } = body

    // Get request details to verify permissions
    const { data: requestData } = await supabase
      .from("clothing_requests")
      .select(`
        *,
        clothing_listings!inner(apartment_id)
      `)
      .eq("id", id)
      .single()

    if (!requestData) {
      return NextResponse.json({ error: "Request not found", success: false }, { status: 404 })
    }

    // Check if user has permission to update this request
    const canUpdate =
      requestData.ngo_id === user.user.id || // NGO can update their own request
      requestData.clothing_listings.apartment_id === user.user.id // Apartment can update requests for their listings

    if (!canUpdate) {
      return NextResponse.json({ error: "Forbidden", success: false }, { status: 403 })
    }

    const { data, error } = await supabase
      .from("clothing_requests")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error

    // If approved, mark listing as unavailable
    if (status === "approved") {
      await supabase.from("clothing_listings").update({ available: false }).eq("id", requestData.listing_id)
    }

    return NextResponse.json({ data, success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update request", success: false }, { status: 500 })
  }
}
