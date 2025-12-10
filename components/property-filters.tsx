"use client"
import { useRouter, useSearchParams } from "next/navigation"
import type React from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { useState, useEffect } from "react"

export function PropertyFilters() {
  const router = useRouter()
  const sp = useSearchParams()

  const [q, setQ] = useState<string>(sp.get("q") || "")
  const [type, setType] = useState<string>(sp.get("type") || "all")
  const [gender, setGender] = useState<string>(sp.get("gender") || "all")
  const [city, setCity] = useState<string>(sp.get("city") || "all")

  useEffect(() => {
    setQ(sp.get("q") || "")
    setType(sp.get("type") || "all")
    setGender(sp.get("gender") || "all")
    setCity(sp.get("city") || "all")
  }, [sp])

  const apply = () => {
    const params = new URLSearchParams()
    if (q.trim()) params.set("q", q.trim())
    if (type !== "all") params.set("type", type)
    if (gender !== "all") params.set("gender", gender)
    if (city !== "all") params.set("city", city)
    router.push(`/properties?${params.toString()}`)
  }

  useEffect(() => {
    apply()
  }, [type, gender, city])

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      apply()
    }
  }

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search box */}
        <div className="relative bg-card border rounded-lg p-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search properties..."
            className="pl-10"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyPress={handleKeyPress}
          />
        </div>

        {/* Property type */}
        <div className="bg-card border rounded-lg p-2">
          <Select value={type} onValueChange={setType}>
            <SelectTrigger>
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

        {/* Gender */}
        <div className="bg-card border rounded-lg p-2">
          <Select value={gender} onValueChange={setGender}>
            <SelectTrigger>
              <SelectValue placeholder="Gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="coed">Co-ed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
