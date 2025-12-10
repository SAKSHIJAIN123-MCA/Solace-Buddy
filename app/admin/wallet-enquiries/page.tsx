"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Eye, Clock, CheckCircle, XCircle } from "lucide-react"

type StudentLite = {
  _id: string
  name: string
  email?: string
  phone?: string
  college?: string
  course?: string
  year?: string
}

type WalletRequest = {
  _id: string
  student: StudentLite
  amount: number
  paymentMethod: "upi" | "bank_transfer"
  status: "pending" | "approved" | "rejected"
  note?: string
  adminNote?: string
  createdAt: string
}

export default function AdminWalletEnquiriesPage() {
  const { toast } = useToast()
  const [requests, setRequests] = useState<WalletRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<WalletRequest | null>(null)
  const [responseForm, setResponseForm] = useState({
    status: "",
    adminNote: "",
  })

  useEffect(() => {
    fetchRequests()
  }, [])

  async function fetchRequests() {
    try {
      setLoading(true)
      const res = await fetch("/api/wallet-requests")
      const json = await res.json()
      if (json.success) {
        setRequests(json.data)
      } else {
        toast({ title: "Error", description: json.error || "Failed to fetch requests", variant: "destructive" })
      }
    } catch (e) {
      toast({ title: "Error", description: "Failed to fetch requests", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  async function updateRequestStatus() {
    if (!selectedRequest || !responseForm.status) {
      toast({ title: "Validation", description: "Please select a status", variant: "destructive" })
      return
    }

    try {
      const res = await fetch(`/api/wallet-requests/${selectedRequest._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: responseForm.status,
          adminNote: responseForm.adminNote,
        }),
      })

      const json = await res.json()
      if (json.success) {
        toast({ title: "Success", description: "Request updated successfully" })
        setSelectedRequest(null)
        setResponseForm({ status: "", adminNote: "" })
        fetchRequests()
      } else {
        toast({ title: "Error", description: json.error || "Failed to update request", variant: "destructive" })
      }
    } catch (e) {
      toast({ title: "Error", description: "Failed to update request", variant: "destructive" })
    }
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "approved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Wallet Enquiries</h1>
          <p className="text-muted-foreground">Manage student wallet requests</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Wallet Requests</CardTitle>
          <CardDescription>Review and respond to student wallet requests</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading requests...</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request._id}>
                      <TableCell>
                        <div className="font-medium">{request.student?.name || "-"}</div>
                        <div className="text-xs text-muted-foreground">{request.student?.email}</div>
                      </TableCell>
                      <TableCell className="font-medium">₹{request.amount.toLocaleString()}</TableCell>
                      <TableCell>{request.paymentMethod === "upi" ? "UPI" : "Bank Transfer"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(request.status)}
                          <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{new Date(request.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedRequest(request)
                            setResponseForm({
                              status: request.status,
                              adminNote: request.adminNote || "",
                            })
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {requests.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                        No wallet requests yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={!!selectedRequest}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedRequest(null)
            setResponseForm({ status: "", adminNote: "" })
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Wallet Request Details</DialogTitle>
            <DialogDescription>Review and respond to this wallet request</DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <Label className="text-sm font-medium">Student</Label>
                  <div className="text-sm">{selectedRequest.student?.name}</div>
                  <div className="text-xs text-muted-foreground">{selectedRequest.student?.email}</div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Amount</Label>
                  <div className="text-lg font-semibold">₹{selectedRequest.amount.toLocaleString()}</div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Payment Method</Label>
                  <div className="text-sm">{selectedRequest.paymentMethod === "upi" ? "UPI" : "Bank Transfer"}</div>
                </div>

                {selectedRequest.note && (
                  <div>
                    <Label className="text-sm font-medium">Student Note</Label>
                    <div className="text-sm bg-gray-50 p-2 rounded">{selectedRequest.note}</div>
                  </div>
                )}

                <div>
                  <Label className="text-sm font-medium">Current Status</Label>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusIcon(selectedRequest.status)}
                    <Badge className={getStatusColor(selectedRequest.status)}>{selectedRequest.status}</Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-4 border-t pt-4">
                <div className="space-y-2">
                  <Label>Update Status</Label>
                  <Select
                    value={responseForm.status}
                    onValueChange={(v) => setResponseForm((f) => ({ ...f, status: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Admin Note</Label>
                  <Textarea
                    value={responseForm.adminNote}
                    onChange={(e) => setResponseForm((f) => ({ ...f, adminNote: e.target.value }))}
                    placeholder="Add a note for the student..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedRequest(null)
                    setResponseForm({ status: "", adminNote: "" })
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={updateRequestStatus}>Update Request</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
