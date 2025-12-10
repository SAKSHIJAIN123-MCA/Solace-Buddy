"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Users, Wifi, Car, Shield, Utensils, Dumbbell, Snowflake, Heart, Trash2 } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

interface Property {
  _id: string
  propertyId: string
  name: string
  type: "Hostel" | "PG" | "Both"
  address: string
  city: string
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

interface WishlistItem {
  _id: string
  userId: string
  propertyId: string
  property: Property
  createdAt: string
  updatedAt: string
}

interface PropertyRentState {
  minRoomRent: number | null
  roomsLoading: boolean
}

const getAmenityIcon = (amenity: string) => {
  const iconMap: Record<string, any> = {
    WiFi: Wifi,
    AC: Snowflake,
    Parking: Car,
    Security: Shield,
    Meals: Utensils,
    Gym: Dumbbell,
    Laundry: Users,
  }

  const IconComponent = iconMap[amenity] || Users
  return <IconComponent className="w-4 h-4" />
}

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [propertyRentStates, setPropertyRentStates] = useState<Record<string, PropertyRentState>>({})
  const { toast } = useToast()

  const userId = "user-123"

  const formatINR = (val?: number | string | null) => {
    if (val === null || val === undefined || val === "") return null
    const n = typeof val === "string" ? Number(val) : val
    if (!Number.isFinite(n as number)) return null
    return (n as number).toLocaleString("en-IN", { maximumFractionDigits: 0 })
  }

  const fetchRoomRent = async (propertyId: string) => {
    if (!propertyId) return

    try {
      setPropertyRentStates((prev) => ({
        ...prev,
        [propertyId]: { ...prev[propertyId], roomsLoading: true },
      }))

      const response = await fetch(`/api/admin/vendor-properties/${propertyId}/rooms`)
      const result = await response.json()

      if (result.success && result.data.rooms && result.data.rooms.length > 0) {
        const availableRooms = result.data.rooms.filter((room: any) => room.availableBeds > 0)
        if (availableRooms.length > 0) {
          const minRent = Math.min(...availableRooms.map((room: any) => room.rent))
          setPropertyRentStates((prev) => ({
            ...prev,
            [propertyId]: { minRoomRent: minRent, roomsLoading: false },
          }))
        } else {
          setPropertyRentStates((prev) => ({
            ...prev,
            [propertyId]: { minRoomRent: null, roomsLoading: false },
          }))
        }
      } else {
        setPropertyRentStates((prev) => ({
          ...prev,
          [propertyId]: { minRoomRent: null, roomsLoading: false },
        }))
      }
    } catch (error) {
      console.error("Failed to fetch room rent:", error)
      setPropertyRentStates((prev) => ({
        ...prev,
        [propertyId]: { minRoomRent: null, roomsLoading: false },
      }))
    }
  }

  const fetchWishlist = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/wishlist?userId=${userId}`)
      const result = await response.json()

      if (result.success) {
        const items = result.data || []
        setWishlistItems(items)

        items.forEach((item: WishlistItem) => {
          fetchRoomRent(item.property._id)
        })
      } else {
        setError(result.message || "Failed to load wishlist")
      }
    } catch (err: any) {
      console.error("Error fetching wishlist:", err)
      setError("Failed to load wishlist")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWishlist()
  }, [])

  const handleRemoveFromWishlist = async (propertyId: string) => {
    try {
      const response = await fetch(`/api/wishlist?userId=${userId}&propertyId=${propertyId}`, {
        method: "DELETE",
      })
      const result = await response.json()

      if (result.success) {
        setWishlistItems((prev) => prev.filter((item) => item.propertyId !== propertyId))
        setPropertyRentStates((prev) => {
          const newState = { ...prev }
          delete newState[propertyId]
          return newState
        })
        toast({
          title: "Removed from wishlist",
          description: "Property has been removed from your wishlist.",
        })
      } else {
        throw new Error(result.message)
      }
    } catch (error: any) {
      console.error("Error removing from wishlist:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to remove from wishlist. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#2e057f] mb-2">My Wishlist</h1>
            <p className="text-muted-foreground">Your saved properties</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                <div className="bg-gray-200 h-4 rounded mb-2"></div>
                <div className="bg-gray-200 h-4 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="text-lg font-medium mb-2 text-red-600">Error loading wishlist</div>
            <p className="text-sm text-muted-foreground">{error}</p>
            <button
              onClick={fetchWishlist}
              className="mt-4 px-4 py-2 bg-[#2e057f] text-white rounded hover:bg-[#230466]"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#2e057f] mb-2">My Wishlist</h1>
          <p className="text-muted-foreground">Your saved properties</p>
          <p className="text-sm text-muted-foreground mt-2">
            {wishlistItems.length} {wishlistItems.length === 1 ? "property" : "properties"} saved
          </p>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <div className="text-lg font-medium mb-2">Your wishlist is empty</div>
            <p className="text-sm text-muted-foreground mb-4">
              Start exploring properties and save your favorites here
            </p>
            <Link href="/properties">
              <Button className="bg-[#2e057f] hover:bg-[#230466]">Browse Properties</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((item) => {
              const property = item.property
              const href = `/properties/${property.slug || property._id}`
              const rentState = propertyRentStates[property._id] || { minRoomRent: null, roomsLoading: false }

              return (
                <Card key={item._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <Link href={href}>
                      <img
                        src={property.images[0] || "/placeholder.svg"}
                        alt={property.name || "Property"}
                        className="w-full h-48 object-cover cursor-pointer"
                      />
                    </Link>
                    <div className="absolute top-3 left-3">
                      <Badge variant="secondary" className="bg-white/90 text-xs">
                        {property.type.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="absolute top-3 right-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-2 rounded-full bg-white/90 hover:bg-white text-red-500 transition-colors"
                        onClick={() => handleRemoveFromWishlist(property._id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-lg font-bold">
                          {rentState.roomsLoading
                            ? "Loading..."
                            : rentState.minRoomRent
                              ? `₹${formatINR(rentState.minRoomRent)} / month`
                              : `₹${property.rentRange.min.toLocaleString()} / month`}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {property.gender.toUpperCase()}'S {property.type.toUpperCase()}
                        </Badge>
                      </div>
                      <Link href={href}>
                        <h3 className="font-semibold text-sm line-clamp-2 mb-2 hover:text-[#2e057f] cursor-pointer">
                          {property.name || "Unnamed Property"}
                        </h3>
                      </Link>
                      <div className="flex items-center text-xs text-muted-foreground mb-2">
                        <MapPin className="w-3 h-3 mr-1" />
                        {property.nearbyLandmark || `${property.city || "Unknown"}, ${property.state || "Unknown"}`}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                      {property.amenities.slice(0, 6).map((amenity, index) => (
                        <div key={index} className="text-muted-foreground">
                          {getAmenityIcon(amenity)}
                        </div>
                      ))}
                      {property.amenities.length > 6 && (
                        <span className="text-xs text-muted-foreground">+{property.amenities.length - 6} More</span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Link href={href} className="flex-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-lg text-white bg-[#2e057f] hover:bg-[#2e057f] hover:text-white"
                        >
                          Book Now
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
