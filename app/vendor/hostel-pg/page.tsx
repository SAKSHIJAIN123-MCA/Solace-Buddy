"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Building2, Plus, Edit, Search, Users, Bed, Trash2, RefreshCw, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { PGFormDialog } from "@/components/vendor/pg-form-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { BedManagementDialog } from "@/components/vendor/bed-management-dialog"

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

export default function HostelPGPage() {
  const { toast } = useToast()
  const [properties, setProperties] = useState<any[]>([])
  const [filteredProperties, setFilteredProperties] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingProperty, setEditingProperty] = useState<any | null>(null)
  const [deletingProperty, setDeletingProperty] = useState<any | null>(null)

  type AvailableItem = {
    propertyId: string
    propertyName: string
    roomId: string
    roomNumber: string
    roomRent: number
    bedId: string
    bedIndex: number
    bedStatus: string
  }

  const [showAvailableDialog, setShowAvailableDialog] = useState(false)
  const [availableLoading, setAvailableLoading] = useState(false)
  const [availableItems, setAvailableItems] = useState<AvailableItem[]>([])

  const [selectedBed, setSelectedBed] = useState<any | null>(null)
  const [selectedRoom, setSelectedRoom] = useState<any | null>(null)
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null)
  const [showBedDialog, setShowBedDialog] = useState(false)

  useEffect(() => {
    fetchProperties()
  }, [])

  useEffect(() => {
    const filtered = properties.filter(
      (property: any) =>
        property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.propertyId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.city.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredProperties(filtered)
  }, [searchTerm, properties])

  const fetchProperties = async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) setRefreshing(true)
      else setLoading(true)

      const response = await fetch("/api/vendor-properties", {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      })
      const data = await response.json()
      if (data.success) {
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

  const handleRefresh = () => fetchProperties(true)
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)

  const handleAddProperty = async (propertyData: any) => {
    try {
      const response = await fetch("/api/vendor-properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(propertyData),
      })
      const data = await response.json()
      if (data.success) {
        toast({ title: "Success", description: "Property added successfully" })
        setShowAddDialog(false)
        fetchProperties()
      } else {
        toast({ title: "Error", description: data.error || "Failed to add property", variant: "destructive" })
      }
    } catch {
      toast({ title: "Error", description: "Failed to add property", variant: "destructive" })
    }
  }

  const handleEditProperty = async (propertyData: any) => {
    if (!editingProperty?._id) return
    try {
      const response = await fetch(`/api/vendor-properties/${editingProperty._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(propertyData),
      })
      const data = await response.json()
      if (data.success) {
        toast({ title: "Success", description: "Property updated successfully" })
        setEditingProperty(null)
        fetchProperties()
      } else {
        toast({ title: "Error", description: data.error || "Failed to update property", variant: "destructive" })
      }
    } catch {
      toast({ title: "Error", description: "Failed to update property", variant: "destructive" })
    }
  }

  const handleDeleteProperty = async () => {
    if (!deletingProperty) return
    try {
      const response = await fetch(`/api/vendor-properties/${deletingProperty._id}`, { method: "DELETE" })
      const data = await response.json()
      if (data.success) {
        toast({ title: "Success", description: "Property deleted successfully" })
        setDeletingProperty(null)
        fetchProperties()
      } else {
        toast({ title: "Error", description: data.error || "Failed to delete property", variant: "destructive" })
      }
    } catch {
      toast({ title: "Error", description: "Failed to delete property", variant: "destructive" })
    }
  }

  const stats = properties.reduce(
    (acc, p: any) => {
      acc.totalRooms += p.totalRooms || 0
      acc.totalBeds += p.totalBeds || 0
      acc.occupiedBeds += p.occupiedBeds || 0
      acc.availableBeds += p.availableBeds || 0
      acc.onBookBeds += p.bedsOnBook || 0
      acc.totalRevenue += p.monthlyRevenue || 0
      return acc
    },
    {
      totalProperties: properties.length,
      totalRooms: 0,
      totalBeds: 0,
      occupiedBeds: 0,
      availableBeds: 0,
      onBookBeds: 0,
      totalRevenue: 0,
    },
  )

  const loadAvailableBeds = async () => {
    setAvailableLoading(true)
    try {
      const all: AvailableItem[] = []

      // fetch rooms per property to get bed-level info
      await Promise.all(
        properties.map(async (prop: any) => {
          try {
            const res = await fetch(`/api/vendor-properties/${prop._id}/rooms`, { cache: "no-store" })
            const data = await res.json()
            if (!data?.success) return

            const rooms = data.data?.rooms || []
            rooms.forEach((room: any) => {
              room.beds?.forEach((bed: any, idx: number) => {
                if (bed.status === "available") {
                  all.push({
                    propertyId: prop._id,
                    propertyName: prop.pgNickName || prop.name,
                    roomId: room._id,
                    roomNumber: room.roomNumber || room.name || room.displayName || "",
                    roomRent: room.rent,
                    bedId: bed._id,
                    bedIndex: idx, // zero-based for display + 1
                    bedStatus: bed.status,
                  })
                }
              })
            })
          } catch {}
        }),
      )

      setAvailableItems(all)
    } finally {
      setAvailableLoading(false)
    }
  }

  const openAvailableDialog = async () => {
    setShowAvailableDialog(true)
    await loadAvailableBeds()
  }

  const handleOpenBedManage = (item: AvailableItem) => {
    setSelectedPropertyId(item.propertyId)
    setSelectedRoom({
      _id: item.roomId,
      rent: item.roomRent,
    })
    setSelectedBed({
      _id: item.bedId,
      status: item.bedStatus,
      bedNumber: item.bedIndex + 1,
    })
    setShowBedDialog(true)
  }

  const handleBedUpdate = async (bedData: any) => {
    if (!selectedPropertyId || !selectedRoom?._id || !selectedBed?._id) return
    try {
      const url = `/api/vendor-properties/${selectedPropertyId}/rooms/${selectedRoom._id}/beds/${selectedBed._id}`
      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bedData),
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: "Success", description: "Bed status updated successfully" })
        setShowBedDialog(false)
        setSelectedBed(null)
        setSelectedRoom(null)
        setSelectedPropertyId(null)
        // refresh available list and stats since counts changed
        await loadAvailableBeds()
        await fetchProperties()
      } else {
        toast({ title: "Error", description: data.error || "Failed to update bed", variant: "destructive" })
      }
    } catch (e) {
      toast({ title: "Error", description: "Failed to update bed", variant: "destructive" })
    }
  }

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
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
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

        <Card className="cursor-pointer" onClick={openAvailableDialog}>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.availableBeds}</div>
            <div className="text-sm text-gray-600">Available</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Hostel & PG Management</h2>
        <div className="flex items-center gap-4">
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
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search properties..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-10 w-64"
            />
          </div>
          <Button onClick={() => setShowAddDialog(true)} className="bg-black text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add Property
          </Button>
        </div>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProperties.map((property: any) => (
          <Card key={property._id} className="border border-gray-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-start gap-3">
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
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {property.pgNickName || property.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {property.propertyId} • {property.type}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {property.city}, {property.state}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
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
              <div className="grid grid-cols-2 gap-4 mb-4">
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

              <Link href={`/vendor/hostel-pg/${property._id}/rooms`}>
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

      <Dialog open={showAvailableDialog} onOpenChange={setShowAvailableDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Available Beds ({availableItems.length})</DialogTitle>
          </DialogHeader>

          {availableLoading ? (
            <div className="py-8 text-center text-gray-600">Loading available beds...</div>
          ) : availableItems.length === 0 ? (
            <div className="py-8 text-center text-gray-600">No available beds found.</div>
          ) : (
            <div className="space-y-2">
              <div className="grid grid-cols-4 gap-2 text-xs text-gray-500 px-2">
                <div>Property Name</div>
                <div>Room No.</div>
                <div>Bed No.</div>
                <div className="text-right pr-2">Actions</div>
              </div>
              <div className="max-h-[420px] overflow-y-auto border rounded-md">
                {availableItems.map((item) => (
                  <div
                    key={`${item.propertyId}-${item.roomId}-${item.bedId}`}
                    className="grid grid-cols-4 gap-2 items-center px-3 py-2 border-b last:border-b-0 bg-white"
                  >
                    <div className="truncate text-sm">{item.propertyName}</div>
                    <div className="text-sm">{item.roomNumber || "-"}</div>
                    <div className="text-sm">Bed {item.bedIndex + 1}</div>
                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-gray-700 border-gray-300 bg-transparent"
                        onClick={() => handleOpenBedManage(item)}
                        title="Manage bed"
                      >
                        <Settings className="h-4 w-4 mr-1" />
                        Manage
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {selectedBed && selectedRoom && (
        <BedManagementDialog
          open={showBedDialog}
          onClose={() => {
            setShowBedDialog(false)
            setSelectedBed(null)
            setSelectedRoom(null)
            setSelectedPropertyId(null)
          }}
          onSubmit={handleBedUpdate}
          bed={selectedBed}
          roomRent={selectedRoom.rent}
          bedNumber={selectedBed.bedNumber}
        />
      )}
    </div>
  )
}
