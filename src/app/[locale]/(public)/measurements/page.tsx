import { createClient } from "@/lib/supabase/server";
import MeasurementsClient, { type SavedMeasurementProfile } from "@/components/measurements/MeasurementsClient";

export const metadata = {
  title: "AI Measurement Assistant — MALIXA",
  description: "Enter your body measurements and get an AI-assisted analysis and size recommendation before ordering your custom piece.",
};

export default async function MeasurementsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let initialProfiles: SavedMeasurementProfile[] = [];

  if (user) {
    const { data } = await supabase
      .from("saved_measurements")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    initialProfiles = (data || []) as SavedMeasurementProfile[];
  }

  return <MeasurementsClient initialProfiles={initialProfiles} isLoggedIn={!!user} />;
}
