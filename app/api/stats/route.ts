import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const supabase = await createClient()

  try {
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) {
      return NextResponse.json({ error: "Unauthorized", success: false }, { status: 401 })
    }

    // Get user profile to check if admin
    const { data: profile } = await supabase.from("profiles").select("user_type").eq("id", user.user.id).single()

    if (!profile || profile.user_type !== "admin") {
      return NextResponse.json({ error: "Forbidden", success: false }, { status: 403 })
    }

    // Get platform statistics
    const [
      { count: totalApartments },
      { count: totalNGOs },
      { count: totalListings },
      { count: activeListings },
      { count: totalRequests },
      { count: pendingRequests },
      { count: approvedRequests },
      { count: completedRequests },
      { count: totalMessages },
    ] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("user_type", "apartment"),
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("user_type", "ngo"),
      supabase.from("clothing_listings").select("*", { count: "exact", head: true }),
      supabase.from("clothing_listings").select("*", { count: "exact", head: true }).eq("available", true),
      supabase.from("clothing_requests").select("*", { count: "exact", head: true }),
      supabase.from("clothing_requests").select("*", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("clothing_requests").select("*", { count: "exact", head: true }).eq("status", "approved"),
      supabase.from("clothing_requests").select("*", { count: "exact", head: true }).eq("status", "completed"),
      supabase.from("messages").select("*", { count: "exact", head: true }),
    ])

    const stats = {
      totalApartments: totalApartments || 0,
      totalNGOs: totalNGOs || 0,
      totalListings: totalListings || 0,
      activeListings: activeListings || 0,
      totalRequests: totalRequests || 0,
      pendingRequests: pendingRequests || 0,
      approvedRequests: approvedRequests || 0,
      completedRequests: completedRequests || 0,
      totalMessages: totalMessages || 0,
    }

    return NextResponse.json({ data: stats, success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch statistics", success: false }, { status: 500 })
  }
}
