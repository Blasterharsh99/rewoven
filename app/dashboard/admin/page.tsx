import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building2, Users, Package, TrendingUp, Heart, Activity, MessageCircle, CheckCircle } from "lucide-react"
import Link from "next/link"

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  if (!profile || profile.user_type !== "admin") {
    redirect("/auth/login")
  }

  // Get statistics
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

  // Get recent activities
  const { data: recentListings } = await supabase
    .from("clothing_listings")
    .select(`
      *,
      profiles!clothing_listings_apartment_id_fkey(name, city, state)
    `)
    .order("created_at", { ascending: false })
    .limit(5)

  const { data: recentRequests } = await supabase
    .from("clothing_requests")
    .select(`
      *,
      clothing_listings!inner(title),
      profiles!clothing_requests_ngo_id_fkey(name),
      apartment_profiles:profiles!clothing_listings_apartment_id_fkey(name)
    `)
    .order("created_at", { ascending: false })
    .limit(5)

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="h-8 w-8 text-emerald-600" />
            <h1 className="text-2xl font-bold text-emerald-900">Rewoven Admin</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-emerald-700">Welcome, {profile.contact_person}</span>
            <form action="/auth/signout" method="post">
              <Button variant="outline" type="submit">
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-emerald-900 mb-2">Admin Dashboard</h2>
          <p className="text-emerald-700">Monitor platform activity and manage the Rewoven community.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-emerald-200 bg-white/60 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-700">Total Apartments</CardTitle>
              <Building2 className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-900">{totalApartments || 0}</div>
            </CardContent>
          </Card>

          <Card className="border-emerald-200 bg-white/60 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-700">Total NGOs</CardTitle>
              <Users className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-900">{totalNGOs || 0}</div>
            </CardContent>
          </Card>

          <Card className="border-emerald-200 bg-white/60 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-700">Total Listings</CardTitle>
              <Package className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-900">{totalListings || 0}</div>
              <p className="text-xs text-emerald-600">{activeListings || 0} active</p>
            </CardContent>
          </Card>

          <Card className="border-emerald-200 bg-white/60 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-700">Total Requests</CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-900">{totalRequests || 0}</div>
              <p className="text-xs text-emerald-600">{pendingRequests || 0} pending</p>
            </CardContent>
          </Card>
        </div>

        {/* Request Status Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-emerald-200 bg-white/60 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-700">Pending Requests</CardTitle>
              <Activity className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-700">{pendingRequests || 0}</div>
            </CardContent>
          </Card>

          <Card className="border-emerald-200 bg-white/60 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-700">Approved Requests</CardTitle>
              <CheckCircle className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">{approvedRequests || 0}</div>
            </CardContent>
          </Card>

          <Card className="border-emerald-200 bg-white/60 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-700">Completed Requests</CardTitle>
              <CheckCircle className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-900">{completedRequests || 0}</div>
            </CardContent>
          </Card>

          <Card className="border-emerald-200 bg-white/60 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-700">Total Messages</CardTitle>
              <MessageCircle className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-900">{totalMessages || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
            <Link href="/dashboard/admin/apartments">Manage Apartments</Link>
          </Button>
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
            <Link href="/dashboard/admin/ngos">Manage NGOs</Link>
          </Button>
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
            <Link href="/dashboard/admin/listings">View All Listings</Link>
          </Button>
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
            <Link href="/dashboard/admin/requests">Monitor Requests</Link>
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Listings */}
          <Card className="border-emerald-200 bg-white/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-emerald-900">Recent Listings</CardTitle>
              <CardDescription>Latest clothing donations posted</CardDescription>
            </CardHeader>
            <CardContent>
              {recentListings && recentListings.length > 0 ? (
                <div className="space-y-4">
                  {recentListings.map((listing) => (
                    <div key={listing.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-emerald-900">{listing.title}</h4>
                        <p className="text-sm text-emerald-700">
                          {listing.profiles?.name} • {listing.profiles?.city}, {listing.profiles?.state}
                        </p>
                        <p className="text-xs text-emerald-600">
                          {listing.clothing_type} • {listing.quantity} items
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={listing.available ? "default" : "secondary"}>
                          {listing.available ? "Available" : "Unavailable"}
                        </Badge>
                        <span className="text-xs text-emerald-500">
                          {new Date(listing.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-emerald-600 text-center py-4">No recent listings</p>
              )}
            </CardContent>
          </Card>

          {/* Recent Requests */}
          <Card className="border-emerald-200 bg-white/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-emerald-900">Recent Requests</CardTitle>
              <CardDescription>Latest donation requests from NGOs</CardDescription>
            </CardHeader>
            <CardContent>
              {recentRequests && recentRequests.length > 0 ? (
                <div className="space-y-4">
                  {recentRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-emerald-900">{request.profiles?.name}</h4>
                        <p className="text-sm text-emerald-700">Requested "{request.clothing_listings?.title}"</p>
                        <p className="text-xs text-emerald-600">
                          {request.requested_quantity} items • {new Date(request.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge
                        variant={
                          request.status === "pending"
                            ? "secondary"
                            : request.status === "approved"
                              ? "default"
                              : request.status === "completed"
                                ? "default"
                                : "outline"
                        }
                      >
                        {request.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-emerald-600 text-center py-4">No recent requests</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
