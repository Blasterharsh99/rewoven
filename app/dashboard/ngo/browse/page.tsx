import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Heart, MapPin, Package, Search } from "lucide-react"
import Link from "next/link"

export default async function BrowseListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; type?: string }>
}) {
  const supabase = await createClient()
  const params = await searchParams

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  if (!profile || profile.user_type !== "ngo") {
    redirect("/auth/login")
  }

  // Build query for listings
  let query = supabase
    .from("clothing_listings")
    .select(`
      *,
      profiles!clothing_listings_apartment_id_fkey(name, city, state, contact_person, phone)
    `)
    .eq("available", true)

  // Apply search filter
  if (params.search) {
    query = query.or(`title.ilike.%${params.search}%,description.ilike.%${params.search}%`)
  }

  // Apply type filter
  if (params.type && params.type !== "all") {
    query = query.eq("clothing_type", params.type)
  }

  const { data: listings } = await query.order("created_at", { ascending: false })

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
            <Link href="/dashboard/ngo">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Dashboard
            </Link>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-emerald-900 mb-2">Browse Available Donations</h2>
          <p className="text-emerald-700">Find clothing donations from apartment communities near you</p>
        </div>

        {/* Search and Filters */}
        <Card className="border-emerald-200 bg-white/60 backdrop-blur-sm mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-500 h-4 w-4" />
                  <Input
                    placeholder="Search donations..."
                    className="pl-10"
                    defaultValue={params.search || ""}
                    name="search"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant={!params.type || params.type === "all" ? "default" : "outline"} asChild>
                  <Link href="/dashboard/ngo/browse">All</Link>
                </Button>
                <Button variant={params.type === "men" ? "default" : "outline"} asChild>
                  <Link href="/dashboard/ngo/browse?type=men">Men</Link>
                </Button>
                <Button variant={params.type === "women" ? "default" : "outline"} asChild>
                  <Link href="/dashboard/ngo/browse?type=women">Women</Link>
                </Button>
                <Button variant={params.type === "children" ? "default" : "outline"} asChild>
                  <Link href="/dashboard/ngo/browse?type=children">Children</Link>
                </Button>
                <Button variant={params.type === "mixed" ? "default" : "outline"} asChild>
                  <Link href="/dashboard/ngo/browse?type=mixed">Mixed</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Listings Grid */}
        {listings && listings.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <Card key={listing.id} className="border-emerald-200 bg-white/60 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-emerald-900 text-lg">{listing.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {listing.clothing_type} • {listing.quantity} items
                      </CardDescription>
                    </div>
                    <Badge variant="default">Available</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm text-emerald-700">
                      <p>
                        <strong>Condition:</strong> {listing.condition}
                      </p>
                      {listing.size_range && (
                        <p>
                          <strong>Size Range:</strong> {listing.size_range}
                        </p>
                      )}
                    </div>

                    {listing.description && (
                      <p className="text-sm text-emerald-600 line-clamp-2">{listing.description}</p>
                    )}

                    <div className="flex items-center gap-1 text-sm text-emerald-600">
                      <MapPin className="h-4 w-4" />
                      <span>
                        {listing.profiles?.name} • {listing.profiles?.city}, {listing.profiles?.state}
                      </span>
                    </div>

                    <div className="text-xs text-emerald-500">
                      Posted: {new Date(listing.created_at).toLocaleDateString()}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" asChild className="flex-1 bg-transparent">
                        <Link href={`/dashboard/ngo/listings/${listing.id}`}>View Details</Link>
                      </Button>
                      <Button size="sm" asChild className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                        <Link href={`/dashboard/ngo/listings/${listing.id}/request`}>Request</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-emerald-200 bg-white/60 backdrop-blur-sm">
            <CardContent className="text-center py-12">
              <Package className="h-16 w-16 text-emerald-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-emerald-900 mb-2">No Donations Found</h3>
              <p className="text-emerald-600 mb-6">
                {params.search || params.type
                  ? "Try adjusting your search criteria or check back later."
                  : "No clothing donations are currently available. Check back later for new listings."}
              </p>
              {(params.search || params.type) && (
                <Button variant="outline" asChild>
                  <Link href="/dashboard/ngo/browse">Clear Filters</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
