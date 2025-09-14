import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Heart, Users, MapPin, Phone, User, Calendar, Globe, FileText } from "lucide-react"
import Link from "next/link"

export default async function AdminNGOsPage() {
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

  // Get all NGOs with their details and request counts
  const { data: ngos } = await supabase
    .from("profiles")
    .select(`
      *,
      ngo_details(*),
      clothing_requests(count)
    `)
    .eq("user_type", "ngo")
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
          <h2 className="text-3xl font-bold text-emerald-900 mb-2">NGO Management</h2>
          <p className="text-emerald-700">View and manage all registered NGO organizations</p>
        </div>

        {ngos && ngos.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ngos.map((ngo) => (
              <Card key={ngo.id} className="border-emerald-200 bg-white/60 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-emerald-900 text-lg">
                        {ngo.ngo_details?.[0]?.ngo_name || ngo.name}
                      </CardTitle>
                      <CardDescription className="mt-1 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {ngo.city}, {ngo.state}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {ngo.clothing_requests?.[0]?.count || 0} requests
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm text-emerald-700">
                      <div className="flex items-center gap-1 mb-1">
                        <User className="h-3 w-3" />
                        <span className="font-medium">Contact:</span> {ngo.contact_person}
                      </div>
                      {ngo.phone && (
                        <div className="flex items-center gap-1 mb-1">
                          <Phone className="h-3 w-3" />
                          <span className="font-medium">Phone:</span> {ngo.phone}
                        </div>
                      )}
                      {ngo.ngo_details?.[0]?.registration_number && (
                        <div className="flex items-center gap-1 mb-1">
                          <FileText className="h-3 w-3" />
                          <span className="font-medium">Reg. No:</span> {ngo.ngo_details[0].registration_number}
                        </div>
                      )}
                    </div>

                    {ngo.ngo_details?.[0]?.focus_areas && (
                      <div className="text-xs text-emerald-600">
                        <strong>Focus Areas:</strong>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {ngo.ngo_details[0].focus_areas.slice(0, 3).map((area: string, index: number) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {area}
                            </Badge>
                          ))}
                          {ngo.ngo_details[0].focus_areas.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{ngo.ngo_details[0].focus_areas.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="text-xs text-emerald-600 border-t pt-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Registered: {new Date(ngo.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="text-xs text-emerald-500 bg-emerald-50 p-2 rounded">
                      <strong>Address:</strong> {ngo.address}
                    </div>

                    {ngo.ngo_details?.[0]?.head_office_address && (
                      <div className="text-xs text-emerald-600">
                        <strong>Head Office:</strong> {ngo.ngo_details[0].head_office_address}
                      </div>
                    )}

                    {ngo.ngo_details?.[0]?.website && (
                      <div className="text-xs text-emerald-600">
                        <div className="flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          <a
                            href={ngo.ngo_details[0].website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-600 hover:text-emerald-700 underline"
                          >
                            Website
                          </a>
                        </div>
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
              <Users className="h-16 w-16 text-emerald-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-emerald-900 mb-2">No NGOs Registered</h3>
              <p className="text-emerald-600">NGO organizations will appear here once they sign up.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
