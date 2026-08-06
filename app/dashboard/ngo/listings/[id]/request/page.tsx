"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Heart } from "lucide-react"
import Link from "next/link"

export default function RequestDonationPage({ params }: { params: Promise<{ id: string }> }) {
  const [listingId, setListingId] = useState<string>("")
  const [listing, setListing] = useState<any>(null)
  const [formData, setFormData] = useState({
    requested_quantity: "",
    message: "",
  })
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params
      setListingId(resolvedParams.id)
    }
    getParams()
  }, [params])

  useEffect(() => {
    if (!listingId) return

    const fetchListing = async () => {
      const res = await fetch(`/api/listings/${listingId}`)
      if (res.ok) {
        const { data } = await res.json()
        if (data) {
          setListing(data)
          setFormData((prev) => ({ ...prev, requested_quantity: data.quantity.toString() }))
        }
      }
    }

    fetchListing()
  }, [listingId])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const requestedQty = parseInt(formData.requested_quantity)
      if (requestedQty <= 0 || requestedQty > listing.quantity) {
        throw new Error(`Requested quantity must be between 1 and ${listing.quantity}`)
      }

      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listing_id: listingId,
          requested_quantity: requestedQty,
          message: formData.message || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to submit request")

      router.push(`/dashboard/ngo/listings/${listingId}`)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  if (!listing) {
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
            <Link href={`/dashboard/ngo/listings/${listingId}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Listing
            </Link>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="border-sky-200 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl text-sky-900">Request Donation</CardTitle>
              <CardDescription>Send a request to {listing.profiles?.name} for their clothing donation</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Listing Summary */}
              <div className="bg-sky-50 border border-sky-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-sky-900 mb-2">{listing.title}</h3>
                <div className="text-sm text-sky-700 space-y-1">
                  <p>
                    <strong>Type:</strong> {listing.clothing_type}
                  </p>
                  <p>
                    <strong>Available Quantity:</strong> {listing.quantity} items
                  </p>
                  <p>
                    <strong>Condition:</strong> {listing.condition}
                  </p>
                  {listing.size_range && (
                    <p>
                      <strong>Size Range:</strong> {listing.size_range}
                    </p>
                  )}
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="requested_quantity">Requested Quantity *</Label>
                    <Input
                      id="requested_quantity"
                      type="number"
                      min="1"
                      max={listing.quantity}
                      required
                      value={formData.requested_quantity}
                      onChange={(e) => handleInputChange("requested_quantity", e.target.value)}
                    />
                    <p className="text-xs text-sky-600">Maximum available: {listing.quantity} items</p>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="message">Message to Apartment</Label>
                    <Textarea
                      id="message"
                      placeholder="Introduce your NGO and explain how you plan to use these donations..."
                      rows={4}
                      value={formData.message}
                      onChange={(e) => handleInputChange("message", e.target.value)}
                    />
                    <p className="text-xs text-sky-600">
                      A brief message about your NGO and intended use will help build trust
                    </p>
                  </div>

                  {error && <p className="text-sm text-red-600">{error}</p>}

                  <div className="flex gap-4">
                    <Button type="submit" className="flex-1 bg-sky-600 hover:bg-sky-700" disabled={isLoading}>
                      {isLoading ? "Sending Request..." : "Send Request"}
                    </Button>
                    <Button type="button" variant="outline" asChild>
                      <Link href={`/dashboard/ngo/listings/${listingId}`}>Cancel</Link>
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
