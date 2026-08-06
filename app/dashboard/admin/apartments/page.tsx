import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth/session"
import { getProfileById } from "@/lib/db/queries"
import { query } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Heart, Building2, MapPin, Phone, User, Calendar } from "lucide-react"
import Link from "next/link"

export default async function AdminApartmentsPage() {
  const session = await getSession()
  if (!session) {
    redirect("/auth/login")
  }

  // Get user profile
  const profile = await getProfileById(session.userId)

  if (!profile || profile.user_type !== "admin") {
    redirect("/auth/login")
  }

  // Get all apartments with their details and listing counts
  const apartments = await query(
    `SELECT p.*, row_to_json(ad.*) AS apartment_details, COUNT(cl.id) AS listing_count
     FROM profiles p
     LEFT JOIN apartment_details ad ON ad.profile_id = p.id
     LEFT JOIN clothing_listings cl ON cl.apartment_id = p.id
     WHERE p.user_type = 'apartment'
     GROUP BY p.id, ad.id
     ORDER BY p.created_at DESC`,
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
          <h2 className="text-3xl font-bold text-sky-900 mb-2">Apartment Management</h2>
          <p className="text-sky-700">View and manage all registered apartment communities</p>
        </div>

        {apartments && apartments.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {apartments.map((apartment) => (
              <Card key={apartment.id} className="border-sky-200 bg-white/60 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-sky-900 text-lg">
                        {apartment.apartment_details?.[0]?.apartment_name || apartment.name}
                      </CardTitle>
                      <CardDescription className="mt-1 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {apartment.city}, {apartment.state}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {apartment.listing_count || 0} listings
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm text-sky-700">
                      <div className="flex items-center gap-1 mb-1">
                        <User className="h-3 w-3" />
                        <span className="font-medium">Contact:</span> {apartment.contact_person}
                      </div>
                      {apartment.phone && (
                        <div className="flex items-center gap-1 mb-1">
                          <Phone className="h-3 w-3" />
                          <span className="font-medium">Phone:</span> {apartment.phone}
                        </div>
                      )}
                      {apartment.apartment_details?.[0]?.total_units && (
                        <div className="flex items-center gap-1 mb-1">
                          <Building2 className="h-3 w-3" />
                          <span className="font-medium">Units:</span> {apartment.apartment_details[0].total_units}
                        </div>
                      )}
                    </div>

                    <div className="text-xs text-sky-600 border-t pt-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Registered: {new Date(apartment.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="text-xs text-sky-500 bg-sky-50 p-2 rounded">
                      <strong>Address:</strong> {apartment.address}
                    </div>

                    {apartment.apartment_details?.[0]?.society_registration_number && (
                      <div className="text-xs text-sky-600">
                        <strong>Registration:</strong> {apartment.apartment_details[0].society_registration_number}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-sky-200 bg-white/60 backdrop-blur-sm">
            <CardContent className="text-center py-12">
              <Building2 className="h-16 w-16 text-sky-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-sky-900 mb-2">No Apartments Registered</h3>
              <p className="text-sky-600">Apartment communities will appear here once they sign up.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
