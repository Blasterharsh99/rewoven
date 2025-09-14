import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Users, Building2, Shield } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="h-8 w-8 text-emerald-600" />
            <h1 className="text-2xl font-bold text-emerald-900">Rewoven</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/auth/login">Login</Link>
            </Button>
            <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
              <Link href="/auth/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold text-emerald-900 mb-6 text-balance">
            Connecting Communities Through Clothing Donations
          </h2>
          <p className="text-xl text-emerald-700 mb-8 text-pretty">
            Rewoven bridges the gap between apartment communities with surplus clothing and NGOs serving those in need.
            Together, we create sustainable impact.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="bg-emerald-600 hover:bg-emerald-700">
              <Link href="/auth/signup?type=apartment">Join as Apartment</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/auth/signup?type=ngo">Join as NGO</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="border-emerald-200 bg-white/60 backdrop-blur-sm">
            <CardHeader>
              <Building2 className="h-12 w-12 text-emerald-600 mb-4" />
              <CardTitle className="text-emerald-900">For Apartments</CardTitle>
              <CardDescription>
                List surplus clothing from your community and connect with NGOs who need them
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-emerald-700">
                <li>• Easy listing management</li>
                <li>• Direct NGO communication</li>
                <li>• Community impact tracking</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-emerald-200 bg-white/60 backdrop-blur-sm">
            <CardHeader>
              <Users className="h-12 w-12 text-emerald-600 mb-4" />
              <CardTitle className="text-emerald-900">For NGOs</CardTitle>
              <CardDescription>Find clothing donations from apartment communities in your area</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-emerald-700">
                <li>• Browse available donations</li>
                <li>• Request specific items</li>
                <li>• Build community partnerships</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-emerald-200 bg-white/60 backdrop-blur-sm">
            <CardHeader>
              <Shield className="h-12 w-12 text-emerald-600 mb-4" />
              <CardTitle className="text-emerald-900">Secure & Transparent</CardTitle>
              <CardDescription>Built with security and transparency at its core</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-emerald-700">
                <li>• Verified organizations</li>
                <li>• Secure messaging</li>
                <li>• Impact analytics</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Progress Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-emerald-900 mb-4">Our Impact So Far</h3>
          <p className="text-emerald-700 text-lg">Together, we're making a real difference in communities</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="relative w-32 h-32 mx-auto mb-4">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" stroke="#d1fae5" strokeWidth="8" fill="none" />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke="#059669"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray="314"
                  strokeDashoffset="94"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-900">3500+</div>
                  <div className="text-xs text-emerald-600">Items</div>
                </div>
              </div>
            </div>
            <h4 className="text-xl font-semibold text-emerald-900 mb-2">Clothes Donated</h4>
            <p className="text-emerald-600">Pieces of clothing given new life</p>
          </div>

          <div className="text-center">
            <div className="relative w-32 h-32 mx-auto mb-4">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" stroke="#d1fae5" strokeWidth="8" fill="none" />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke="#059669"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray="314"
                  strokeDashoffset="251"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-900">4+</div>
                  <div className="text-xs text-emerald-600">Active</div>
                </div>
              </div>
            </div>
            <h4 className="text-xl font-semibold text-emerald-900 mb-2">Apartments Listed</h4>
            <p className="text-emerald-600">Communities actively participating</p>
          </div>

          <div className="text-center">
            <div className="relative w-32 h-32 mx-auto mb-4">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" stroke="#d1fae5" strokeWidth="8" fill="none" />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke="#059669"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray="314"
                  strokeDashoffset="220"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-900">10+</div>
                  <div className="text-xs text-emerald-600">Partners</div>
                </div>
              </div>
            </div>
            <h4 className="text-xl font-semibold text-emerald-900 mb-2">NGOs Listed</h4>
            <p className="text-emerald-600">Organizations making impact</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur-sm mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-emerald-700">
          <p>&copy; 2025 Rewoven NGO. Making a difference, one donation at a time.</p>
        </div>
      </footer>
    </div>
  )
}
