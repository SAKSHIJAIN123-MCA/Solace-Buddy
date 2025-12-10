"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import ImageUpload from "@/components/image"

interface IHeroSlide {
  _id?: string
  title: string
  subtitle?: string
  description?: string
  image: string
  link?: string
  buttonText?: string
  isActive: boolean
  order: number
}

export default function EditHeroSlideClientPage({ id }: { id: string }) {
  const isNew = id === "new"
  const router = useRouter()
  const { toast } = useToast()

  const [data, setData] = useState<IHeroSlide>({
    title: "",
    subtitle: "",
    description: "",
    image: "",
    link: "",
    buttonText: "Learn More",
    isActive: true,
    order: 0,
  })
  const [isLoading, setIsLoading] = useState(!isNew)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!isNew) {
      fetchSlide()
    } else {
      setIsLoading(false)
    }
  }, [id])

  const fetchSlide = async () => {
    try {
      const res = await fetch(`/api/admin/hero/${id}`)
      if (!res.ok) throw new Error("Failed to fetch hero slide")
      const slide = await res.json()
      setData(slide)
    } catch (err) {
      toast({
        title: "Error",
        description: "Could not load hero slide",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (url: string) => {
    setData((prev) => ({ ...prev, image: url }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSaving) return

    if (!data.title || !data.image) {
      toast({
        title: "Validation Error",
        description: "Title and image are required.",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      const url = isNew ? `/api/admin/hero` : `/api/admin/hero/${id}`
      const method = isNew ? "POST" : "PUT"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || "Failed to save")
      }

      toast({ title: isNew ? "Hero Slide Created" : "Hero Slide Updated" })
      router.push("/admin/hero")
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-60">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="ml-4 text-gray-500">Loading...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-10 py-16">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Button variant="outline" size="icon" asChild className="hover:bg-black hover:text-white bg-transparent">
            <Link href="/admin/hero">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold">{isNew ? "Create Hero Slide" : "Edit Hero Slide"}</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/admin/hero")} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" form="hero-slide-form" disabled={isSaving} className="bg-black text-white">
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <form id="hero-slide-form" onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            name="title"
            value={data.title}
            onChange={handleChange}
            placeholder="e.g., Welcome to Our Store"
            disabled={isSaving}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="subtitle">Subtitle</Label>
          <Input
            id="subtitle"
            name="subtitle"
            value={data.subtitle}
            onChange={handleChange}
            placeholder="e.g., Discover amazing products"
            disabled={isSaving}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            value={data.description}
            onChange={handleChange}
            placeholder="Detailed description of the slide..."
            disabled={isSaving}
            rows={4}
          />
        </div>

        {/* Image Upload Section */}
        <div className="space-y-2">
          <Label>Hero Image *</Label>
          <ImageUpload
            value={data.image}
            onChange={handleImageChange}
            disabled={isSaving}
            folder="hero-slides"
            maxSize={5}
            aspectRatio="aspect-video"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="link">Link URL</Label>
          <Input
            id="link"
            name="link"
            value={data.link}
            onChange={handleChange}
            placeholder="e.g., /products or https://example.com"
            disabled={isSaving}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="buttonText">Button Text</Label>
          <Input
            id="buttonText"
            name="buttonText"
            value={data.buttonText}
            onChange={handleChange}
            placeholder="e.g., Shop Now, Learn More"
            disabled={isSaving}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="order">Display Order</Label>
            <Input
              id="order"
              name="order"
              type="number"
              value={data.order}
              onChange={handleChange}
              placeholder="0"
              disabled={isSaving}
              min="0"
            />
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="isActive"
                checked={data.isActive}
                onCheckedChange={(checked) => setData((prev) => ({ ...prev, isActive: !!checked }))}
                disabled={isSaving}
              />
              <Label htmlFor="isActive">Active (visible on website)</Label>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
