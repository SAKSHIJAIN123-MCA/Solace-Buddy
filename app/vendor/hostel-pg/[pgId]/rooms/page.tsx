"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Plus, Search, Edit, Bed, ChevronDown, ChevronRight, ArrowLeft, Trash2, Settings } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"
import { RoomFormDialog } from "@/components/vendor/room-form-dialog"
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

export default function RoomsPage() {
  const { toast } = useToast()
  const router = useRouter()
  const params = useParams()
  const pgId = params.pgId as string

  const [pgData, setPgData] = useState<any>(null)
  const [rooms, setRooms] = useState([])
  const [filteredRooms, setFilteredRooms] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingRoom, setEditingRoom] = useState(null)
  const [deletingRoom, setDeletingRoom] = useState(null)
  const [expandedRooms, setExpandedRooms] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  // Bed management states
  const [selectedBed, setSelectedBed] = useState(null)
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [showBedDialog, setShowBedDialog] = useState(false)

  useEffect(() => {
    fetchRooms()
  }, [pgId])

  useEffect(() => {
    const filtered = rooms.filter(
      (room: any) =>
        room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredRooms(filtered)
  }, [searchTerm, rooms])

  const fetchRooms = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/vendor-properties/${pgId}/rooms`)
      const data = await response.json()

      if (data.success) {
        setPgData(data.data.property)
        setRooms(data.data.rooms)
        setFilteredRooms(data.data.rooms)
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to fetch rooms",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch rooms",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleAddRoom = async (roomData: any) => {
    try {
      const response = await fetch(`/api/vendor-properties/${pgId}/rooms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(roomData),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Room added successfully",
        })
        setShowAddDialog(false)
        fetchRooms()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to add room",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add room",
        variant: "destructive",
      })
    }
  }

  const handleEditRoom = async (roomData: any) => {
    try {
      const response = await fetch(`/api/vendor-properties/${pgId}/rooms/${editingRoom._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(roomData),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Room updated successfully",
        })
        setEditingRoom(null)
        fetchRooms()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update room",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update room",
        variant: "destructive",
      })
    }
  }

  const handleDeleteRoom = async () => {
    if (!deletingRoom) return

    try {
      const response = await fetch(`/api/vendor-properties/${pgId}/rooms/${deletingRoom._id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Room deleted successfully",
        })
        setDeletingRoom(null)
        fetchRooms()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to delete room",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete room",
        variant: "destructive",
      })
    }
  }

  const handleBedClick = (bed: any, room: any, bedIndex: number) => {
    console.log("Bed clicked:", bed, "Room:", room._id, "Index:", bedIndex)
    setSelectedBed({ ...bed, bedNumber: bedIndex + 1 })
    setSelectedRoom(room)
    setShowBedDialog(true)
  }

  const handleBedUpdate = async (bedData: any) => {
    try {
      console.log("Updating bed with data:", bedData)
      console.log("API URL:", `/api/vendor-properties/${pgId}/rooms/${selectedRoom._id}/beds/${selectedBed._id}`)

      const response = await fetch(`/api/vendor-properties/${pgId}/rooms/${selectedRoom._id}/beds/${selectedBed._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bedData),
      })

      const data = await response.json()
      console.log("API Response:", data)

      if (data.success) {
        toast({
          title: "Success",
          description: "Bed status updated successfully",
        })
        setShowBedDialog(false)
        setSelectedBed(null)
        setSelectedRoom(null)
        // Refresh the rooms data to show updated bed status
        await fetchRooms()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update bed",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating bed:", error)
      toast({
        title: "Error",
        description: "Failed to update bed",
        variant: "destructive",
      })
    }
  }

  const toggleRoomExpansion = (roomId: string) => {
    setExpandedRooms((prev) => (prev.includes(roomId) ? prev.filter((id) => id !== roomId) : [...prev, roomId]))
  }

  const getBedStatusColor = (status: string) => {
    switch (status) {
      case "occupied":
        return "text-red-500 hover:text-red-600"
      case "available":
        return "text-green-700 hover:text-green-800"
      case "onbook":
        return "text-blue-500 hover:text-blue-600"
      case "notice":
        return "text-yellow-500 hover:text-yellow-600"
      case "maintenance":
        return "text-gray-500 hover:text-gray-600"
      default:
        return "text-gray-300 hover:text-gray-400"
    }
  }

  const getBedStatusText = (status: string) => {
    switch (status) {
      case "occupied":
        return "Occupied"
      case "available":
        return "Available"
      case "onbook":
        return "On Book"
      case "notice":
        return "On Notice"
      case "maintenance":
        return "Maintenance"
      default:
        return "Unknown"
    }
  }

  const getQuickStats = () => {
    const stats = {
      totalBeds: 0,
      occupiedBeds: 0,
      availableBeds: 0,
      onBookBeds: 0,
      onNoticeBeds: 0,
      maintenanceBeds: 0,
      totalRevenue: 0,
    }

    rooms.forEach((room: any) => {
      stats.totalBeds += room.totalBeds
      stats.occupiedBeds += room.occupiedBeds
      stats.availableBeds += room.availableBeds
      stats.onBookBeds += room.onBookBeds
      stats.onNoticeBeds += room.onNoticeBeds

      // Calculate maintenance beds
      const maintenanceBeds = room.beds?.filter((bed: any) => bed.status === "maintenance").length || 0
      stats.maintenanceBeds += maintenanceBeds

      // Calculate revenue from occupied and notice beds
      stats.totalRevenue += (room.occupiedBeds + room.onNoticeBeds) * room.rent
    })

    return stats
  }

  const stats = getQuickStats()

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading rooms...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Breadcrumb */}
      <div className="flex items-center mb-6">
        <Link href="/vendor/hostel-pg" className="flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to PG List
        </Link>
        <span className="mx-2 text-gray-400">/</span>
        <span className="text-gray-600">{pgData?.name} - Rooms</span>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
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
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.onBookBeds}</div>
            <div className="text-sm text-gray-600">On Book</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.onNoticeBeds}</div>
            <div className="text-sm text-gray-600">On Notice</div>
          </CardContent>
        </Card>
      
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{pgData?.name} - Room Management</h2>

        <div className="flex items-center space-x-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search rooms..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-10 w-64"
            />
          </div>

          {/* Add Room Button */}
          <Button onClick={() => setShowAddDialog(true)} className="bg-black text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add Room
          </Button>
        </div>
      </div>

      {/* Rooms Listing */}
      <div className="space-y-4">
        {filteredRooms.map((room: any) => (
          <Card key={room._id} className="border border-gray-200">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Bed className="h-6 w-6 text-green-600" />
                    </div>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {room.roomNumber} | {room.name}
                    </h3>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-3">
                      <div className="text-sm">
                        <span className="text-gray-500">Total:</span>
                        <span className="font-medium ml-1">{room.totalBeds}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-500">Occupied:</span>
                        <span className="font-medium ml-1 text-red-600">{room.occupiedBeds}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-500">Available:</span>
                        <span className="font-medium ml-1 text-green-600">{room.availableBeds}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-500">On Book:</span>
                        <span className="font-medium ml-1 text-blue-600">{room.onBookBeds}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-500">Revenue:</span>
                        <span className="font-medium ml-1">
                          ₹{((room.occupiedBeds + room.onNoticeBeds) * room.rent).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 mt-2">
                      <div className="text-sm">
                        <span className="text-gray-500">Rent:</span>
                        <span className="font-medium ml-1">₹{room.rent}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-500">Type:</span>
                        <span className="font-medium ml-1">
                          {room.displayName || `${room.noOfSharing}-Sharing-${room.acType}`}
                        </span>
                      </div>
                      {room.onNoticeBeds > 0 && (
                        <div className="text-sm">
                          <span className="text-gray-500">On Notice:</span>
                          <span className="font-medium ml-1 text-yellow-600">{room.onNoticeBeds}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Edit Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingRoom(room)}
                    className="text-blue-600 border-blue-600 hover:bg-blue-50"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>

                  {/* Delete Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeletingRoom(room)}
                    className="text-red-600 border-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>

                  {/* Expand/Collapse Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleRoomExpansion(room._id)}
                    className="text-gray-600 border-gray-300"
                  >
                    {expandedRooms.includes(room._id) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Bed Details - Collapsible */}
              <Collapsible open={expandedRooms.includes(room._id)}>
                <CollapsibleContent>
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-medium text-gray-900">Bed Management:</h5>
                      <div className="text-sm text-gray-600">Click on any bed to update its status</div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {room.beds &&
                        room.beds.map((bed: any, index: number) => (
                          <div
                            key={bed._id}
                            className="flex items-center p-3 bg-white border rounded-lg cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => handleBedClick(bed, room, index)}
                          >
                            <Bed
                              className={`w-6 h-6 mr-3 ${getBedStatusColor(bed.status)} cursor-pointer`}
                              title={getBedStatusText(bed.status)}
                            />
                            <div className="flex-1">
                              <div className="text-sm font-medium">Bed {index + 1}</div>
                              <div className="text-xs text-gray-500">{getBedStatusText(bed.status)}</div>
                              {bed.studentName && (
                                <div className="text-xs text-blue-600 mt-1 truncate">{bed.studentName}</div>
                              )}
                              {bed.status === "occupied" && bed.rentDueDate && (
                                <div className="text-xs text-red-500 mt-1">
                                  Due: {new Date(bed.rentDueDate).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                            <Settings className="w-4 h-4 text-gray-400" />
                          </div>
                        ))}
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRooms.length === 0 && !loading && (
        <div className="text-center py-12">
          <Bed className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No rooms found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm ? "No rooms match your search criteria." : "Get started by adding your first room."}
          </p>
          <Button onClick={() => setShowAddDialog(true)} className="bg-black text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add Room
          </Button>
        </div>
      )}

      {/* Add/Edit Room Dialog */}
      <RoomFormDialog
        open={showAddDialog || !!editingRoom}
        onClose={() => {
          setShowAddDialog(false)
          setEditingRoom(null)
        }}
        onSubmit={editingRoom ? handleEditRoom : handleAddRoom}
        initialData={editingRoom}
        mode={editingRoom ? "edit" : "add"}
        pgId={pgId}
      />

      {/* Bed Management Dialog */}
      {selectedBed && selectedRoom && (
        <BedManagementDialog
          open={showBedDialog}
          onClose={() => {
            setShowBedDialog(false)
            setSelectedBed(null)
            setSelectedRoom(null)
          }}
          onSubmit={handleBedUpdate}
          bed={selectedBed}
          roomRent={selectedRoom.rent}
          bedNumber={selectedBed.bedNumber}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingRoom} onOpenChange={() => setDeletingRoom(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Room</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingRoom?.name}"? This action cannot be undone.
              {deletingRoom?.occupiedBeds > 0 && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700">
                  Warning: This room has {deletingRoom.occupiedBeds} occupied beds. Please ensure all students are
                  relocated before deletion.
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRoom} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
