"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Heart, MessageCircle, Phone, User, Calendar } from "lucide-react"
import Link from "next/link"

export default function RequestDetailsPage({ params }: { params: { id: string } }) {
  const requestId = params.id
  const [request, setRequest] = useState<any>(null)
  const [ngoDetails, setNgoDetails] = useState<any>(null)
  const [profileDetails, setProfileDetails] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()


  useEffect(() => {
    if (!requestId) return

    const fetchRequest = async () => {
      const res = await fetch(`/api/requests/${requestId}`)
      if (!res.ok) {
        setError("Request not found")
        return
      }
      const { data } = await res.json()
      if (data) {
        setRequest(data)
        setNgoDetails(data.clothing_listings)
        setProfileDetails({ ...data.ngo_profiles, ...data.ngo_details })
      }
    }

    fetchRequest()
  }, [requestId])


  const handleStatusUpdate = async (newStatus: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/requests/${requestId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to update status")

      setRequest((prev: any) => ({ ...prev, status: newStatus }))
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  if (!request) {
  return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/rewoven-logo.jpeg" alt="Rewoven Logo" className="h-12 w-12 rounded-full object-cover" />
            <h1 className="text-2xl font-bold text-sky-900">Rewoven</h1>
          </div>
          <Button variant="outline" asChild>
            <Link href="/dashboard/apartment/requests">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Requests
            </Link>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Request Details */}
              <Card className="border-sky-200 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-2xl text-sky-900 mb-2">
                        Request from {profileDetails?.ngo_name || profileDetails?.name}
                      </CardTitle>
                      <CardDescription>For: {ngoDetails?.title}</CardDescription>
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
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-sky-900">Requested Quantity</h4>
                        <p className="text-sky-700">
                          {request.requested_quantity} out of {ngoDetails?.quantity} available items
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-sky-900 flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Request Date
                        </h4>
                        <p className="text-sky-700">{new Date(request.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {request.message && (
                      <div>
                        <h4 className="font-medium text-sky-900 mb-2">Message from NGO</h4>
                        <div className="bg-sky-50 border border-sky-200 rounded-lg p-3">
                          <p className="text-sky-700">{request.message}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Listing Details */}
              <Card className="border-sky-200 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-sky-900">Clothing Listing Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-sky-900">Type</h4>
                        <p className="text-sky-700">{ngoDetails?.clothing_type}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-sky-900">Condition</h4>
                        <p className="text-sky-700">{ngoDetails?.condition}</p>
                      </div>
                    </div>
                    {ngoDetails?.size_range && (
                      <div>
                        <h4 className="font-medium text-sky-900">Size Range</h4>
                        <p className="text-sky-700">{ngoDetails?.size_range}</p>
                      </div>
                    )}
                    {ngoDetails?.description && (
                      <div>
                        <h4 className="font-medium text-sky-900">Description</h4>
                        <p className="text-sky-700">{ngoDetails?.description}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* NGO Info */}
              <Card className="border-sky-200 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-sky-900">NGO Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-sky-900">Organization</h4>
                      <p className="text-sky-700">{profileDetails?.ngo_name}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sky-900">Registration</h4>
                      <p className="text-sky-700">{profileDetails?.registration_number}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sky-900 flex items-center gap-1">
                        <User className="h-4 w-4" />
                        Contact Person
                      </h4>
                      <p className="text-sky-700">{profileDetails?.contact_person}</p>
                    </div>
                    {profileDetails?.phone && (
                      <div>
                        <h4 className="font-medium text-sky-900 flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          Phone
                        </h4>
                        <p className="text-sky-700">{profileDetails?.phone}</p>
                      </div>
                    )}
                    <div>
                      <h4 className="font-medium text-sky-900">Location</h4>
                      <p className="text-sky-700">
                        {profileDetails?.city}, {profileDetails?.state}
                      </p>
                    </div>
                    {profileDetails?.focus_areas && (
                      <div>
                        <h4 className="font-medium text-sky-900">Focus Areas</h4>
                        <p className="text-sky-700">{Array.isArray(profileDetails?.focus_areas) ? profileDetails.focus_areas.join(", ") : profileDetails.focus_areas}</p>
                      </div>
                    )}
                    {profileDetails?.website && (
                      <div>
                        <h4 className="font-medium text-sky-900">Website</h4>
                        <a
                          href={profileDetails?.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sky-600 hover:text-sky-700 underline"
                        >
                          {profileDetails?.website}
                        </a>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card className="border-sky-200 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-sky-900">Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {request.status === "pending" && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-sky-900">Update Status</label>
                      <Select onValueChange={handleStatusUpdate} disabled={isLoading}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select action" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="approved">Approve Request</SelectItem>
                          <SelectItem value="rejected">Reject Request</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {request.status === "approved" && (
                    <Button
                      onClick={() => handleStatusUpdate("completed")}
                      className="w-full bg-sky-600 hover:bg-sky-700"
                      disabled={isLoading}
                    >
                      Mark as Completed
                    </Button>
                  )}

                  <Button variant="outline" asChild className="w-full bg-transparent">
                    <Link href={`/dashboard/apartment/requests/${request.id}/messages`}>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Send Message
                    </Link>
                  </Button>

                  {error && <p className="text-sm text-red-600">{error}</p>}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
