"use client";

import React, { useEffect, useState } from "react";

import Button from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import FileUpload from "@/components/dashboard/FileUpload";
import { Eye, Trash2, Camera, Loader2 } from "lucide-react";

export default function CreatorPortfolioPage() {
  const { user } = useAuth();
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!user) return;
    const fetchPortfolio = async () => {
      const { data, error } = await supabase
        .from("couturiere_profiles")
        .select("portfolio_images")
        .eq("id", user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is not found for single()
        console.error("Error fetching portfolio:", error);
      }

      if (data && data.portfolio_images) {
        setImages(data.portfolio_images);
      }
      setLoading(false);
    };
    fetchPortfolio();
  }, [user, supabase]);

  const handleUploadComplete = async (newUrls: string[]) => {
    if (!user) return;
    
    const updatedImages = [...images, ...newUrls];
    
    const { error } = await supabase
      .from("couturiere_profiles")
      .upsert({ 
        id: user.id, 
        portfolio_images: updatedImages,
        // Since it's an upsert on a potentially new row, we should provide some defaults if needed
        // but id should be enough if other fields are nullable or have defaults.
      });

    if (error) {
      console.error("Error upserting portfolio:", error);
      toast.error("Erreur sauvegarde portfolio");
    } else {
      setImages(updatedImages);
      toast.success(`${newUrls.length} image(s) ajoutée(s)`);
    }
  };

  const handleDelete = async (imageUrl: string) => {
    if (!user) return;
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
      
      // Attempt to delete from bucket if it's our bucket
      const pathMatch = imageUrl.match(/\/portfolio\/(.*)$/);
      if (pathMatch && pathMatch[1]) {
        const filePath = pathMatch[1].split('?')[0]; // Remove query params
        await supabase.storage.from("portfolio").remove([filePath]);
      }
    }
  };

  if (loading) {
    return (
    <>
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-muted rounded-xl w-1/3" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-[4/5] bg-muted rounded-2xl" />
            ))}
          </div>
        </div>
    </>
    );
  }

  return (
    <>
      <div className="max-w-6xl mx-auto">
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
        </div>

        <div className="mb-12">
          <FileUpload 
            bucket="portfolio" 
            folder="gallery" 
            multiple={true} 
            onUploadComplete={handleUploadComplete} 
          />
        </div>

        {images.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {images.map((url, index) => (
              <div
                key={index}
                className="group relative bg-card rounded-2xl border border-border overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                <div className="aspect-[4/5] bg-secondary overflow-hidden">
                  <img
                    src={url}
                    alt={`Portfolio ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-4">
                    <div className="flex gap-2 w-full">
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 h-10 rounded-xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/40 transition-colors"
                      >
                        <Eye size={18} className="mr-2" />
                        <span className="text-xs font-semibold">Voir</span>
                      </a>
                      <button
                        onClick={() => handleDelete(url)}
                        className="w-10 h-10 rounded-xl bg-destructive/80 backdrop-blur-md text-white flex items-center justify-center hover:bg-destructive transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-secondary/10 rounded-3xl border-2 border-dashed border-border/50">
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-6">
              <Camera size={36} className="text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">
              Votre portfolio est vide
            </h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Partagez vos œuvres pour inspirer vos clients. Les images de haute qualité augmentent vos chances d'obtenir des contrats.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
