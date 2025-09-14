import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get user profile to determine dashboard type
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  if (!profile) {
    // Profile not created yet, redirect to complete setup
    redirect("/auth/complete-profile")
  }

  if (profile.user_type === "ngo") {
    const { data: ngoDetails } = await supabase.from("ngo_details").select("*").eq("profile_id", data.user.id).single()

    if (!ngoDetails) {
      redirect("/auth/complete-profile")
    }
  }

  if (profile.user_type === "apartment") {
    const { data: apartmentDetails } = await supabase
      .from("apartment_details")
      .select("*")
      .eq("profile_id", data.user.id)
      .single()

    if (!apartmentDetails) {
      redirect("/auth/complete-profile")
    }
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
