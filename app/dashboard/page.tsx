import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth/session"
import { getFullProfile } from "@/lib/db/queries"
import { queryOne } from "@/lib/db"

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) {
    redirect("/auth/login")
  }

  // Get user profile to determine dashboard type
  const profile = await getFullProfile(session.userId)

  if (!profile) {
    redirect("/auth/complete-profile")
  }

  if (profile.user_type === "ngo" && !profile.ngo_details) {
    redirect("/auth/complete-profile")
  }

  if (profile.user_type === "apartment" && !profile.apartment_details) {
    redirect("/auth/complete-profile")
  }

  // Redirect to appropriate dashboard based on user type
  switch (profile.user_type) {
    case "apartment":
      redirect("/dashboard/apartment")
    case "ngo":
      redirect("/dashboard/ngo")
    case "admin":
      redirect("/dashboard/admin")
    default:
      redirect("/auth/login")
  }
}

