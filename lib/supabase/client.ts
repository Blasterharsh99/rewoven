import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  // For client-side, we need to use the public environment variables
  // These should be set in your Vercel project settings with NEXT_PUBLIC_ prefix
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("[v0] Missing client-side Supabase environment variables")
    console.error("[v0] Required: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY")
    console.error(
      "[v0] Available env vars:",
      Object.keys(process.env).filter((key) => key.includes("SUPABASE")),
    )

    // Fallback error message for users
    throw new Error(
      "Supabase configuration missing. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your environment variables.",
    )
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
