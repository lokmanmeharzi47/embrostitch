import { createClient } from "@/lib/supabase/server"
import { redirect } from "@/i18n/routing"

export default async function MessagesRedirect({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ to?: string; recipient?: string; orderId?: string }>
}) {
  const { locale } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect({ href: "/login", locale })
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (!profile || error) {
    return redirect({ href: "/login", locale })
  }

  const searchParamsResolved = await searchParams
  const targetParams = new URLSearchParams()
  if (searchParamsResolved.orderId) targetParams.set("orderId", searchParamsResolved.orderId)
  if (searchParamsResolved.recipient) targetParams.set("recipient", searchParamsResolved.recipient)
  if (searchParamsResolved.to) targetParams.set("to", searchParamsResolved.to)
  const toParam = targetParams.toString() ? `?${targetParams.toString()}` : ""

  // Redirect to the role-specific messages page
  const roleRoutes: Record<string, string> = {
    client: "/client/messages",
    creator: "/creator/messages",
    admin: "/admin",
  }

  const target = roleRoutes[profile.role as string] || "/login"
  // Since we use the localized redirect, target should not include the locale prefix if it's already handled by href logic
  // but next-intl redirect usually takes the path without locale if it's configured in routing
  return redirect({ href: `${target}${toParam}` as any, locale })
}
