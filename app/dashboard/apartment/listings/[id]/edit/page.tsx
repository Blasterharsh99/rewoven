"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Heart, Trash2 } from "lucide-react"
import Link from "next/link"

export default function EditListingPage({ params }: { params: { id: string } }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    clothing_type: "",
    quantity: "",
    condition: "",
    size_range: "",
    pickup_instructions: "",
    available: true,
  })
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const router = useRouter()

  // Load existing listing data
  useEffect(() => {
    const loadListing = async () => {
      try {
        const res = await fetch(`/api/listings/${params.id}`)
        if (!res.ok) throw new Error("Listing not found")
        const { data: listing } = await res.json()

        setFormData({
          title: listing.title,
          description: listing.description || "",
          clothing_type: listing.clothing_type,
          quantity: listing.quantity.toString(),
          condition: listing.condition,
          size_range: listing.size_range || "",
          pickup_instructions: listing.pickup_instructions || "",
          available: listing.available,
        })
      } catch (error: unknown) {
        setError(error instanceof Error ? error.message : "Failed to load listing")
        router.push("/dashboard/apartment/listings")
      } finally {
        setIsLoadingData(false)
      }
    }

    loadListing()
  }, [params.id, router])

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/listings/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || null,
          clothing_type: formData.clothing_type,
          quantity: parseInt(formData.quantity) || 1,
          condition: formData.condition,
          size_range: formData.size_range || null,
          pickup_instructions: formData.pickup_instructions || null,
          available: formData.available,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to update listing")

      router.push(`/dashboard/apartment/listings/${params.id}`)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this listing? This action cannot be undone.")) {
      return
    }

    setIsDeleting(true)
    setError(null)

    try {
      const res = await fetch(`/api/listings/${params.id}`, {
        method: "DELETE",
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to delete listing")

      router.push("/dashboard/apartment/listings")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Failed to delete listing")
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-emerald-700">Loading listing...</p>
        </div>
      </div>
    )
  }

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
            <Link href={`/dashboard/apartment/listings/${params.id}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Listing
            </Link>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="border-emerald-200 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl text-emerald-900">Edit Clothing Listing</CardTitle>
              <CardDescription>Update the details of your clothing donation</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Winter Jackets for Children"
                      required
                      value={formData.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the clothing items, their condition, and any special notes"
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Clothing Type *</Label>
                      <Select
                        value={formData.clothing_type}
                        onValueChange={(value) => handleInputChange("clothing_type", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="men">Men's Clothing</SelectItem>
                          <SelectItem value="women">Women's Clothing</SelectItem>
                          <SelectItem value="children">Children's Clothing</SelectItem>
                          <SelectItem value="mixed">Mixed/All Types</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="quantity">Quantity *</Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        required
                        value={formData.quantity}
                        onChange={(e) => handleInputChange("quantity", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Condition *</Label>
                      <Select
                        value={formData.condition}
                        onValueChange={(value) => handleInputChange("condition", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="excellent">Excellent</SelectItem>
                          <SelectItem value="good">Good</SelectItem>
                          <SelectItem value="fair">Fair</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="size_range">Size Range</Label>
                      <Input
                        id="size_range"
                        placeholder="e.g., S-M, L-XL, Mixed"
                        value={formData.size_range}
                        onChange={(e) => handleInputChange("size_range", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="pickup_instructions">Pickup Instructions</Label>
                    <Textarea
                      id="pickup_instructions"
                      placeholder="Provide instructions for NGOs on how to collect the items"
                      value={formData.pickup_instructions}
                      onChange={(e) => handleInputChange("pickup_instructions", e.target.value)}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="available"
                      checked={formData.available}
                      onCheckedChange={(checked) => handleInputChange("available", checked)}
                    />
                    <Label htmlFor="available">Available for requests</Label>
                  </div>

                  {error && <p className="text-sm text-red-600">{error}</p>}

                  <div className="flex gap-4">
                    <Button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700" disabled={isLoading}>
                      {isLoading ? "Updating..." : "Update Listing"}
                    </Button>
                    <Button type="button" variant="outline" asChild>
                      <Link href={`/dashboard/apartment/listings/${params.id}`}>Cancel</Link>
                    </Button>
                  </div>

                  <div className="border-t pt-6">
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="w-full"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {isDeleting ? "Deleting..." : "Delete Listing"}
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
