"use client"

import React, { useState, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, X, Image as ImageIcon, Loader2, Trash2, CheckCircle2, AlertCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/context/AuthContext"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/Button"

interface ReferenceFile {
  id?: string
  file_url: string
  file_name: string
  file_type: string
  size?: number
  uploading?: boolean
  error?: string
}

interface ReferenceUploaderProps {
  onReferencesChange: (references: string[]) => void
  initialReferences?: ReferenceFile[]
}

export default function ReferenceUploader({ 
  onReferencesChange,
  initialReferences = [] 
}: ReferenceUploaderProps) {
  const { user } = useAuth()
  const [references, setReferences] = useState<ReferenceFile[]>(initialReferences)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()
  const MAX_FILES = 5
  const MAX_SIZE_MB = 5

  // Use effect to update parent component when references change
  // This avoids the "Cannot update a component while rendering a different component" warning
  React.useEffect(() => {
    const validUrls = references
      .filter(ref => !ref.uploading && !ref.error)
      .map(ref => ref.file_url)
    
    // We only want to call this if the valid URLs have actually changed
    // to prevent unnecessary re-renders in the parent
    onReferencesChange(validUrls)
  }, [references, onReferencesChange])

  const handleFileUpload = async (files: FileList | File[]) => {
    if (!user) {
      toast.error("Vous devez être connecté pour uploader des fichiers.")
      return
    }

    const fileArray = Array.from(files)
    
    if (references.length + fileArray.length > MAX_FILES) {
      toast.error(`Maximum ${MAX_FILES} fichiers autorisés.`)
      return
    }

    const newRefs: ReferenceFile[] = fileArray.map(file => ({
      file_url: URL.createObjectURL(file), // Temporary preview URL
      file_name: file.name,
      file_type: file.type,
      size: file.size,
      uploading: true
    }))

    setReferences(prev => [...prev, ...newRefs])

    // Process each file
    for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i]
        
        // Validation
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
            setReferences(prev => prev.map(r => r.file_name === file.name ? { ...r, uploading: false, error: "Trop lourd" } : r))
            toast.error(`${file.name} dépasse la limite de ${MAX_SIZE_MB}MB.`)
            continue
        }

        if (!file.type.startsWith("image/")) {
            setReferences(prev => prev.map(r => r.file_name === file.name ? { ...r, uploading: false, error: "Format invalide" } : r))
            toast.error(`${file.name} n'est pas une image.`)
            continue
        }

        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("type", "reference");

            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) throw new Error("Upload failed");

            const resData = await response.json();
            const dbData = resData.data;

            // Update UI
            setReferences(prev => {
                const updated = prev.map(r => 
                    r.file_name === file.name && r.uploading 
                    ? { ...r, id: dbData.id, file_url: dbData.file_url, uploading: false } 
                    : r
                )
                return updated
            })

        } catch (error: any) {
            console.error("Upload failed:", error)
            setReferences(prev => prev.map(r => r.file_name === file.name ? { ...r, uploading: false, error: "Échec" } : r))
            toast.error(`Erreur d'upload pour ${file.name}`)
        }
    }
  }

  const handleDelete = async (ref: ReferenceFile) => {
    if (!ref.id && !ref.error) {
        // If it was just a local preview that hasn't finished uploading
        setReferences(prev => prev.filter(r => r !== ref))
        return
    }

    try {
        const response = await fetch("/api/upload", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                id: ref.id,
                image_url: ref.file_url,
                type: "reference",
            }),
        });

        if (!response.ok) throw new Error("Deletion failed");

        setReferences(prev => prev.filter(r => r.id !== ref.id))
        toast.success("Fichier supprimé.")

    } catch (error: any) {
        console.error("Delete failed:", error)
        toast.error("Impossible de supprimer le fichier.")
    }
  }

  return (
    <div className="w-full space-y-4">
      {/* Drag & Drop Zone */}
      <motion.div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files) handleFileUpload(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-[2rem] p-10 
          flex flex-col items-center justify-center gap-4
          transition-all cursor-pointer group overflow-hidden
          ${isDragging 
            ? "border-primary bg-primary/5 scale-[0.99] shadow-inner" 
            : "border-indigo-100 bg-indigo-50/30 hover:border-primary/40 hover:bg-indigo-50/50"}
        `}
        whileHover={{ scale: 1.005 }}
        whileTap={{ scale: 0.995 }}
      >
        <div className={`
            w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300
            ${isDragging ? "bg-primary text-white rotate-12" : "bg-white text-primary shadow-sm group-hover:scale-110 group-hover:rotate-6"}
        `}>
          <Upload size={28} />
        </div>
        
        <div className="text-center">
          <p className="text-lg font-bold text-slate-800">
            {isDragging ? "Déposez vos fichiers ici" : "Cliquez ou glissez vos images"}
          </p>
          <p className="text-slate-500 text-sm mt-1">
            Max 5 images (JPG, PNG, WebP) • 5MB max
          </p>
        </div>

        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          multiple 
          accept="image/*"
          onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
        />
        
        {/* Decorative background circles */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      </motion.div>

      {/* Previews List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {references.map((ref, idx) => (
            <motion.div
              key={ref.id || `temp-${idx}`}
              layout
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
              className="relative group bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow h-24 flex items-center p-3 gap-3"
            >
              {/* Thumbnail */}
              <div className="relative w-16 h-16 bg-slate-50 rounded-lg overflow-hidden flex-shrink-0">
                <img 
                  src={ref.file_url} 
                  alt={ref.file_name} 
                  className={`w-full h-full object-cover transition-opacity duration-300 ${ref.uploading ? "opacity-30 blur-sm" : "opacity-100"}`}
                />
                
                {ref.uploading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 size={20} className="animate-spin text-primary" />
                  </div>
                )}
                
                {ref.error && (
                  <div className="absolute inset-0 bg-red-50/80 flex items-center justify-center text-red-500">
                    <AlertCircle size={20} />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 pr-8">
                <p className="text-sm font-bold text-slate-800 truncate">{ref.file_name}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  {ref.uploading ? (
                    <span className="text-[10px] uppercase tracking-wider font-bold text-primary animate-pulse">Envoi...</span>
                  ) : ref.error ? (
                    <span className="text-[10px] uppercase tracking-wider font-bold text-red-500">{ref.error}</span>
                  ) : (
                    <div className="flex items-center gap-1">
                        <CheckCircle2 size={12} className="text-emerald-500" />
                        <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-500">Prêt</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(ref); }}
                className="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur-sm rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100 shadow-sm border border-slate-100"
              >
                <Trash2 size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {references.length > 0 && references.length < MAX_FILES && (
          <p className="text-center text-xs text-slate-400 italic">
            Vous pouvez ajouter encore {MAX_FILES - references.length} image(s).
          </p>
      )}
    </div>
  )
}
