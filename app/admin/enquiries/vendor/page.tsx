"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Eye, MessageSquare, Trash2, Calendar, Download } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EnquiryResponseDialog } from "@/components/enquiry-response-dialog"
import { useToast } from "@/hooks/use-toast"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

export default function VendorEnquiryPage() {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [enquiries, setEnquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedEnquiry, setSelectedEnquiry] = useState<any>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isResponseDialogOpen, setIsResponseDialogOpen] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState({ open: false, enquiry: null as any })
  const [statistics, setStatistics] = useState({
    total: 0,
    pending: 0,
    responded: 0,
    closed: 0,
    spam: 0,
    high: 0,
    medium: 0,
    low: 0
  })

  const fetchEnquiries = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        search: searchTerm,
        status: statusFilter,
        priority: priorityFilter,
        limit: '100'
      })
      
      const response = await fetch(`/api/vendor-enquiries?${params}`)
      const result = await response.json()
      
      if (result.success) {
        setEnquiries(result.data)
        setStatistics(result.statistics)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch enquiries",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong while fetching enquiries",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEnquiries()
  }, [searchTerm, statusFilter, priorityFilter])

  const handleViewEnquiry = (enquiry: any) => {
    setSelectedEnquiry(enquiry)
    setIsViewDialogOpen(true)
  }

  const handleRespondToEnquiry = (enquiry: any) => {
    setSelectedEnquiry(enquiry)
    setIsResponseDialogOpen(true)
  }

  const handleStatusChange = async (enquiryId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/vendor-enquiries/${enquiryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Enquiry status updated successfully",
        })
        fetchEnquiries()
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update enquiry status",
        variant: "destructive",
      })
    }
  }

  const handleDeleteEnquiry = async (enquiry: any) => {
    try {
      const response = await fetch(`/api/vendor-enquiries/${enquiry._id}`, {
        method: 'DELETE',
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Enquiry deleted successfully",
        })
        fetchEnquiries()
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete enquiry",
        variant: "destructive",
      })
    }
    setDeleteDialog({ open: false, enquiry: null })
  }

  const exportEnquiries = async () => {
    try {
      const response = await fetch('/api/vendor-enquiries?limit=1000')
      const result = await response.json()
      
      if (result.success) {
        const csvContent = [
          ['Vendor Name', 'Email', 'Phone', 'Subject', 'Location', 'Status', 'Priority', 'Date', 'Responded At'].join(','),
          ...result.data.map((enquiry: any) => [
            enquiry.vendorName,
            enquiry.email,
            enquiry.phone,
            enquiry.subject,
            enquiry.location || '',
            enquiry.status,
            enquiry.priority,
            new Date(enquiry.createdAt).toLocaleDateString(),
            enquiry.respondedAt ? new Date(enquiry.respondedAt).toLocaleDateString() : ''
          ].join(','))
        ].join('\n')
        
        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `vendor-enquiries-${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        window.URL.revokeObjectURL(url)
        
        toast({
          title: "Success",
          description: "Enquiries data exported successfully",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export enquiries data",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "secondary"
      case "responded":
        return "default"
      case "closed":
        return "outline"
      case "spam":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600"
      case "medium":
        return "text-yellow-600"
      case "low":
        return "text-green-600"
      default:
        return "text-gray-600"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
          <p className="mt-4">Loading enquiries...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vendor Enquiries</h1>
          <p className="text-muted-foreground">Manage enquiries from potential vendor partners</p>
        </div>
        <Button variant="outline" onClick={exportEnquiries}>
          <Download className="mr-2 h-4 w-4" />
          Export Enquiries
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Enquiries</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.total}</div>
            <p className="text-xs text-muted-foreground">All enquiries</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Calendar className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{statistics.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting response</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Responded</CardTitle>
            <MessageSquare className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{statistics.responded}</div>
            <p className="text-xs text-muted-foreground">Response sent</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <Calendar className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{statistics.high}</div>
            <p className="text-xs text-muted-foreground">Urgent enquiries</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vendor Enquiries</CardTitle>
          <CardDescription>All enquiries from vendors interested in partnering with the platform</CardDescription>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by vendor name, email, or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="responded">Responded</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="spam">Spam</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor Details</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enquiries.map((enquiry: any) => (
                  <TableRow key={enquiry._id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{enquiry.vendorName}</div>
                        {enquiry.businessType && (
                          <Badge variant="outline" className="text-xs">{enquiry.businessType}</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm">{enquiry.email}</div>
                        <div className="text-xs text-muted-foreground">{enquiry.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate" title={enquiry.subject}>
                        {enquiry.subject}
                      </div>
                    </TableCell>
                    <TableCell>{enquiry.location || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getPriorityColor(enquiry.priority)}>
                        {enquiry.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(enquiry.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Select value={enquiry.status} onValueChange={(value) => handleStatusChange(enquiry._id, value)}>
                        <SelectTrigger className="w-[120px]">
                          <Badge variant={getStatusColor(enquiry.status)}>{enquiry.status}</Badge>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="responded">Responded</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                          <SelectItem value="spam">Spam</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleViewEnquiry(enquiry)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleRespondToEnquiry(enquiry)}>
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setDeleteDialog({ open: true, enquiry })}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* View Enquiry Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Enquiry Details</DialogTitle>
            <DialogDescription>Complete information about the vendor enquiry</DialogDescription>
          </DialogHeader>
          {selectedEnquiry && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-2">Vendor Information</h3>
                  <div className="space-y-2">
                    <div><span className="font-medium">Name:</span> {selectedEnquiry.vendorName}</div>
                    <div><span className="font-medium">Email:</span> {selectedEnquiry.email}</div>
                    <div><span className="font-medium">Phone:</span> {selectedEnquiry.phone}</div>
                    {selectedEnquiry.location && (
                      <div><span className="font-medium">Location:</span> {selectedEnquiry.location}</div>
                    )}
                    {selectedEnquiry.businessType && (
                      <div><span className="font-medium">Business Type:</span> {selectedEnquiry.businessType}</div>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-2">Enquiry Details</h3>
                  <div className="space-y-2">
                    <div><span className="font-medium">Subject:</span> {selectedEnquiry.subject}</div>
                    <div><span className="font-medium">Status:</span> <Badge variant={getStatusColor(selectedEnquiry.status)}>{selectedEnquiry.status}</Badge></div>
                    <div><span className="font-medium">Priority:</span> <Badge variant="outline" className={getPriorityColor(selectedEnquiry.priority)}>{selectedEnquiry.priority}</Badge></div>
                    <div><span className="font-medium">Date:</span> {new Date(selectedEnquiry.createdAt).toLocaleDateString()}</div>
                    {selectedEnquiry.respondedAt && (
                      <div><span className="font-medium">Responded:</span> {new Date(selectedEnquiry.respondedAt).toLocaleDateString()}</div>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-2">Message</h3>
                <div className="bg-gray-50 p-3 rounded-md text-sm">
                  {selectedEnquiry.message}
                </div>
              </div>
              {selectedEnquiry.response && (
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-2">Response</h3>
                  <div className="bg-blue-50 p-3 rounded-md text-sm">
                    {selectedEnquiry.response}
                  </div>
                  {selectedEnquiry.respondedBy && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Responded by: {selectedEnquiry.respondedBy}
                    </p>
                  )}
                </div>
              )}
              {selectedEnquiry.notes && (
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-2">Internal Notes</h3>
                  <div className="bg-yellow-50 p-3 rounded-md text-sm">
                    {selectedEnquiry.notes}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Response Dialog */}
      <EnquiryResponseDialog
        isOpen={isResponseDialogOpen}
        onClose={() => setIsResponseDialogOpen(false)}
        onSuccess={fetchEnquiries}
        enquiry={selectedEnquiry}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, enquiry: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the enquiry from{" "}
              <strong>{deleteDialog.enquiry?.vendorName}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDeleteEnquiry(deleteDialog.enquiry)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
