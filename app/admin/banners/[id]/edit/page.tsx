"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { BannerForm } from "@/components/admin/banner-form"
import type { Banner } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

export default function EditBannerPage() {
  const params = useParams()
  const [banner, setBanner] = useState<Banner | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchBanner()
  }, [])

  const fetchBanner = async () => {
    try {
      const response = await fetch(`/api/banners/${params.id}`)
      const result = await response.json()

      if (result.success) {
        setBanner(result.data)
      } else {
        toast({
          title: "Error",
          description: "Banner not found",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching banner:", error)
      toast({
        title: "Error",
        description: "Failed to fetch banner",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!banner) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Banner Not Found</h1>
          <p className="text-gray-600">The banner you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Banner</h1>
        <p className="text-gray-600">Update your hero banner</p>
      </div>

      <BannerForm banner={banner} />
    </div>
  )
}
