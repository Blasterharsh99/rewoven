import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth/session"
import { getProfileById } from "@/lib/db/queries"
import { query, queryOne } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Package, Users, TrendingUp, Heart, MapPin } from "lucide-react"
import Link from "next/link"

export default async function NGODashboardPage() {
  const session = await getSession()
  if (!session) {
    redirect("/auth/login")
  }

  // Get user profile
  const profile = await getProfileById(session.userId)

  if (!profile || profile.user_type !== "ngo") {
    redirect("/auth/login")
  }

  // Get NGO details
  const ngoDetails = await queryOne(
    "SELECT * FROM ngo_details WHERE profile_id = $1",
    [profile.id]
  )

  // If NGO details don't exist, redirect to complete profile
  if (!ngoDetails) {
    redirect("/auth/complete-profile")
  }

  // Get available clothing listings
  const availableListings = await query(
    `SELECT cl.*, json_build_object('name', p.name, 'city', p.city, 'state', p.state) AS profiles
     FROM clothing_listings cl
     JOIN profiles p ON p.id = cl.apartment_id
     WHERE cl.available = TRUE
     ORDER BY cl.created_at DESC
     LIMIT 5`,
    []
  )

  // Get NGO's requests
  const requests = await query(
    `SELECT cr.*,
       json_build_object('title', cl.title, 'apartment_id', cl.apartment_id) AS clothing_listings
     FROM clothing_requests cr
     JOIN clothing_listings cl ON cl.id = cr.listing_id
     WHERE cr.ngo_id = $1
     ORDER BY cr.created_at DESC`,
    [profile.id]
  )

  const totalRequests = requests?.length || 0
  const pendingRequests = requests?.filter((r) => r.status === "pending").length || 0
  const approvedRequests = requests?.filter((r) => r.status === "approved").length || 0
  const completedRequests = requests?.filter((r) => r.status === "completed").length || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/rewoven-logo.jpeg" alt="Rewoven Logo" className="h-12 w-12 rounded-full object-cover" />
            <h1 className="text-2xl font-bold text-sky-900">Rewoven</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-sky-700">Welcome, {profile.contact_person}</span>
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
          <h2 className="text-3xl font-bold text-sky-900 mb-2">{ngoDetails?.ngo_name || profile.name} Dashboard</h2>
          <p className="text-sky-700">Browse available clothing donations and manage your requests.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-sky-200 bg-white/60 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-sky-700">Total Requests</CardTitle>
              <Package className="h-4 w-4 text-sky-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-sky-900">{totalRequests}</div>
            </CardContent>
          </Card>

          <Card className="border-sky-200 bg-white/60 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-sky-700">Pending</CardTitle>
              <TrendingUp className="h-4 w-4 text-sky-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-sky-900">{pendingRequests}</div>
            </CardContent>
          </Card>

          <Card className="border-sky-200 bg-white/60 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-sky-700">Approved</CardTitle>
              <Users className="h-4 w-4 text-sky-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-sky-900">{approvedRequests}</div>
            </CardContent>
          </Card>

          <Card className="border-sky-200 bg-white/60 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-sky-700">Completed</CardTitle>
              <Users className="h-4 w-4 text-sky-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-sky-900">{completedRequests}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Available Listings */}
          <Card className="border-sky-200 bg-white/60 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sky-900">Available Donations</CardTitle>
                  <CardDescription>Browse clothing donations from apartment communities</CardDescription>
                </div>
                <Button variant="outline" className="bg-sky-600 hover:bg-sky-700">
                  <Link href="/dashboard/ngo/browse">
                    <Search className="h-4 w-4 mr-2" />
                    Browse All
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {availableListings && availableListings.length > 0 ? (
                <div className="space-y-4">
                  {availableListings.map((listing) => (
                    <div key={listing.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-sky-900">{listing.title}</h4>
                        <p className="text-sm text-sky-700">
                          {listing.clothing_type} • {listing.quantity} items • {listing.condition}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-sky-600 mt-1">
                          <MapPin className="h-3 w-3" />
                          {listing.profiles?.name} • {listing.profiles?.city}, {listing.profiles?.state}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="default">Available</Badge>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/ngo/listings/${listing.id}`}>View</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full bg-transparent" asChild>
                    <Link href="/dashboard/ngo/browse">View All Available Donations</Link>
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-sky-300 mx-auto mb-4" />
                  <p className="text-sky-600 mb-4">No donations available at the moment</p>
                  <p className="text-sm text-sky-500">Check back later for new clothing donations</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Requests */}
          <Card className="border-sky-200 bg-white/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-sky-900">Your Recent Requests</CardTitle>
              <CardDescription>Track your clothing donation requests</CardDescription>
            </CardHeader>
            <CardContent>
              {requests && requests.length > 0 ? (
                <div className="space-y-4">
                  {requests.slice(0, 5).map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-sky-900">{request.clothing_listings?.title}</h4>
                        <p className="text-sm text-sky-700">
                          From {request.profiles?.name} • {request.requested_quantity} items
                        </p>
                        <p className="text-xs text-sky-600">{new Date(request.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            request.status === "pending"
                              ? "default"
                              : request.status === "approved"
                                ? "default"
                                : request.status === "completed"
                                  ? "default"
                                  : "secondary"
                          }
                        >
                          {request.status}
                        </Badge>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/ngo/requests/${request.id}`}>View</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                  {requests.length > 5 && (
                    <Button variant="outline" className="w-full bg-transparent" asChild>
                      <Link href="/dashboard/ngo/requests">View All Requests</Link>
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-sky-300 mx-auto mb-4" />
                  <p className="text-sky-600">No requests yet</p>
                  <p className="text-sm text-sky-500">
                    Start browsing available donations to make your first request
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
