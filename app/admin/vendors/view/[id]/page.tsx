"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Building2, Mail, Phone, Edit, Home } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"

export default function ViewVendorPage() {
  const { toast } = useToast()
  const router = useRouter()
  const params = useParams()
  const vendorId = params.id as string

  const [loading, setLoading] = useState(true)
  const [vendor, setVendor] = useState<any>(null)
  const [properties, setProperties] = useState<any[]>([])
  const [propertiesLoading, setPropertiesLoading] = useState(false)

  useEffect(() => {
    const fetchVendor = async () => {
      try {
        const response = await fetch(`/api/vendors/${vendorId}`)
        const result = await response.json()

        if (result.success) {
          setVendor(result.data)
        } else {
          toast({
            title: "Error",
            description: "Failed to fetch vendor details",
            variant: "destructive",
          })
          router.push("/admin/vendors")
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Something went wrong while fetching vendor details",
          variant: "destructive",
        })
        router.push("/admin/vendors")
      } finally {
        setLoading(false)
      }
    }

    if (vendorId) {
      fetchVendor()
    }
  }, [vendorId, router, toast])

  useEffect(() => {
    const fetchProperties = async () => {
      if (!vendorId) return
      try {
        setPropertiesLoading(true)
        const response = await fetch(`/api/admin/vendors/${vendorId}/properties`)
        const result = await response.json()

        if (result.success) {
          setProperties(result.data)
        } else {
          console.error("Failed to fetch properties:", result.error)
        }
      } catch (error) {
        console.error("Error fetching properties:", error)
      } finally {
        setPropertiesLoading(false)
      }
    }

    fetchProperties()
  }, [vendorId])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "default"
      case "pending":
        return "secondary"
      case "suspended":
        return "destructive"
      case "rejected":
        return "destructive"
      default:
        return "secondary"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
          <p className="mt-4">Loading vendor details...</p>
        </div>
      </div>
    )
  }

  if (!vendor) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">Vendor not found</p>
          <Link href="/admin/vendors">
            <Button className="mt-4">Back to Vendors</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/admin/vendors">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Vendors
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{vendor.name}</h1>
            <p className="text-muted-foreground">Vendor details and information</p>
          </div>
        </div>
        <Link href={`/admin/vendors/edit/${vendor._id}`}>
          <Button>
            <Edit className="h-4 w-4 mr-2" />
            Edit Vendor
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Business Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="h-5 w-5 mr-2" />
              Business Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Business Name</label>
              <p className="text-lg font-medium">{vendor.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Owner Name</label>
              <p className="text-lg">{vendor.ownerName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Business Type</label>
              <div className="mt-1">
                <Badge variant="outline">{vendor.businessType}</Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <div className="mt-1">
                <Badge variant={getStatusColor(vendor.status)}>{vendor.status}</Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Registration Date</label>
              <p className="text-lg">{new Date(vendor.registrationDate).toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Phone className="h-5 w-5 mr-2" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email Address</label>
              <div className="flex items-center mt-1">
                <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                <p className="text-lg">{vendor.email}</p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
              <div className="flex items-center mt-1">
                <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                <p className="text-lg">{vendor.phone}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Home className="h-5 w-5 mr-2" />
            Properties ({properties.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {propertiesLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-2 text-sm text-muted-foreground">Loading properties...</p>
              </div>
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-8">
              <Home className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <p className="text-muted-foreground">No properties found for this vendor</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {properties.map((property: any) => (
                <Card key={property._id} className="border border-gray-200">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-lg truncate">{property.pgNickName || property.name}</h3>
                        <p className="text-sm text-muted-foreground">{property.propertyId}</p>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Type:</span>
                        <Badge variant="outline">{property.type}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Location:</span>
                        <span className="font-medium">
                          {property.city}, {property.state}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                        <div className="text-center">
                          <p className="text-lg font-bold">{property.totalBeds}</p>
                          <p className="text-xs text-muted-foreground">Total Beds</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-green-600">{property.availableBeds}</p>
                          <p className="text-xs text-muted-foreground">Available</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-red-600">{property.occupiedBeds}</p>
                          <p className="text-xs text-muted-foreground">Occupied</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
