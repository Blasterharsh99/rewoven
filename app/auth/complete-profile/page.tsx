"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Heart } from "lucide-react"

export default function CompleteProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [userType, setUserType] = useState<"apartment" | "ngo">("apartment")
  const [formData, setFormData] = useState({
    name: "",
    contactPerson: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    // Apartment specific
    apartmentName: "",
    totalUnits: "",
    registrationNumber: "",
    // NGO specific
    ngoName: "",
    ngoRegistrationNumber: "",
    headOfficeAddress: "",
    website: "",
    focusAreas: "",
  })
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      setUser(user)

      // Pre-fill form with metadata if available
      const metadata = user.user_metadata || {}
      setUserType(metadata.user_type || "apartment")
      setFormData({
        name: metadata.name || "",
        contactPerson: metadata.contact_person || "",
        phone: metadata.phone || "",
        address: metadata.address || "",
        city: metadata.city || "",
        state: metadata.state || "",
        pincode: metadata.pincode || "",
        apartmentName: metadata.apartment_name || "",
        totalUnits: metadata.total_units || "",
        registrationNumber: metadata.society_registration_number || "",
        ngoName: metadata.ngo_name || "",
        ngoRegistrationNumber: metadata.ngo_registration_number || "",
        headOfficeAddress: metadata.head_office_address || "",
        website: metadata.website || "",
        focusAreas: Array.isArray(metadata.focus_areas) ? metadata.focus_areas.join(", ") : "",
      })
    }

    getUser()
  }, [router])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleCompleteProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: user.id,
        user_type: userType,
        name: formData.name,
        contact_person: formData.contactPerson,
        email: user.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
      })

      if (profileError) throw profileError

      if (userType === "apartment") {
        const { error: apartmentError } = await supabase.from("apartment_details").upsert({
          profile_id: user.id,
          apartment_name: formData.apartmentName,
          total_units: formData.totalUnits ? Number.parseInt(formData.totalUnits) : null,
          society_registration_number: formData.registrationNumber,
        })

        if (apartmentError) throw apartmentError
      } else {
        const { error: ngoError } = await supabase.from("ngo_details").upsert({
          profile_id: user.id,
          ngo_name: formData.ngoName,
          registration_number: formData.ngoRegistrationNumber,
          head_office_address: formData.headOfficeAddress,
          website: formData.website,
          focus_areas: formData.focusAreas
            .split(",")
            .map((area) => area.trim())
            .filter(Boolean),
        })

        if (ngoError) throw ngoError
      }

      router.push("/dashboard")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="flex flex-col gap-6">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="h-8 w-8 text-emerald-600" />
            <h1 className="text-2xl font-bold text-emerald-900">Rewoven</h1>
          </div>

          <Card className="border-emerald-200 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl text-emerald-900">Complete Your Profile</CardTitle>
              <CardDescription>Please complete your profile information to continue</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCompleteProfile}>
                <div className="flex flex-col gap-6">
                  {/* User Type Selection */}
                  <div className="grid gap-2">
                    <Label>Account Type</Label>
                    <Select value={userType} onValueChange={(value: "apartment" | "ngo") => setUserType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="apartment">Apartment Community</SelectItem>
                        <SelectItem value="ngo">NGO</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Organization Details */}
                  {userType === "apartment" ? (
                    <>
                      <div className="grid gap-2">
                        <Label htmlFor="apartmentName">Apartment/Society Name *</Label>
                        <Input
                          id="apartmentName"
                          required
                          value={formData.apartmentName}
                          onChange={(e) => handleInputChange("apartmentName", e.target.value)}
                        />
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="totalUnits">Total Units</Label>
                          <Input
                            id="totalUnits"
                            type="number"
                            value={formData.totalUnits}
                            onChange={(e) => handleInputChange("totalUnits", e.target.value)}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="registrationNumber">Society Registration Number</Label>
                          <Input
                            id="registrationNumber"
                            value={formData.registrationNumber}
                            onChange={(e) => handleInputChange("registrationNumber", e.target.value)}
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="grid gap-2">
                        <Label htmlFor="ngoName">NGO Name *</Label>
                        <Input
                          id="ngoName"
                          required
                          value={formData.ngoName}
                          onChange={(e) => handleInputChange("ngoName", e.target.value)}
                        />
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="ngoRegistrationNumber">Registration Number *</Label>
                          <Input
                            id="ngoRegistrationNumber"
                            required
                            value={formData.ngoRegistrationNumber}
                            onChange={(e) => handleInputChange("ngoRegistrationNumber", e.target.value)}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="website">Website</Label>
                          <Input
                            id="website"
                            type="url"
                            value={formData.website}
                            onChange={(e) => handleInputChange("website", e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="focusAreas">Focus Areas (comma-separated)</Label>
                        <Input
                          id="focusAreas"
                          placeholder="e.g., Education, Healthcare, Women Empowerment"
                          value={formData.focusAreas}
                          onChange={(e) => handleInputChange("focusAreas", e.target.value)}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="headOfficeAddress">Head Office Address *</Label>
                        <Textarea
                          id="headOfficeAddress"
                          required
                          value={formData.headOfficeAddress}
                          onChange={(e) => handleInputChange("headOfficeAddress", e.target.value)}
                        />
                      </div>
                    </>
                  )}

                  <div className="grid gap-2">
                    <Label htmlFor="contactPerson">Contact Person *</Label>
                    <Input
                      id="contactPerson"
                      required
                      value={formData.contactPerson}
                      onChange={(e) => handleInputChange("contactPerson", e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                    />
                  </div>

                  {/* Address */}
                  <div className="grid gap-2">
                    <Label htmlFor="address">Address *</Label>
                    <Textarea
                      id="address"
                      required
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        required
                        value={formData.city}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        required
                        value={formData.state}
                        onChange={(e) => handleInputChange("state", e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="pincode">Pincode *</Label>
                      <Input
                        id="pincode"
                        required
                        value={formData.pincode}
                        onChange={(e) => handleInputChange("pincode", e.target.value)}
                      />
                    </div>
                  </div>

                  {error && <p className="text-sm text-red-600">{error}</p>}

                  <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={isLoading}>
                    {isLoading ? "Completing profile..." : "Complete Profile"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
