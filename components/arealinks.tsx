"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

interface PopularArea {
  name: string
  properties: number
  image: string
}

export default function AreaLinks() {
  const [areas, setAreas] = useState<PopularArea[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAreas()
  }, [])

  const fetchAreas = async () => {
    try {
      const response = await fetch("/api/popular-areas")
      const data = await response.json()
      if (data.success) {
        setAreas(data.data)
      }
    } catch (error) {
      console.error("Failed to fetch areas:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section className="py-12 px-4 bg-[#F5F0F9] border-t border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((col) => (
              <div key={col} className="space-y-2">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="h-4 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  // Split areas into 3 columns
  const itemsPerColumn = Math.ceil(areas.length / 3)
  const column1 = areas.slice(0, itemsPerColumn)
  const column2 = areas.slice(itemsPerColumn, itemsPerColumn * 2)
  const column3 = areas.slice(itemsPerColumn * 2)

  return (
    <section className="py-14 px-4 bg-[#F5F0F9] border-t border-gray-200">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Column 1 */}
          <div className="space-y-2">
            {column1.map((area, index) => {
              const encodedArea = encodeURIComponent(area.name)
              return (
                <Link
                  key={index}
                  href={`/areas/${encodedArea}`}
                  className="block text-gray-900 hover:text-[#2e057f] transition-colors text-sm"
                >
                  PG in {area.name}
                </Link>
              )
            })}
          </div>

          {/* Column 2 */}
          <div className="space-y-2">
            {column2.map((area, index) => {
              const encodedArea = encodeURIComponent(area.name)
              return (
                <Link
                  key={index}
                  href={`/areas/${encodedArea}`}
                  className="block text-gray-900 hover:text-[#2e057f] transition-colors text-sm"
                >
                  PG in {area.name}
                </Link>
              )
            })}
          </div>

          {/* Column 3 */}
          <div className="space-y-2">
            {column3.map((area, index) => {
              const encodedArea = encodeURIComponent(area.name)
              return (
                <Link
                  key={index}
                  href={`/areas/${encodedArea}`}
                  className="block text-gray-900 hover:text-[#2e057f] transition-colors text-sm"
                >
                  PG in {area.name}
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
