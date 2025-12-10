"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Users,
  Bed,
  Shield,
  Wifi,
  Car,
  Utensils,
  Snowflake,
  CheckCircle,
  ZoomIn,
  ShowerHead,
  ChevronDown,
  ChevronUp,
  MapPin,
} from "lucide-react"
import { VisitPropertyDrawer } from "@/components/visit-property-drawer"
import { BedBookingForm } from "@/components/bed-booking-form"
import { useState, useEffect } from "react"
import Image from "next/image"
import Cont from "@/public/west-end-london-map-with-pin.jpg"
interface PropertyDetailProps {
  property: any // Using any for now, would use proper type in real app
}

interface AmenityWithIcon {
  _id: string
  name: string
  description: string
  icon: string // Base64 string
  status: "active" | "inactive"
}

export function PropertyDetail({ property }: PropertyDetailProps) {
  const [showBedBookingForm, setShowBedBookingForm] = useState(false)
  const [selectedRoomForBooking, setSelectedRoomForBooking] = useState<any>(null)
  const [selectedBedForBooking, setSelectedBedForBooking] = useState<any>(null)
  const [rooms, setRooms] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [showAllRooms, setShowAllRooms] = useState(false)
  const [amenitiesWithIcons, setAmenitiesWithIcons] = useState<AmenityWithIcon[]>([])
  const [amenitiesLoading, setAmenitiesLoading] = useState(false)

  const safeProperty = {
    type: property?.type || "Property",
    gender: property?.gender || "mixed",
    name: property?.name || "Property",
    address: property?.address || "Address not available",
    availableBeds: property?.availableBeds || 0,
    totalBeds: property?.totalBeds || 0,
    description: property?.description || "No description available",
    nearbyPlaces: property?.nearbyPlaces || "No nearby places information",
    amenities: property?.amenities || [],
    contactNumber: property?.contactNumber || "Contact not available",
    email: property?.email || "",
    nearbyLandmark: property?.nearbyLandmark || "No landmark information",
    _id: property?._id || "",
    ...property,
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
      // Always fetch the canonical amenities list so we can resolve IDs → name/icon
      const response = await fetch("/api/amenities")
      const result = await response.json()

      if (!result?.success || !Array.isArray(result?.data)) {
        setAmenitiesWithIcons([])
        return
      }

      const allAmenities: AmenityWithIcon[] = result.data

      // Normalize each provided amenity entry into AmenityWithIcon
      const normalized: AmenityWithIcon[] = rawAmenities
        .map((a: any) => {
          // Case 1: Populated object with name/icon already present
          if (a && typeof a === "object") {
            const byId = a._id ? allAmenities.find((x) => x._id === a._id) : undefined
            // Prefer backend canonical if found; otherwise use provided fields
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

          // Case 2: String ID or name
          if (typeof a === "string") {
            // If looks like ObjectId: match by _id
            if (isLikelyObjectId(a)) {
              const byId = allAmenities.find((x) => x._id === a)
              if (byId) return byId
              // Fallback: unknown id—keep placeholder with id but empty name/icon
              return {
                _id: a,
                name: "",
                description: "",
                icon: "",
                status: "active",
              }
            }

            // Otherwise treat as a name (case-insensitive)
            const byName = allAmenities.find((x) => (x.name || "").toLowerCase() === a.toLowerCase()) || null
            if (byName) return byName

            // Fallback if not found in canonical list
            return {
              _id: "",
              name: a,
              description: "",
              icon: "",
              status: "active",
            }
          }

          return null
        })
        .filter(Boolean)

      // Deduplicate by _id or name
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
    } finally {
      setAmenitiesLoading(false)
    }
  }

  const fetchRooms = async () => {
    if (!safeProperty._id) return

    try {
      setLoading(true)

      const baseURL = typeof window !== "undefined" ? window.location.origin : process.env.NEXT_PUBLIC_BASE_URL

      const response = await fetch(`${baseURL}/api/rooms?propertyId=${safeProperty._id}`)

      const result = await response.json()

      if (result.success) {
        setRooms(result.data.rooms || [])
      } else {
        console.log("Room fetch failed:", result)
      }
    } catch (error) {
      console.error("Failed to fetch rooms:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (safeProperty._id) {
      fetchRooms()
    }
    fetchAmenitiesWithIcons()
  }, [safeProperty._id])

  const availableRooms = rooms.filter((room) => room.availableBeds > 0)
  const displayedRooms = showAllRooms ? availableRooms : availableRooms.slice(0, 3)
  const hasMoreRooms = availableRooms.length > 3

  const minRent =
    rooms.length > 0
      ? Math.min(...rooms.filter((room) => room.availableBeds > 0).map((room) => room.rent))
      : safeProperty?.rentRange?.min || safeProperty?.expectedRent?.min || safeProperty?.rentMin

  const getAmenityIcon = (amenity: string | AmenityWithIcon) => {
    const iconMap: Record<string, any> = {
      "High Speed WiFi": Wifi,
      WiFi: Wifi,
      "Air Conditioning": Snowflake,
      AC: Snowflake,
      Parking: Car,
      Security: Shield,
      "Common Kitchen": Utensils,
      Housekeeping: Users,
      "Power Backup": Shield,
      Laundry: Users,
    }

    // Try to resolve via normalized list (by id or name)
    const resolved =
      typeof amenity === "string"
        ? amenitiesWithIcons.find((a) => a._id === amenity || (a.name || "").toLowerCase() === amenity.toLowerCase())
        : amenitiesWithIcons.find((a) => a._id === amenity._id || a.name === amenity.name)

    const name = typeof amenity === "string" ? amenity : resolved?.name || amenity.name

    if (resolved?.icon) {
      return (
        <img
          src={resolved.icon || "/placeholder.svg?height=64&width=64&query=amenity icon" || "/placeholder.svg"}
          alt={name || "Amenity"}
          className="w-8 h-8 object-contain"
        />
      )
    }

    const IconComponent = name && iconMap[name] ? iconMap[name] : CheckCircle
    return <IconComponent className="w-8 h-8" />
  }

  const mainImage: string = safeProperty?.mainImage || safeProperty?.images?.[0] || "/placeholder.svg"

  const thumbSource: string[] = (
    Array.isArray(safeProperty?.commonPhotos) && safeProperty.commonPhotos.length > 0
      ? safeProperty.commonPhotos
      : Array.isArray(safeProperty?.images)
        ? safeProperty.images.slice(1)
        : []
  ) as string[]

  const thumbs = thumbSource.slice(0, 6)

  const getGridClass = (photoCount: number) => {
    if (photoCount === 1) return "grid-cols-1"
    if (photoCount === 2) return "grid-cols-2"
    if (photoCount === 3) return "grid-cols-3"
    if (photoCount === 4) return "grid-cols-2"
    if (photoCount === 5) return "grid-cols-3"
    return "grid-cols-2" // for 6 photos
  }

  const openLightbox = (imageSrc: string) => {
    setSelectedImage(imageSrc)
  }

  const closeLightbox = () => {
    setSelectedImage(null)
  }

  const formatINR = (val?: number | string | null) => {
    if (val === null || val === undefined || val === "") return null
    const n = typeof val === "string" ? Number(val) : val
    if (!Number.isFinite(n as number)) return null
    return (n as number).toLocaleString("en-IN", { maximumFractionDigits: 0 })
  }

  const titleText =
    (safeProperty?.name || safeProperty?.pgNickName || "Property") +
    (safeProperty?.city
      ? ` in ${safeProperty.city}`
      : safeProperty?.address?.city
        ? ` in ${safeProperty.address.city}`
        : "")

  const lockInMonths = safeProperty?.lockInMonths ?? safeProperty?.lockinMonths
  const depositType: string = safeProperty?.depositType ?? "one_rent"
  const depositAmount: number | undefined =
    safeProperty?.depositAmount ?? safeProperty?.deposit?.amount ?? safeProperty?.securityDeposit
  const depositLabel =
    depositType === "custom" && depositAmount && depositAmount > 0
      ? `${formatINR(depositAmount)} Deposit`
      : "One Month Deposit"

  const sharedAvailable =
    safeProperty?.sharedAvailable ??
    safeProperty?.availableBedsShared ??
    safeProperty?.availableBeds ??
    safeProperty?.beds?.shared?.available ??
    0
  const privateAvailable =
    safeProperty?.privateAvailable ??
    safeProperty?.availablePrivateRooms ??
    safeProperty?.rooms?.private?.available ??
    0

  const sharedPriceMin =
    safeProperty?.pricing?.shared?.min ??
    safeProperty?.rentRange?.min ??
    safeProperty?.expectedRent?.min ??
    safeProperty?.rentMin
  const privatePriceMin =
    safeProperty?.pricing?.private?.min ??
    safeProperty?.rentRange?.max ??
    safeProperty?.expectedRent?.max ??
    safeProperty?.rentMax

  const rating = safeProperty?.rating?.average ?? safeProperty?.ratingAvg
  const ratingCount = safeProperty?.rating?.count ?? safeProperty?.ratingCount

  const subtitleId = safeProperty?.propertyId || safeProperty?._id
  const sharingLine =
    (sharedAvailable > 0 ? "Shared available" : "No shared") + (privateAvailable > 0 ? " · Private available" : "")
  const subtitleText = [sharingLine, subtitleId].filter(Boolean).join(" · ")

  const handleDirectBooking = (room?: any) => {
    let roomToBook = room

    // If no specific room provided, use the first available room
    if (!roomToBook) {
      roomToBook = rooms.find((r) => r.availableBeds > 0)
    }

    if (!roomToBook) {
      console.error("No available rooms found")
      return
    }

    // Find the first available bed in the room
    const availableBed = roomToBook.beds?.find((bed: any) => bed.status === "available") || {
      _id: `${roomToBook._id}-bed-1`,
      bedNumber: "1",
    }

    setSelectedRoomForBooking(roomToBook)
    setSelectedBedForBooking(availableBed)
    setShowBedBookingForm(true)
  }

  const handleCloseBedBookingForm = () => {
    setShowBedBookingForm(false)
    setSelectedRoomForBooking(null)
    setSelectedBedForBooking(null)
  }

  const getFoodAvailability = () => {
    const withFood = safeProperty?.withFood
    const withoutFood = safeProperty?.withoutFood

    if (withFood && withoutFood) {
      return "With Food & Without Food"
    } else if (withFood) {
      return "With Food"
    } else if (withoutFood) {
      return "Without Food"
    }
    return "Food options not specified"
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Property Images */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <div className="lg:col-span-2">
          <div className="relative">
            <img
              src={mainImage || "/placeholder.svg"}
              alt={safeProperty?.name || "Property main image"}
              className="w-full h-96 object-cover rounded-lg"
            />
            <button
              className="absolute inset-0 w-full h-full bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center group"
              type="button"
              aria-haspopup="dialog"
              aria-label="Open main image in modal"
              onClick={() => openLightbox(mainImage)}
            >
              <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </button>
          </div>
        </div>

        {thumbs.length > 0 && (
          <div className={`grid ${getGridClass(thumbs.length)} gap-4`}>
            {thumbs.map((image: string, index: number) => (
              <div key={index} className="relative">
                <img
                  src={image || "/placeholder.svg"}
                  alt={`Property gallery image ${index + 1}`}
                  className="w-full h-28 lg:h-28 object-cover rounded-lg"
                />
                <button
                  className="absolute inset-0 w-full h-full bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center group"
                  type="button"
                  aria-haspopup="dialog"
                  aria-label={`Open media ${index + 1} in modal`}
                  onClick={() => openLightbox(image)}
                >
                  <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={selectedImage || "/placeholder.svg"}
              alt="Property image enlarged"
              className="max-w-full max-h-full object-contain"
            />
            <button
              className="absolute top-4 right-4 text-white hover:text-gray-300 text-2xl font-bold"
              onClick={closeLightbox}
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Property Header */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">{safeProperty.type.toUpperCase()}</Badge>
              <Badge variant="outline">{safeProperty.gender.toUpperCase()}'S PROPERTY</Badge>
            </div>
            <h1 className="text-2xl font-bold mb-4">{safeProperty.name}</h1>

            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Bed className="w-4 h-4" />
                <span>{safeProperty.availableBeds} beds available</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{safeProperty.totalBeds} total beds</span>
              </div>
            </div>
          </div>

          {/* About the Property */}
          <Card>
            <CardHeader>
              <CardTitle>About the Property</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-line text-sm text-muted-foreground">{safeProperty.description}</div>
            </CardContent>
          </Card>

          {/* Amenities */}
          <Card>
            <CardHeader>
              <CardTitle>Property Amenities</CardTitle>
            </CardHeader>
            <CardContent>
              {amenitiesLoading ? (
                <div className="flex justify-center items-center h-20">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {amenitiesWithIcons.length > 0 ? (
                    amenitiesWithIcons.map((a, idx) => (
                      <div key={a._id || `${a.name}-${idx}`} className="flex items-center gap-3">
                        {a.icon ? (
                          <img
                            src={
                              a.icon ||
                              "/placeholder.svg?height=64&width=64&query=amenity icon" ||
                              "/placeholder.svg" ||
                              "/placeholder.svg"
                            }
                            alt={a.name || "Amenity"}
                            className="w-8 h-8 object-contain"
                          />
                        ) : (
                          getAmenityIcon(a)
                        )}
                        <span className="text-sm font-medium">{a.name || "Amenity"}</span>
                      </div>
                    ))
                  ) : Array.isArray(safeProperty.amenities) && safeProperty.amenities.length > 0 ? (
                    safeProperty.amenities.map((amenity: any, index: number) => {
                      const label = typeof amenity === "string" ? amenity : amenity?.name || ""
                      return (
                        <div key={index} className="flex items-center gap-3">
                          {getAmenityIcon(amenity)}
                          <span className="text-sm font-medium">{label || "Amenity"}</span>
                        </div>
                      )
                    })
                  ) : (
                    <div className="col-span-3 text-sm text-muted-foreground">No amenities listed</div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {safeProperty?.mapLink && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">View property location on map</p>

                  {/* Image with overlay button like your first example */}
                  <div className="aspect-video relative rounded-lg overflow-hidden border border-blue-100 shadow-sm">
                    <Image
                      src={Cont || "/placeholder.svg"} // Yahan apni map thumbnail image ya placeholder dena
                      alt="Property Location Map"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <a
                        href={safeProperty.mapLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#2e057f] hover:bg-[#4310b8] text-white px-4 py-2 rounded-lg shadow-lg transition-colors"
                      >
                        Open in Google Maps
                      </a>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pricing Card */}
          <Card className="border border-gray-200 shadow-md">
            <CardContent className="p-5">
              {/* Title + Subtitle */}
              <div className="mb-4">
                <h2 className="text-lg font-bold text-gray-900">{titleText}</h2>
                <p className="text-sm text-gray-600 mt-1">{subtitleText || "Availability and pricing information"}</p>
              </div>
              {/* Highlights */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-700 mb-4">
                {/* Deposit */}
                <div className="flex items-center gap-1">
                  <span className="text-[#2e057f]">💰</span>
                  <span>Deposit: 1 Month Rent</span>
                </div>

                {/* Notice Period */}
                <div className="flex items-center gap-1">
                  <span className="text-[#2e057f]">📅</span>
                  <span>Notice Period: 30 Days</span>
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-[#2e057f]">🍽️</span>
                  <span>{getFoodAvailability()}</span>
                </div>
              </div>

              {/* Visitors Info (optional) */}
              {typeof property?.views === "number" && (
                <div className="bg-yellow-50 text-yellow-800 text-sm px-3 py-2 mb-4 border border-yellow-100">
                  ⏳ {property.views} people visited this property. Avoid missing out!
                </div>
              )}

              {/* Room Details */}
              <div className="border border-gray-200">
                <div className="flex justify-between p-3 border-b text-sm">
                  <span className="font-medium text-gray-700">Rooms Details :</span>
                  <span className="text-gray-600">
                    {(property?.category || property?.type || "Co-living") +
                      " · " +
                      (property?.managementType || "Managed Homes")}
                  </span>
                </div>
                {displayedRooms.map((room, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-3 border-b cursor-pointer hover:bg-gray-50"
                    onClick={() => handleDirectBooking(room)}
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {room.displayName || `${room.noOfSharing}-Sharing-${room.acType}`}
                      </p>
                      <div className="flex items-center gap-1">
                        <Bed className="w-4 h-4 text-blue-500" />
                        <span className="capitalize text-xs text-gray-500">{room.availableBeds} Beds Available</span>
                      </div>
                      {/* Washroom */}
                      {room.bathroomType && (
                        <div className="flex items-center gap-1">
                          <ShowerHead className="w-5 h-5 text-purple-500" />
                          <span className="capitalize text-xs text-gray-500">
                            {room.bathroomType === "attached" ? "Attached" : "Common"} Washroom
                          </span>
                        </div>
                      )}

                      {/* Balcony */}
                      {room.balcony && (
                        <div className="flex items-center gap-1">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-xs text-gray-500">Balcony</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-bold text-[#2e057f]">₹{formatINR(room.rent)}</p>
                        <p className="text-xs text-gray-500">per month</p>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-[#2e057f] flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}

                {hasMoreRooms && (
                  <div className="p-3 border-b">
                    <Button
                      variant="ghost"
                      className="w-full text-[#2e057f] hover:bg-[#f4f0fa] flex items-center justify-center gap-2"
                      onClick={() => setShowAllRooms(!showAllRooms)}
                    >
                      {showAllRooms ? (
                        <>
                          Show Less
                          <ChevronUp className="w-4 h-4" />
                        </>
                      ) : (
                        <>
                          Explore More ({availableRooms.length - 3} more rooms)
                          <ChevronDown className="w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {availableRooms.length === 0 && (
                  <div className="flex justify-between items-center p-3">
                    <div>
                      <p className="text-sm font-medium text-gray-400">No rooms available</p>
                      <p className="text-xs text-gray-400">Check back later</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-bold text-gray-400">—</p>
                        <p className="text-xs text-gray-500">not available</p>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-xs text-gray-600 font-medium">NA</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-3 mt-5">
                <VisitPropertyDrawer propertyId={property._id} propertyName={property.name}>
                  <Button className="flex-1 border border-[#2e057f] text-[#2e057f] font-semibold bg-white hover:bg-[#f4f0fa]">
                    VISIT PROPERTY
                  </Button>
                </VisitPropertyDrawer>
                <Button
                  className="flex-1 bg-[#2e057f] text-white font-semibold hover:bg-[#230466]"
                  onClick={() => handleDirectBooking()}
                >
                  BOOK NOW
                </Button>
              </div>

              {/* Rating (optional) */}
              {(typeof rating === "number" || typeof ratingCount === "number") && (
                <div className="mt-6 border-t pt-4 flex items-center gap-2 text-sm">
                  <span className="text-yellow-500" aria-hidden>
                    ⭐
                  </span>
                  <span className="font-bold">
                    {typeof rating === "number" ? `${Number(rating).toFixed(1)} star` : "Rating"}
                  </span>
                  {typeof ratingCount === "number" && (
                    <span className="text-gray-600">
                      Based on {ratingCount} {ratingCount === 1 ? "review" : "reviews"}.
                    </span>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-auto border-[#2e057f] text-[#2e057f] hover:bg-[#f4f0fa] bg-transparent"
                  >
                    READ REVIEWS
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contact Card ki jagah image */}
          <div className="w-full">
            <Image
              src="/book2.png"
              alt="Contact Information"
              width={600}
              height={300}
              className="rounded-2xl object-cover"
            />
          </div>
        </div>
      </div>

      {/* Bed Booking Form */}
      {showBedBookingForm && selectedRoomForBooking && selectedBedForBooking && (
        <BedBookingForm
          open={showBedBookingForm}
          onClose={handleCloseBedBookingForm}
          onBack={handleCloseBedBookingForm}
          propertyId={safeProperty._id}
          propertyName={safeProperty.name}
          roomId={selectedRoomForBooking._id}
          roomName={
            selectedRoomForBooking.name ||
            selectedRoomForBooking.displayName ||
            `${selectedRoomForBooking.noOfSharing}-Sharing-${selectedRoomForBooking.acType}`
          }
          bedId={selectedBedForBooking._id}
          bedNumber={selectedBedForBooking.bedNumber}
          rent={selectedRoomForBooking.rent}
        />
      )}
    </div>
  )
}
