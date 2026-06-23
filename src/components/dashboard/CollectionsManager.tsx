"use client";

import React, { useEffect, useState, useRef } from "react";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import { Trash2, Layers, Loader2, Plus, X } from "lucide-react";

interface Collection {
  id: string;
  title: string;
  image: string | null;
  status: string;
  created_at: string;
}

export default function CollectionsManager() {
  const { user } = useAuth();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [title, setTitle] = useState("");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const { data, error } = await supabase.from("collections").select("*").eq("creator_id", user?.id).order("created_at", { ascending: false });
      if (error) throw error;
      if (data) setCollections(data);
    } catch (error) {
      console.error(error);
      toast.error("Erreur de chargement des collections");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files.length) return;
    const file = e.target.files[0];
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "collections");

    toast.loading("Upload de l'image...", { id: "upload" });
    try {
      const response = await fetch("/api/upload", { method: "POST", body: formData });
      if (!response.ok) throw new Error("Upload failed");
      const resData = await response.json();
      if (resData.data && resData.data.image_url) {
        setUploadedImage(resData.data.image_url);
        toast.success("Image ajoutée", { id: "upload" });
      }
    } catch (error) {
      console.error(error);
      toast.error("Échec de l'upload", { id: "upload" });
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!title) {
      toast.error("Veuillez saisir un titre");
      return;
    }

    setSaving(true);
    try {
      const newCollection = {
        title,
        creator_id: user.id,
        image: uploadedImage,
        status: "ACTIVE"
      };

      const { data, error } = await supabase.from("collections").insert([newCollection]).select().single();
      if (error) throw error;
      
      setCollections(prev => [data, ...prev]);
      toast.success("Collection créée !");
      setIsModalOpen(false);
      
      // Reset form
      setTitle("");
      setUploadedImage(null);
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la création");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette collection ?")) return;
    try {
      const { error } = await supabase.from("collections").delete().eq("id", id);
      if (error) throw error;
      setCollections(prev => prev.filter(c => c.id !== id));
      toast.success("Collection supprimée");
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
          {[1, 2, 3].map((i) => <div key={i} className="h-40 bg-muted rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 relative">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Mes Collections</h1>
          <p className="text-muted-foreground max-w-xl">
            Regroupez vos produits en collections thématiques.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus size={18} className="mr-2" />
          Nouvelle Collection
        </Button>
      </div>

      {collections.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {collections.map((collection) => (
            <div key={collection.id} className="group bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300">
              <div className="relative h-40 bg-secondary overflow-hidden">
                <img
                  src={collection.image || "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=80"}
                  alt={collection.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button onClick={() => handleDelete(collection.id)} className="w-10 h-10 rounded-full bg-white text-destructive flex items-center justify-center hover:bg-destructive hover:text-white transition-colors shadow-sm">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-foreground truncate">{collection.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">Status: {collection.status}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-secondary/20 rounded-3xl border-2 border-dashed border-border/50">
          <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-6">
            <Layers size={36} className="text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">Aucune collection</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Créez des collections pour mieux organiser votre boutique en ligne.
          </p>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus size={18} className="mr-2" />
            Créer une collection
          </Button>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl">
            <div className="p-6 border-b border-border/50 flex items-center justify-between">
              <h2 className="text-xl font-bold">Nouvelle Collection</h2>
              <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Titre de la collection *</label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Ex: Collection Été 2024" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Image de couverture</label>
                <div className="flex flex-col gap-4">
                  {uploadedImage ? (
                    <div className="relative w-full h-40 rounded-xl overflow-hidden border border-border">
                      <img src={uploadedImage} alt="preview" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setUploadedImage(null)} className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-2 hover:bg-destructive">
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full h-40 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground hover:bg-muted transition-colors">
                      <Plus size={24} className="mb-2" />
                      <span className="text-sm font-semibold">Ajouter une image</span>
                    </button>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Annuler</Button>
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 size={16} className="mr-2 animate-spin" />}
                  Enregistrer
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
