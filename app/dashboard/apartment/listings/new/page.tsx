"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Heart } from "lucide-react"
import Link from "next/link"

export default function NewListingPage() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    clothing_type: "",
    quantity: "",
    condition: "",
    size_range: "",
    pickup_instructions: "",
  })
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || null,
          clothing_type: formData.clothing_type,
          quantity: parseInt(formData.quantity) || 1,
          condition: formData.condition,
          size_range: formData.size_range || null,
          pickup_instructions: formData.pickup_instructions || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to create listing")

      router.push("/dashboard/apartment")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
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
            <Link href="/dashboard/apartment">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="border-sky-200 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl text-sky-900">Create New Clothing Listing</CardTitle>
              <CardDescription>Add details about the clothing items you want to donate</CardDescription>
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
                      placeholder="Provide instructions for NGOs on how to collect the items (timing, contact person, etc.)"
                      value={formData.pickup_instructions}
                      onChange={(e) => handleInputChange("pickup_instructions", e.target.value)}
                    />
                  </div>

                  {error && <p className="text-sm text-red-600">{error}</p>}

                  <div className="flex gap-4">
                    <Button type="submit" className="flex-1 bg-sky-600 hover:bg-sky-700" disabled={isLoading}>
                      {isLoading ? "Creating..." : "Create Listing"}
                    </Button>
                    <Button type="button" variant="outline" asChild>
                      <Link href="/dashboard/apartment">Cancel</Link>
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
