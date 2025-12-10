"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

interface Testimonial {
  _id: string
  name: string
  designation: string
  company: string
  rating: number
  review: string
  image: string
  createdAt: string
}

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTestimonials()
  }, [])

  const fetchTestimonials = async () => {
    try {
      const response = await fetch("/api/testimonials")
      const result = await response.json()
      if (result.success) {
        setTestimonials(result.data)
      }
    } catch (error) {
      console.error("Error fetching testimonials:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this testimonial?")) return

    try {
      const response = await fetch(`/api/testimonials/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setTestimonials(testimonials.filter((t) => t._id !== id))
      }
    } catch (error) {
      console.error("Error deleting testimonial:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading testimonials...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Testimonials</h1>
          <p className="text-gray-600 mt-2">Manage customer testimonials and reviews</p>
        </div>
        <Link href="/admin/testimonials/add">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Testimonial
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((testimonial) => (
          <Card key={testimonial._id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <img
                  src={testimonial.image || "/placeholder.svg"}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                  <p className="text-sm text-gray-600">
                    {testimonial.designation} at {testimonial.company}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < testimonial.rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                  />
                ))}
              </div>
              <p className="text-gray-700 text-sm mb-4 line-clamp-3">"{testimonial.review}"</p>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">{new Date(testimonial.createdAt).toLocaleDateString()}</span>
                <div className="flex gap-2">
                  <Link href={`/admin/testimonials/edit/${testimonial._id}`}>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(testimonial._id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {testimonials.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">No testimonials found</p>
          <Link href="/admin/testimonials/add">
            <Button>Add Your First Testimonial</Button>
          </Link>
        </div>
      )}
    </div>
  )
}
