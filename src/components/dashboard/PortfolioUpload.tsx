"use client";

import React, { useEffect, useState, useRef } from "react";
import Button from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import { Eye, Trash2, Camera, Loader2, CloudUpload } from "lucide-react";

interface PortfolioImage {
  id: string;
  image_url: string;
}

export default function PortfolioUpload() {
  const { user } = useAuth();
  const [images, setImages] = useState<PortfolioImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    
    let isMounted = true;
    const fetchPortfolio = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("portfolio_images")
          .select("id, image_url")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching portfolio:", error);
        } else if (data && isMounted) {
          setImages(data);
        }
      } catch (err) {
        console.error("Error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    fetchPortfolio();
    
    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files.length || !user) return;
    
    // Validate files
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/');
      const validSize = file.size <= 5 * 1024 * 1024; // 5MB max
      if (!isImage) toast.error(`${file.name} n'est pas une image.`);
      if (!validSize) toast.error(`${file.name} dépasse 5MB.`);
      return isImage && validSize;
    });

    if (validFiles.length === 0) return;

    setUploading(true);

    let newUploads: PortfolioImage[] = [];

    // Upload files sequentially to avoid overriding rate limits
    for (const file of validFiles) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", "portfolio");

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Upload failed for " + file.name);
        }

        const resData = await response.json();
        if (resData.data) {
          newUploads.push(resData.data);
        }
      } catch (error) {
        toast.error(`Erreur upload: ${file.name}`);
        console.error(error);
      }
    }

    if (newUploads.length > 0) {
      setImages(prev => [...newUploads, ...prev]);
      toast.success(
        `${newUploads.length} image${newUploads.length > 1 ? "s" : ""} ajoutée${newUploads.length > 1 ? "s" : ""}`
      );
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDelete = async (image: PortfolioImage) => {
    if (!user) return;
    
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette image ?")) {
      return;
    }

    try {
      const response = await fetch("/api/upload", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: image.id,
          image_url: image.image_url,
          type: "portfolio",
        }),
      });

      if (!response.ok) {
        throw new Error("Deletion failed");
      }

      setImages(prev => prev.filter(img => img.id !== image.id));
      toast.success("Image supprimée");
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la suppression");
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-10 bg-muted rounded-xl w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="aspect-[4/5] bg-muted rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
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
            accept="image/jpeg, image/png, image/webp"
            multiple
            className="hidden"
            onChange={handleUpload}
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full sm:w-auto"
          >
            {uploading ? (
              <>
                <Loader2 size={18} className="mr-2 animate-spin" />
                Upload en cours...
              </>
            ) : (
              <>
                <CloudUpload size={18} className="mr-2" />
                Ajouter des Images
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Gallery Grid */}
      {images.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {images.map((img) => (
            <div
              key={img.id}
              className="group bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300"
            >
              <div className="relative aspect-[4/5] bg-secondary overflow-hidden">
                {/* We use standard img to allow unoptimized Cloudinary URLs directly (which are already optimized) */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.image_url}
                  alt="Portfolio"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />

                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <a
                    href={img.image_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-white text-foreground flex items-center justify-center hover:bg-primary hover:text-white transition-colors shadow-sm"
                    title="Voir en plein écran"
                  >
                    <Eye size={18} />
                  </a>
                  <button
                    className="w-10 h-10 rounded-full bg-white text-destructive flex items-center justify-center hover:bg-destructive hover:text-white transition-colors shadow-sm"
                    title="Supprimer"
                    onClick={() => handleDelete(img)}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-secondary/20 rounded-3xl border-2 border-dashed border-border/50">
          <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-6">
            <Camera size={36} className="text-muted-foreground" />
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
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <CloudUpload size={18} className="mr-2" />
            Ajouter vos premières images
          </Button>
        </div>
      )}
    </div>
  );
}
