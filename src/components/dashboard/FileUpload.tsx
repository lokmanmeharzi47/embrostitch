"use client"

import React, { useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/context/AuthContext"
import Button from "@/components/ui/Button"
import { Upload, X, FileText, Image as ImageIcon, Loader2 } from "lucide-react"
import toast from "react-hot-toast"

interface FileUploadProps {
  bucket: string
  folder?: string
  onUploadComplete: (urls: string[]) => void
  multiple?: boolean
  accept?: string
  maxSize?: number // in MB
}

export default function FileUpload({
  bucket,
  folder = "",
  onUploadComplete,
  multiple = false,
  accept = "image/*",
  maxSize = 5
}: FileUploadProps) {
  const { user } = useAuth()
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !user) return
    
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    // Validation
    for (const file of files) {
      if (file.size > maxSize * 1024 * 1024) {
        toast.error(`File ${file.name} is too large (max ${maxSize}MB)`)
        return
      }
    }

    setUploading(true)
    const uploadedUrls: string[] = []

    try {
      for (const file of files) {
        const ext = file.name.split(".").pop()
        const fileName = `${folder ? folder + "/" : ""}${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`

        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(fileName, file, {
            cacheControl: "3600",
            upsert: false
          })

        if (error) {
          console.error("Upload error:", error)
          toast.error(`Failed to upload ${file.name}`)
          continue
        }

        const { data: { publicUrl } } = supabase.storage
          .from(bucket)
          .getPublicUrl(fileName)

        uploadedUrls.push(publicUrl)
      }

      if (uploadedUrls.length > 0) {
        onUploadComplete(uploadedUrls)
        toast.success(`${uploadedUrls.length} file(s) uploaded successfully`)
      }
    } catch (err) {
      console.error("Upload process error:", err)
      toast.error("An unexpected error occurred during upload")
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleUpload}
        multiple={multiple}
        accept={accept}
        className="hidden"
      />
      
      <div 
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`
          border-2 border-dashed border-border rounded-2xl p-8 
          flex flex-col items-center justify-center gap-3
          transition-all cursor-pointer bg-card
          ${uploading ? "opacity-50 cursor-not-allowed" : "hover:border-primary hover:bg-primary/5"}
        `}
      >
        <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
          {uploading ? (
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          ) : (
            <Upload className="w-6 h-6 text-muted-foreground" />
          )}
        </div>
        
        <div className="text-center">
          <p className="text-sm font-semibold text-foreground">
            {uploading ? "Uploading files..." : `Click to upload ${multiple ? "files" : "a file"}`}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {accept === "image/*" ? "PNG, JPG up to " : "Files up to "}{maxSize}MB
          </p>
        </div>
        
        {!uploading && (
          <Button variant="outline" size="sm" className="mt-2">
            Select files
          </Button>
        )}
      </div>
    </div>
  )
}
