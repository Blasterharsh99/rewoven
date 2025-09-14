import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Mail } from "lucide-react"
import Link from "next/link"

export default function SignupSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="h-8 w-8 text-emerald-600" />
            <h1 className="text-2xl font-bold text-emerald-900">Rewoven</h1>
          </div>

          <Card className="border-emerald-200 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Mail className="h-16 w-16 text-emerald-600" />
              </div>
              <CardTitle className="text-2xl text-emerald-900">Check Your Email</CardTitle>
              <CardDescription>We&apos;ve sent you a confirmation link</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-emerald-700 mb-6">
                Please check your email and click the confirmation link to activate your account. Once confirmed,
                you&apos;ll be able to access your dashboard.
              </p>
              <p className="text-xs text-emerald-600">
                Didn&apos;t receive the email? Check your spam folder or{" "}
                <Link href="/auth/signup" className="underline hover:text-emerald-700">
                  try signing up again
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
