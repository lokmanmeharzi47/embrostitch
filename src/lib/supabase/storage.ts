import { createClient } from "./client";

export const uploadFile = async (bucket: string, path: string, file: File) => {
  const supabase = createClient();
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) {
    throw error;
  }

  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path);
  return publicUrl;
};
