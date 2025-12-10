"use client"

import { PropertyDetail } from "@/components/property-detail"
import { SimilarProperties } from "@/components/similar-properties"
import { useState, useEffect } from "react"
import { notFound } from "next/navigation"
import { use } from "react" // Added React.use import
import BOOKINGFAQ from "@/components/bookingfaq"

interface Property {
  _id: string
  propertyId: string
  name: string
  type: "Hostel" | "PG" | "Both"
  address: string
  city: string
  state: string
  pincode: string
  contactNumber: string
  email: string
  gender: "male" | "female" | "coed"
  nearbyLandmark: string
  totalRooms: number
  totalBeds: number
  availableBeds: number
  rentRange: { min: number; max: number }
  monthlyRevenue: number
  amenities: string[]
  rules: string[]
  description: string
  nearbyPlaces: string
  images: string[]
  rooms: any[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function PropertyDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  // Updated params type to Promise
  const resolvedParams = use(params) // Unwrap params Promise using React.use()
  const [property, setProperty] = useState<Property | null>(null)
  const [similarProperties, setSimilarProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/properties/${resolvedParams.slug}`) // Use resolvedParams.slug instead of params.slug
        const result = await response.json()

        if (result.success) {
          setProperty(result.data)

          // Fetch similar properties
          const similarResponse = await fetch(
            `/api/properties?city=${result.data.city}&gender=${result.data.gender}&pageSize=4`,
          )
          const similarResult = await similarResponse.json()

          if (similarResult.success) {
            // Filter out current property
            const filtered = similarResult.data.filter((p: any) => p._id !== result.data._id)
            setSimilarProperties(filtered.slice(0, 4))
          }
        } else {
          setError(result.message || "Property not found")
        }
      } catch (err: any) {
        console.error("Error fetching property:", err)
        setError("Failed to load property")
      } finally {
        setLoading(false)
      }
    }

    if (mounted && resolvedParams.slug) {
      // Use resolvedParams.slug instead of params.slug
      fetchProperty()
    }
  }, [resolvedParams.slug, mounted]) // Updated dependency to resolvedParams.slug

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
              <div className="lg:col-span-2">
                <div className="bg-gray-200 h-96 rounded-lg"></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-gray-200 h-28 rounded-lg"></div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-gray-200 h-8 rounded w-3/4"></div>
                <div className="bg-gray-200 h-32 rounded"></div>
              </div>
              <div className="bg-gray-200 h-64 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !property) {
    return notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <PropertyDetail property={property} />
      <SimilarProperties properties={similarProperties} />
      <BOOKINGFAQ/>
    </div>
  )
}
