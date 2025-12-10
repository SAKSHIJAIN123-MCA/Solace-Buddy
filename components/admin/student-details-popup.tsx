"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Phone, MapPin, Calendar, GraduationCap, Users } from "lucide-react"
import { useState, useEffect } from "react"

interface StudentDetailsPopupProps {
  open: boolean
  onClose: () => void
  student: {
    studentName: string
    studentEmail: string
    studentPhone: string
    studentAddress?: string
    status: string
    checkInDate?: string
    checkOutDate?: string
  }
  bedNumber: number
  roomName: string
}

export function StudentDetailsPopup({ open, onClose, student, bedNumber, roomName }: StudentDetailsPopupProps) {
  const [fullStudentData, setFullStudentData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  console.log("[v0] Student Details Popup - Received student data:", student)

  useEffect(() => {
    const fetchStudentDetails = async () => {
      if (!open || !student.studentEmail) return

      try {
        setLoading(true)
        const response = await fetch(`/api/students?limit=1000&status=active`)
        const result = await response.json()

        if (result.success && result.data && result.data.length > 0) {
          // Find student by email from the fetched list
          const foundStudent = result.data.find((s: any) => s.email === student.studentEmail)
          if (foundStudent) {
            setFullStudentData(foundStudent)
            console.log("[v0] Fetched complete student data:", foundStudent)
          } else {
            console.log("[v0] Student not found in active students list")
            setFullStudentData(null)
          }
        } else {
          console.log("[v0] No students data found")
          setFullStudentData(null)
        }
      } catch (error) {
        console.error("[v0] Error fetching student details:", error)
        setFullStudentData(null)
      } finally {
        setLoading(false)
      }
    }

    fetchStudentDetails()
  }, [open, student.studentEmail])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "occupied":
        return "bg-red-100 text-red-800 border-red-200"
      case "onbook":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "notice":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "occupied":
        return "Occupied"
      case "onbook":
        return "On Book"
      case "notice":
        return "On Notice"
      default:
        return status
    }
  }

  const displayData = fullStudentData || student

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Student Details</span>
            <Badge className={getStatusColor(student.status)}>{getStatusText(student.status)}</Badge>
          </DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
          </div>
        )}

        <div className="space-y-4">
          {/* Bed and Room Info */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">
              <strong>Location:</strong> {roomName} - Bed {bedNumber}
            </div>
          </div>

          {/* Student Information */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Name</div>
                <div className="font-medium">{displayData.name || displayData.studentName || "Not provided"}</div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Email</div>
                <div className="font-medium">{displayData.email || displayData.studentEmail || "Not provided"}</div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <Phone className="h-5 w-5 text-gray-400" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Phone Number</div>
                <div className="font-medium">{displayData.phone || displayData.studentPhone || "Not provided"}</div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Address</div>
                <div className="font-medium">{displayData.address || displayData.studentAddress || "Not provided"}</div>
              </div>
            </div>

            {fullStudentData && (
              <>
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <GraduationCap className="h-5 w-5 text-gray-400" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">College</div>
                    <div className="font-medium">{fullStudentData.college || "Not provided"}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <GraduationCap className="h-5 w-5 text-gray-400" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Course & Year</div>
                    <div className="font-medium">
                      {fullStudentData.course || "Not provided"} - {fullStudentData.year || "Not provided"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <Users className="h-5 w-5 text-gray-400" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Parent Contact</div>
                    <div className="font-medium">{fullStudentData.parentContact || "Not provided"}</div>
                  </div>
                </div>
              </>
            )}

            {/* Date Information */}
            {student.status === "onbook" && student.checkInDate && (
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Check-in Date</div>
                  <div className="font-medium">{new Date(student.checkInDate).toLocaleDateString()}</div>
                </div>
              </div>
            )}

            {student.status === "notice" && student.checkOutDate && (
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Check-out Date</div>
                  <div className="font-medium">{new Date(student.checkOutDate).toLocaleDateString()}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
