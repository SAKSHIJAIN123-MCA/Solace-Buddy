"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Suspense } from "react"

type PropertyLite = {
  _id: string
  slug?: string | null
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
}

type PropertyDetail = {
  _id: string
  slug?: string | null
  propertyId: string
  name: string
  type: "Hostel" | "PG" | "Both"
  address: string
  city: string
  state: string
  pincode?: string
  contactNumber?: string
  email?: string
  gender: "male" | "female" | "coed"
  nearbyLandmark?: string
  totalRooms?: number
  totalBeds: number
  availableBeds: number
  rentRange: { min: number; max: number }
  monthlyRevenue?: number
  amenities: any[]
  rules?: string[]
  description?: string
  nearbyPlaces?: string
  images: string[]
  rooms?: any[]
  isActive?: boolean
  withFood?: boolean
  withoutFood?: boolean
}

type Amenity = {
  _id?: string
  name?: string
  description?: string
  icon?: string
  status?: "active" | "inactive"
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

function formatINR(n: number | null | undefined) {
  if (!Number.isFinite(n as number)) return ""
  return (n as number).toLocaleString("en-IN", { maximumFractionDigits: 0 })
}

function useCompareSelectionFromQuery() {
  const search = useSearchParams()
  const router = useRouter()
  const [ids, setIds] = useState<string[]>([])

  useEffect(() => {
    const raw = (search.get("ids") || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
    if (raw.length) {
      setIds(raw.slice(0, 2))
      // persist for card toggle UX continuity
      try {
        localStorage.setItem("compareSelection", JSON.stringify(raw.slice(0, 2)))
      } catch {}
    } else {
      // attempt from localStorage
      try {
        const ls = localStorage.getItem("compareSelection")
        const arr = ls ? (JSON.parse(ls) as string[]) : []
        if (Array.isArray(arr) && arr.length) {
          setIds(arr.slice(0, 2))
          router.replace(`/compare?ids=${encodeURIComponent(arr.slice(0, 2).join(","))}`)
        }
      } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const update = (next: string[]) => {
    const two = next.slice(0, 2)
    setIds(two)
    try {
      localStorage.setItem("compareSelection", JSON.stringify(two))
    } catch {}
    const qs = two.length ? `?ids=${encodeURIComponent(two.join(","))}` : ""
    router.replace(`/compare${qs}`)
  }

  return { ids, setIds: update }
}

function usePropertyList(query: string) {
  const params = new URLSearchParams()
  if (query) params.set("q", query)
  params.set("pageSize", "10")
  const { data } = useSWR<{ success: boolean; data: PropertyLite[] }>(`/api/properties?${params.toString()}`, fetcher, {
    keepPreviousData: true,
  })
  return data?.data || []
}

function usePropertyDetail(idOrSlug?: string) {
  const key = idOrSlug ? `/api/properties/${idOrSlug}` : null
  const { data } = useSWR<{ success: boolean; data: PropertyDetail }>(key, fetcher)
  return data?.data
}

function useAmenitiesCatalog() {
  const { data } = useSWR<{ success: boolean; data: Amenity[] }>("/api/amenities", fetcher)
  return data?.data || []
}

function normalizeAmenities(raw: any[], catalog: Amenity[]): Amenity[] {
  const isLikelyObjectId = (val: unknown) => typeof val === "string" && /^[a-f0-9]{24}$/i.test(val)
  if (!Array.isArray(raw)) return []
  const mapped = raw
    .map((a: any) => {
      if (a && typeof a === "object") {
        const byId = a._id ? catalog.find((x) => x._id === a._id) : undefined
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
          const byId = catalog.find((x) => x._id === a)
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
        const byName = catalog.find((x) => (x.name || "").toLowerCase() === a.toLowerCase())
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
    .filter(Boolean) as Amenity[]
  const seen = new Set<string>()
  return mapped.filter((am) => {
    const key = am._id || `name:${(am.name || "").toLowerCase()}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function AmenityPill({ amenity }: { amenity: Amenity }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <img
        src={amenity.icon || "/placeholder.svg?height=64&width=64&query=amenity icon"}
        alt={amenity.name || "Amenity"}
        className="w-4 h-4 object-contain"
      />
      <span className="text-muted-foreground">{amenity.name || "Amenity"}</span>
    </div>
  )
}

export default function ComparePage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8">Loading comparison...</div>
        </main>
      }
    >
      <CompareContent />
    </Suspense>
  )
}

function CompareContent() {
  const { ids, setIds } = useCompareSelectionFromQuery()
  const [qA, setQA] = useState("")
  const [qB, setQB] = useState("")
  const listA = usePropertyList(qA)
  const listB = usePropertyList(qB)
  const a = usePropertyDetail(ids[0])
  const b = usePropertyDetail(ids[1])
  const catalog = useAmenitiesCatalog()

  const aAmenities = useMemo(() => normalizeAmenities(a?.amenities || [], catalog), [a, catalog])
  const bAmenities = useMemo(() => normalizeAmenities(b?.amenities || [], catalog), [b, catalog])

  const aSet = useMemo(() => new Set(aAmenities.map((x) => (x.name || "").toLowerCase())), [aAmenities])
  const bSet = useMemo(() => new Set(bAmenities.map((x) => (x.name || "").toLowerCase())), [bAmenities])

  const common = aAmenities.filter((x) => bSet.has((x.name || "").toLowerCase()))
  const onlyA = aAmenities.filter((x) => !bSet.has((x.name || "").toLowerCase()))
  const onlyB = bAmenities.filter((x) => !aSet.has((x.name || "").toLowerCase()))

  const selectA = (p: PropertyLite) => {
    const next = [p._id, ids[1]].filter(Boolean) as string[]
    setIds(next)
    setQA(p.name)
  }
  const selectB = (p: PropertyLite) => {
    const next = [ids[0], p._id].filter(Boolean) as string[]
    setIds(next)
    setQB(p.name)
  }

  const clearA = () => setIds([undefined as unknown as string, ids[1]].filter(Boolean) as string[])
  const clearB = () => setIds(ids[0] ? [ids[0]] : [])

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-[#2e057f] mb-2 text-balance">Compare Properties</h1>
        <p className="text-muted-foreground mb-6">Select two properties to compare by amenities and key details.</p>

        {/* Selection row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Property A</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                placeholder="Search property..."
                value={qA}
                onChange={(e) => setQA(e.target.value)}
                className="w-full"
              />
              {!ids[0] && qA && (
                <div className="border rounded p-2 max-h-60 overflow-auto">
                  {listA.map((p) => (
                    <button
                      key={p._id}
                      onClick={() => selectA(p)}
                      className="w-full text-left px-2 py-1 hover:bg-accent rounded"
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={p.images?.[0] || "/placeholder.svg?height=64&width=64&query=property"}
                          alt={p.name}
                          className="w-8 h-8 object-cover rounded"
                        />
                        <div className="text-sm">
                          <div className="font-medium">{p.name}</div>
                          <div className="text-muted-foreground">
                            {p.city}, {p.state}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {ids[0] && a && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={a.images?.[0] || "/placeholder.svg?height=64&width=64&query=property"}
                      alt={a.name}
                      className="w-10 h-10 object-cover rounded"
                    />
                    <div>
                      <div className="font-medium">{a.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {a.city}, {a.state}
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={clearA}>
                    Change
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Property B</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                placeholder="Search property..."
                value={qB}
                onChange={(e) => setQB(e.target.value)}
                className="w-full"
              />
              {!ids[1] && qB && (
                <div className="border rounded p-2 max-h-60 overflow-auto">
                  {listB.map((p) => (
                    <button
                      key={p._id}
                      onClick={() => selectB(p)}
                      className="w-full text-left px-2 py-1 hover:bg-accent rounded"
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={p.images?.[0] || "/placeholder.svg?height=64&width=64&query=property"}
                          alt={p.name}
                          className="w-8 h-8 object-cover rounded"
                        />
                        <div className="text-sm">
                          <div className="font-medium">{p.name}</div>
                          <div className="text-muted-foreground">
                            {p.city}, {p.state}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {ids[1] && b && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={b.images?.[0] || "/placeholder.svg?height=64&width=64&query=property"}
                      alt={b.name}
                      className="w-10 h-10 object-cover rounded"
                    />
                    <div>
                      <div className="font-medium">{b.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {b.city}, {b.state}
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={clearB}>
                    Change
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Summary strip */}
        {(a || b) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <Badge variant="secondary">{a?.type?.toUpperCase() || "—"}</Badge>
                <div className="text-sm">
                  {a ? (
                    <>
                      <div className="font-medium">{a.name}</div>
                      <div className="text-muted-foreground">
                        {a.city}, {a.state} • {a.gender?.toUpperCase()}
                        {typeof a.rentRange?.min === "number" && <> • ₹{formatINR(a.rentRange.min)}+</>}
                      </div>
                    </>
                  ) : (
                    <div className="text-muted-foreground">Select Property A</div>
                  )}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <Badge variant="secondary">{b?.type?.toUpperCase() || "—"}</Badge>
                <div className="text-sm">
                  {b ? (
                    <>
                      <div className="font-medium">{b.name}</div>
                      <div className="text-muted-foreground">
                        {b.city}, {b.state} • {b.gender?.toUpperCase()}
                        {typeof b.rentRange?.min === "number" && <> • ₹{formatINR(b.rentRange.min)}+</>}
                      </div>
                    </>
                  ) : (
                    <div className="text-muted-foreground">Select Property B</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Amenities comparison */}
        {a && b && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Common Amenities</CardTitle>
              </CardHeader>
              <CardContent>
                {common.length ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {common.map((am) => (
                      <AmenityPill key={(am._id || am.name) as string} amenity={am} />
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">No common amenities found.</div>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Only in {a.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  {onlyA.length ? (
                    <div className="grid grid-cols-2 gap-3">
                      {onlyA.map((am) => (
                        <AmenityPill key={(am._id || am.name) as string} amenity={am} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">No unique amenities.</div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Only in {b.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  {onlyB.length ? (
                    <div className="grid grid-cols-2 gap-3">
                      {onlyB.map((am) => (
                        <AmenityPill key={(am._id || am.name) as string} amenity={am} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">No unique amenities.</div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
