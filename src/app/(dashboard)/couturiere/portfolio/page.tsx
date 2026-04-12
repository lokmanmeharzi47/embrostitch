"use client";

import React, { useEffect, useState, useRef } from "react";

import Button from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

export default function CreatorPortfolioPage() {
  const { user } = useAuth();
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    const fetchPortfolio = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("couturiere_profiles")
        .select("portfolio_images")
        .eq("id", user.id)
        .single();

      if (data && data.portfolio_images) {
        setImages(data.portfolio_images);
      }
      setLoading(false);
    };
    fetchPortfolio();
  }, [user]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !user) return;
    setUploading(true);

    const supabase = createClient();
    const newImages: string[] = [];

    for (const file of Array.from(e.target.files)) {
      const ext = file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error } = await supabase.storage
        .from("portfolio")
        .upload(fileName, file, { upsert: true });

      if (error) {
        toast.error(`Erreur upload: ${file.name}`);
        continue;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("portfolio").getPublicUrl(fileName);

      newImages.push(publicUrl);
    }

    if (newImages.length > 0) {
      const updatedImages = [...images, ...newImages];
      const { error } = await supabase
        .from("couturiere_profiles")
        .upsert({ 
          id: user.id, 
          portfolio_images: updatedImages 
        });

      if (error) {
        console.error("Error upserting portfolio:", error);
        toast.error("Erreur sauvegarde portfolio");
      } else {
        setImages(updatedImages);
        toast.success(
          `${newImages.length} image${newImages.length > 1 ? "s" : ""} ajoutée${newImages.length > 1 ? "s" : ""}`
        );
      }
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDelete = async (imageUrl: string) => {
    if (!user) return;
    const supabase = createClient();
    const updatedImages = images.filter((img) => img !== imageUrl);

    const { error } = await supabase
      .from("couturiere_profiles")
      .update({ portfolio_images: updatedImages })
      .eq("id", user.id);

    if (error) {
      toast.error("Erreur suppression");
    } else {
      setImages(updatedImages);
      toast.success("Image supprimée");
    }

    // Also try to delete from storage
    try {
      const urlParts = imageUrl.split("/portfolio/");
      if (urlParts[1]) {
        await supabase.storage.from("portfolio").remove([urlParts[1]]);
      }
    } catch {
      // Ignore storage deletion errors
    }
  };

  if (loading) {
    return (
    <>
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-muted rounded-xl w-1/3" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-4/5 bg-muted rounded-2xl" />
            ))}
          </div>
        </div>
    </>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
            Mon Portfolio
          </h1>
          <p className="text-muted-foreground max-w-xl">
            Gérez votre galerie de créations. {images.length} image
            {images.length > 1 ? "s" : ""} dans votre portfolio.
          </p>
        </div>
        <div className="flex gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleUpload}
          />
          <Button
            variant="primary"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <span className="material-icons text-sm mr-2">
              {uploading ? "hourglass_empty" : "cloud_upload"}
            </span>
            {uploading ? "Upload en cours..." : "Ajouter des Images"}
          </Button>
        </div>
      </div>

      {/* Gallery Grid */}
      {images.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {images.map((url, index) => (
            <div
              key={index}
              className="group bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300"
            >
              <div className="relative aspect-4/5 bg-secondary overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`Portfolio ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-white text-foreground flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                    title="Voir en plein écran"
                  >
                    <span className="material-icons text-sm">
                      open_in_new
                    </span>
                  </a>
                  <button
                    className="w-10 h-10 rounded-full bg-white text-destructive flex items-center justify-center hover:bg-destructive hover:text-white transition-colors"
                    title="Supprimer"
                    onClick={() => handleDelete(url)}
                  >
                    <span className="material-icons text-sm">delete</span>
                  </button>
                </div>
              </div>
              <div className="p-4 border-t border-border">
                <p className="text-sm font-medium text-foreground">
                  Image {index + 1}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-6">
            <span className="material-icons text-muted-foreground text-4xl">
              add_photo_alternate
            </span>
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">
            Votre portfolio est vide
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Ajoutez vos meilleures créations pour attirer de nouveaux clients.
            Les images de qualité augmentent vos chances de recevoir des
            commandes.
          </p>
          <Button
            variant="primary"
            onClick={() => fileInputRef.current?.click()}
          >
            <span className="material-icons text-sm mr-2">cloud_upload</span>
            Ajouter vos premières images
          </Button>
        </div>
      )}
    </>
  );
}
