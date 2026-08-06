import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth/session"
import { query } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, ArrowLeft, Heart, Package, Edit, Eye } from "lucide-react"
import Link from "next/link"

export default async function ListingsPage() {
  const session = await getSession()
  if (!session) {
    redirect("/auth/login")
  }

  // Get clothing listings
  const listings = await query(
    "SELECT * FROM clothing_listings WHERE apartment_id = $1 ORDER BY created_at DESC",
    [session.userId]
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/rewoven-logo.jpeg" alt="Rewoven Logo" className="h-12 w-12 rounded-full object-cover" />
            <h1 className="text-2xl font-bold text-sky-900">Rewoven</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/dashboard/apartment">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Link>
            </Button>
            <Button asChild className="bg-sky-600 hover:bg-sky-700">
              <Link href="/dashboard/apartment/listings/new">
                <Plus className="h-4 w-4 mr-2" />
                New Listing
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-sky-900 mb-2">Your Clothing Listings</h2>
          <p className="text-sky-700">Manage all your clothing donation listings</p>
        </div>

        {listings && listings.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <Card key={listing.id} className="border-sky-200 bg-white/60 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-sky-900 text-lg">{listing.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {listing.clothing_type} • {listing.quantity} items
                      </CardDescription>
                    </div>
                    <Badge variant={listing.available ? "default" : "secondary"}>
                      {listing.available ? "Available" : "Unavailable"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm text-sky-700">
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
                      <p className="text-sm text-sky-600 line-clamp-2">{listing.description}</p>
                    )}

                    <div className="text-xs text-sky-500">
                      Created: {new Date(listing.created_at).toLocaleDateString()}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" asChild className="flex-1 bg-transparent">
                        <Link href={`/dashboard/apartment/listings/${listing.id}`}>
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild className="flex-1 bg-transparent">
                        <Link href={`/dashboard/apartment/listings/${listing.id}/edit`}>
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Link>
                      </Button>
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
              <h3 className="text-xl font-semibold text-sky-900 mb-2">No Listings Yet</h3>
              <p className="text-sky-600 mb-6">Create your first clothing listing to start helping NGOs in need.</p>
              <Button asChild className="bg-sky-600 hover:bg-sky-700">
                <Link href="/dashboard/apartment/listings/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Listing
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
