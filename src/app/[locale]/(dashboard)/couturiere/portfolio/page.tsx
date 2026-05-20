import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PortfolioUpload from "@/components/dashboard/PortfolioUpload";

export default async function CreatorPortfolioPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: tableData }, { data: profileData }] = await Promise.all([
    supabase
      .from("portfolio_images")
      .select("id, image_url")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("couturiere_profiles")
      .select("portfolio_images")
      .eq("id", user.id)
      .maybeSingle(),
  ]);

  const map = new Map<string, { id: string; image_url: string }>();
  (tableData ?? []).forEach((img) => map.set(img.image_url, img));
  ((profileData?.portfolio_images as string[]) ?? []).forEach((url) => {
    if (!map.has(url)) map.set(url, { id: `legacy-${url}`, image_url: url });
  });

  return (
    <div className="max-w-6xl mx-auto">
      <PortfolioUpload initialImages={Array.from(map.values())} />
    </div>
  );
}
