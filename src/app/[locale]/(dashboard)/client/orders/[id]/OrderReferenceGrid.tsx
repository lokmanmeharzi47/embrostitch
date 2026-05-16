"use client";

import { type ChangeEvent, useRef, useState } from "react";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";

interface OrderReferenceGridProps {
  orderId: string;
  initialImages: string[];
}

interface UploadResponse {
  url?: string;
  data?: {
    file_url?: string;
  };
  error?: string;
}

export default function OrderReferenceGrid({ orderId, initialImages }: OrderReferenceGridProps) {
  const [images, setImages] = useState(initialImages);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Veuillez sélectionner une image.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "reference");
    formData.append("orderId", orderId);

    setIsUploading(true);
    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = (await response.json()) as UploadResponse;
      if (!response.ok) {
        throw new Error(result.error || "Upload failed");
      }

      const uploadedUrl = result.url || result.data?.file_url;
      if (uploadedUrl) {
        setImages((current) => [...current, uploadedUrl]);
        toast.success("Image ajoutée.");
      }
    } catch (error) {
      console.error("Reference upload failed:", error);
      toast.error("Impossible d'ajouter cette image.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <section className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
      <div className="p-5 border-b border-border bg-secondary/20 flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">Inspiration & Files</h2>
        <Button
          variant="outline"
          size="sm"
          className="bg-white text-xs h-8"
          onClick={handleUploadClick}
          disabled={isUploading}
        >
          <span className="material-icons text-[16px] mr-1">upload</span>
          {isUploading ? "Uploading..." : "Upload New"}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
      <div className="p-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-wrap">
          {images.map((img, i) => (
            <div key={`${img}-${i}`} className="aspect-square bg-secondary rounded-lg border border-border relative group cursor-pointer overflow-hidden">
              <img src={img} alt={`Reference ${i + 1}`} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="material-icons text-white">zoom_in</span>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={handleUploadClick}
            disabled={isUploading}
            className="aspect-square bg-secondary/30 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:bg-secondary/50 transition-colors hover:border-primary/50 text-muted-foreground hover:text-primary disabled:opacity-60"
          >
            <span className="material-icons mb-1 text-[24px]">add_photo_alternate</span>
            <span className="text-xs font-medium">{isUploading ? "Uploading..." : "Add File"}</span>
          </button>
        </div>
      </div>
    </section>
  );
}
