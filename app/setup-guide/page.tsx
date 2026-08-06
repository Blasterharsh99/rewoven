import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function SetupGuidePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-sky-800 mb-2">Rewoven Platform Setup Guide</h1>
          <p className="text-gray-600">Follow these steps to get your Rewoven NGO platform running</p>
        </div>

        <div className="grid gap-6">
          {/* Environment Variables */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sky-700">1. Environment Variables Setup</CardTitle>
              <CardDescription>Configure the required environment variables in your Vercel project</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertDescription>
                  <strong>Required Environment Variables:</strong>
                  <br />
                  You need to add these to your environment (e.g. .env file or Vercel settings):
                </AlertDescription>
              </Alert>

              <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm">
                <div className="space-y-1">
                  <div>
                    <strong>DATABASE_URL</strong> = postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require
                  </div>
                  <div>
                    <strong>JWT_SECRET</strong> = your-long-random-secret-string
                  </div>
                  <div>
                    <strong>NEXT_PUBLIC_SITE_URL</strong> = http://localhost:3000
                  </div>
                </div>
              </div>

              <Alert>
                <AlertDescription>
                  <strong>How to find these values:</strong>
                  <br />
                  1. Go to your Neon.tech dashboard (or any Postgres provider)
                  <br />
                  2. Navigate to Connection Details → Connection String
                  <br />
                  3. Copy the URL to DATABASE_URL
                  <br />
                  4. For JWT_SECRET, generate a strong random 32+ char string
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Database Setup */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sky-700">2. Database Setup</CardTitle>
              <CardDescription>Run the database scripts to create tables and functions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p>
                  <strong>Run these scripts in order:</strong>
                </p>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>
                    <code>scripts/001_create_tables.sql</code> - Creates all database tables
                  </li>
                  <li>
                    <code>scripts/002_create_functions.sql</code> - Creates helper functions
                  </li>
                  <li>
                    <code>scripts/004_fix_rls_policies.sql</code> - Fixes security policies
                  </li>
                  <li>
                    <code>scripts/005_create_admin_user.sql</code> - Creates admin user
                  </li>
                </ol>
              </div>
            </CardContent>
          </Card>

          {/* Admin User */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sky-700">3. Admin User Creation</CardTitle>
              <CardDescription>Create the initial admin user to manage the platform</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p>
                  <strong>Option 1: Run SQL Script (Recommended)</strong>
                </p>
                <p className="text-sm text-gray-600">
                  Run <code>scripts/005_create_admin_user.sql</code> to create admin user with:
                </p>
                <div className="bg-gray-100 p-3 rounded text-sm">
                  <div>
                    <strong>Email:</strong> admin@rewoven.org
                  </div>
                  <div>
                    <strong>Password:</strong> admin123
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p>
                  <strong>Option 2: Use Setup Page</strong>
                </p>
                <Link href="/auth/admin-setup">
                  <Button className="bg-sky-600 hover:bg-sky-700">Go to Admin Setup Page</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Testing */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sky-700">4. Test the Platform</CardTitle>
              <CardDescription>Verify everything is working correctly</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/auth/login">
                  <Button variant="outline" className="w-full bg-transparent">
                    Test Login
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button variant="outline" className="w-full bg-transparent">
                    Test Signup
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="outline" className="w-full bg-transparent">
                    Test Dashboard
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <Alert>
            <AlertDescription>
              <strong>Need Help?</strong> If you encounter any issues, check the browser console for detailed error
              messages.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  )
}
