"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface EditTestimonialPageProps {
  params: { id: string }
}

export default function EditTestimonialPage({ params }: EditTestimonialPageProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: "",
    designation: "",
    company: "",
    rating: 5,
    review: "",
    image: "",
  })

  useEffect(() => {
    fetchTestimonial()
  }, [params.id])

  const fetchTestimonial = async () => {
    try {
      const response = await fetch(`/api/testimonials/${params.id}`)
      const result = await response.json()

      if (result.success) {
        const testimonial = result.data
        setFormData({
          name: testimonial.name,
          designation: testimonial.designation,
          company: testimonial.company,
          rating: testimonial.rating,
          review: testimonial.review,
          image: testimonial.image || "",
        })
      }
    } catch (error) {
      console.error("Error fetching testimonial:", error)
    } finally {
      setInitialLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/testimonials/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push("/admin/testimonials")
      } else {
        alert("Failed to update testimonial")
      }
    } catch (error) {
      console.error("Error updating testimonial:", error)
      alert("Failed to update testimonial")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading testimonial...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/testimonials">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Testimonial</h1>
          <p className="text-gray-600 mt-2">Update testimonial details</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Testimonial Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Customer Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="designation">Designation *</Label>
                <Input
                  id="designation"
                  value={formData.designation}
                  onChange={(e) => handleChange("designation", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="company">Company *</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => handleChange("company", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="rating">Rating *</Label>
                <Select
                  value={formData.rating.toString()}
                  onValueChange={(value) => handleChange("rating", Number.parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Star</SelectItem>
                    <SelectItem value="2">2 Stars</SelectItem>
                    <SelectItem value="3">3 Stars</SelectItem>
                    <SelectItem value="4">4 Stars</SelectItem>
                    <SelectItem value="5">5 Stars</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="image">Profile Image URL</Label>
              <Input
                id="image"
                value={formData.image}
                onChange={(e) => handleChange("image", e.target.value)}
                placeholder="/placeholder.svg"
              />
            </div>

            <div>
              <Label htmlFor="review">Review *</Label>
              <Textarea
                id="review"
                value={formData.review}
                onChange={(e) => handleChange("review", e.target.value)}
                rows={4}
                required
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Updating..." : "Update Testimonial"}
              </Button>
              <Link href="/admin/testimonials">
                <Button variant="outline">Cancel</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
