import { getSession } from "@/lib/auth/session"
import { getRequestById, updateRequest } from "@/lib/db/queries"
import { query } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  try {
    const data = await getRequestById(id)
    if (!data) throw new Error("Not found")

    return NextResponse.json({ data, success: true })
  } catch (error) {
    return NextResponse.json({ error: "Request not found", success: false }, { status: 404 })
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
    const { status } = body

    // Get request details to verify permissions
    const rows = await query<{ ngo_id: string; listing_id: string; apartment_id: string }>(
      `SELECT cr.ngo_id, cr.listing_id, cl.apartment_id
       FROM clothing_requests cr
       JOIN clothing_listings cl ON cl.id = cr.listing_id
       WHERE cr.id = $1`,
      [id]
    )
    const requestData = rows[0] ?? null

    if (!requestData) {
      return NextResponse.json({ error: "Request not found", success: false }, { status: 404 })
    }

    // Check if user has permission to update this request
    const canUpdate =
      requestData.ngo_id === session.userId ||
      requestData.apartment_id === session.userId

    if (!canUpdate) {
      return NextResponse.json({ error: "Forbidden", success: false }, { status: 403 })
    }

    const data = await updateRequest(id, { status, updated_at: new Date().toISOString() })

    // If approved, mark listing as unavailable
    if (status === "approved") {
      await query(
        "UPDATE clothing_listings SET available = FALSE WHERE id = $1",
        [requestData.listing_id]
      )
    }

    return NextResponse.json({ data, success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update request", success: false }, { status: 500 })
  }
}
