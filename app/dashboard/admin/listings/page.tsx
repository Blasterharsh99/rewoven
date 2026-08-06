import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth/session"
import { getProfileById } from "@/lib/db/queries"
import { query, queryOne } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Heart, Package, MapPin, Calendar, User, Search, Filter } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default async function AdminListingsPage({
  searchParams,
}: {
  searchParams: { search?: string; status?: string; type?: string }
}) {
  const session = await getSession()
  if (!session) {
    redirect("/auth/login")
  }

  // Get user profile
  const profile = await getProfileById(session.userId)

  if (!profile || profile.user_type !== "admin") {
    redirect("/auth/login")
  }

  // Build query with filters
  const conditions: string[] = []
  const values: unknown[] = []
  let idx = 1

  if (searchParams.search) {
    conditions.push(`cl.title ILIKE $${idx++}`)
    values.push(`%${searchParams.search}%`)
  }

  if (searchParams.status && searchParams.status !== "all") {
    conditions.push(`cl.available = $${idx++}`)
    values.push(searchParams.status === "available")
  }

  if (searchParams.type && searchParams.type !== "all") {
    conditions.push(`cl.clothing_type = $${idx++}`)
    values.push(searchParams.type)
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ""

  const listings = await query(
    `SELECT cl.*,
       json_build_object('name', p.name, 'contact_person', p.contact_person, 'city', p.city, 'state', p.state) AS profiles,
       COUNT(cr.id) AS request_count
     FROM clothing_listings cl
     JOIN profiles p ON p.id = cl.apartment_id
     LEFT JOIN clothing_requests cr ON cr.listing_id = cl.id
     ${where}
     GROUP BY cl.id, p.id
     ORDER BY cl.created_at DESC`,
    values
  )

  // Get statistics
  const [totalRow, availableRow, unavailableRow] = await Promise.all([
    queryOne<{ count: string }>("SELECT COUNT(*) FROM clothing_listings", []),
    queryOne<{ count: string }>("SELECT COUNT(*) FROM clothing_listings WHERE available = TRUE", []),
    queryOne<{ count: string }>("SELECT COUNT(*) FROM clothing_listings WHERE available = FALSE", []),
  ])

  const totalListings = parseInt(totalRow?.count ?? "0")
  const availableListings = parseInt(availableRow?.count ?? "0")
  const unavailableListings = parseInt(unavailableRow?.count ?? "0")

  // Get unique clothing types for filter
  const typeRows = await query("SELECT DISTINCT clothing_type FROM clothing_listings WHERE clothing_type IS NOT NULL", [])
  const uniqueTypes = typeRows.map((r: any) => r.clothing_type)

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/rewoven-logo.jpeg" alt="Rewoven Logo" className="h-12 w-12 rounded-full object-cover" />
            <h1 className="text-2xl font-bold text-sky-900">Rewoven Admin</h1>
          </div>
          <Button variant="outline" asChild>
            <Link href="/dashboard/admin">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Dashboard
            </Link>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-sky-900 mb-2">All Listings</h2>
          <p className="text-sky-700">View and manage all clothing donations across the platform</p>
        </div>

        {/* Statistics */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-sky-200 bg-white/60 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-sky-700">Total Listings</CardTitle>
              <Package className="h-4 w-4 text-sky-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-sky-900">{totalListings || 0}</div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50/60 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700">Available</CardTitle>
              <Package className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-800">{availableListings || 0}</div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 bg-gray-50/60 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Unavailable</CardTitle>
              <Package className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-800">{unavailableListings || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-sky-200 bg-white/60 backdrop-blur-sm mb-6">
          <CardHeader>
            <CardTitle className="text-sky-900 flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form method="GET" className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sky-500 h-4 w-4" />
                  <Input
                    name="search"
                    placeholder="Search listings..."
                    defaultValue={searchParams.search}
                    className="pl-10 border-sky-200 focus:border-sky-400"
                  />
                </div>
              </div>

              <Select name="status" defaultValue={searchParams.status || "all"}>
                <SelectTrigger className="w-[150px] border-sky-200">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="unavailable">Unavailable</SelectItem>
                </SelectContent>
              </Select>

              <Select name="type" defaultValue={searchParams.type || "all"}>
                <SelectTrigger className="w-[150px] border-sky-200">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {uniqueTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button type="submit" className="bg-sky-600 hover:bg-sky-700">
                Apply Filters
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Listings */}
        {listings && listings.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <Card key={listing.id} className="border-sky-200 bg-white/60 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-sky-900 text-lg line-clamp-2">{listing.title}</CardTitle>
                      <CardDescription className="mt-1 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {listing.profiles?.name}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Badge variant={listing.available ? "default" : "secondary"}>
                        {listing.available ? "Available" : "Unavailable"}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {listing.clothing_requests?.[0]?.count || 0} requests
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Image */}
                    {listing.image_url && (
                      <div className="relative h-32 w-full rounded-lg overflow-hidden">
                        <Image
                          src={listing.image_url || "/placeholder.svg"}
                          alt={listing.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}

                    {/* Details */}
                    <div className="text-sm text-sky-700">
                      <div className="flex items-center gap-1 mb-1">
                        <Package className="h-3 w-3" />
                        <span className="font-medium">Type:</span> {listing.clothing_type}
                      </div>
                      <div className="flex items-center gap-1 mb-1">
                        <span className="font-medium">Quantity:</span> {listing.quantity} items
                      </div>
                      <div className="flex items-center gap-1 mb-1">
                        <User className="h-3 w-3" />
                        <span className="font-medium">Contact:</span> {listing.profiles?.contact_person}
                      </div>
                    </div>

                    {/* Description */}
                    {listing.description && (
                      <div className="text-xs text-sky-600 bg-sky-50 p-2 rounded line-clamp-3">
                        {listing.description}
                      </div>
                    )}

                    {/* Location */}
                    <div className="text-xs text-sky-500">
                      <strong>Location:</strong> {listing.profiles?.city}, {listing.profiles?.state}
                    </div>

                    {/* Date */}
                    <div className="text-xs text-sky-600 border-t pt-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Posted: {new Date(listing.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-sky-200 bg-white/60 backdrop-blur-sm">
            <CardContent className="text-center py-12">
              <Package className="h-16 w-16 text-sky-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-sky-900 mb-2">No Listings Found</h3>
              <p className="text-sky-600">
                {searchParams.search || searchParams.status || searchParams.type
                  ? "Try adjusting your filters to see more results."
                  : "Clothing listings will appear here once apartments start posting donations."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
