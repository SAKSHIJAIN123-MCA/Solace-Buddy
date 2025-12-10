"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useVendor } from "@/components/vendor-auth-provider"
import { Loader2, Building2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useState } from "react"

function VendorDashboard() {
  const { vendor } = useVendor()
  const [stats, setStats] = useState({
    totalPG: 0,
    totalBeds: 0,
    totalRooms: 0,
    filledBeds: 0,
    emptyBeds: 0,
    bedsOnNotice: 0,
    bookingsReceived: 0,
    pastTotalBookings: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (vendor) {
      fetchStats()
    }
  }, [vendor])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/vendor-properties", {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      })
      const data = await response.json()

      if (data.success && data.data) {
        // Calculate stats from properties data
        const properties = data.data

        let totalRooms = 0
        let totalBeds = 0
        let filledBeds = 0
        let emptyBeds = 0

        properties.forEach((property: any) => {
          totalRooms += property.totalRooms || 0
          totalBeds += property.totalBeds || 0
          filledBeds += property.occupiedBeds || 0
          emptyBeds += property.availableBeds || 0
        })

        setStats({
          totalPG: properties.length,
          totalBeds: totalBeds,
          totalRooms: totalRooms,
          filledBeds: filledBeds,
          emptyBeds: emptyBeds,
          bedsOnNotice: 0,
          bookingsReceived: 0,
          pastTotalBookings: 0,
        })
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600 mb-4" />
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
        <div className="text-sm text-gray-600">
          Welcome back, <span className="font-medium">{vendor?.name}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gray-100">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{stats.totalPG.toString().padStart(2, "0")}</div>
              <div className="text-sm font-medium text-gray-600 mt-2">Total Properties</div>
            </div>
          </CardContent>
        </Card>

      

        <Card className="bg-gray-100">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-black">{stats.totalRooms.toString().padStart(2, "0")}</div>
              <div className="text-sm font-medium text-gray-600 mt-2">Total Rooms</div>
            </div>
          </CardContent>
        </Card>

  <Card className="bg-gray-100">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-900">{stats.totalBeds.toString().padStart(2, "0")}</div>
              <div className="text-sm font-medium text-gray-600 mt-2">Total Beds</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-100">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{stats.filledBeds.toString().padStart(2, "0")}</div>
              <div className="text-sm font-medium text-gray-600 mt-2">Occupied Beds</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-100">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{stats.emptyBeds.toString().padStart(2, "0")}</div>
              <div className="text-sm font-medium text-gray-600 mt-2">Available Beds</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function VendorPage() {
  const { vendor, loading } = useVendor()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !vendor) {
      router.replace("/vendor/login")
    }
  }, [vendor, loading, router])

  if (!loading && !vendor) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="mx-auto h-12 w-12 text-blue-600 mb-4" />
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600 mb-4" />
          <p className="text-gray-600">Loading vendor dashboard...</p>
        </div>
      </div>
    )
  }

  return <VendorDashboard />
}
