import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { createClient } from "@/lib/supabase/server";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string || "portfolio"; // default to portfolio
    const orderId = formData.get("orderId") as string; // optional, for references

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const base64String = Buffer.from(buffer).toString("base64");
    const dataUri = `data:${file.type};base64,${base64String}`;

    // Upload to Cloudinary with folder based on type
    const folder = `${type}/${user.id}`;
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        dataUri,
        {
          folder,
          resource_type: "image",
          format: "webp",
          quality: "auto",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
    }) as any;

    const secureUrl = uploadResult.secure_url;

    // Handle DB insertion based on type
    let responseData = null;

    if (type === "portfolio") {
      const title = file.name
        .replace(/\.[^/.]+$/, "")
        .replace(/[-_]+/g, " ")
        .trim();

      const { data, error } = await supabase
        .from("portfolio_images")
        .insert({
          user_id: user.id,
          image_url: secureUrl,
          title: title || null,
          is_published: true,
        })
        .select()
        .single();
      if (error) throw error;
      responseData = data;

      // SYNC: Also append to creator_profiles.portfolio_images array
      try {
        const { data: profile } = await supabase
          .from("creator_profiles")
          .select("portfolio_images")
          .eq("id", user.id)
          .maybeSingle();

        if (profile) {
          const updatedImages = [...(profile.portfolio_images || []), secureUrl];
          await supabase
            .from("creator_profiles")
            .update({ portfolio_images: updatedImages })
            .eq("id", user.id);
        }
      } catch (syncError) {
        console.error("Sync error:", syncError);
        // Don't fail the whole upload if sync fails
      }
    } else if (type === "reference") {
      const { data, error } = await supabase
        .from("references")
        .insert({
          user_id: user.id,
          order_id: orderId || null,
          file_url: secureUrl,
          file_name: file.name,
          file_type: file.type,
          file_size: file.size
        })
        .select()
        .single();
      if (error) throw error;
      responseData = data;
    } else if (type === "avatar") {
      const { data, error } = await supabase
        .from("profiles")
        .update({ avatar_url: secureUrl })
        .eq("id", user.id)
        .select()
        .single();
      if (error) throw error;
      responseData = data;
    }

    return NextResponse.json({ data: responseData, url: secureUrl }, { status: 200 });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error.message || "Upload failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, image_url, type } = await req.json();

    if (!image_url) {
      return NextResponse.json({ error: "Missing image_url" }, { status: 400 });
    }

    // Attempt to extract Cloudinary public_id
    const urlParts = image_url.split('/upload/');
    if (!urlParts[1]) {
      return NextResponse.json({ error: "Invalid Cloudinary URL" }, { status: 400 });
    }
    
    const pathWithVersion = urlParts[1];
    const pathWithoutVersion = pathWithVersion.replace(/^v\d+\//, '');
    const publicId = pathWithoutVersion.substring(0, pathWithoutVersion.lastIndexOf('.'));

    if (publicId) {
      await cloudinary.uploader.destroy(publicId);
    }

    // Delete from DB if ID is provided and not a legacy ID
    if (id && type) {
      if (!id.startsWith("legacy-")) {
        const table = type === "portfolio" ? "portfolio_images" : "references";
        const { error } = await supabase
          .from(table)
          .delete()
          .eq("id", id)
          .eq("user_id", user.id);

        if (error) throw error;
      }

      // SYNC: Also remove from creator_profiles.portfolio_images array
      if (type === "portfolio") {
        try {
          const { data: profile } = await supabase
            .from("creator_profiles")
            .select("portfolio_images")
            .eq("id", user.id)
            .maybeSingle();

          if (profile && profile.portfolio_images) {
            const updatedImages = profile.portfolio_images.filter((url: string) => url !== image_url);
            await supabase
              .from("creator_profiles")
              .update({ portfolio_images: updatedImages })
              .eq("id", user.id);
          }
        } catch (syncError) {
          console.error("Sync error during delete:", syncError);
        }
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: error.message || "Delete failed" }, { status: 500 });
  }
}
