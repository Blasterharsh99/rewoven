import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Heart, TrendingUp, Calendar, Package } from "lucide-react"
import Link from "next/link"

export default async function AdminRequestsPage() {
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

  // Get all requests with details
const { data: requests, error: requestsError } = await supabase
  .from("clothing_requests")
  .select("*")
console.log("Fetched Requests:", requests)
console.log("Requests Error:", requestsError)

  const statusCounts = {
    pending: requests?.filter((r) => r.status === "pending").length || 0,
    approved: requests?.filter((r) => r.status === "approved").length || 0,
    rejected: requests?.filter((r) => r.status === "rejected").length || 0,
    completed: requests?.filter((r) => r.status === "completed").length || 0,
  }

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
          <h2 className="text-3xl font-bold text-emerald-900 mb-2">Request Monitoring</h2>
          <p className="text-emerald-700">Monitor all donation requests across the platform</p>
        </div>

        {/* Status Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-yellow-200 bg-yellow-50/60 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-yellow-700">Pending</CardTitle>
              <TrendingUp className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-800">{statusCounts.pending}</div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50/60 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">Approved</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-800">{statusCounts.approved}</div>
            </CardContent>
          </Card>

          <Card className="border-emerald-200 bg-emerald-50/60 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-700">Completed</CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-800">{statusCounts.completed}</div>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50/60 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-700">Rejected</CardTitle>
              <TrendingUp className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-800">{statusCounts.rejected}</div>
            </CardContent>
          </Card>
        </div>

        {/* Requests List */}
        {requests && requests.length > 0 ? (
          <div className="space-y-4">
            {requests.map((request) => (
              <Card key={request.id} className="border-emerald-200 bg-white/60 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-emerald-900 text-lg">
                        {request.ngo_profiles?.name} → {request.apartment_profiles?.name}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Request for: {request.clothing_listings?.title}
                      </CardDescription>
                    </div>
                    <Badge
                      variant={
                        request.status === "pending"
                          ? "secondary"
                          : request.status === "approved"
                            ? "default"
                            : request.status === "completed"
                              ? "default"
                              : "outline"
                      }
                    >
                      {request.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-emerald-700">
                        <strong>NGO Contact:</strong> {request.ngo_profiles?.contact_person}
                      </p>
                      <p className="text-emerald-600">
                        {request.ngo_profiles?.city}, {request.ngo_profiles?.state}
                      </p>
                    </div>
                    <div>
                      <p className="text-emerald-700">
                        <strong>Apartment Contact:</strong> {request.apartment_profiles?.contact_person}
                      </p>
                      <p className="text-emerald-600">
                        {request.apartment_profiles?.city}, {request.apartment_profiles?.state}
                      </p>
                    </div>
                    <div>
                      <p className="text-emerald-700 flex items-center gap-1">
                        <Package className="h-3 w-3" />
                        <strong>Requested:</strong> {request.requested_quantity} items
                      </p>
                      <p className="text-emerald-600">Type: {request.clothing_listings?.clothing_type}</p>
                    </div>
                    <div>
                      <p className="text-emerald-700 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <strong>Date:</strong> {new Date(request.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-emerald-600">Updated: {new Date(request.updated_at).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {request.message && (
                    <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                      <p className="text-sm text-emerald-700">
                        <strong>NGO Message:</strong>
                      </p>
                      <p className="text-emerald-600 mt-1">{request.message}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-emerald-200 bg-white/60 backdrop-blur-sm">
            <CardContent className="text-center py-12">
              <TrendingUp className="h-16 w-16 text-emerald-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-emerald-900 mb-2">No Requests Yet</h3>
              <p className="text-emerald-600">Donation requests will appear here as NGOs make them.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
