"use client"

import { useRef, useState } from "react"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { CircleUser, Loader2, CheckCircle2, ImagePlus, MapPinned } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { ALGERIA_WILAYAS } from "@/lib/data/algeria"

interface CreatorProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  city: string;
  bio: string;
  avatar_url: string;
  wilaya: string;
  commune: string;
  address: string;
  cover_image: string;
}

export default function CreatorProfileClient({
  initialProfile
}: {
  initialProfile: CreatorProfile
}) {
  const [profile, setProfile] = useState(initialProfile)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  const coverInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const handleSave = async () => {
    setLoading(true)
    setSuccess(false)

    const [{ error }, { error: cpError }] = await Promise.all([
      supabase
        .from("profiles")
        .update({
          first_name: profile.first_name,
          last_name: profile.last_name,
          phone: profile.phone,
          city: profile.city,
          bio: profile.bio
        })
        .eq("id", profile.id),
      supabase
        .from("creator_profiles")
        .update({
          wilaya: profile.wilaya || null,
          commune: profile.commune || null,
          address: profile.address || null,
        })
        .eq("id", profile.id),
    ])

    if (!error && !cpError) {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    }

    setLoading(false)
  }

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingCover(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", "cover")

      const res = await fetch("/api/upload", { method: "POST", body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Upload failed")

      setProfile((prev) => ({ ...prev, cover_image: data.url }))
    } catch (err) {
      console.error("Cover upload error:", err)
    } finally {
      setUploadingCover(false)
      if (coverInputRef.current) coverInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Profil Créateur</h1>
          <p className="text-muted-foreground mt-2 text-lg">Gérez votre identité publique et votre biographie.</p>
        </div>
        <div className="flex items-center gap-4">
          {success && (
            <span className="text-sm text-green-600 flex items-center gap-1 font-bold select-none">
              <CheckCircle2 size={16} /> Modifications enregistrées
            </span>
          )}
          <Button variant="luxury" size="lg" onClick={handleSave} disabled={loading} className="min-w-[160px] shadow-xl shadow-primary/10">
            {loading ? <Loader2 className="animate-spin" size={18} /> : "Enregistrer"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="border-none shadow-sm flex flex-col items-center bg-white p-8">
            <div className="mx-auto w-40 h-40 mb-6 bg-secondary rounded-3xl flex items-center justify-center overflow-hidden border-4 border-white shadow-xl relative group cursor-pointer transition-all">
               {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
               ) : (
                  <CircleUser size={64} className="text-muted-foreground/40 group-hover:text-primary transition-colors duration-500" />
               )}
               <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                 <span className="text-white text-xs font-black uppercase tracking-widest">Modifier</span>
               </div>
            </div>
            <h2 className="text-2xl font-black text-foreground tracking-tighter">{profile.first_name || "Votre Nom"} {profile.last_name}</h2>
            <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mt-2 mb-6">Compte Créateur</p>
            <div className="text-sm text-muted-foreground text-center font-medium leading-relaxed">
              Une photo de profil professionnelle augmente la confiance des clients envers votre marque.
            </div>
        </Card>

        <div className="md:col-span-2 space-y-8">
          <Card className="border-none shadow-sm bg-white p-8">
            <div className="mb-8 border-b border-border/50 pb-6">
               <h3 className="text-xl font-bold text-foreground">Informations Personnelles</h3>
               <p className="text-muted-foreground text-sm mt-1">Mettez à jour vos coordonnées et les détails de votre marque.</p>
            </div>
            <div className="space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <Input
                   label="Prénom / Nom de Marque"
                   value={profile.first_name || ""}
                   onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                   placeholder="ex: Modern Stitch"
                 />
                 <Input
                   label="Nom (Optionnel)"
                   value={profile.last_name || ""}
                   onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                   placeholder="ex: Studio"
                 />
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <Input
                   label="Ville / Localisation"
                   value={profile.city || ""}
                   onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                   placeholder="ex: Alger"
                 />
                 <Input
                   label="Numéro de Téléphone"
                   value={profile.phone || ""}
                   onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                   placeholder="ex: +213 555 123 456"
                 />
               </div>

               <Input
                 label="Adresse Email"
                 value={profile.email || ""}
                 disabled
                 className="bg-secondary/30 cursor-not-allowed opacity-70"
               />

               <div className="w-full space-y-2">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Bio / Description</label>
                    <textarea
                      value={profile.bio || ""}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      placeholder="Parlez de votre parcours, de votre style et de ce que vous aimez créer..."
                      className="flex min-h-[160px] w-full rounded-2xl border border-border/50 bg-secondary/20 px-4 py-4 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all font-medium"
                    />
               </div>
            </div>
          </Card>

          <Card className="border-none shadow-sm bg-white p-8">
            <div className="mb-8 border-b border-border/50 pb-6 flex items-center gap-3">
              <MapPinned className="text-primary" size={22} />
              <div>
                <h3 className="text-xl font-bold text-foreground">Atelier sur la Carte</h3>
                <p className="text-muted-foreground text-sm mt-1">
                  Ces informations positionnent votre atelier sur la carte MALIXA et sont visibles par les clients.
                </p>
              </div>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="w-full space-y-2">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Wilaya</label>
                  <select
                    value={profile.wilaya || ""}
                    onChange={(e) => setProfile({ ...profile, wilaya: e.target.value })}
                    className="flex h-11 w-full rounded-xl border border-border bg-card px-4 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent transition-all"
                  >
                    <option value="">Sélectionner une wilaya</option>
                    {ALGERIA_WILAYAS.map((w) => (
                      <option key={w.code} value={w.name_fr}>{w.name_fr}</option>
                    ))}
                  </select>
                </div>
                <Input
                  label="Commune"
                  value={profile.commune || ""}
                  onChange={(e) => setProfile({ ...profile, commune: e.target.value })}
                  placeholder="ex: Hydra"
                />
              </div>
              <Input
                label="Adresse (Optionnel)"
                value={profile.address || ""}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                placeholder="ex: 12 Rue des Frères Bouadou"
              />

              <div className="w-full space-y-2">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Photo de Couverture</label>
                <div className="relative h-40 w-full overflow-hidden rounded-2xl border border-border/50 bg-secondary/20">
                  {profile.cover_image ? (
                    <img src={profile.cover_image} alt="Couverture" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <ImagePlus className="text-muted-foreground/40" size={32} />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => coverInputRef.current?.click()}
                    disabled={uploadingCover}
                    className="absolute inset-0 flex items-center justify-center bg-black/0 text-white opacity-0 transition-opacity hover:bg-black/40 hover:opacity-100 disabled:opacity-100 disabled:bg-black/40"
                  >
                    {uploadingCover ? (
                      <Loader2 className="animate-spin" size={24} />
                    ) : (
                      <span className="text-xs font-black uppercase tracking-widest">
                        {profile.cover_image ? "Changer l'image" : "Ajouter une image"}
                      </span>
                    )}
                  </button>
                </div>
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCoverUpload}
                />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
