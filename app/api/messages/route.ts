import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)

  const request_id = searchParams.get("request_id")

  try {
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) {
      return NextResponse.json({ error: "Unauthorized", success: false }, { status: 401 })
    }

    if (!request_id) {
      return NextResponse.json({ error: "Request ID is required", success: false }, { status: 400 })
    }

    // Verify user has access to this request's messages
    const { data: requestData } = await supabase
      .from("clothing_requests")
      .select(`
        *,
        clothing_listings!inner(apartment_id)
      `)
      .eq("id", request_id)
      .single()

    if (!requestData) {
      return NextResponse.json({ error: "Request not found", success: false }, { status: 404 })
    }

    const hasAccess = requestData.ngo_id === user.user.id || requestData.clothing_listings.apartment_id === user.user.id

    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden", success: false }, { status: 403 })
    }

    const { data, error } = await supabase
      .from("messages")
      .select(`
        *,
        profiles!messages_sender_id_fkey(name, contact_person, user_type)
      `)
      .eq("request_id", request_id)
      .order("created_at", { ascending: true })

    if (error) throw error

    return NextResponse.json({ data, success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch messages", success: false }, { status: 500 })
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
    const { request_id, message } = body

    // Validate required fields
    if (!request_id || !message?.trim()) {
      return NextResponse.json({ error: "Missing required fields", success: false }, { status: 400 })
    }

    // Verify user has access to send messages for this request
    const { data: requestData } = await supabase
      .from("clothing_requests")
      .select(`
        *,
        clothing_listings!inner(apartment_id)
      `)
      .eq("id", request_id)
      .single()

    if (!requestData) {
      return NextResponse.json({ error: "Request not found", success: false }, { status: 404 })
    }

    const hasAccess = requestData.ngo_id === user.user.id || requestData.clothing_listings.apartment_id === user.user.id

    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden", success: false }, { status: 403 })
    }

    const { data, error } = await supabase
      .from("messages")
      .insert({
        request_id,
        sender_id: user.user.id,
        message: message.trim(),
      })
      .select(`
        *,
        profiles!messages_sender_id_fkey(name, contact_person, user_type)
      `)
      .single()

    if (error) throw error

    return NextResponse.json({ data, success: true }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to send message", success: false }, { status: 500 })
  }
}
