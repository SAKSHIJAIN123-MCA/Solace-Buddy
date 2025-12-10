"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"

type Area = { name: string; properties: number; image?: string }

function formatINR(n: number) {
  return n.toLocaleString("en-IN", { maximumFractionDigits: 0 })
}

function parseCsvParam(sp: URLSearchParams, key: string): string[] {
  const raw = sp.get(key)
  if (!raw) return []
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
}

export function PropertySidebarFilters() {
  const router = useRouter()
  const sp = useSearchParams()

  // URL → State (with defaults)
  const [price, setPrice] = useState<[number, number]>([
    Number(sp.get("minPrice") || 0),
    Number(sp.get("maxPrice") || 50000),
  ])

  const [areas, setAreas] = useState<string[]>(parseCsvParam(sp, "areas"))
  const [sharing, setSharing] = useState<string[]>(parseCsvParam(sp, "sharing")) // values: "1","2","3","4"
  const [ac, setAc] = useState<string[]>(parseCsvParam(sp, "ac")) // values: "ac","non-ac"

  const [allAreas, setAllAreas] = useState<Area[]>([])
  const [loadingAreas, setLoadingAreas] = useState(false)

  // Keep in sync when search params change externally
  useEffect(() => {
    setPrice([Number(sp.get("minPrice") || 0), Number(sp.get("maxPrice") || 50000)])
    setAreas(parseCsvParam(sp, "areas"))
    setSharing(parseCsvParam(sp, "sharing"))
    setAc(parseCsvParam(sp, "ac"))
  }, [sp])

  // Fetch areas
  useEffect(() => {
    const fetchAreas = async () => {
      setLoadingAreas(true)
      try {
        const res = await fetch("/api/popular-areas")
        const data = await res.json()
        if (data?.success && Array.isArray(data?.data)) {
          setAllAreas(data.data as Area[])
        }
      } catch (e) {
        console.error("Failed to fetch areas", e)
      } finally {
        setLoadingAreas(false)
      }
    }
    fetchAreas()
  }, [])

  // Merge with any existing top filters (q, type, gender, city)
  const buildUrl = () => {
    const params = new URLSearchParams()
    ;["q", "type", "gender", "city"].forEach((k) => {
      const v = sp.get(k)
      if (v && v !== "all" && v.trim()) params.set(k, v)
    })

    if (price[0] > 0) params.set("minPrice", String(price[0]))
    if (price[1] < 50000) params.set("maxPrice", String(price[1]))

    if (areas.length) params.set("areas", areas.join(","))
    if (sharing.length) params.set("sharing", sharing.join(","))
    if (ac.length) params.set("ac", ac.join(","))

    return `/properties?${params.toString()}`
  }

  const apply = () => {
    router.push(buildUrl())
  }

  // Instant apply on change for a smoother UX
  useEffect(() => {
    // Debounce slight to reduce pushes
    const t = setTimeout(() => apply(), 200)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [price, areas, sharing, ac])

  const toggleInArray = (arr: string[], value: string, set: (v: string[]) => void) => {
    if (arr.includes(value)) set(arr.filter((v) => v !== value))
    else set([...arr, value])
  }

  const sharingOptions = useMemo(() => ["1", "2", "3", "4", "5", "6", "7", "8"], [])
  const acOptions = useMemo(() => ["ac", "non-ac"], [])

  return (
    <aside aria-label="Filters" className="sticky top-4">
      <Card className="p-4 border">
        <div className="mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔎</span>
            <h2 className="text-lg font-semibold">Filters</h2>
          </div>
        </div>

        {/* Price Range */}
        <div className="mt-4">
          <h3 className="text-sm font-medium mb-3">Price Range</h3>
          <Slider
            value={price}
            onValueChange={(val) => setPrice([val[0] ?? 0, val[1] ?? 50000])}
            min={0}
            max={50000}
            step={500}
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>₹{formatINR(price[0])}</span>
            <span>₹{formatINR(price[1])}</span>
          </div>
        </div>

        {/* Areas */}
        <div className="mt-6">
          <h3 className="text-sm font-medium mb-3">Areas</h3>
          <div className="space-y-3 max-h-64 overflow-auto pr-1">
            {loadingAreas && <div className="text-xs text-muted-foreground">Loading areas...</div>}
            {!loadingAreas &&
              (allAreas.length ? (
                allAreas.map((a) => {
                  const name = a.name
                  const checked = areas.includes(name)
                  return (
                    <label key={name} className="flex items-center gap-3 text-sm">
                      <Checkbox checked={checked} onCheckedChange={() => toggleInArray(areas, name, setAreas)} />
                      <span className="text-foreground">{name}</span>
                    </label>
                  )
                })
              ) : (
                <div className="text-xs text-muted-foreground">No areas</div>
              ))}
          </div>
        </div>

        {/* Sharing */}
        <div className="mt-6">
          <h3 className="text-sm font-medium mb-3">Sharing</h3>
          <div className="space-y-3">
            {sharingOptions.map((opt) => (
              <label key={opt} className="flex items-center gap-3 text-sm">
                <Checkbox
                  checked={sharing.includes(opt)}
                  onCheckedChange={() => toggleInArray(sharing, opt, setSharing)}
                />
                <span className="text-foreground">{opt}-Sharing</span>
              </label>
            ))}
          </div>
        </div>

        {/* AC Type */}
        <div className="mt-6">
          <h3 className="text-sm font-medium mb-3">AC Type</h3>
          <div className="space-y-3">
            {acOptions.map((opt) => (
              <label key={opt} className="flex items-center gap-3 text-sm capitalize">
                <Checkbox checked={ac.includes(opt)} onCheckedChange={() => toggleInArray(ac, opt, setAc)} />
                <span className="text-foreground">{opt === "ac" ? "AC" : "Non-AC"}</span>
              </label>
            ))}
          </div>
        </div>
      </Card>
    </aside>
  )
}
