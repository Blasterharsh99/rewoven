import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth/session"
import { getProfileById } from "@/lib/db/queries"
import { query, queryOne } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building2, Users, Package, TrendingUp, Heart, Activity, MessageCircle, CheckCircle } from "lucide-react"
import Link from "next/link"

export default async function AdminDashboardPage() {
  const session = await getSession()
  if (!session) {
    redirect("/auth/login")
  }

  // Get user profile
  const profile = await getProfileById(session.userId)

  if (!profile || profile.user_type !== "admin") {
    redirect("/auth/login")
  }

  // Get statistics
  const [
    totalApartmentsRow,
    totalNGOsRow,
    totalListingsRow,
    activeListingsRow,
    totalRequestsRow,
    pendingRequestsRow,
    approvedRequestsRow,
    completedRequestsRow,
    totalMessagesRow,
  ] = await Promise.all([
    queryOne<{ count: string }>("SELECT COUNT(*) FROM profiles WHERE user_type = 'apartment'", []),
    queryOne<{ count: string }>("SELECT COUNT(*) FROM profiles WHERE user_type = 'ngo'", []),
    queryOne<{ count: string }>("SELECT COUNT(*) FROM clothing_listings", []),
    queryOne<{ count: string }>("SELECT COUNT(*) FROM clothing_listings WHERE available = TRUE", []),
    queryOne<{ count: string }>("SELECT COUNT(*) FROM clothing_requests", []),
    queryOne<{ count: string }>("SELECT COUNT(*) FROM clothing_requests WHERE status = 'pending'", []),
    queryOne<{ count: string }>("SELECT COUNT(*) FROM clothing_requests WHERE status = 'approved'", []),
    queryOne<{ count: string }>("SELECT COUNT(*) FROM clothing_requests WHERE status = 'completed'", []),
    queryOne<{ count: string }>("SELECT COUNT(*) FROM messages", []),
  ])

  const totalApartments = parseInt(totalApartmentsRow?.count ?? "0")
  const totalNGOs = parseInt(totalNGOsRow?.count ?? "0")
  const totalListings = parseInt(totalListingsRow?.count ?? "0")
  const activeListings = parseInt(activeListingsRow?.count ?? "0")
  const totalRequests = parseInt(totalRequestsRow?.count ?? "0")
  const pendingRequests = parseInt(pendingRequestsRow?.count ?? "0")
  const approvedRequests = parseInt(approvedRequestsRow?.count ?? "0")
  const completedRequests = parseInt(completedRequestsRow?.count ?? "0")
  const totalMessages = parseInt(totalMessagesRow?.count ?? "0")

  // Get recent activities
  const recentListings = await query(
    `SELECT cl.*, json_build_object('name', p.name, 'city', p.city, 'state', p.state) AS profiles
     FROM clothing_listings cl
     JOIN profiles p ON p.id = cl.apartment_id
     ORDER BY cl.created_at DESC
     LIMIT 5`,
    []
  )

  const recentRequests = await query(
    `SELECT cr.*,
       json_build_object('name', np.name) AS ngo_profile,
       json_build_object('title', cl.title) AS listing
     FROM clothing_requests cr
     JOIN profiles np ON np.id = cr.ngo_id
     JOIN clothing_listings cl ON cl.id = cr.listing_id
     ORDER BY cr.created_at DESC
     LIMIT 5`,
    []
  )


  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/rewoven-logo.jpeg" alt="Rewoven Logo" className="h-12 w-12 rounded-full object-cover" />
            <h1 className="text-2xl font-bold text-sky-900">Rewoven Admin</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-sky-700">Welcome, Admin</span>
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
          <h2 className="text-3xl font-bold text-sky-900 mb-2">Admin Dashboard</h2>
          <p className="text-sky-700">Monitor platform activity and manage the Rewoven community.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-sky-200 bg-white/60 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-sky-700">Total Apartments</CardTitle>
              <Building2 className="h-4 w-4 text-sky-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-sky-900">{totalApartments || 0}</div>
            </CardContent>
          </Card>

          <Card className="border-sky-200 bg-white/60 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-sky-700">Total NGOs</CardTitle>
              <Users className="h-4 w-4 text-sky-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-sky-900">{totalNGOs || 0}</div>
            </CardContent>
          </Card>

          <Card className="border-sky-200 bg-white/60 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-sky-700">Total Listings</CardTitle>
              <Package className="h-4 w-4 text-sky-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-sky-900">{totalListings || 0}</div>
              <p className="text-xs text-sky-600">{activeListings || 0} active</p>
            </CardContent>
          </Card>

          <Card className="border-sky-200 bg-white/60 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-sky-700">Total Requests</CardTitle>
              <TrendingUp className="h-4 w-4 text-sky-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-sky-900">{totalRequests || 0}</div>
              <p className="text-xs text-sky-600">{pendingRequests || 0} pending</p>
            </CardContent>
          </Card>
        </div>

        {/* Request Status Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-sky-200 bg-white/60 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-sky-700">Pending Requests</CardTitle>
              <Activity className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-700">{pendingRequests || 0}</div>
            </CardContent>
          </Card>

          <Card className="border-sky-200 bg-white/60 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-sky-700">Approved Requests</CardTitle>
              <CheckCircle className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">{approvedRequests || 0}</div>
            </CardContent>
          </Card>

          <Card className="border-sky-200 bg-white/60 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-sky-700">Completed Requests</CardTitle>
              <CheckCircle className="h-4 w-4 text-sky-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-sky-900">{completedRequests || 0}</div>
            </CardContent>
          </Card>

          <Card className="border-sky-200 bg-white/60 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-sky-700">Total Messages</CardTitle>
              <MessageCircle className="h-4 w-4 text-sky-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-sky-900">{totalMessages || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Button asChild className="bg-sky-600 hover:bg-sky-700">
            <Link href="/dashboard/admin/apartments">Manage Apartments</Link>
          </Button>
          <Button asChild className="bg-sky-600 hover:bg-sky-700">
            <Link href="/dashboard/admin/ngos">Manage NGOs</Link>
          </Button>
          <Button asChild className="bg-sky-600 hover:bg-sky-700">
            <Link href="/dashboard/admin/listings">View All Listings</Link>
          </Button>
          <Button asChild className="bg-sky-600 hover:bg-sky-700">
            <Link href="/dashboard/admin/requests">Monitor Requests</Link>
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Listings */}
          <Card className="border-sky-200 bg-white/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-sky-900">Recent Listings</CardTitle>
              <CardDescription>Latest clothing donations posted</CardDescription>
            </CardHeader>
            <CardContent>
              {recentListings && recentListings.length > 0 ? (
                <div className="space-y-4">
                  {recentListings.map((listing) => (
                    <div key={listing.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-sky-900">{listing.title}</h4>
                        <p className="text-sm text-sky-700">
                          {listing.profiles?.name} • {listing.profiles?.city}, {listing.profiles?.state}
                        </p>
                        <p className="text-xs text-sky-600">
                          {listing.clothing_type} • {listing.quantity} items
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={listing.available ? "default" : "secondary"}>
                          {listing.available ? "Available" : "Unavailable"}
                        </Badge>
                        <span className="text-xs text-sky-500">
                          {new Date(listing.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sky-600 text-center py-4">No recent listings</p>
              )}
            </CardContent>
          </Card>

          {/* Recent Requests */}
          <Card className="border-sky-200 bg-white/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-sky-900">Recent Requests</CardTitle>
              <CardDescription>Latest donation requests from NGOs</CardDescription>
            </CardHeader>
            <CardContent>
              {recentRequests && recentRequests.length > 0 ? (
                <div className="space-y-4">
                  {recentRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-sky-900">{request.ngo_name}</h4>
                        <p className="text-sm text-sky-700">"{request.message}"</p>
                        <p className="text-xs text-sky-600">
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
                <p className="text-sky-600 text-center py-4">No recent requests</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
