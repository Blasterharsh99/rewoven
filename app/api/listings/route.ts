import { getSession } from "@/lib/auth/session"
import { getListings, createListing } from "@/lib/db/queries"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const search = searchParams.get("search")
  const type = searchParams.get("type")
  const city = searchParams.get("city")
  const availableParam = searchParams.get("available")

  try {
    const available = availableParam !== null ? availableParam === "true" : true

    console.log("[listings] Fetching listings with params:", { search, type, city, available })

    const data = await getListings({ search, type, city, available })

    console.log("[listings] Successfully fetched listings:", data.length)
    return NextResponse.json({ data, success: true })
  } catch (error) {
    console.error("[listings] Failed to fetch listings:", error)
    return NextResponse.json({ error: "Failed to fetch listings", success: false }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized", success: false }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, clothing_type, quantity, condition, size_range, pickup_instructions } = body

    console.log("[listings] Creating listing for user:", session.userId)

    if (!title || !clothing_type || !quantity || !condition) {
      return NextResponse.json({ error: "Missing required fields", success: false }, { status: 400 })
    }

    const data = await createListing({
      apartment_id: session.userId,
      title,
      description: description || null,
      clothing_type,
      quantity: parseInt(quantity),
      condition,
      size_range: size_range || null,
      pickup_instructions: pickup_instructions || null,
    })

    console.log("[listings] Successfully created listing:", data.id)
    return NextResponse.json({ data, success: true }, { status: 201 })
  } catch (error) {
    console.error("[listings] Failed to create listing:", error)
    return NextResponse.json({ error: "Failed to create listing", success: false }, { status: 500 })
  }
}
