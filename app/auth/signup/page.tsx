"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Heart } from "lucide-react"

export default function SignupPage() {
  const [userType, setUserType] = useState<"apartment" | "ngo">("apartment")
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
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
  const searchParams = useSearchParams()

  useEffect(() => {
    const type = searchParams.get("type")
    if (type === "apartment" || type === "ngo") {
      setUserType(type)
    }
  }, [searchParams])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    try {
      const metadata = {
        user_type: userType,
        name: formData.name,
        contact_person: formData.contactPerson,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        ...(userType === "apartment"
          ? {
              apartment_name: formData.apartmentName,
              total_units: formData.totalUnits,
              society_registration_number: formData.registrationNumber,
            }
          : {
              ngo_name: formData.ngoName,
              ngo_registration_number: formData.ngoRegistrationNumber,
              head_office_address: formData.headOfficeAddress,
              website: formData.website,
              focus_areas: formData.focusAreas.split(",").map((area) => area.trim()),
            }),
      }

      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, password: formData.password, metadata }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Signup failed")

      router.push("/dashboard")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="flex flex-col gap-6">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <img src="/rewoven-logo.jpeg" alt="Rewoven Logo" className="h-12 w-12 rounded-full object-cover" />
            <h1 className="text-2xl font-bold text-sky-900">Rewoven</h1>
          </div>

          <Card className="border-sky-200 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl text-sky-900">Join Rewoven</CardTitle>
              <CardDescription>Create your account to start making a difference</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignup}>
                <div className="flex flex-col gap-6">
                  {/* User Type Selection */}
                  <div className="grid gap-2">
                    <Label>I am registering as</Label>
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

                  {/* Basic Info */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
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
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="password">Password *</Label>
                      <Input
                        id="password"
                        type="password"
                        required
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="confirmPassword">Confirm Password *</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        required
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      />
                    </div>
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

                  <Button type="submit" className="w-full bg-sky-600 hover:bg-sky-700" disabled={isLoading}>
                    {isLoading ? "Creating account..." : "Create Account"}
                  </Button>
                </div>

                <div className="mt-4 text-center text-sm">
                  Already have an account?{" "}
                  <Link
                    href="/auth/login"
                    className="text-sky-600 underline underline-offset-4 hover:text-sky-700"
                  >
                    Sign in
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
