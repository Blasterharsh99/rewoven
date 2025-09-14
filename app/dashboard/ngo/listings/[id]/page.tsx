import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Heart, MapPin, Phone, User, Calendar, Package } from "lucide-react"
import Link from "next/link"

export default async function ListingDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  if (!profile || profile.user_type !== "ngo") {
    redirect("/auth/login")
  }

  // Get listing details
  const { data: listing } = await supabase
    .from("clothing_listings")
    .select(`
      *,
      profiles!clothing_listings_apartment_id_fkey(name, city, state, contact_person, phone, address),
      apartment_details!inner(apartment_name, total_units)
    `)
    .eq("id", id)
    .single()

  if (!listing) {
    redirect("/dashboard/ngo/browse")
  }

  // Check if NGO has already requested this listing
  const { data: existingRequest } = await supabase
    .from("clothing_requests")
    .select("*")
    .eq("ngo_id", profile.id)
    .eq("listing_id", listing.id)
    .single()

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="h-8 w-8 text-emerald-600" />
            <h1 className="text-2xl font-bold text-emerald-900">Rewoven</h1>
          </div>
          <Button variant="outline" asChild>
            <Link href="/dashboard/ngo/browse">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Browse
            </Link>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <Card className="border-emerald-200 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-2xl text-emerald-900 mb-2">{listing.title}</CardTitle>
                      <div className="flex items-center gap-4 text-sm text-emerald-700">
                        <span className="flex items-center gap-1">
                          <Package className="h-4 w-4" />
                          {listing.clothing_type}
                        </span>
                        <span>{listing.quantity} items</span>
                        <span>Condition: {listing.condition}</span>
                      </div>
                    </div>
                    <Badge variant={listing.available ? "default" : "secondary"} className="text-sm">
                      {listing.available ? "Available" : "Unavailable"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {listing.description && (
                      <div>
                        <h3 className="font-semibold text-emerald-900 mb-2">Description</h3>
                        <p className="text-emerald-700">{listing.description}</p>
                      </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-4">
                      {listing.size_range && (
                        <div>
                          <h4 className="font-medium text-emerald-900">Size Range</h4>
                          <p className="text-emerald-700">{listing.size_range}</p>
                        </div>
                      )}
                      <div>
                        <h4 className="font-medium text-emerald-900">Posted</h4>
                        <p className="text-emerald-700 flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(listing.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {listing.pickup_instructions && (
                      <div>
                        <h3 className="font-semibold text-emerald-900 mb-2">Pickup Instructions</h3>
                        <p className="text-emerald-700 bg-emerald-50 p-3 rounded-lg">{listing.pickup_instructions}</p>
                      </div>
                    )}

                    {/* Request Status */}
                    {existingRequest && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="font-semibold text-blue-900 mb-2">Your Request Status</h3>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              existingRequest.status === "approved"
                                ? "default"
                                : existingRequest.status === "pending"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {existingRequest.status}
                          </Badge>
                          <span className="text-sm text-blue-700">
                            Requested {existingRequest.requested_quantity} items on{" "}
                            {new Date(existingRequest.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {existingRequest.message && (
                          <p className="text-sm text-blue-600 mt-2">
                            <strong>Your message:</strong> {existingRequest.message}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Apartment Info */}
              <Card className="border-emerald-200 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-emerald-900">Apartment Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-emerald-900">Apartment</h4>
                      <p className="text-emerald-700">{listing.apartment_details?.apartment_name}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-emerald-900 flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        Location
                      </h4>
                      <p className="text-emerald-700">
                        {listing.profiles?.city}, {listing.profiles?.state}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-emerald-900 flex items-center gap-1">
                        <User className="h-4 w-4" />
                        Contact Person
                      </h4>
                      <p className="text-emerald-700">{listing.profiles?.contact_person}</p>
                    </div>
                    {listing.profiles?.phone && (
                      <div>
                        <h4 className="font-medium text-emerald-900 flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          Phone
                        </h4>
                        <p className="text-emerald-700">{listing.profiles?.phone}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Action Button */}
              <Card className="border-emerald-200 bg-white/80 backdrop-blur-sm">
                <CardContent className="pt-6">
                  {listing.available ? (
                    existingRequest ? (
                      <div className="text-center">
                        <p className="text-sm text-emerald-600 mb-3">You have already requested this donation</p>
                        <Button variant="outline" asChild className="w-full bg-transparent">
                          <Link href={`/dashboard/ngo/requests/${existingRequest.id}`}>View Request</Link>
                        </Button>
                      </div>
                    ) : (
                      <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700">
                        <Link href={`/dashboard/ngo/listings/${listing.id}/request`}>Request This Donation</Link>
                      </Button>
                    )
                  ) : (
                    <Button disabled className="w-full">
                      No Longer Available
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
