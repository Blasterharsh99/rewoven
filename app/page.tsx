import fs from "fs"
import path from "path"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Users, Building2, Shield, ChevronLeft, ChevronRight } from "lucide-react"

export const dynamic = 'force-dynamic'

export default function HomePage() {
  let galleryPhotos: string[] = []
  try {
    const galleryDir = path.join(process.cwd(), "public", "gallery")
    if (fs.existsSync(galleryDir)) {
      galleryPhotos = fs.readdirSync(galleryDir).filter(file => /\.(jpg|jpeg|png|webp|gif)$/i.test(file))
    }
  } catch (e) {
    console.error("Error reading gallery", e)
  }

  const images = galleryPhotos.length > 0
    ? galleryPhotos.map(filename => `/gallery/${filename}`)
    : ["/rewoven1.jpg", "/rewoven3.jpg", "/rewoven2.jpg"]

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/rewoven-logo.jpeg" alt="Rewoven Logo" className="h-12 w-12 rounded-full object-cover" />
            <h1 className="text-2xl font-bold text-sky-900">Rewoven</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/auth/login">Login</Link>
            </Button>
            <Button asChild className="bg-sky-600 hover:bg-sky-700">
              <Link href="/auth/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold text-sky-900 mb-6 text-balance">
            Connecting Communities Through Clothing Donations
          </h2>
          <p className="text-xl text-sky-700 mb-8 text-pretty">
            Rewoven bridges the gap between apartment communities with surplus clothing and NGOs serving those in need.
            Together, we create sustainable impact.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="bg-sky-600 hover:bg-sky-700">
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
          <Card className="border-sky-200 bg-white/60 backdrop-blur-sm">
            <CardHeader>
              <Building2 className="h-12 w-12 text-sky-600 mb-4" />
              <CardTitle className="text-sky-900">For Apartments</CardTitle>
              <CardDescription>
                List surplus clothing from your community and connect with NGOs who need them
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-sky-700">
                <li>• Easy listing management</li>
                <li>• Direct NGO communication</li>
                <li>• Community impact tracking</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-sky-200 bg-white/60 backdrop-blur-sm">
            <CardHeader>
              <Users className="h-12 w-12 text-sky-600 mb-4" />
              <CardTitle className="text-sky-900">For NGOs</CardTitle>
              <CardDescription>Find clothing donations from apartment communities in your area</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-sky-700">
                <li>• Browse available donations</li>
                <li>• Request specific items</li>
                <li>• Build community partnerships</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-sky-200 bg-white/60 backdrop-blur-sm">
            <CardHeader>
              <Shield className="h-12 w-12 text-sky-600 mb-4" />
              <CardTitle className="text-sky-900">Secure & Transparent</CardTitle>
              <CardDescription>Built with security and transparency at its core</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-sky-700">
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
          <h3 className="text-3xl font-bold text-sky-900 mb-4">Our Impact So Far</h3>
          <p className="text-sky-700 text-lg">Together, we're making a real difference in communities</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="relative w-32 h-32 mx-auto mb-4">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" stroke="#e0f2fe" strokeWidth="8" fill="none" />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke="#0284c7"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray="314"
                  strokeDashoffset="94"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-sky-900">6300+</div>
                  <div className="text-xs text-sky-600">Items</div>
                </div>
              </div>
            </div>
            <h4 className="text-xl font-semibold text-sky-900 mb-2">Clothes Donated</h4>
            <p className="text-sky-600">Pieces of clothing given new life</p>
          </div>

          <div className="text-center">
            <div className="relative w-32 h-32 mx-auto mb-4">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" stroke="#e0f2fe" strokeWidth="8" fill="none" />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke="#0284c7"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray="314"
                  strokeDashoffset="251"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-sky-900">6</div>
                  <div className="text-xs text-sky-600">Active</div>
                </div>
              </div>
            </div>
            <h4 className="text-xl font-semibold text-sky-900 mb-2">Apartments Listed</h4>
            <p className="text-sky-600">Communities actively participating</p>
          </div>

          <div className="text-center">
            <div className="relative w-32 h-32 mx-auto mb-4">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" stroke="#e0f2fe" strokeWidth="8" fill="none" />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke="#0284c7"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray="314"
                  strokeDashoffset="220"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-sky-900">8</div>
                  <div className="text-xs text-sky-600">Partners</div>
                </div>
              </div>
            </div>
            <h4 className="text-xl font-semibold text-sky-900 mb-2">NGOs Listed</h4>
            <p className="text-sky-600">Organizations making impact</p>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="container mx-auto px-4 py-16 bg-white/40 backdrop-blur-sm">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-sky-900 mb-4">Our Past Work & Stories of Impact</h3>
          <p className="text-sky-700 text-lg">See how communities are coming together to make a difference</p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          <div className="overflow-hidden rounded-2xl shadow-2xl">
            <div className="flex transition-transform duration-500 ease-in-out" id="gallery-slider">
              {images.map((src, index) => (
                <div key={index} className="w-full flex-shrink-0 relative">
                  <img
                    src={src}
                    alt={`Impact story ${index + 1}`}
                    className="w-full h-150 object-cover bg-sky-50"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Left/Right Arrows */}
          <button
            id="prev-btn"
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white p-2 rounded-full transition-colors z-10 backdrop-blur-sm"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button
            id="next-btn"
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white p-2 rounded-full transition-colors z-10 backdrop-blur-sm"
          >
            <ChevronRight className="w-8 h-8" />
          </button>

          {/* Gallery Navigation */}
          <div className="flex justify-center mt-6 gap-2 flex-wrap">
            {images.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${index === 0 ? 'bg-sky-600' : 'bg-sky-200 hover:bg-sky-400'}`}
                id={`dot-${index}`}
              ></button>
            ))}
          </div>
        </div>

        <script
          dangerouslySetInnerHTML={{
            __html: `
            let currentSlide = 0;
            const totalSlides = ${images.length};
            
            function showSlide(index) {
              const slider = document.getElementById('gallery-slider');
              const dots = document.querySelectorAll('[id^="dot-"]');
              
              if (slider) {
                slider.style.transform = \`translateX(-\${index * 100}%)\`;
              }
              
              dots.forEach((dot, i) => {
                if (i === index) {
                  dot.classList.remove('bg-sky-200');
                  dot.classList.add('bg-sky-600');
                } else {
                  dot.classList.remove('bg-sky-600');
                  dot.classList.add('bg-sky-200');
                }
              });
              
              currentSlide = index;
            }
            
            // Auto-rotate gallery
            setInterval(() => {
              if (totalSlides > 1) {
                currentSlide = (currentSlide + 1) % totalSlides;
                showSlide(currentSlide);
              }
            }, 4000);
            
            // Add click handlers to dots and arrows
            document.addEventListener('DOMContentLoaded', () => {
              const prevBtn = document.getElementById('prev-btn');
              const nextBtn = document.getElementById('next-btn');
              
              if (prevBtn) {
                prevBtn.addEventListener('click', () => {
                  if (totalSlides > 1) {
                    currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
                    showSlide(currentSlide);
                  }
                });
              }
              
              if (nextBtn) {
                nextBtn.addEventListener('click', () => {
                  if (totalSlides > 1) {
                    currentSlide = (currentSlide + 1) % totalSlides;
                    showSlide(currentSlide);
                  }
                });
              }

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
                <div className="absolute inset-0 bg-sky-100 rounded-2xl transform rotate-3"></div>
                <img
                  src="/peehu_photo.jpg"
                  alt="Founder of Rewoven NGO"
                  className="relative w-full h-150 object-cover rounded-2xl shadow-xl"
                />
                <div className="absolute -bottom-4 -right-4 bg-sky-600 text-white p-4 rounded-xl shadow-lg">
                  <img src="/rewoven-logo.jpeg" alt="Rewoven Logo" className="h-12 w-12 rounded-full object-cover" />
                </div>
              </div>
            </div>

            {/* About Content */}
            <div className="order-1 lg:order-2">
              <h3 className="text-4xl font-bold text-sky-900 mb-6">About Rewoven</h3>

              <div className="space-y-6 text-sky-700">

                <p className="text-lg leading-relaxed">
                  Suhani Agarwal is an 12 th grade student studying at NPS Koramangala, Bangalore.
                  She greatly enjoys exploring her interests, which include art, parliamentary debating, finance, and as importantly - her passion for sustainability.
                  As someone who grew up in a family that internalised service and giving, ReWoven has allowed Suhani’s vision to come to life.
                  Empathetic, ambitious and hard working, Suhani aims to broaden ReWoven's outreach and hopes to establish tangible change.
                </p>

                <p className="leading-relaxed">
                  ReWoven stands for a world where clothing is not a privilege but a shared right.
                  By embodying a circular system where long forgotten clothes are given a new life in the hands of the underprivileged, ReWoven aims at bridging the gap.
                </p>

                <div className="bg-sky-50 p-6 rounded-xl border-l-4 border-sky-600">
                  <h4 className="font-semibold text-sky-900 mb-2">Our Mission</h4>
                  <p className="text-sky-800">
                    "To reduce the clothing insecurity that plagues India, by focusing on practical, impactful and tangible ground-level change"
                  </p>
                </div>

                <div className="flex flex-wrap gap-4 pt-4">
                  <div className="flex items-center gap-2 text-sky-600">
                    <Shield className="h-5 w-5" />
                    <span className="font-medium">Verified Partners</span>
                  </div>
                  <div className="flex items-center gap-2 text-sky-600">
                    <Users className="h-5 w-5" />
                    <span className="font-medium">Community Driven</span>
                  </div>
                  <div className="flex items-center gap-2 text-sky-600">
                    <Heart className="h-5 w-5" />
                    <span className="font-medium">Impact Focused</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Our Partners Section */}
      <section className="container mx-auto px-4 py-16 bg-white/40 backdrop-blur-sm border-t border-sky-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-sky-900 mb-4">Our Partners</h3>
            <p className="text-sky-700 text-lg">Thank you to the organizations and communities making this possible</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Partner Apartments */}
            <div className="bg-white/80 rounded-2xl p-8 shadow-sm border border-sky-50">
              <div className="flex items-center gap-3 mb-6">
                <Building2 className="h-8 w-8 text-sky-600" />
                <h4 className="text-2xl font-semibold text-sky-900">Partner Apartments</h4>
              </div>
              <ul className="space-y-3 text-sky-800">
                <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-2 shrink-0"></div>Mantri Espana, Bellandur</li>
                <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-2 shrink-0"></div>Adarsh Palm Retreat Bellandur</li>
                <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-2 shrink-0"></div>Shobha Jasmine Bellandur</li>
                <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-2 shrink-0"></div>Purva Fountain Square Marathalli</li>
                <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-2 shrink-0"></div>Mantri Classic Apartments Koramangala</li>
              </ul>
            </div>

            {/* Partner NGOs */}
            <div className="bg-white/80 rounded-2xl p-8 shadow-sm border border-sky-50">
              <div className="flex items-center gap-3 mb-6">
                <Users className="h-8 w-8 text-sky-600" />
                <h4 className="text-2xl font-semibold text-sky-900">Partner NGOs</h4>
              </div>
              <ul className="space-y-3 text-sky-800">
                <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-2 shrink-0"></div>Goonj</li>
                <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-2 shrink-0"></div>Samarthanam Trust for the Disabled, HSR Layout</li>
                <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-2 shrink-0"></div>Gerizim Rehabilitation Trust, Ejipura</li>
                <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-2 shrink-0"></div>Indro Foundation, Ejipura</li>
                <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-2 shrink-0"></div>Cheshire Homes India Bangalore Unit, HAL Old Airport Road</li>
                <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-2 shrink-0"></div>Karunashraya, Kundalahalli, Marathahalli</li>
                <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-2 shrink-0"></div>Swanthana, Carmalaram post, Sarjapur</li>
                <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-2 shrink-0"></div>Primary Govt Schools in Bellandur</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8 text-center text-sky-700">
          <p>&copy; 2025 Rewoven NGO. Making a difference, one donation at a time.</p>
          <p className="mt-2">
            Contact us: <a href="mailto:rewoven.in@gmail.com" className="hover:text-sky-900 font-medium transition-colors">rewoven.in@gmail.com</a>
          </p>
        </div>
      </footer>
    </div>
  )
}
