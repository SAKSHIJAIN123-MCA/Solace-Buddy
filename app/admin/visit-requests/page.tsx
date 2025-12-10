"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Eye, Calendar, Clock, Phone, Mail, MapPin } from "lucide-react"
import { format } from "date-fns"

interface VisitRequest {
  _id: string
  propertyId: {
    _id: string
    name: string
    address: string
    city: string
    contactNumber?: string
    email?: string
  }
  propertyName: string
  fullName: string
  mobile: string
  email: string
  visitDate: string
  visitTime: string
  status: string
  notes?: string
  createdAt: string
}

export default function AdminVisitRequestsPage() {
  const [requests, setRequests] = useState<VisitRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedRequest, setSelectedRequest] = useState<VisitRequest | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/visit-requests?page=${page}&status=${statusFilter}`)
      const result = await response.json()

      if (result.success) {
        setRequests(result.data)
        setTotalPages(result.pagination.pages)
      }
    } catch (error) {
      console.error("Error fetching visit requests:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [page, statusFilter])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "confirmed":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/visit-requests/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        fetchRequests()
      }
    } catch (error) {
      console.error("Error updating status:", error)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#2e057f] mb-2">Visit Requests</h1>
        <p className="text-muted-foreground">Manage property visit requests from potential tenants</p>
      </div>

      <div className="mb-6">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Requests</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <Card key={request._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="font-semibold text-lg">{request.fullName}</h3>
                      <Badge className={getStatusColor(request.status)}>{request.status.toUpperCase()}</Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{request.propertyName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          <span>{request.mobile}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          <span>{request.email}</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{format(new Date(request.visitDate), "PPP")}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{request.visitTime}</span>
                        </div>
                        <div className="text-xs">Requested: {format(new Date(request.createdAt), "PPp")}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Select value={request.status} onValueChange={(value) => updateStatus(request._id, value)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setSelectedRequest(request)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Visit Request Details</DialogTitle>
                        </DialogHeader>
                        {selectedRequest && (
                          <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-semibold mb-2">Visitor Information</h4>
                                <div className="space-y-2 text-sm">
                                  <div>
                                    <strong>Name:</strong> {selectedRequest.fullName}
                                  </div>
                                  <div>
                                    <strong>Mobile:</strong> {selectedRequest.mobile}
                                  </div>
                                  <div>
                                    <strong>Email:</strong> {selectedRequest.email}
                                  </div>
                                </div>
                              </div>

                              <div>
                                <h4 className="font-semibold mb-2">Visit Details</h4>
                                <div className="space-y-2 text-sm">
                                  <div>
                                    <strong>Date:</strong> {format(new Date(selectedRequest.visitDate), "PPP")}
                                  </div>
                                  <div>
                                    <strong>Time:</strong> {selectedRequest.visitTime}
                                  </div>
                                  <div>
                                    <strong>Status:</strong>
                                    <Badge className={`ml-2 ${getStatusColor(selectedRequest.status)}`}>
                                      {selectedRequest.status.toUpperCase()}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-semibold mb-2">Property Information</h4>
                              <div className="space-y-2 text-sm">
                                <div>
                                  <strong>Property:</strong> {selectedRequest.propertyName}
                                </div>
                                <div>
                                  <strong>Address:</strong> {selectedRequest.propertyId?.address}
                                </div>
                                <div>
                                  <strong>City:</strong> {selectedRequest.propertyId?.city}
                                </div>
                                {selectedRequest.propertyId?.contactNumber && (
                                  <div>
                                    <strong>Contact:</strong> {selectedRequest.propertyId.contactNumber}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div>
                              <div>
                                <strong>Requested On:</strong> {format(new Date(selectedRequest.createdAt), "PPpp")}
                              </div>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {requests.length === 0 && (
            <div className="text-center py-12">
              <div className="text-lg font-medium mb-2">No visit requests found</div>
              <p className="text-sm text-muted-foreground">
                {statusFilter === "all"
                  ? "No visit requests have been submitted yet."
                  : `No ${statusFilter} visit requests found.`}
              </p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <Button variant="outline" onClick={() => setPage(page - 1)} disabled={page === 1}>
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button variant="outline" onClick={() => setPage(page + 1)} disabled={page === totalPages}>
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
