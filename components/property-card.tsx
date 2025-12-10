"use client"

import type React from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Users, Wifi, Car, Shield, Utensils, Dumbbell, Snowflake, Heart, CheckCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface Property {
  _id: string
  propertyId: string
  name: string
  pgNickName: string
  type: "Hostel" | "PG" | "Both"
  address: string
  area: string
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

interface PropertyCardProps {
  property: Property
  userId: string
}

interface AmenityWithIcon {
  _id?: string
  name?: string
  description?: string
  icon?: string
  status?: "active" | "inactive"
}

export function PropertyCard({ property, userId }: PropertyCardProps) {
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [minRoomRent, setMinRoomRent] = useState<number | null>(null)
  const [roomsLoading, setRoomsLoading] = useState(false)
  const [amenitiesWithIcons, setAmenitiesWithIcons] = useState<AmenityWithIcon[]>([])
  const [amenitiesLoading, setAmenitiesLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const [isInCompare, setIsInCompare] = useState(false)

  const safeProperty = {
    ...property,
    type: property.type || "PG",
    gender: property.gender || "coed",
    rentRange: property.rentRange || { min: 0, max: 0 },
    amenities: property.amenities || [],
    images: property.images || [],
    availableBeds: property.availableBeds || 0,
    totalBeds: property.totalBeds || 0,
  }

  const fetchRoomRent = async () => {
    if (!safeProperty._id) return

    try {
      setRoomsLoading(true)
      const response = await fetch(`/api/rooms?propertyId=${safeProperty._id}`)
      const result = await response.json()

      if (result.success && result.data.rooms && result.data.rooms.length > 0) {
        const availableRooms = result.data.rooms.filter((room: any) => room.availableBeds > 0)
        if (availableRooms.length > 0) {
          const minRent = Math.min(...availableRooms.map((room: any) => room.rent))
          setMinRoomRent(minRent)
        }
      }
    } catch (error) {
      console.error("Failed to fetch room rent:", error)
    } finally {
      setRoomsLoading(false)
    }
  }

  useEffect(() => {
    const checkWishlistStatus = async () => {
      try {
        const response = await fetch(`/api/wishlist/check?userId=${userId}&propertyId=${safeProperty._id}`)
        const result = await response.json()
        if (result.success) {
          setIsInWishlist(result.isInWishlist)
        }
      } catch (error) {
        console.error("Error checking wishlist status:", error)
      }
    }

    if (property) {
      checkWishlistStatus()
      fetchRoomRent()
    }
  }, [property, userId])

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setIsLoading(true)

    try {
      if (isInWishlist) {
        const response = await fetch(`/api/wishlist?userId=${userId}&propertyId=${safeProperty._id}`, {
          method: "DELETE",
        })
        const result = await response.json()

        if (result.success) {
          setIsInWishlist(false)
          toast({
            title: "Removed from wishlist",
            description: "Property has been removed from your wishlist.",
          })
        } else {
          throw new Error(result.message)
        }
      } else {
        const response = await fetch("/api/wishlist", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            propertyId: safeProperty._id,
          }),
        })
        const result = await response.json()

        if (result.success) {
          setIsInWishlist(true)
          toast({
            title: "Added to wishlist",
            description: "Property has been added to your wishlist.",
          })
        } else {
          throw new Error(result.message)
        }
      }
    } catch (error: any) {
      console.error("Error toggling wishlist:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update wishlist. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const href = `/properties/${safeProperty.slug || safeProperty._id}`

  const formatINR = (val?: number | string | null) => {
    if (val === null || val === undefined || val === "") return null
    const n = typeof val === "string" ? Number(val) : val
    if (!Number.isFinite(n as number)) return null
    return (n as number).toLocaleString("en-IN", { maximumFractionDigits: 0 })
  }

  const isLikelyObjectId = (val: unknown) => typeof val === "string" && /^[a-f0-9]{24}$/i.test(val)

  const fetchAmenitiesWithIcons = async () => {
    const rawAmenities = Array.isArray(safeProperty.amenities) ? safeProperty.amenities : []
    if (rawAmenities.length === 0) {
      setAmenitiesWithIcons([])
      return
    }
    setAmenitiesLoading(true)
    try {
      const response = await fetch("/api/amenities")
      const result = await response.json()

      if (!result?.success || !Array.isArray(result?.data)) {
        setAmenitiesWithIcons([])
        return
      }

      const allAmenities: AmenityWithIcon[] = result.data

      const normalized: AmenityWithIcon[] = rawAmenities
        .map((a: any) => {
          if (a && typeof a === "object") {
            const byId = a._id ? allAmenities.find((x) => x._id === a._id) : undefined
            return (
              byId || {
                _id: a._id || a.id || "",
                name: a.name || "",
                description: a.description || "",
                icon: a.icon || "",
                status: (a.status as "active" | "inactive") || "active",
              }
            )
          }

          if (typeof a === "string") {
            if (isLikelyObjectId(a)) {
              const byId = allAmenities.find((x) => x._id === a)
              return (
                byId || {
                  _id: a,
                  name: "",
                  description: "",
                  icon: "",
                  status: "active",
                }
              )
            }
            const byName = allAmenities.find((x) => (x.name || "").toLowerCase() === a.toLowerCase()) || null
            return (
              byName || {
                _id: "",
                name: a,
                description: "",
                icon: "",
                status: "active",
              }
            )
          }

          return null
        })
        .filter(Boolean) as AmenityWithIcon[]

      const seen = new Set<string>()
      const unique = normalized.filter((item) => {
        const key = item._id || `name:${(item.name || "").toLowerCase()}`
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })

      setAmenitiesWithIcons(unique)
    } catch (error) {
      console.error("Failed to fetch amenities:", error)
      setAmenitiesWithIcons([])
    } finally {
      setAmenitiesLoading(false)
    }
  }

  useEffect(() => {
    fetchAmenitiesWithIcons()
  }, [JSON.stringify(safeProperty.amenities)])

  const getAmenityIcon = (amenity: any) => {
    const iconMap: Record<string, any> = {
      "High Speed WiFi": Wifi,
      WiFi: Wifi,
      "Air Conditioning": Snowflake,
      AC: Snowflake,
      Parking: Car,
      Security: Shield,
      "Common Kitchen": Utensils,
      Meals: Utensils,
      Gym: Dumbbell,
      Housekeeping: Users,
      "Power Backup": Shield,
      Laundry: Users,
    }

    const resolved =
      typeof amenity === "string"
        ? amenitiesWithIcons.find((a) => a._id === amenity || (a.name || "").toLowerCase() === amenity.toLowerCase())
        : amenitiesWithIcons.find((a) => a._id === amenity?._id || a.name === amenity?.name)

    const name = typeof amenity === "string" ? amenity : resolved?.name || amenity?.name

    if (resolved?.icon) {
      return (
        <img
          src={resolved.icon || "/placeholder.svg?height=64&width=64&query=amenity icon"}
          alt={name || "Amenity"}
          className="w-4 h-4 object-contain"
        />
      )
    }

    const IconComponent = name && iconMap[name] ? iconMap[name] : CheckCircle
    return <IconComponent className="w-4 h-4" />
  }

  const getCompareSelection = (): string[] => {
    try {
      const raw = localStorage.getItem("compareSelection")
      const arr = raw ? (JSON.parse(raw) as string[]) : []
      return Array.isArray(arr) ? arr.slice(0, 2) : []
    } catch {
      return []
    }
  }

  const setCompareSelection = (ids: string[]) => {
    try {
      localStorage.setItem("compareSelection", JSON.stringify(ids.slice(0, 2)))
    } catch {}
  }

  const syncIsInCompare = () => {
    const ids = getCompareSelection()
    setIsInCompare(ids.includes(safeProperty._id))
  }

  useEffect(() => {
    syncIsInCompare()
  }, [safeProperty._id])

  const handleCompareToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const ids = getCompareSelection()
    const exists = ids.includes(safeProperty._id)

    if (exists) {
      const next = ids.filter((id) => id !== safeProperty._id)
      setCompareSelection(next)
      setIsInCompare(false)
      toast({
        title: "Removed from compare",
        description: "Property removed from comparison list.",
      })
      return
    }

    if (ids.length >= 2) {
      const next = [ids[1], safeProperty._id]
      setCompareSelection(next)
      setIsInCompare(true)
      toast({
        title: "Added to compare",
        description: "Opening comparison...",
      })
      router.push(`/compare?ids=${encodeURIComponent(next.join(","))}`)
      return
    }

    const next = [...ids, safeProperty._id]
    setCompareSelection(next)
    setIsInCompare(true)
    if (next.length === 2) {
      toast({
        title: "Ready to compare",
        description: "Opening comparison...",
      })
      router.push(`/compare?ids=${encodeURIComponent(next.join(","))}`)
    } else {
      toast({
        title: "Added to compare",
        description: "Select one more property to compare.",
      })
    }
  }

  return (
    <Link href={href} className="block hover:shadow-2xl hover:-translate-y-1 transition-all">
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
        <div className="relative">
          <img
            src={safeProperty.images[0] || "/placeholder.svg"}
            alt={`${safeProperty.name}${safeProperty.pgNickName ? " - " + safeProperty.pgNickName : ""}`}
            className="w-full h-48 object-cover"
          />
          <div className="absolute top-3 left-3">
            <Badge variant="secondary" className="bg-white/90 text-xs">
              {safeProperty.type.toUpperCase()}
            </Badge>
          </div>
          <div className="absolute top-3 right-3">
            <Button
              variant="ghost"
              size="sm"
              className={`p-2 rounded-full bg-white/90 hover:bg-white transition-colors ${
                isInWishlist ? "text-red-500" : "text-gray-600"
              }`}
              onClick={handleWishlistToggle}
              disabled={isLoading}
            >
              <Heart className={`w-5 h-5 ${isInWishlist ? "fill-current" : ""}`} />
            </Button>
          </div>
        </div>

        <CardContent className="p-4">
          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold">
                {roomsLoading
                  ? "Loading..."
                  : minRoomRent
                    ? `Starts from ₹${formatINR(minRoomRent)}`
                    : `Starts from ₹${safeProperty.rentRange.min.toLocaleString()}`}
              </span>
              <Badge variant="outline" className="text-xs">
                {safeProperty.gender.toUpperCase()}'S {safeProperty.type.toUpperCase()}
              </Badge>
            </div>
            <h3 className="font-semibold text-sm line-clamp-2 mb-2">
              {`${safeProperty.name}${safeProperty.pgNickName ? " - " + safeProperty.pgNickName : ""}`}
            </h3>
            <div className="flex items-center text-xs text-muted-foreground mb-2">
              <MapPin className="w-3 h-3 mr-1" />
              {safeProperty.nearbyLandmark || `${safeProperty.area || "Unknown"}, ${safeProperty.city || "Unknown"}`}
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4">
            {amenitiesWithIcons.slice(0, 6).map((amenity, index) => (
              <div key={index} className="text-muted-foreground">
                {getAmenityIcon(amenity)}
              </div>
            ))}
            {amenitiesWithIcons.length > 6 && (
              <span className="text-xs text-muted-foreground">+{amenitiesWithIcons.length - 6} More</span>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-lg text-white bg-[#2e057f] hover:bg-[#2e057f] hover:text-white"
            >
              Explore
            </Button>
            <Button
              variant={isInCompare ? "default" : "outline"}
              size="sm"
              className="flex-1"
              onClick={handleCompareToggle}
            >
              {isInCompare ? "Added to Compare" : "Compare"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
