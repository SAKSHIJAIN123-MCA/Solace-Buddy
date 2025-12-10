"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PopularArea {
  name: string
  properties: number
  image: string
}

export default function PopularAreas() {
  const [areas, setAreas] = useState<PopularArea[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const citiesPerPage = 25
  const router = useRouter()

  useEffect(() => {
    fetchPopularCities()
  }, [])

  const fetchPopularCities = async () => {
    try {
      const response = await fetch("/api/popular-cities")
      const data = await response.json()
      if (data.success) {
        setAreas(data.data)
      }
    } catch (error) {
      console.error("Failed to fetch popular cities:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewAll = () => {
    router.push("/properties")
  }

  const totalPages = Math.ceil(areas.length / citiesPerPage)
  const startIndex = (currentPage - 1) * citiesPerPage
  const endIndex = startIndex + citiesPerPage
  const currentCities = areas.slice(startIndex, endIndex)

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
  }

  const goToPrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1))
  }

  if (loading) {
    return (
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#2e057f] mb-4">Popular Areas</h2>
            <p className="text-gray-600 text-lg">Discover the most sought-after locations in your city</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {Array.from({ length: 25 }).map((_, index) => (
              <div key={index} className="bg-white rounded-xl p-4 shadow-md animate-pulse">
                <div className="w-full h-40 bg-gray-300 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#2e057f] mb-4">Popular Areas</h2>
          <p className="text-gray-600 text-lg">Discover the most sought-after locations in your city</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-8">
          {currentCities.map((area, index) => {
            const encodedCity = encodeURIComponent(area.name)
            return (
              <Link key={index} href={`/cities/${encodedCity}`} className="group">
                <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="relative h-40 overflow-hidden">
                    <Image
                      src={area.image || "/placeholder.svg?height=160&width=280&query=city view"}
                      alt={`${area.name} area`}
                      width={280}
                      height={160}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-[#2e057f] mb-1 group-hover:text-[#4c1d95] transition-colors">
                      {area.name}
                    </h3>
                    <p className="text-sm text-gray-500">{area.properties} properties</p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4">
            <Button
              variant="outline"
              onClick={goToPrevPage}
              disabled={currentPage === 1}
              className="flex items-center gap-2 bg-transparent"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
            </div>

            <Button
              variant="outline"
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="flex items-center gap-2 bg-transparent"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}
