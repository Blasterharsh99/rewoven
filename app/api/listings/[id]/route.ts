import { getSession } from "@/lib/auth/session"
import { getListingById, updateListing } from "@/lib/db/queries"
import { query, queryOne } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  try {
    const rows = await query(
      `SELECT cl.*,
         json_build_object('name', p.name, 'city', p.city, 'state', p.state, 'contact_person', p.contact_person, 'phone', p.phone, 'address', p.address) AS profiles,
         row_to_json(ad.*) AS apartment_details
       FROM clothing_listings cl
       JOIN profiles p ON p.id = cl.apartment_id
       LEFT JOIN apartment_details ad ON ad.profile_id = cl.apartment_id
       WHERE cl.id = $1`,
      [id]
    )
    const data = rows[0] ?? null
    if (!data) throw new Error("Not found")

    return NextResponse.json({ data, success: true })
  } catch (error) {
    return NextResponse.json({ error: "Listing not found", success: false }, { status: 404 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized", success: false }, { status: 401 })
    }

    const body = await request.json()

    // Verify ownership
    const listing = await queryOne<{ apartment_id: string }>(
      "SELECT apartment_id FROM clothing_listings WHERE id = $1",
      [id]
    )

    if (!listing || listing.apartment_id !== session.userId) {
      return NextResponse.json({ error: "Forbidden", success: false }, { status: 403 })
    }

    const data = await updateListing(id, body)

    return NextResponse.json({ data, success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update listing", success: false }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized", success: false }, { status: 401 })
    }

    // Verify ownership
    const listing = await queryOne<{ apartment_id: string }>(
      "SELECT apartment_id FROM clothing_listings WHERE id = $1",
      [id]
    )

    if (!listing || listing.apartment_id !== session.userId) {
      return NextResponse.json({ error: "Forbidden", success: false }, { status: 403 })
    }

    await query("DELETE FROM clothing_listings WHERE id = $1", [id])

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete listing", success: false }, { status: 500 })
  }
}
