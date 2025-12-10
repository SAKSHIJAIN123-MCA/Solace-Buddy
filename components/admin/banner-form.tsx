"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import type { Banner } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { Upload, X } from "lucide-react"

interface BannerFormProps {
  banner?: Banner
}

export function BannerForm({ banner }: BannerFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState(banner?.backgroundImage || "")

  const [formData, setFormData] = useState({
    title: banner?.title || "",
    subtitle: banner?.subtitle || "",
    description: banner?.description || "",
    buttonText: banner?.buttonText || "",
    buttonLink: banner?.buttonLink || "#",
    backgroundImage: banner?.backgroundImage || "",
    isActive: banner?.isActive ?? true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = banner ? `/api/banners/${banner._id}` : "/api/banners"
      const method = banner ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Success",
          description: `Banner ${banner ? "updated" : "created"} successfully`,
        })
        router.push("/admin/banners")
      } else {
        toast({
          title: "Error",
          description: result.error || `Failed to ${banner ? "update" : "create"} banner`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error saving banner:", error)
      toast({
        title: "Error",
        description: `Failed to ${banner ? "update" : "create"} banner`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

   
    const imageUrl = `/placeholder.svg?height=300&width=800&query=${encodeURIComponent(file.name)}`

    setFormData({ ...formData, backgroundImage: imageUrl })
    setImagePreview(imageUrl)

    toast({
      title: "Image uploaded",
      description: "Image has been uploaded successfully",
    })
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>{banner ? "Edit Banner" : "Create New Banner"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter banner title"
              required
            />
          </div>

          {/* Subtitle */}
          <div className="space-y-2">
            <Label htmlFor="subtitle">Subtitle</Label>
            <Textarea
              id="subtitle"
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              placeholder="Enter banner subtitle"
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter banner description (optional)"
              rows={2}
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="image">Banner Image</Label>
            <div className="space-y-4">
              {imagePreview && (
                <div className="relative">
                  <img
                    src={imagePreview || "/placeholder.svg"}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-md border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setImagePreview("")
                      setFormData({ ...formData, backgroundImage: "" })
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              <div className="flex items-center space-x-4">
                <Input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="image-upload" />
                <Label
                  htmlFor="image-upload"
                  className="cursor-pointer flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <Upload className="h-4 w-4" />
                  <span>Upload Image</span>
                </Label>

                <span className="text-sm text-gray-500">or</span>

                <Input
                  placeholder="Enter image URL"
                  value={formData.backgroundImage}
                  onChange={(e) => {
                    setFormData({ ...formData, backgroundImage: e.target.value })
                    setImagePreview(e.target.value)
                  }}
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="buttonText">Button Text</Label>
            <Input
              id="buttonText"
              value={formData.buttonText}
              onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
              placeholder="Enter button text"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="buttonLink">Button Link</Label>
            <Input
              id="buttonLink"
              value={formData.buttonLink}
              onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
              placeholder="Enter button link URL"
            />
          </div>

          {/* Active Status */}
          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
            <Label htmlFor="isActive">Active (visible on website)</Label>
          </div>

          {/* Actions */}
          <div className="flex space-x-4 pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : banner ? "Update Banner" : "Create Banner"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/admin/banners")}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
