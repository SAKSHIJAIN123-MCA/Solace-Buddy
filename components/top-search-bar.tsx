"use client"

import type React from "react"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { SearchIcon, PlusCircle, MinusCircle } from "lucide-react"

type Amenity = { _id?: string; name?: string; icon?: string }

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

export function TopSearchBar() {
  const router = useRouter()
  const sp = useSearchParams()

  // URL-synced state
  const [q, setQ] = useState(sp.get("q") || "")
  const [type, setType] = useState(sp.get("type") || "all")
  const [gender, setGender] = useState(sp.get("gender") || "")
  const [price, setPrice] = useState<[number, number]>([
    Number(sp.get("minPrice") || 0),
    Number(sp.get("maxPrice") || 100000),
  ])
  const [amenities, setAmenities] = useState<string[]>(parseCsv(sp.get("amenities")))

  // amenities list
  const [amenitiesList, setAmenitiesList] = useState<Amenity[]>([])
  const [amenitiesOpen, setAmenitiesOpen] = useState(false)
  const [advancedOpen, setAdvancedOpen] = useState(false)

  // keep in sync with URL changes (back/forward)
  useEffect(() => {
    setQ(sp.get("q") || "")
    setType(sp.get("type") || "all")
    setGender(sp.get("gender") || "")
    setPrice([Number(sp.get("minPrice") || 0), Number(sp.get("maxPrice") || 100000)])
    setAmenities(parseCsv(sp.get("amenities")))
  }, [sp])

  // fetch amenities
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
        // swallow
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  const buildUrl = () => {
    const params = new URLSearchParams()
    // preserve other known params
    ;["city", "areas", "sharing", "ac"].forEach((k) => {
      const v = sp.get(k)
      if (v) params.set(k, v)
    })
    if (q.trim()) params.set("q", q.trim())
    if (type && type !== "all") params.set("type", type)
    if (gender === "male" || gender === "female") params.set("gender", gender)

    // advanced
    if (price[0] > 0) params.set("minPrice", String(price[0]))
    if (price[1] < 100000) params.set("maxPrice", String(price[1]))
    if (amenities.length) params.set("amenities", amenities.join(","))

    return `/properties?${params.toString()}`
  }

  const apply = () => {
    router.push(buildUrl())
  }

  // debounce instant apply on advanced filters
  useEffect(() => {
    const t = setTimeout(() => {
      // Only auto-apply when advanced is open (to avoid surprising URL churn)
      if (advancedOpen) apply()
    }, 200)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [price, amenities, advancedOpen])

  const onSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") apply()
  }

  const toggleAmenity = (idOrName: string) => {
    setAmenities((prev) => (prev.includes(idOrName) ? prev.filter((x) => x !== idOrName) : [...prev, idOrName]))
  }

  const activeGender = useMemo<"boys" | "girls" | "">(() => {
    if (gender === "male") return "boys"
    if (gender === "female") return "girls"
    return ""
  }, [gender])

  return (
    <section className="w-screen relative left-1/2 right-1/2 -mx-[50vw] mt-0">
      {/* Top bar */}
      <div className="w-full rounded-md bg-[#3a3c6e] text-white px-4 py-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
          {/* Boys/Girls */}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              className={`h-9 px-4 uppercase tracking-wide ${
                activeGender === "boys" ? "bg-white text-[#3a3c6e]" : "bg-transparent text-white border-white/40 border"
              }`}
              onClick={() => {
                const next = gender === "male" ? "" : "male"
                setGender(next)
                // Immediate apply for tabs
                setTimeout(apply, 0)
              }}
            >
              BOYS
            </Button>
            <Button
              type="button"
              variant="secondary"
              className={`h-9 px-4 uppercase tracking-wide ${
                activeGender === "girls"
                  ? "bg-white text-[#3a3c6e]"
                  : "bg-transparent text-white border-white/40 border"
              }`}
              onClick={() => {
                const next = gender === "female" ? "" : "female"
                setGender(next)
                setTimeout(apply, 0)
              }}
            >
              GIRLS
            </Button>
          </div>

          {/* Search input */}
          <div className="relative flex-1">
            <Input
              placeholder="Search For PG/Hostel..."
              className="h-10 pl-3 pr-10 bg-white text-[#111] placeholder:text-gray-500"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={onSearchKeyDown}
            />
            <button
              aria-label="Search"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#3a3c6e]"
              onClick={apply}
            >
              <SearchIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Advanced Search toggle */}
          <button
            type="button"
            className="flex items-center gap-2 text-sm font-medium"
            onClick={() => setAdvancedOpen((v) => !v)}
          >
            <span>Advanced Search</span>
            {advancedOpen ? (
              <MinusCircle className="w-5 h-5 text-lime-400" />
            ) : (
              <PlusCircle className="w-5 h-5 text-lime-400" />
            )}
          </button>
        </div>

        {/* Advanced content */}
        {advancedOpen && (
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {/* Property Type */}
            <div className=" rounded-md p-2 text-[#111]">
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Property Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="hostel">Hostel</SelectItem>
                  <SelectItem value="pg">PG</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Price Range */}
            <div className="bg-transparent p-2">
              <div className="text-white/90 text-sm mb-2">Price Range</div>
              <Slider
                value={price}
                onValueChange={(v) => setPrice([v[0] ?? 0, v[1] ?? 100000])}
                min={0}
                max={100000}
                step={500}
              />
              <div className="flex justify-between text-xs mt-2">
                <span>₹{formatINR(price[0])}</span>
                <span>₹{formatINR(price[1])}</span>
              </div>
            </div>

            {/* Amenities */}
            <div className="p-2">
              <button
                type="button"
                className="inline-flex items-center gap-2 text-white/90 text-sm font-medium"
                onClick={() => setAmenitiesOpen((v) => !v)}
              >
                <PlusCircle className="w-4 h-4 text-lime-400" />
                <span>Amenities</span>
              </button>

              {amenitiesOpen && (
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {amenitiesList.map((a) => {
                    const key = a._id || a.name || ""
                    const checked = amenities.includes(key as string) || amenities.includes(a.name || "")
                    return (
                      <label key={key} className="flex items-center gap-3 text-sm">
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => toggleAmenity((a._id as string) || a.name || "")}
                        />
                        {a.icon ? (
                          <img
                            src={a.icon || "/placeholder.svg"}
                            alt={a.name || "Amenity"}
                            className="w-4 h-4 object-contain"
                          />
                        ) : null}
                        <span className="text-white">{a.name}</span>
                      </label>
                    )
                  })}
                  {!amenitiesList.length && <div className="text-xs text-white/70">No amenities</div>}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default TopSearchBar
