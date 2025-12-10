"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Building2, Plus, Edit, Search, Users, Bed, Trash2, RefreshCw, Eye } from "lucide-react"
import Link from "next/link"
import { PGFormDialog } from "@/components/admin/pg-form-dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function HostelPGPage() {
  const { toast } = useToast()
  const [properties, setProperties] = useState([])
  const [filteredProperties, setFilteredProperties] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingProperty, setEditingProperty] = useState(null)
  const [deletingProperty, setDeletingProperty] = useState(null)

  const [showVendorPropertiesDialog, setShowVendorPropertiesDialog] = useState(false)
  const [vendorProperties, setVendorProperties] = useState([])
  const [filteredVendorProperties, setFilteredVendorProperties] = useState([])
  const [vendorSearchTerm, setVendorSearchTerm] = useState("")
  const [vendorPropertiesLoading, setVendorPropertiesLoading] = useState(false)
  const [editingVendorProperty, setEditingVendorProperty] = useState(null)
  const [deletingVendorProperty, setDeletingVendorProperty] = useState(null)

  useEffect(() => {
    fetchProperties()
  }, [])

  useEffect(() => {
    // Filter properties based on search term
    const filtered = properties.filter(
      (property: any) =>
        property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.propertyId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.city.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredProperties(filtered)
  }, [searchTerm, properties])

  useEffect(() => {
    const filtered = vendorProperties.filter(
      (property: any) =>
        property.name.toLowerCase().includes(vendorSearchTerm.toLowerCase()) ||
        property.propertyId.toLowerCase().includes(vendorSearchTerm.toLowerCase()) ||
        property.city.toLowerCase().includes(vendorSearchTerm.toLowerCase()),
    )
    setFilteredVendorProperties(filtered)
  }, [vendorSearchTerm, vendorProperties])

  const fetchProperties = async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      const response = await fetch("/api/admin/vendor-properties", {
        cache: "no-store", // Force fresh data
        headers: {
          "Cache-Control": "no-cache",
        },
      })
      const data = await response.json()

      if (data.success) {
        console.log("Fetched properties with updated stats:", data.data)
        setProperties(data.data)
        setFilteredProperties(data.data)
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to fetch properties",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching properties:", error)
      toast({
        title: "Error",
        description: "Failed to fetch properties",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const fetchVendorProperties = async () => {
    try {
      setVendorPropertiesLoading(true)
      const response = await fetch("/api/vendor-properties", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      })
      const data = await response.json()

      if (data.success) {
        setVendorProperties(data.data)
        setFilteredVendorProperties(data.data)
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to fetch vendor properties",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching vendor properties:", error)
      toast({
        title: "Error",
        description: "Failed to fetch vendor properties",
        variant: "destructive",
      })
    } finally {
      setVendorPropertiesLoading(false)
    }
  }

  const handleRefresh = () => {
    fetchProperties(true)
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleVendorSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVendorSearchTerm(e.target.value)
  }

  const handleAddProperty = async (propertyData: any) => {
    try {
      console.log("[v0][hostel-pg][add][requestBody]", propertyData)

      const response = await fetch("/api/admin/vendor-properties", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(propertyData),
      })

      console.log("[v0][hostel-pg][add][responseStatus]", response.status, response.ok)

      const data = await response.json()

      console.log("[v0][hostel-pg][add][responseBody]", data)

      if (data.success) {
        toast({
          title: "Success",
          description: "Property added successfully",
        })
        setShowAddDialog(false)
        fetchProperties()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to add property",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0][hostel-pg][add][error]", error)
      toast({
        title: "Error",
        description: "Failed to add property",
        variant: "destructive",
      })
    }
  }

  const handleEditProperty = async (propertyData: any) => {
    try {
      console.log("[v0][hostel-pg][edit][requestBody]", {
        id: editingProperty?._id,
        body: propertyData,
      })

      const response = await fetch(`/api/admin/vendor-properties/${editingProperty._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(propertyData),
      })

      console.log("[v0][hostel-pg][edit][responseStatus]", response.status, response.ok)

      const data = await response.json()

      console.log("[v0][hostel-pg][edit][responseBody]", data)

      if (data.success) {
        toast({
          title: "Success",
          description: "Property updated successfully",
        })
        setEditingProperty(null)
        fetchProperties()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update property",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0][hostel-pg][edit][error]", error)
      toast({
        title: "Error",
        description: "Failed to update property",
        variant: "destructive",
      })
    }
  }

  const handleEditVendorProperty = async (propertyData: any) => {
    try {
      const response = await fetch(`/api/vendor-properties/${editingVendorProperty._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(propertyData),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Property updated successfully",
        })
        setEditingVendorProperty(null)
        fetchVendorProperties()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update property",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating vendor property:", error)
      toast({
        title: "Error",
        description: "Failed to update property",
        variant: "destructive",
      })
    }
  }

  const handleDeleteProperty = async () => {
    if (!deletingProperty) return

    try {
      const response = await fetch(`/api/admin/vendor-properties/${deletingProperty._id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Property deleted successfully",
        })
        setDeletingProperty(null)
        fetchProperties()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to delete property",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete property",
        variant: "destructive",
      })
    }
  }

  const handleDeleteVendorProperty = async () => {
    if (!deletingVendorProperty) return

    try {
      const response = await fetch(`/api/vendor-properties/${deletingVendorProperty._id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Property deleted successfully",
        })
        setDeletingVendorProperty(null)
        fetchVendorProperties()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to delete property",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete property",
        variant: "destructive",
      })
    }
  }

  const getOverallStats = () => {
    const stats = {
      totalProperties: properties.length,
      totalRooms: 0,
      totalBeds: 0,
      occupiedBeds: 0,
      availableBeds: 0,
      onBookBeds: 0,
      totalRevenue: 0,
    }

    properties.forEach((property: any) => {
      stats.totalRooms += property.totalRooms || 0
      stats.totalBeds += property.totalBeds || 0
      stats.occupiedBeds += property.occupiedBeds || 0
      stats.availableBeds += property.availableBeds || 0
      stats.onBookBeds += property.bedsOnBook || 0
      stats.totalRevenue += property.monthlyRevenue || 0
    })

    return stats
  }

  const stats = getOverallStats()

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading properties...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.totalProperties}</div>
            <div className="text-sm text-gray-600">Total Properties</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.totalRooms}</div>
            <div className="text-sm text-gray-600">Total Rooms</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.totalBeds}</div>
            <div className="text-sm text-gray-600">Total Beds</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.occupiedBeds}</div>
            <div className="text-sm text-gray-600">Occupied</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.availableBeds}</div>
            <div className="text-sm text-gray-600">Available</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Hostel & PG Management</h2>

        <div className="flex items-center space-x-4">
          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="text-gray-600 border-gray-300 bg-transparent"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search properties..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-10 w-64"
            />
          </div>

          <Button
            onClick={() => {
              setShowVendorPropertiesDialog(true)
              fetchVendorProperties()
            }}
            variant="outline"
            className="text-gray-600 border-gray-300 bg-transparent"
          >
            <Eye className="h-4 w-4 mr-2" />
            Vendor Properties
          </Button>

          {/* Add Property Button */}
          <Button onClick={() => setShowAddDialog(true)} className="bg-black text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add Property
          </Button>
        </div>
      </div>

      {/* Properties Listing */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProperties.map((property: any) => (
          <Card key={property._id} className="border border-gray-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {property.mainImage || (property.images && property.images[0]) ? (
                      <img
                        src={property.mainImage || property.images[0]}
                        alt="Property"
                        className="w-12 h-12 rounded-lg object-cover border"
                        onError={(e) => {
                          e.currentTarget.style.display = "none"
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-blue-600" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900 truncate max-w-[140px]">
                        {property.pgNickName || property.name}
                      </h3>
                      
                    </div>
                    <p className="text-sm text-gray-600">
                      {property.propertyId} • {property.type}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {property.city}, {property.state}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingProperty(property)}
                    className="text-blue-600 border-blue-600 hover:bg-blue-50"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeletingProperty(property)}
                    className="text-red-600 border-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Property Stats */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center mb-1">
                    <Bed className="h-4 w-4 text-gray-600 mr-1" />
                    <span className="text-lg font-semibold">{property.totalBeds || 0}</span>
                  </div>
                  <div className="text-xs text-gray-600">Total Beds</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center mb-1">
                    <Users className="h-4 w-4 text-gray-600 mr-1" />
                    <span className="text-lg font-semibold">{property.totalRooms || 0}</span>
                  </div>
                  <div className="text-xs text-gray-600">Total Rooms</div>
                </div>
              </div>

              {/* Bed Status */}
              <div className="grid grid-cols-3 gap-2 mb-8">
                <div className="text-center">
                  <div className="text-sm font-semibold text-red-600">{property.occupiedBeds || 0}</div>
                  <div className="text-xs text-gray-600">Occupied</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-semibold text-green-600">{property.availableBeds || 0}</div>
                  <div className="text-xs text-gray-600">Available</div>
                </div>
              </div>

              {/* Action Button */}
              <Link href={`/admin/hostel-pg/${property._id}/rooms`}>
                <Button className="w-full bg-black text-white">Manage Rooms & Beds</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProperties.length === 0 && !loading && (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm ? "No properties match your search criteria." : "Get started by adding your first property."}
          </p>
          <Button onClick={() => setShowAddDialog(true)} className="bg-black text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Property
          </Button>
        </div>
      )}

      {/* Add/Edit Property Dialog */}
      <PGFormDialog
        open={showAddDialog || !!editingProperty}
        onClose={() => {
          setShowAddDialog(false)
          setEditingProperty(null)
        }}
        onSubmit={editingProperty ? handleEditProperty : handleAddProperty}
        initialData={editingProperty}
        mode={editingProperty ? "edit" : "add"}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingProperty} onOpenChange={() => setDeletingProperty(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Property</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingProperty?.name}"? This action cannot be undone.
              {deletingProperty?.occupiedBeds > 0 && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700">
                  Warning: This property has {deletingProperty.occupiedBeds} occupied beds. Please ensure all students
                  are relocated before deletion.
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProperty} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showVendorPropertiesDialog} onOpenChange={setShowVendorPropertiesDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Vendor Properties Listing</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Search Bar for Vendor Properties */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search vendor properties..."
                value={vendorSearchTerm}
                onChange={handleVendorSearch}
                className="pl-10 w-full"
              />
            </div>

            {/* Vendor Properties Grid */}
            {vendorPropertiesLoading ? (
              <div className="text-center py-8">
                <div className="text-lg">Loading vendor properties...</div>
              </div>
            ) : filteredVendorProperties.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No vendor properties found</h3>
                <p className="text-gray-500">
                  {vendorSearchTerm ? "No properties match your search criteria." : "No vendor properties available."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredVendorProperties.map((property: any) => (
                  <Card key={property._id} className="border border-gray-200 hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-start space-x-2 flex-1">
                          <div className="flex-shrink-0">
                            {property.mainImage || (property.images && property.images[0]) ? (
                              <img
                                src={property.mainImage || property.images[0]}
                                alt="Property"
                                className="w-10 h-10 rounded-lg object-cover border"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none"
                                }}
                              />
                            ) : (
                              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <Building2 className="h-5 w-5 text-green-600" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-sm font-semibold text-gray-900 truncate">
                                {property.pgNickName || property.name}
                              </h3>
                              <span className="inline-block px-2 py-0.5 text-xs font-semibold bg-green-100 text-green-800 rounded whitespace-nowrap">
                                Vendor
                              </span>
                            </div>
                            <p className="text-xs text-gray-600">
                              {property.propertyId} • {property.type}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {property.city}, {property.state}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-1 ml-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingVendorProperty(property)}
                            className="text-blue-600 border-blue-600 hover:bg-blue-50 h-8 w-8 p-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeletingVendorProperty(property)}
                            className="text-red-600 border-red-600 hover:bg-red-50 h-8 w-8 p-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Property Stats */}
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="text-center p-2 bg-gray-50 rounded">
                          <div className="flex items-center justify-center mb-0.5">
                            <Bed className="h-3 w-3 text-gray-600 mr-0.5" />
                            <span className="text-sm font-semibold">{property.totalBeds || 0}</span>
                          </div>
                          <div className="text-xs text-gray-600">Beds</div>
                        </div>
                        <div className="text-center p-2 bg-gray-50 rounded">
                          <div className="flex items-center justify-center mb-0.5">
                            <Users className="h-3 w-3 text-gray-600 mr-0.5" />
                            <span className="text-sm font-semibold">{property.totalRooms || 0}</span>
                          </div>
                          <div className="text-xs text-gray-600">Rooms</div>
                        </div>
                      </div>

                      {/* Bed Status */}
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="text-center">
                          <div className="text-xs font-semibold text-red-600">{property.occupiedBeds || 0}</div>
                          <div className="text-xs text-gray-600">Occupied</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs font-semibold text-green-600">{property.availableBeds || 0}</div>
                          <div className="text-xs text-gray-600">Available</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <PGFormDialog
        open={!!editingVendorProperty}
        onClose={() => setEditingVendorProperty(null)}
        onSubmit={handleEditVendorProperty}
        initialData={editingVendorProperty}
        mode="edit"
      />

      <AlertDialog open={!!deletingVendorProperty} onOpenChange={() => setDeletingVendorProperty(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Vendor Property</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingVendorProperty?.name}"? This action cannot be undone.
              {deletingVendorProperty?.occupiedBeds > 0 && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700">
                  Warning: This property has {deletingVendorProperty.occupiedBeds} occupied beds. Please ensure all
                  students are relocated before deletion.
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteVendorProperty} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
