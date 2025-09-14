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

      {/* Gallery Section */}
      <section className="container mx-auto px-4 py-16 bg-white/40 backdrop-blur-sm">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-emerald-900 mb-4">Stories of Impact</h3>
          <p className="text-emerald-700 text-lg">See how communities are coming together to make a difference</p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          <div className="overflow-hidden rounded-2xl shadow-2xl">
            <div className="flex transition-transform duration-500 ease-in-out" id="gallery-slider">
              {/* Gallery Item 1 */}
              <div className="w-full flex-shrink-0 relative">
                <img
                  src="/rewoven1.jpg"
                  alt="Drives across multiple apartments"
                  className="w-full h-150 object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                  <h4 className="text-white text-xl font-semibold mb-2">Drives across multiple apartments</h4>
                  <p className="text-white/90">
                    Collecting clothing donations for local NGOs across multiple apartments
                  </p>
                </div>
              </div>

              {/* Gallery Item 2 */}
              <div className="w-full flex-shrink-0 relative">
                <img
                  src="/rewoven3.jpg"
                  alt="NGO distributing clothes to families"
                  className="w-full h-150 object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                  <h4 className="text-white text-xl font-semibold mb-2">Reaching Those in Need</h4>
                  <p className="text-white/90">Reaching local NGOs to organize donation drives</p>
                </div>
              </div>

              {/* Gallery Item 3 */}
              <div className="w-full flex-shrink-0 relative">
                <img
                  src="/rewoven2.jpg"
                  alt="Happy children in donated clothes"
                  className="w-full h-150 object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                  <h4 className="text-white text-xl font-semibold mb-2">Thousands of lives transformed</h4>
                  <p className="text-white/90">
                    People from underprivileged communities receiving new clothes through Rewoven
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Gallery Navigation */}
          <div className="flex justify-center mt-6 gap-2">
            <button className="w-3 h-3 rounded-full bg-emerald-600 transition-all duration-300" id="dot-0"></button>
            <button
              className="w-3 h-3 rounded-full bg-emerald-200 hover:bg-emerald-400 transition-all duration-300"
              id="dot-1"
            ></button>
            <button
              className="w-3 h-3 rounded-full bg-emerald-200 hover:bg-emerald-400 transition-all duration-300"
              id="dot-2"
            ></button>
          </div>
        </div>

        <script
          dangerouslySetInnerHTML={{
            __html: `
            let currentSlide = 0;
            const totalSlides = 3;
            
            function showSlide(index) {
              const slider = document.getElementById('gallery-slider');
              const dots = document.querySelectorAll('[id^="dot-"]');
              
              if (slider) {
                slider.style.transform = \`translateX(-\${index * 100}%)\`;
              }
              
              dots.forEach((dot, i) => {
                if (i === index) {
                  dot.classList.remove('bg-emerald-200');
                  dot.classList.add('bg-emerald-600');
                } else {
                  dot.classList.remove('bg-emerald-600');
                  dot.classList.add('bg-emerald-200');
                }
              });
              
              currentSlide = index;
            }
            
            // Auto-rotate gallery
            setInterval(() => {
              currentSlide = (currentSlide + 1) % totalSlides;
              showSlide(currentSlide);
            }, 4000);
            
            // Add click handlers to dots
            document.addEventListener('DOMContentLoaded', () => {
              for (let i = 0; i < totalSlides; i++) {
                const dot = document.getElementById(\`dot-\${i}\`);
                if (dot) {
                  dot.addEventListener('click', () => showSlide(i));
                }
              }
            });
          `,
          }}
        />
      </section>

      {/* About Us Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Founder Image */}
            <div className="order-2 lg:order-1">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-100 rounded-2xl transform rotate-3"></div>
                  <img
                    src="/peehu_photo.jpg"
                    alt="Founder of Rewoven NGO"
                    className="relative w-full h-150 object-cover rounded-2xl shadow-xl"
                  />
                <div className="absolute -bottom-4 -right-4 bg-emerald-600 text-white p-4 rounded-xl shadow-lg">
                  <Heart className="h-8 w-8" />
                </div>
              </div>
            </div>

            {/* About Content */}
            <div className="order-1 lg:order-2">
              <h3 className="text-4xl font-bold text-emerald-900 mb-6">About Rewoven</h3>

              <div className="space-y-6 text-emerald-700">

                <p className="text-lg leading-relaxed">
                  Suhani Agarwal is an 11 th grade student studying at NPS Koramangala, Bangalore. 
                  She greatly enjoys exploring her interests, which include art, parliamentary debating, finance, and as importantly - her passion for sustainability.  
                  As someone who grew up in a family that internalised service and giving, ReWoven has allowed Suhani’s vision to come to life. 
                  Empathetic, ambitious and hard working, Suhani aims to broaden ReWoven's outreach and hopes to establish tangible change.
                </p>

                <p className="leading-relaxed">
                  ReWoven stands for a world where clothing is not a privilege but a shared right. 
                  By embodying a circular system where long forgotten clothes are given a new life in the hands of the underprivileged, ReWoven aims at bridging the gap. 
                </p>

                <div className="bg-emerald-50 p-6 rounded-xl border-l-4 border-emerald-600">
                  <h4 className="font-semibold text-emerald-900 mb-2">Our Mission</h4>
                  <p className="text-emerald-800">
                    "To reduce the clothing insecurity that plagues India, by focusing on practical, impactful and tangible ground-level change"
                  </p>
                </div>

                <div className="flex flex-wrap gap-4 pt-4">
                  <div className="flex items-center gap-2 text-emerald-600">
                    <Shield className="h-5 w-5" />
                    <span className="font-medium">Verified Partners</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-600">
                    <Users className="h-5 w-5" />
                    <span className="font-medium">Community Driven</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-600">
                    <Heart className="h-5 w-5" />
                    <span className="font-medium">Impact Focused</span>
                  </div>
                </div>
              </div>
            </div>
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
