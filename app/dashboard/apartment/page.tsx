import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth/session"
import { getProfileById } from "@/lib/db/queries"
import { query, queryOne } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Package, Users, TrendingUp, Heart } from "lucide-react"
import Link from "next/link"

export default async function ApartmentDashboardPage() {
  const session = await getSession()
  if (!session) {
    redirect("/auth/login")
  }

  // Get user profile
  const profile = await getProfileById(session.userId)

  if (!profile || profile.user_type !== "apartment") {
    redirect("/auth/login")
  }

  // Get apartment details
  const apartmentDetails = await queryOne(
    "SELECT * FROM apartment_details WHERE profile_id = $1",
    [profile.id]
  )

  // Get clothing listings
  const listings = await query(
    "SELECT * FROM clothing_listings WHERE apartment_id = $1",
    [profile.id]
  )

  // Get requests for apartment's listings
  const requests = await query(
    `SELECT cr.*, 
       json_build_object('title', cl.title, 'apartment_id', cl.apartment_id) AS clothing_listings,
       json_build_object('name', p.name) AS profiles
     FROM clothing_requests cr
     JOIN clothing_listings cl ON cl.id = cr.listing_id
     JOIN profiles p ON p.id = cr.ngo_id
     WHERE cl.apartment_id = $1
     ORDER BY cr.created_at DESC`,
    [profile.id]
  )

  const totalListings = listings?.length || 0
  const activeListings = listings?.filter((l) => l.available).length || 0
  const totalRequests = requests?.length || 0
  const pendingRequests = requests?.filter((r) => r.status === "pending").length || 0

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
          <h2 className="text-3xl font-bold text-sky-900 mb-2">
            {apartmentDetails?.apartment_name || profile.name} Dashboard
          </h2>
          <p className="text-sky-700">Manage your clothing donations and connect with NGOs in need.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-sky-200 bg-white/60 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-sky-700">Total Listings</CardTitle>
              <Package className="h-4 w-4 text-sky-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-sky-900">{totalListings}</div>
            </CardContent>
          </Card>

          <Card className="border-sky-200 bg-white/60 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-sky-700">Active Listings</CardTitle>
              <TrendingUp className="h-4 w-4 text-sky-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-sky-900">{activeListings}</div>
            </CardContent>
          </Card>

          <Card className="border-sky-200 bg-white/60 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-sky-700">Total Requests</CardTitle>
              <Users className="h-4 w-4 text-sky-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-sky-900">{totalRequests}</div>
            </CardContent>
          </Card>

          <Card className="border-sky-200 bg-white/60 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-sky-700">Pending Requests</CardTitle>
              <Users className="h-4 w-4 text-sky-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-sky-900">{pendingRequests}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Clothing Listings */}
          <Card className="border-sky-200 bg-white/60 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sky-900">Your Clothing Listings</CardTitle>
                  <CardDescription>Manage your available clothing donations</CardDescription>
                </div>
                <Button asChild className="bg-sky-600 hover:bg-sky-700">
                  <Link href="/dashboard/apartment/listings/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Listing
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {listings && listings.length > 0 ? (
                <div className="space-y-4">
                  {listings.slice(0, 5).map((listing) => (
                    <div key={listing.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-sky-900">{listing.title}</h4>
                        <p className="text-sm text-sky-700">
                          {listing.clothing_type} • {listing.quantity} items • {listing.condition}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={listing.available ? "default" : "secondary"}>
                          {listing.available ? "Available" : "Unavailable"}
                        </Badge>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/apartment/listings/${listing.id}`}>View</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                  {listings.length > 5 && (
                    <Button variant="outline" className="w-full bg-transparent" asChild>
                      <Link href="/dashboard/apartment/listings">View All Listings</Link>
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-sky-300 mx-auto mb-4" />
                  <p className="text-sky-600 mb-4">No clothing listings yet</p>
                  <Button asChild className="bg-sky-600 hover:bg-sky-700">
                    <Link href="/dashboard/apartment/listings/new">Create Your First Listing</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Requests */}
          <Card className="border-sky-200 bg-white/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-sky-900">Recent Requests</CardTitle>
              <CardDescription>NGOs interested in your donations</CardDescription>
            </CardHeader>
            <CardContent>
              {requests && requests.length > 0 ? (
                <div className="space-y-4">
                  {requests.slice(0, 5).map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-sky-900">{request.profiles?.name}</h4>
                        <p className="text-sm text-sky-700">
                          Requested {request.requested_quantity} items from "{request.clothing_listings?.title}"
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
                                : "secondary"
                          }
                        >
                          {request.status}
                        </Badge>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/apartment/requests/${request.id}`}>View</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                  {requests.length > 5 && (
                    <Button variant="outline" className="w-full bg-transparent" asChild>
                      <Link href="/dashboard/apartment/requests">View All Requests</Link>
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-sky-300 mx-auto mb-4" />
                  <p className="text-sky-600">No requests yet</p>
                  <p className="text-sm text-sky-500">NGOs will be able to request your clothing donations</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
