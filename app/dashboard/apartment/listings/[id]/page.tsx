import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth/session"
import { query, queryOne } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Heart, Edit, Package, Calendar, User } from "lucide-react"
import Link from "next/link"

export default async function ListingDetailPage({ params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) {
    redirect("/auth/login")
  }

  // Get the specific listing (ensure user owns it)
  const listing = await queryOne(
    "SELECT * FROM clothing_listings WHERE id = $1 AND apartment_id = $2",
    [params.id, session.userId]
  )

  if (!listing) {
    redirect("/dashboard/apartment/listings")
  }

  // Get any requests for this listing
  const requests = await query(
    `SELECT cr.*,
       json_build_object('name', p.name, 'contact_person', p.contact_person) AS profiles
     FROM clothing_requests cr
     JOIN profiles p ON p.id = cr.ngo_id
     WHERE cr.listing_id = $1
     ORDER BY cr.created_at DESC`,
    [params.id]
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="h-8 w-8 text-emerald-600" />
            <h1 className="text-2xl font-bold text-emerald-900">Rewoven</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/dashboard/apartment/listings">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Listings
              </Link>
            </Button>
            <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
              <Link href={`/dashboard/apartment/listings/${listing.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Listing
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Main Listing Details */}
          <Card className="border-emerald-200 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-2xl text-emerald-900 mb-2">{listing.title}</CardTitle>
                  <CardDescription className="text-lg">
                    {listing.clothing_type} • {listing.quantity} items
                  </CardDescription>
                </div>
                <Badge variant={listing.available ? "default" : "secondary"} className="text-sm">
                  {listing.available ? "Available" : "Unavailable"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-emerald-700">
                    <Package className="h-5 w-5" />
                    <div>
                      <p className="font-medium">Condition</p>
                      <p className="text-sm capitalize">{listing.condition}</p>
                    </div>
                  </div>

                  {listing.size_range && (
                    <div className="flex items-center gap-2 text-emerald-700">
                      <User className="h-5 w-5" />
                      <div>
                        <p className="font-medium">Size Range</p>
                        <p className="text-sm">{listing.size_range}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-emerald-700">
                    <Calendar className="h-5 w-5" />
                    <div>
                      <p className="font-medium">Created</p>
                      <p className="text-sm">{new Date(listing.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {listing.description && (
                    <div>
                      <p className="font-medium text-emerald-900 mb-2">Description</p>
                      <p className="text-emerald-700 text-sm leading-relaxed">{listing.description}</p>
                    </div>
                  )}

                  {listing.pickup_instructions && (
                    <div>
                      <p className="font-medium text-emerald-900 mb-2">Pickup Instructions</p>
                      <p className="text-emerald-700 text-sm leading-relaxed">{listing.pickup_instructions}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Requests Section */}
          <Card className="border-emerald-200 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl text-emerald-900">Requests ({requests?.length || 0})</CardTitle>
              <CardDescription>NGOs that have requested this clothing donation</CardDescription>
            </CardHeader>
            <CardContent>
              {requests && requests.length > 0 ? (
                <div className="space-y-4">
                  {requests.map((request) => (
                    <div key={request.id} className="border border-emerald-100 rounded-lg p-4 bg-emerald-50/50">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium text-emerald-900">
                            {request.profiles?.organization_name || request.profiles?.full_name}
                          </h4>
                          <p className="text-sm text-emerald-600">
                            Requested on {new Date(request.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge
                          variant={
                            request.status === "approved"
                              ? "default"
                              : request.status === "rejected"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {request.status}
                        </Badge>
                      </div>

                      {request.message && <p className="text-sm text-emerald-700 mb-3">{request.message}</p>}

                      <div className="flex gap-2">
                        <Button size="sm" asChild>
                          <Link href={`/dashboard/apartment/requests/${request.id}`}>View Details</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-emerald-300 mx-auto mb-3" />
                  <p className="text-emerald-600">No requests yet for this listing</p>
                  <p className="text-sm text-emerald-500 mt-1">
                    NGOs will be able to request these items once they discover your listing
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
