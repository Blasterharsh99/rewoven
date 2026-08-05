import { getSession } from "@/lib/auth/session"
import { getMessages, createMessage } from "@/lib/db/queries"
import { queryOne } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const request_id = searchParams.get("request_id")

  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized", success: false }, { status: 401 })
    }

    if (!request_id) {
      return NextResponse.json({ error: "Request ID is required", success: false }, { status: 400 })
    }

    // Verify user has access to this request's messages
    const requestData = await queryOne<{ ngo_id: string; apartment_id: string }>(
      `SELECT cr.ngo_id, cl.apartment_id
       FROM clothing_requests cr
       JOIN clothing_listings cl ON cl.id = cr.listing_id
       WHERE cr.id = $1`,
      [request_id]
    )

    if (!requestData) {
      return NextResponse.json({ error: "Request not found", success: false }, { status: 404 })
    }

    const hasAccess =
      requestData.ngo_id === session.userId ||
      requestData.apartment_id === session.userId

    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden", success: false }, { status: 403 })
    }

    const data = await getMessages(request_id)
    return NextResponse.json({ data, success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch messages", success: false }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized", success: false }, { status: 401 })
    }

    const body = await request.json()
    const { request_id, message } = body

    if (!request_id || !message?.trim()) {
      return NextResponse.json({ error: "Missing required fields", success: false }, { status: 400 })
    }

    // Verify user has access to send messages for this request
    const requestData = await queryOne<{ ngo_id: string; apartment_id: string }>(
      `SELECT cr.ngo_id, cl.apartment_id
       FROM clothing_requests cr
       JOIN clothing_listings cl ON cl.id = cr.listing_id
       WHERE cr.id = $1`,
      [request_id]
    )

    if (!requestData) {
      return NextResponse.json({ error: "Request not found", success: false }, { status: 404 })
    }

    const hasAccess =
      requestData.ngo_id === session.userId ||
      requestData.apartment_id === session.userId

    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden", success: false }, { status: 403 })
    }

    const data = await createMessage({
      request_id,
      sender_id: session.userId,
      message: message.trim(),
    })

    return NextResponse.json({ data, success: true }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to send message", success: false }, { status: 500 })
  }
}
