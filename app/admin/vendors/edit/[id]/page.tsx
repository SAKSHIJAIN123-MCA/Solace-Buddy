"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Building2, Mail, Phone, User, ArrowLeft } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"

export default function EditVendorPage() {
  const { toast } = useToast()
  const router = useRouter()
  const params = useParams()
  const vendorId = params.id as string

  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: "",
    ownerName: "",
    email: "",
    phone: "",
    businessType: "PG",
  })
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    const fetchVendor = async () => {
      try {
        const response = await fetch(`/api/vendors/${vendorId}`)
        const result = await response.json()

        if (result.success) {
          const vendor = result.data
          setFormData({
            name: vendor.name || "",
            ownerName: vendor.ownerName || "",
            email: vendor.email || "",
            phone: vendor.phone || "",
            businessType: vendor.businessType || "PG",
          })
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
        setFetchLoading(false)
      }
    }

    if (vendorId) {
      fetchVendor()
    }
  }, [vendorId, router, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setFormErrors({})

    try {
      const response = await fetch(`/api/vendors/${vendorId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Success",
          description: "Vendor updated successfully",
        })
        router.push("/admin/vendors")
      } else {
        if (result.errors) {
          setFormErrors(result.errors)
        }
        toast({
          title: "Error",
          description: result.error || "Something went wrong. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
          <p className="mt-4">Loading vendor details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/admin/vendors">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Vendors
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Vendor</h1>
          <p className="text-muted-foreground">Update the vendor information below</p>
        </div>
      </div>

      <div className="w-full">
        <Card>
          <CardHeader>
            <CardTitle>Vendor Information</CardTitle>
            <CardDescription>Update the vendor details below</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Business Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Business Name *</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        placeholder="Enter business name"
                        className="pl-10"
                        required
                      />
                    </div>
                    {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ownerName">Owner Name *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="ownerName"
                        value={formData.ownerName}
                        onChange={(e) => handleChange("ownerName", e.target.value)}
                        placeholder="Enter owner name"
                        className="pl-10"
                        required
                      />
                    </div>
                    {formErrors.ownerName && <p className="text-red-500 text-sm mt-1">{formErrors.ownerName}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        placeholder="Enter email address"
                        className="pl-10"
                        required
                      />
                    </div>
                    {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleChange("phone", e.target.value)}
                        placeholder="+91 9876543210"
                        className="pl-10"
                        required
                      />
                    </div>
                    {formErrors.phone && <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessType">Business Type *</Label>
                  <Select value={formData.businessType} onValueChange={(value) => handleChange("businessType", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select business type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Hostel">Hostel</SelectItem>
                      <SelectItem value="PG">PG</SelectItem>
                      <SelectItem value="Both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                  {formErrors.businessType && <p className="text-red-500 text-sm mt-1">{formErrors.businessType}</p>}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-6">
                <Link href="/admin/vendors">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update Vendor
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
