"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, MoreHorizontal, Edit, Trash2, Eye } from "lucide-react"
import type { Banner } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchBanners()
  }, [])

  const fetchBanners = async () => {
    try {
      const response = await fetch("/api/banners")
      const result = await response.json()

      if (result.success) {
        setBanners(result.data)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch banners",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching banners:", error)
      toast({
        title: "Error",
        description: "Failed to fetch banners",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this banner?")) return

    try {
      const response = await fetch(`/api/banners/${id}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (result.success) {
        setBanners(banners.filter((banner) => banner._id !== id))
        toast({
          title: "Success",
          description: "Banner deleted successfully",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete banner",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting banner:", error)
      toast({
        title: "Error",
        description: "Failed to delete banner",
        variant: "destructive",
      })
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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Banners</h1>
          <p className="text-gray-600">Manage your hero banners</p>
        </div>
        <Link href="/admin/banners/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Banner
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Banners ({banners.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Subtitle</TableHead>
                <TableHead>CTA</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {banners.map((banner) => (
                <TableRow key={banner._id}>
                  <TableCell>
                    <div className="w-16 h-10 bg-gray-200 rounded overflow-hidden">
                      <img
                        src={banner.backgroundImage || "/placeholder.svg"}
                        alt={banner.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/celebratory-banner.png"
                        }}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{banner.title}</TableCell>
                  <TableCell className="max-w-xs truncate">{banner.subtitle}</TableCell>
                  <TableCell>{banner.buttonText}</TableCell>
                  <TableCell>
                    <Badge variant={banner.isActive ? "default" : "secondary"}>
                      {banner.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>{banner.order}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                       
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/banners/${banner._id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(banner._id)} className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {banners.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No banners found</p>
              <Link href="/admin/banners/new">
                <Button>Create your first banner</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
