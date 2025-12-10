"use client"

import type React from "react"

import { useState, useRef } from "react"
import Image from "next/image"
import { Upload, X, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  disabled?: boolean
  folder?: string
  maxSize?: number // in MB
  aspectRatio?: string
  className?: string
}

export default function ImageUpload({
  value,
  onChange,
  disabled = false,
  folder = "uploads",
  maxSize = 5,
  aspectRatio = "aspect-video",
  className = "",
}: ImageUploadProps) {
  const { toast } = useToast()
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(value || "")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File",
        description: "Please select an image file",
        variant: "destructive",
      })
      return
    }

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: `Please select an image smaller than ${maxSize}MB`,
        variant: "destructive",
      })
      return
    }

    // Create preview
    const preview = URL.createObjectURL(file)
    setPreviewUrl(preview)

    // Upload file
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", folder)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to upload image")
      }

      const data = await response.json()
      onChange(data.url)
      setPreviewUrl(data.url)

      toast({
        title: "Success",
        description: "Image uploaded successfully",
      })
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      })
      setPreviewUrl(value || "")
    } finally {
      setIsUploading(false)
    }
  }

  const removeImage = async () => {
    if (value) {
      try {
        await fetch(`/api/upload/delete?path=${encodeURIComponent(value)}`, {
          method: "DELETE",
        })
      } catch (error) {
        console.error("Failed to delete file:", error)
      }
    }

    setPreviewUrl("")
    onChange("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={disabled || isUploading}
        className="hidden"
      />

      {previewUrl ? (
        <div className="space-y-2">
          <div className={`relative ${aspectRatio} w-full rounded-lg overflow-hidden bg-gray-100 border`}>
            <Image src={previewUrl || "/placeholder.svg"} alt="Preview" fill className="object-cover" unoptimized />
            {isUploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-sm">Uploading...</p>
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || isUploading}
              size="sm"
            >
              <Upload className="h-4 w-4 mr-2" />
              Change Image
            </Button>
            <Button type="button" variant="outline" onClick={removeImage} disabled={disabled || isUploading} size="sm">
              <X className="h-4 w-4 mr-2" />
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <div
          className={`${aspectRatio} w-full border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors ${
            disabled ? "opacity-50 cursor-not-allowed" : ""
          }`}
          onClick={() => !disabled && fileInputRef.current?.click()}
        >
          <ImageIcon className="h-12 w-12 text-gray-400 mb-4" />
          <p className="text-sm text-gray-600 mb-2">Click to upload image</p>
          <p className="text-xs text-gray-500">Supported: JPG, PNG, GIF, WebP (max {maxSize}MB)</p>
        </div>
      )}
    </div>
  )
}
