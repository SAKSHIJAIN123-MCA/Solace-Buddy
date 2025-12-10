"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface PopularArea {
  name: string
  properties: number
  image: string
}

export default function PopularAreas() {
  const [areas, setAreas] = useState<PopularArea[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchPopularAreas() // Renamed function call
  }, [])

  const fetchPopularAreas = async () => {
    // Renamed function
    try {
      const response = await fetch("/api/popular-areas") // Updated API endpoint
      const data = await response.json()
      if (data.success) {
        setAreas(data.data)
      }
    } catch (error) {
      console.error("Failed to fetch popular areas:", error) // Updated error message
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#2e057f] mb-4">Popular Areas</h2>
            <p className="text-gray-600 text-lg">Discover the most sought-after locations in your area</p>{" "}
            {/* Updated text */}
          </div>
          <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-6 justify-items-center">
            {Array.from({ length: 9 }).map((_, index) => (
              <div key={index} className="bg-white rounded-xl p-4 shadow-md animate-pulse">
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gray-300"></div>
                  <div className="mt-3 h-4 bg-gray-300 rounded w-16"></div>
                  <div className="mt-1 h-3 bg-gray-300 rounded w-12"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  const displayedAreas = areas.slice(0, 9)

  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 animate-fade-in-up">
          <h2 className="text-3xl font-bold text-[#2e057f] mb-4">Popular Areas</h2>
          <p className="text-gray-600 text-lg">Discover the most sought-after locations in your area</p>{" "}
          {/* Updated text */}
        </div>

        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-6 justify-items-center mb-12">
          {displayedAreas.map((area, index) => {
            const encodedArea = encodeURIComponent(area.name) // Renamed variable
            return (
              <Link
                key={index}
                href={`/areas/${encodedArea}`} // Updated URL from /cities to /areas
                className="bg-white rounded-xl p-4 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-2 cursor-pointer group animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-300 border-4 border-[#2e057f] group-hover:border-[#4c1d95]">
                    <Image
                      src={area.image || "/placeholder.svg"}
                      alt={`${area.name} area`}
                      width={96}
                      height={96}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                  <h3 className="mt-3 text-sm md:text-base font-semibold text-[#2e057f] text-center group-hover:text-[#4c1d95] transition-colors">
                    {area.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">{area.properties} properties</p>
                </div>
              </Link>
            )
          })}
        </div>

        <div className="text-center animate-fade-in-up" style={{ animationDelay: "900ms" }}>
          <Link href="/areas">
            {" "}
            {/* Updated URL from /cities to /areas */}
            <Button className="bg-[#2e057f] hover:bg-[#4c1d95] text-white px-8 py-3 text-lg font-semibold rounded-lg transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl">
              Explore More
            </Button>
          </Link>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
      `}</style>
    </section>
  )
}
