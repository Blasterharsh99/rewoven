import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params

  try {
    const { data, error } = await supabase
      .from("clothing_listings")
      .select(`
        *,
        profiles!clothing_listings_apartment_id_fkey(name, city, state, contact_person, phone, address),
        apartment_details!inner(apartment_name, total_units)
      `)
      .eq("id", id)
      .single()

    if (error) throw error

    return NextResponse.json({ data, success: true })
  } catch (error) {
    return NextResponse.json({ error: "Listing not found", success: false }, { status: 404 })
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

    // Verify ownership
    const { data: listing } = await supabase.from("clothing_listings").select("apartment_id").eq("id", id).single()

    if (!listing || listing.apartment_id !== user.user.id) {
      return NextResponse.json({ error: "Forbidden", success: false }, { status: 403 })
    }

    const { data, error } = await supabase.from("clothing_listings").update(body).eq("id", id).select().single()

    if (error) throw error

    return NextResponse.json({ data, success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update listing", success: false }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params

  try {
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) {
      return NextResponse.json({ error: "Unauthorized", success: false }, { status: 401 })
    }

    // Verify ownership
    const { data: listing } = await supabase.from("clothing_listings").select("apartment_id").eq("id", id).single()

    if (!listing || listing.apartment_id !== user.user.id) {
      return NextResponse.json({ error: "Forbidden", success: false }, { status: 403 })
    }

    const { error } = await supabase.from("clothing_listings").delete().eq("id", id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete listing", success: false }, { status: 500 })
  }
}
