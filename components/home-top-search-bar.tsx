"use client"

import type React from "react"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { PlusCircle, MinusCircle, SearchIcon } from "lucide-react"

type Amenity = { _id?: string; name?: string; icon?: string }
type Area = { name: string; properties?: number; image?: string }

// Helpers
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
const isObjectId = (val: unknown) => typeof val === "string" && /^[a-f0-9]{24}$/i.test(val)

export default function HomeTopSearchBar() {
  const router = useRouter()
  const sp = useSearchParams()

  // Top-level filters
  const [city, setCity] = useState<string>(sp.get("city") || "all")
  const [area, setArea] = useState<string>(() => {
    const areas = parseCsv(sp.get("areas"))
    return areas[0] || "none"
  })
  const [gender, setGender] = useState<string>(sp.get("gender") || "all")
  const [q, setQ] = useState<string>(sp.get("q") || "")

  // Advanced filters
  const [sharing, setSharing] = useState<string[]>(parseCsv(sp.get("sharing")))
  const [price, setPrice] = useState<[number, number]>([
    Number(sp.get("minPrice") || 0),
    Number(sp.get("maxPrice") || 50000),
  ])
  const [amenities, setAmenities] = useState<string[]>(parseCsv(sp.get("amenities")))

  // Options data
  const [cities, setCities] = useState<string[]>([])
  const [areasList, setAreasList] = useState<Area[]>([])
  const [amenitiesList, setAmenitiesList] = useState<Amenity[]>([])

  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [amenitiesOpen, setAmenitiesOpen] = useState(false)

  // Keep in sync with URL changes (back/forward)
  useEffect(() => {
    setCity(sp.get("city") || "all")
    {
      const arr = parseCsv(sp.get("areas"))
      setArea(arr[0] || "none")
    }
    setGender(sp.get("gender") || "all")
    setQ(sp.get("q") || "")

    setSharing(parseCsv(sp.get("sharing")))
    setPrice([Number(sp.get("minPrice") || 0), Number(sp.get("maxPrice") || 50000)])
    setAmenities(parseCsv(sp.get("amenities")))
  }, [sp])

  // Fetch: Cities (attempt /api/cities, fallback to unique from /api/properties)
  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        // Try direct cities API
        const res = await fetch("/api/cities")
        if (res.ok) {
          const data = await res.json()
          const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
          if (mounted && list.length) {
            setCities(Array.from(new Set(list.map((c: any) => String(c)).filter(Boolean))))
            return
          }
        }
      } catch {
        // ignore and try fallback
      }
      try {
        // Fallback: infer from properties
        const resProps = await fetch("/api/properties?limit=500")
        const dataProps = await resProps.json()
        const list = Array.isArray(dataProps?.data) ? dataProps.data : []
        const inferred = Array.from(new Set(list.map((p: any) => (p?.city ? String(p.city) : "")).filter(Boolean)))
        if (mounted) setCities(inferred)
      } catch {
        if (mounted) setCities([])
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  // Fetch: Areas (same as sidebar)
  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch("/api/popular-areas")
        const data = await res.json()
        if (mounted && data?.success && Array.isArray(data?.data)) {
          setAreasList(data.data as Area[])
        }
      } catch {
        if (mounted) setAreasList([])
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  // Fetch: Amenities (same as top-search-bar on properties page)
  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch("/api/amenities")
        const data = await res.json()
        if (mounted && data?.success && Array.isArray(data?.data)) {
          setAmenitiesList(
            data.data.map((a: any) => ({
              _id: a._id || a.id,
              name: a.name || "",
              icon: a.icon || "",
            })),
          )
        }
      } catch {
        if (mounted) setAmenitiesList([])
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  const sharingOptions = useMemo(() => ["1", "2", "3", "4", "5", "6", "7", "8"], [])

  const toggleSharing = (opt: string) => {
    setSharing((prev) => (prev.includes(opt) ? prev.filter((x) => x !== opt) : [...prev, opt]))
  }
  const toggleAmenity = (idOrName: string) => {
    setAmenities((prev) => (prev.includes(idOrName) ? prev.filter((x) => x !== idOrName) : [...prev, idOrName]))
  }

  const buildUrl = () => {
    const params = new URLSearchParams()

    if (q.trim()) params.set("q", q.trim())
    if (city && city !== "all") params.set("city", city)
    if (area && area !== "none") params.set("areas", area)
    if (gender && gender !== "all") params.set("gender", gender)

    // Advanced
    if (price[0] > 0) params.set("minPrice", String(price[0]))
    if (price[1] < 50000) params.set("maxPrice", String(price[1]))
    if (sharing.length) params.set("sharing", sharing.join(","))
    if (amenities.length) params.set("amenities", amenities.join(","))

    return `/properties?${params.toString()}`
  }

  const apply = () => {
    router.push(buildUrl())
  }

  // Debounced auto-apply when advanced is open for a smoother UX
  useEffect(() => {
    if (!advancedOpen) return
    const t = setTimeout(() => {
      apply()
    }, 250)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [price, sharing, amenities])

  const onSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") apply()
  }

  return (
   <section aria-label="Homepage Search" className="w-full">
    <div className="container mx-auto px-4">
      {/* Top row: City, Area, Gender, Search, Advanced toggle, Search button */}
      <div className="w-full rounded-md bg-background border px-4 py-4">
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,2fr)_auto_auto] gap-3 items-end">
          {/* Gender */}
          <div>
            <div className="text-[11px] tracking-wide text-muted-foreground mb-1">GENDER</div>
            <Select value={gender} onValueChange={setGender}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="coed">Co-ed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* City */}
          <div>
            <div className="text-[11px] tracking-wide text-muted-foreground mb-1">City</div>
            <Select value={city} onValueChange={setCity}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {cities.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Area */}
          <div>
            <div className="text-[11px] tracking-wide text-muted-foreground mb-1">AREA</div>
            <Select value={area} onValueChange={setArea}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {areasList.map((a) => (
                  <SelectItem key={a.name} value={a.name}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Search input */}
          <div>
            <div className="text-[11px] tracking-wide text-muted-foreground mb-1">SEARCH</div>
            <div className="relative">
              <Input
                placeholder="Search For PG/Hostel..."
                className="h-10 pr-10"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={onSearchKeyDown}
              />
              <button
                aria-label="Search"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-foreground/70"
                onClick={apply}
              >
                <SearchIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Advanced toggle */}
          <div className="justify-self-end md:justify-self-auto">
            <button
              type="button"
              className="h-10 px-4 inline-flex items-center gap-2 rounded-md bg-muted hover:bg-muted/80 transition text-foreground font-medium"
              onClick={() => setAdvancedOpen((v) => !v)}
            >
              <span>Advanced Search</span>
              {advancedOpen ? <MinusCircle className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
            </button>
          </div>

          {/* Search button */}
          <div className="justify-self-end">
            <Button
              className="h-10 px-5 bg-[#2e057f] hover:bg-[#7AB43F] text-white font-semibold"
              type="button"
              onClick={apply}
            >
              Search
            </Button>
          </div>
        </div>

        {/* Advanced content */}
        {advancedOpen && (
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {/* Sharing */}
            <div>
              <h3 className="text-sm font-medium mb-3">Sharing Options</h3>
              <div className="grid grid-cols-2 gap-2">
                {sharingOptions.map((opt) => (
                  <label key={opt} className="flex items-center gap-3 text-sm">
                    <Checkbox checked={sharing.includes(opt)} onCheckedChange={() => toggleSharing(opt)} />
                    <span className="text-foreground">{opt}-Sharing</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h3 className="text-sm font-medium mb-3">Price Range</h3>
              <Slider
                value={price}
                onValueChange={(v) => setPrice([v[0] ?? 0, v[1] ?? 50000])}
                min={0}
                max={50000}
                step={500}
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>₹{formatINR(price[0])}</span>
                <span>₹{formatINR(price[1])}</span>
              </div>
            </div>

            {/* Amenities */}
            <div>
              <button
                type="button"
                className="inline-flex items-center gap-2 text-sm font-medium"
                onClick={() => setAmenitiesOpen((v) => !v)}
              >
                <PlusCircle className="w-4 h-4 text-[#8BC34A]" />
                <span>Amenities</span>
              </button>

              {amenitiesOpen && (
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {amenitiesList.map((a) => {
                    const key = a._id || a.name || ""
                    const checked = amenities.includes(key as string) || (a.name ? amenities.includes(a.name) : false)
                    return (
                      <label key={key} className="flex items-center gap-3 text-sm">
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => toggleAmenity((a._id as string) || a.name || "")}
                        />
                        {a.icon ? (
                          <img
                            src={a.icon || "/placeholder.svg?height=64&width=64&query=amenity icon"}
                            alt={a.name || "Amenity"}
                            className="w-4 h-4 object-contain"
                          />
                        ) : null}
                        <span className="text-foreground">{a.name}</span>
                      </label>
                    )
                  })}
                  {!amenitiesList.length && <div className="text-xs text-muted-foreground">No amenities</div>}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
        </div>
    </section>
  )
}
