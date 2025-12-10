"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer"
import { ArrowLeft, ArrowRight, X } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { BedBookingForm } from "./bed-booking-form"

interface Room {
  _id: string
  roomNumber: string
  name: string
  roomType: string
  totalBeds: number
  rent: number
  beds: Array<{
    _id: string
    bedNumber: string
    status: "available" | "occupied" | "onbook" | "notice" | "maintenance"
  }>
  availableBeds: number
}

interface RoomBookingDrawerProps {
  open: boolean
  onClose: () => void
  propertyId: string
  propertyName: string
}

export function RoomBookingDrawer({ open, onClose, propertyId, propertyName }: RoomBookingDrawerProps) {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [selectedBed, setSelectedBed] = useState<{ _id: string; bedNumber: string } | null>(null)
  const [showBookingForm, setShowBookingForm] = useState(false)

  const fetchRooms = async () => {
    if (!propertyId) return

    try {
      setLoading(true)
      const response = await fetch(`/api/admin/vendor-properties/${propertyId}/rooms`)
      const result = await response.json()

      if (result.success) {
        setRooms(result.data.rooms || [])
      }
    } catch (error) {
      console.error("Failed to fetch rooms:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open && propertyId) {
      fetchRooms()
    }
  }, [open, propertyId])

  const formatINR = (amount: number) => {
    return amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })
  }

  const handleRoomClick = (room: Room) => {
    if (room.availableBeds > 0) {
      setSelectedRoom(room)
    }
  }

  const handleBedBooking = (bedId: string, bedNumber: string) => {
    setSelectedBed({ _id: bedId, bedNumber })
    setShowBookingForm(true)
  }

  const handleBackToRooms = () => {
    setSelectedRoom(null)
  }

  const handleBackToBeds = () => {
    setShowBookingForm(false)
    setSelectedBed(null)
  }

  const handleCloseBookingForm = () => {
    setShowBookingForm(false)
    setSelectedBed(null)
    setSelectedRoom(null)
    onClose()
  }

  if (showBookingForm && selectedRoom && selectedBed) {
    return (
      <BedBookingForm
        open={showBookingForm}
        onClose={handleCloseBookingForm}
        onBack={handleBackToBeds}
        propertyId={propertyId}
        propertyName={propertyName}
        roomId={selectedRoom._id}
        roomName={selectedRoom.name}
        bedId={selectedBed._id}
        bedNumber={selectedBed.bedNumber}
        rent={selectedRoom.rent}
      />
    )
  }

  if (selectedRoom) {
    return (
      <Drawer open={open} onOpenChange={onClose} direction="right">
        <DrawerContent className="h-full w-96 bg-white/95 backdrop-blur-sm border-l shadow-xl ml-auto">
          <DrawerHeader className="flex items-center justify-between border-b pb-4 bg-transparent">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={handleBackToRooms}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <DrawerTitle className="text-lg font-semibold text-gray-900">
                  {selectedRoom.name} - Bed Selection
                </DrawerTitle>
                <p className="text-sm text-gray-600">
                  {selectedRoom.roomType} • ₹{formatINR(selectedRoom.rent)}/month
                </p>
              </div>
            </div>
            <DrawerClose asChild>
              <Button variant="ghost" size="sm">
                <X className="w-4 h-4" />
              </Button>
            </DrawerClose>
          </DrawerHeader>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-3">
              {selectedRoom.beds.map((bed, index) => (
                <div
                  key={bed._id}
                  className={`p-4 rounded-lg border ${
                    bed.status === "available"
                      ? "bg-green-50 border-green-200 cursor-pointer hover:bg-green-100"
                      : "bg-gray-50 border-gray-200 cursor-not-allowed opacity-60"
                  }`}
                  onClick={() => bed.status === "available" && handleBedBooking(bed._id, bed.bedNumber)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-gray-900">Bed {index + 1}</h4>
                      <p className="text-sm text-gray-600 capitalize">
                        Status: {bed.status === "available" ? "Available" : bed.status}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#2e057f]">₹{formatINR(selectedRoom.rent)}</p>
                      <p className="text-xs text-gray-500">per month</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="p-4 border-t">
            <Button className="w-full bg-gray-400 text-white cursor-not-allowed" disabled>
              NEXT
            </Button>
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Drawer open={open} onOpenChange={onClose} direction="right">
      <DrawerContent className="h-full w-96 bg-white/95 backdrop-blur-sm border-l shadow-xl ml-auto">
        <DrawerHeader className="flex items-center justify-between border-b pb-4 bg-transparent">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onClose}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <DrawerTitle className="text-lg font-semibold text-gray-900">Book your stay</DrawerTitle>
          </div>
          <DrawerClose asChild>
            <Button variant="ghost" size="sm">
              <X className="w-4 h-4" />
            </Button>
          </DrawerClose>
        </DrawerHeader>

        <ScrollArea className="flex-1 p-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <p className="text-gray-500">Loading rooms...</p>
            </div>
          ) : rooms.length === 0 ? (
            <div className="flex justify-center py-8">
              <p className="text-gray-500">No rooms available</p>
            </div>
          ) : (
            <div className="space-y-3">
              {rooms.map((room, index) => (
                <div
                  key={room._id}
                  className={`p-4 rounded-lg border ${
                    room.availableBeds > 0
                      ? "bg-white border-gray-200 cursor-pointer hover:bg-gray-50"
                      : "bg-gray-50 border-gray-200 cursor-not-allowed opacity-60"
                  }`}
                  onClick={() => handleRoomClick(room)}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">₹{formatINR(room.rent)}</h3>
                        <span className="text-sm text-gray-600">Room {index + 1}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                        <span>{room.roomType}</span>
                        {room.availableBeds > 0 && (
                          <>
                            <span>•</span>
                            <span>{room.availableBeds} bed(s) available</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="ml-4">
                      {room.availableBeds > 0 ? (
                        <div className="w-8 h-8 rounded-full bg-[#2e057f] flex items-center justify-center">
                          <ArrowRight className="w-4 h-4 text-white" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-xs text-gray-600 font-medium">NA</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="p-4 border-t">
          <Button className="w-full bg-gray-400 text-white cursor-not-allowed" disabled>
            NEXT
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
