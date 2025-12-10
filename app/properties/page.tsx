"use client"

import { PropertyCard } from "@/components/property-card"
import { PropertyFilters } from "@/components/property-filters"
import { PropertySidebarFilters } from "@/components/property-sidebar-filters"
import { useState, useEffect, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { TopSearchBar } from "@/components/top-search-bar"
import HomeTopSearchBar from "@/components/home-top-search-bar"
import ProTopSearchBar from "@/components/protopsearchbar"

interface Property {
  _id: string
  slug?: string | null
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
}

type RoomsCacheEntry = {
  rooms: any[]
  minRent: number | null
  fetchedAt: number
}

function formatINR(n: number) {
  return n.toLocaleString("en-IN", { maximumFractionDigits: 0 })
}

function parseCsv(val: string | null): string[] {
  if (!val) return []
  return val
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
}

function includesArea(prop: Property, area: string) {
  const a = area.toLowerCase()
  return (
    (prop.city && prop.city.toLowerCase() === a) ||
    (prop.address && prop.address.toLowerCase().includes(a)) ||
    (prop.nearbyLandmark && prop.nearbyLandmark.toLowerCase().includes(a))
  )
}

function propertyEffectiveMinRent(prop: Property, cache?: RoomsCacheEntry | undefined | null): number {
  if (cache && typeof cache.minRent === "number") return cache.minRent
  return prop?.rentRange?.min ?? 0
}

function extractMinRentFromRooms(rooms: any[]): number | null {
  if (!Array.isArray(rooms) || rooms.length === 0) return null
  const available = rooms.filter((r) => (r?.availableBeds ?? 0) > 0)
  if (!available.length) return null
  return Math.min(...available.map((r) => Number(r?.rent) || 0))
}

function roomMatchesFilters(room: any, sharingSet: Set<string>, acSet: Set<string>): boolean {
  const shareOk = sharingSet.size ? sharingSet.has(String(room?.noOfSharing ?? "")) : true
  const acType = String(room?.acType || "").toLowerCase()
  const acOk = acSet.size
    ? (acSet.has("ac") && acType === "ac") ||
      (acSet.has("non-ac") && (acType === "non-ac" || acType === "nonac" || acType === "non ac"))
    : true
  const hasBed = (room?.availableBeds ?? 0) > 0
  return shareOk && acOk && hasBed
}

function useRoomsPrefetch(properties: Property[], enable: boolean) {
  const [cache, setCache] = useState<Record<string, RoomsCacheEntry>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!enable || !properties.length) return

    let isCancelled = false
    const run = async () => {
      setLoading(true)
      try {
        await Promise.all(
          properties.map(async (p) => {
            if (!p._id) return
            if (cache[p._id]) return
            try {
              const res = await fetch(`/api/admin/vendor-properties/${p._id}/rooms`)
              const result = await res.json()
              if (!isCancelled && result?.success) {
                const rooms = result.data?.rooms || []
                const minRent = extractMinRentFromRooms(rooms)
                setCache((prev) => ({
                  ...prev,
                  [p._id]: { rooms, minRent, fetchedAt: Date.now() },
                }))
              }
            } catch (e) {
              console.error("Failed to fetch rooms for", p._id, e)
            }
          }),
        )
      } finally {
        if (!isCancelled) setLoading(false)
      }
    }
    run()
    return () => {
      isCancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enable, properties.map((p) => p._id).join("|")])

  return { cache, loading }
}

function isLikelyObjectId(val: unknown) {
  return typeof val === "string" && /^[a-f0-9]{24}$/i.test(val)
}

