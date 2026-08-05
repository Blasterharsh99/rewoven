import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth/session"
import { getProfileById } from "@/lib/db/queries"
import { query } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Heart, MessageCircle, Eye } from "lucide-react"
import Link from "next/link"

export default async function ApartmentRequestsPage() {
  const session = await getSession()
  if (!session) {
    redirect("/auth/login")
  }

  // Get user profile
  const profile = await getProfileById(session.userId)

  if (!profile || profile.user_type !== "apartment") {
    redirect("/auth/login")
  }

  // Get requests for apartment's listings
  const requests = await query(
    `SELECT cr.*,
       json_build_object(
         'id', p.id, 'name', p.name, 'contact_person', p.contact_person,
         'city', p.city, 'state', p.state, 'phone', p.phone
       ) AS profiles,
       json_build_object(
         'id', cl.id, 'title', cl.title, 'apartment_id', cl.apartment_id,
         'clothing_type', cl.clothing_type, 'quantity', cl.quantity
       ) AS clothing_listings
     FROM clothing_requests cr
     JOIN profiles p ON p.id = cr.ngo_id
     JOIN clothing_listings cl ON cl.id = cr.listing_id
     WHERE cl.apartment_id = $1
     ORDER BY cr.created_at DESC`,
    [profile.id]
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
          <Button variant="outline" asChild>
            <Link href="/dashboard/apartment">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Dashboard
            </Link>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-emerald-900 mb-2">Donation Requests</h2>
          <p className="text-emerald-700">Manage requests from NGOs for your clothing donations</p>
        </div>

       {requests && requests.length > 0 ? (
  <div className="space-y-6">
    {requests.map((request) => (
      <Card key={request.id} className="border-emerald-200 bg-white/60 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-emerald-900">
                {request.profiles?.ngo_details?.ngo_name || request.profiles?.name}
              </CardTitle>
              <CardDescription className="mt-1">
                Requested {request.requested_quantity} item{request.requested_quantity > 1 ? "s" : ""} from "{request.clothing_listings?.title}"
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
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
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-emerald-700">
                  <strong>Contact Person:</strong> {request.profiles?.contact_person || "N/A"}
                </p>
                {request.profiles?.phone && (
                  <p className="text-emerald-700">
                    <strong>Phone:</strong> {request.profiles.phone}
                  </p>
                )}
              </div>
              <div>
                <p className="text-emerald-700">
                  <strong>Focus Areas:</strong>{" "}
                  {request.profiles?.ngo_details?.focus_areas?.join(", ") || "Not specified"}
                </p>
                <p className="text-emerald-700">
                  <strong>Requested:</strong> {new Date(request.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            {request.message && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                <p className="text-sm text-emerald-700">
                  <strong>Message from NGO:</strong>
                </p>
                <p className="text-emerald-600 mt-1">{request.message}</p>
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild className="bg-transparent">
                <Link href={`/dashboard/apartment/requests/${request.id}`}>
                  <Eye className="h-4 w-4 mr-1" />
                  View Details
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild className="bg-transparent">
                <Link href={`/dashboard/apartment/requests/${request.id}/messages`}>
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Messages
                </Link>
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
      <MessageCircle className="h-16 w-16 text-emerald-300 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-emerald-900 mb-2">No Requests Yet</h3>
      <p className="text-emerald-600 mb-6">When NGOs request your clothing donations, they will appear here.</p>
      <Button variant="outline" asChild>
        <Link href="/dashboard/apartment/listings">View Your Listings</Link>
      </Button>
    </CardContent>
  </Card>
)}

      </div>
    </div>
  )
}
