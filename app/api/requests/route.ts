import { getSession } from "@/lib/auth/session"
import { getRequests, createRequest } from "@/lib/db/queries"
import { queryOne } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const status = searchParams.get("status")
  const ngo_id = searchParams.get("ngo_id")
  const apartment_id = searchParams.get("apartment_id")

  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized", success: false }, { status: 401 })
    }

    const data = await getRequests({ status, ngo_id, apartment_id })
    return NextResponse.json({ data, success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch requests", success: false }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized", success: false }, { status: 401 })
    }

    const body = await request.json()
    const { listing_id, requested_quantity, message } = body

    if (!listing_id || !requested_quantity) {
      return NextResponse.json({ error: "Missing required fields", success: false }, { status: 400 })
    }

    // Check if listing exists and is available
    const listing = await queryOne<{ quantity: number; available: boolean }>(
      "SELECT quantity, available FROM clothing_listings WHERE id = $1",
      [listing_id]
    )

    if (!listing || !listing.available) {
      return NextResponse.json({ error: "Listing not available", success: false }, { status: 400 })
    }

    if (requested_quantity > listing.quantity) {
      return NextResponse.json(
        { error: "Requested quantity exceeds available quantity", success: false },
        { status: 400 }
      )
    }

    // Check if user already has a request for this listing
    const existingRequest = await queryOne(
      "SELECT id FROM clothing_requests WHERE ngo_id = $1 AND listing_id = $2",
      [session.userId, listing_id]
    )

    if (existingRequest) {
      return NextResponse.json(
        { error: "You have already requested this listing", success: false },
        { status: 400 }
      )
    }

    const data = await createRequest({
      ngo_id: session.userId,
      listing_id,
      requested_quantity: parseInt(requested_quantity),
      message: message || null,
    })

    return NextResponse.json({ data, success: true }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create request", success: false }, { status: 500 })
  }
}