function PropertiesContent() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()

  // Fetch properties from API based on existing top filters
  const fetchProperties = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      searchParams.forEach((value, key) => {
        params.set(key, value)
      })

      const response = await fetch(`/api/properties?${params.toString()}`)
      const result = await response.json()

      if (result.success) {
        setProperties(result.data || [])
        setTotal(result.total || 0)
      } else {
        setError(result.message || "Failed to load properties")
      }
    } catch (err: any) {
      console.error("Error fetching properties:", err)
      setError("Failed to load properties")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProperties()
  }, [searchParams])

  // Read sidebar params
  const minPrice = Number(searchParams.get("minPrice") || 0)
  const maxPrice = Number(searchParams.get("maxPrice") || 100000)
  const areas = parseCsv(searchParams.get("areas"))
  const sharing = parseCsv(searchParams.get("sharing"))
  const ac = parseCsv(searchParams.get("ac"))

  const sharingSet = useMemo(() => new Set(sharing), [sharing])
  const acSet = useMemo(() => new Set(ac.map((a) => a.toLowerCase())), [ac])

  // Prefetch rooms if we need room-level filtering for price/sharing/ac
  const needRooms = useMemo(() => {
    return minPrice > 0 || maxPrice < 100000 || sharingSet.size > 0 || acSet.size > 0
  }, [minPrice, maxPrice, sharingSet, acSet])

  const { cache: roomsCache, loading: roomsLoading } = useRoomsPrefetch(properties, needRooms)

  const amenitiesSelected = parseCsv(searchParams.get("amenities"))
  const amenitiesSelectedLower = useMemo(
    () => new Set(amenitiesSelected.map((s) => s.toLowerCase())),
    [amenitiesSelected],
  )
  const amenitiesSelectedIds = useMemo(
    () => new Set(amenitiesSelected.filter((s) => isLikelyObjectId(s))),
    [amenitiesSelected],
  )

  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      // Areas check
      if (areas.length) {
        const match = areas.some((a) => includesArea(p, a))
        if (!match) return false
      }

      // Price check (use rooms minRent when available, fallback to property)
      const effMinRent = propertyEffectiveMinRent(p, roomsCache[p._id])
      if (effMinRent < minPrice || effMinRent > maxPrice) return false

      // Sharing/AC need room-level verification only if filters selected
      if (sharingSet.size > 0 || acSet.size > 0) {
        const rooms = roomsCache[p._id]?.rooms
        if (!Array.isArray(rooms)) {
          // Rooms not yet loaded—temporarily exclude to avoid false positives
          return false
        }
        const anyOk = rooms.some((r) => roomMatchesFilters(r, sharingSet, acSet))
        if (!anyOk) return false
      }

      // Amenities match: property must include all selected amenities (by id or name)
      if (amenitiesSelected.length) {
        const propAmenityIds: string[] = Array.isArray(p.amenities)
          ? (p.amenities
              .map((a: any) => (typeof a === "string" && isLikelyObjectId(a) ? a : (a && a._id) || null))
              .filter(Boolean) as string[])
          : []

        const propAmenityNamesLower: string[] = Array.isArray(p.amenities)
          ? p.amenities
              .map((a: any) => (typeof a === "string" && !isLikelyObjectId(a) ? a : a?.name || null))
              .filter(Boolean)
              .map((n: string) => n.toLowerCase())
          : []

        const allSelectedPresent = amenitiesSelected.every((sel) => {
          if (amenitiesSelectedIds.has(sel)) {
            // sel is an id
            return propAmenityIds.includes(sel)
          }
          // sel is a name
          return propAmenityNamesLower.includes(sel.toLowerCase())
        })

        if (!allSelectedPresent) return false
      }

      return true
    })
  }, [
    properties,
    areas,
    minPrice,
    maxPrice,
    roomsCache,
    sharingSet,
    acSet,
    amenitiesSelected,
    amenitiesSelectedIds,
    amenitiesSelectedLower,
  ])

  const q = searchParams.get("q") || ""
  const type = searchParams.get("type") || "all"
  const gender = searchParams.get("gender") || "all"
  const city = searchParams.get("city") || "all"

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#2e057f] mb-2">All Properties</h1>
            <p className="text-muted-foreground">Find the perfect accommodation for your needs</p>
          </div>
          <PropertyFilters />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
            {[...Array(8)].map((_, i) => (
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
            <div className="text-lg font-medium mb-2 text-red-600">Error loading properties</div>
            <p className="text-sm text-muted-foreground">{error}</p>
            <button
              onClick={fetchProperties}
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
      <div className="container mx-auto px-4 py-0">
       <ProTopSearchBar/>
        <div className="mb-6 py-8">
          <h1 className="text-3xl font-bold text-[#2e057f] mb-2">All Properties</h1>
          <p className="text-muted-foreground">Find the perfect accommodation for your needs</p>
          <p className="text-sm text-muted-foreground mt-2">
            Showing {filteredProperties.length} of {total} properties
            {q && ` for "${q}"`}
            {type !== "all" && ` • ${type.toUpperCase()}`}
            {gender !== "all" && ` • ${gender.toUpperCase()}`}
            {city !== "all" && ` • ${city.toUpperCase()}`}
          </p>
        </div>

      
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6 mb-6">
          {/* Left sidebar */}
          <div className="lg:col-span-1">
            <PropertySidebarFilters />
            {needRooms && roomsLoading && (
              <div className="text-xs text-muted-foreground mt-3">Refining results using room details...</div>
            )}
          </div>

          {/* Property grid */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProperties.map((property) => (
                <PropertyCard key={property._id} property={property} />
              ))}
            </div>

            {!filteredProperties.length && !loading && (
              <div className="text-center text-muted-foreground py-12">
                <div className="text-lg font-medium mb-2">No properties found</div>
                <p className="text-sm">Try adjusting your search criteria or filters</p>
              </div>
            )}

            {total > 24 && filteredProperties.length > 0 && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <p className="text-sm text-muted-foreground">
                  Showing {filteredProperties.length} of {total} properties
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PropertiesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-[#2e057f] mb-2">All Properties</h1>
              <p className="text-muted-foreground">Find the perfect accommodation for your needs</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                  <div className="bg-gray-200 h-4 rounded mb-2"></div>
                  <div className="bg-gray-200 h-4 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      }
    >
      <PropertiesContent />
    </Suspense>
  )
}
