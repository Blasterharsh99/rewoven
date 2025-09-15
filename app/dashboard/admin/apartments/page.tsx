import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Heart, Building2, MapPin, Phone, User, Calendar } from "lucide-react"
import Link from "next/link"

export default async function AdminApartmentsPage() {
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

  // Get all apartments with their details and listing counts
 const { data: apartments } = await supabase
  .from("apartment_with_listing_counts")
  .select("*")
  .order("created_at", { ascending: false }) 

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="h-8 w-8 text-emerald-600" />
            <h1 className="text-2xl font-bold text-emerald-900">Rewoven Admin</h1>
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
          <h2 className="text-3xl font-bold text-emerald-900 mb-2">Apartment Management</h2>
          <p className="text-emerald-700">View and manage all registered apartment communities</p>
        </div>

        {apartments && apartments.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {apartments.map((apartment) => (
              <Card key={apartment.id} className="border-emerald-200 bg-white/60 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-emerald-900 text-lg">
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
                    <div className="text-sm text-emerald-700">
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

                    <div className="text-xs text-emerald-600 border-t pt-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Registered: {new Date(apartment.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="text-xs text-emerald-500 bg-emerald-50 p-2 rounded">
                      <strong>Address:</strong> {apartment.address}
                    </div>

                    {apartment.apartment_details?.[0]?.society_registration_number && (
                      <div className="text-xs text-emerald-600">
                        <strong>Registration:</strong> {apartment.apartment_details[0].society_registration_number}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-emerald-200 bg-white/60 backdrop-blur-sm">
            <CardContent className="text-center py-12">
              <Building2 className="h-16 w-16 text-emerald-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-emerald-900 mb-2">No Apartments Registered</h3>
              <p className="text-emerald-600">Apartment communities will appear here once they sign up.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
