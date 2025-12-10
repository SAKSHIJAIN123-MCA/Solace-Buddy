"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { PropertyCard } from "./property-card"

interface Property {
  _id: string
  propertyId: string
  name: string
  type: "Hostel" | "PG" | "Both"
  address: string
  city: string
  area: string
  state: string
  gender: "male" | "female" | "coed"
  rentRange: { min: number; max: number }
  totalBeds: number
  availableBeds: number
  amenities: string[]
  images: string[]
  nearbyLandmark?: string
  slug?: string
}

export default function FeaturedProperties() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const itemsPerSlide = 3

  useEffect(() => {
    const fetchFeaturedProperties = async () => {
      try {
        setLoading(true)
        setError(null) // Reset error state before fetching

        console.log("[v0] Fetching featured properties from /api/featured-properties")
        const response = await fetch("/api/featured-properties", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })

        console.log("[v0] Response status:", response.status)
        console.log("[v0] Response headers:", Object.fromEntries(response.headers.entries()))

        if (!response.ok) {
          const errorText = await response.text()
          console.error("[v0] API Error Response:", errorText)
          throw new Error(`HTTP ${response.status}: ${errorText}`)
        }

        const data = await response.json()
        console.log("[v0] API Response data:", data)

        if (data.success && Array.isArray(data.data)) {
          setFeaturedProperties(data.data)
          console.log("[v0] Successfully loaded", data.data.length, "featured properties")
        } else {
          console.error("[v0] Invalid API response format:", data)
          setError(data.error || "Invalid response format from server")
        }
      } catch (err: any) {
        console.error("[v0] Error fetching featured properties:", err)
        setError(err.message || "Failed to load featured properties")
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedProperties()
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + itemsPerSlide >= featuredProperties.length ? 0 : prev + itemsPerSlide))
  }

  const prevSlide = () => {
    setCurrentSlide((prev) =>
      prev === 0 ? Math.max(0, featuredProperties.length - itemsPerSlide) : prev - itemsPerSlide,
    )
  }

  const visibleProperties = featuredProperties.slice(currentSlide, currentSlide + itemsPerSlide)

  if (loading) {
    return (
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#2e057f] mb-4">Featured Properties</h2>
            <p className="text-gray-600 text-lg">Loading featured properties...</p>
          </div>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2e057f]"></div>
          </div>
        </div>
      </section>
    )
  }

  if (error || featuredProperties.length === 0) {
    return (
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#2e057f] mb-4">Featured Properties</h2>
            <p className="text-gray-600 text-lg">{error || "No featured properties available at the moment"}</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#2e057f] mb-4">Featured Properties</h2>
          <p className="text-gray-600 text-lg">Handpicked properties based on your selected city</p>
        </div>

        <div className="relative">
          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-colors duration-300 border border-gray-200"
            disabled={currentSlide === 0}
          >
            <ChevronLeft className="w-6 h-6 text-[#2e057f]" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-colors duration-300 border border-gray-200"
            disabled={currentSlide + itemsPerSlide >= featuredProperties.length}
          >
            <ChevronRight className="w-6 h-6 text-[#2e057f]" />
          </button>

          {/* Properties Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mx-12">
            {visibleProperties.map((property) => (
              <PropertyCard key={property._id} property={property} />
            ))}
          </div>
        </div>

        {/* Pagination Dots */}
        {featuredProperties.length > itemsPerSlide && (
          <div className="flex justify-center mt-8 gap-2">
            {Array.from({ length: Math.ceil(featuredProperties.length / itemsPerSlide) }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index * itemsPerSlide)}
                className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                  Math.floor(currentSlide / itemsPerSlide) === index ? "bg-[#2e057f]" : "bg-gray-300 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>
        )}

        <div className="text-center mt-10">
          <Link href={"/properties"}>
            <button className="bg-[#2e057f] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#4c1d95] transition-colors duration-300 shadow-lg hover:shadow-xl">
              View All Properties
            </button>
          </Link>
        </div>
      </div>
    </section>
  )
}
