"use client";

import React, { useEffect, useState, useRef } from "react";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import { Eye, Trash2, Package, Loader2, Plus, X } from "lucide-react";
import Image from "next/image";

interface Category {
  id: string;
  name_fr: string;
}

interface Product {
  id: string;
  title: string;
  description: string | null;
  price: number;
  category_id: string | null;
  images: string[];
  stock: number;
  created_at: string;
}

export default function ProductsManager() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [stock, setStock] = useState("1");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        supabase.from("products").select("*").eq("creator_id", user?.id).order("created_at", { ascending: false }),
        supabase.from("categories").select("id, name_fr").order("name_fr")
      ]);
      if (productsRes.data) setProducts(productsRes.data);
      if (categoriesRes.data) {
        setCategories(categoriesRes.data);
        if (categoriesRes.data.length > 0) setCategoryId(categoriesRes.data[0].id);
      }
    } catch (error) {
      console.error(error);
      toast.error("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files.length) return;
    const file = e.target.files[0];
    
    // In a real app, upload to a storage bucket or Cloudinary
    // For now, let's use the existing /api/upload if it exists, or just simulate
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "products");

    toast.loading("Upload de l'image...", { id: "upload" });
    try {
      const response = await fetch("/api/upload", { method: "POST", body: formData });
      if (!response.ok) throw new Error("Upload failed");
      const resData = await response.json();
      const imageUrl = resData.url || resData.data?.image_url;
      if (imageUrl) {
        setUploadedImages(prev => [...prev, imageUrl]);
        toast.success("Image ajoutée", { id: "upload" });
      } else {
        throw new Error("No image URL returned");
      }
    } catch (error) {
      console.error(error);
      toast.error("Échec de l'upload", { id: "upload" });
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!title || !price || !categoryId) {
      toast.error("Veuillez remplir les champs obligatoires");
      return;
    }

    setSaving(true);
    try {
      const newProduct = {
        title,
        description,
        price: parseFloat(price),
        category_id: categoryId,
        creator_id: user.id,
        stock: parseInt(stock, 10),
        images: uploadedImages,
      };

      const { data, error } = await supabase.from("products").insert([newProduct]).select().single();
      if (error) throw error;
      
      setProducts(prev => [data, ...prev]);
      toast.success("Produit créé avec succès !");
      setIsModalOpen(false);
      
      // Reset form
      setTitle("");
      setDescription("");
      setPrice("");
      setStock("1");
      setUploadedImages([]);
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la création du produit");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) return;
    try {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
      setProducts(prev => prev.filter(p => p.id !== id));
      toast.success("Produit supprimé");
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
          {[1, 2, 3].map((i) => <div key={i} className="aspect-[4/5] bg-muted rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 relative">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Mes Produits</h1>
          <p className="text-muted-foreground max-w-xl">
            Gérez votre catalogue. {products.length} produit{products.length > 1 ? "s" : ""} en ligne.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus size={18} className="mr-2" />
          Nouveau Produit
        </Button>
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="group bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300">
              <div className="relative aspect-[4/5] bg-secondary overflow-hidden">
                <img
                  src={product.images?.[0] || "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=80"}
                  alt={product.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button onClick={() => handleDelete(product.id)} className="w-10 h-10 rounded-full bg-white text-destructive flex items-center justify-center hover:bg-destructive hover:text-white transition-colors shadow-sm">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-foreground truncate">{product.title}</h3>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-primary font-bold">{product.price.toLocaleString("fr-DZ")} DZD</span>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">Stock: {product.stock}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-secondary/20 rounded-3xl border-2 border-dashed border-border/50">
          <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-6">
            <Package size={36} className="text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">Votre catalogue est vide</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Ajoutez vos produits pour que vos clients puissent les découvrir et les commander.
          </p>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus size={18} className="mr-2" />
            Créer votre premier produit
          </Button>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-border/50 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur z-10">
              <h2 className="text-xl font-bold">Nouveau Produit</h2>
              <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Titre *</label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Ex: Robe Kabyle Moderne" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Prix (DZD) *</label>
                  <Input type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} required placeholder="Ex: 15000" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Catégorie *</label>
                  <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full h-11 px-3 border border-input rounded-xl bg-background" required>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name_fr}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Stock</label>
                  <Input type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Description</label>
                <textarea 
                  value={description} onChange={(e) => setDescription(e.target.value)} 
                  className="w-full min-h-[100px] p-3 border border-input rounded-xl bg-background focus:ring-2 focus:ring-primary/20 outline-none" 
                  placeholder="Décrivez votre produit, les tissus utilisés..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Images</label>
                <div className="flex flex-wrap gap-4">
                  {uploadedImages.map((img, idx) => (
                    <div key={idx} className="relative w-24 h-24 rounded-xl overflow-hidden border border-border">
                      <img src={img} alt="preview" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 hover:bg-destructive">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="w-24 h-24 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground hover:bg-muted transition-colors">
                    <Plus size={24} />
                    <span className="text-xs mt-1">Ajouter</span>
                  </button>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Annuler</Button>
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 size={16} className="mr-2 animate-spin" />}
                  Créer le produit
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
