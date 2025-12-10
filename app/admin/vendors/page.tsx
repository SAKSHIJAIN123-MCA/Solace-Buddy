"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Eye, Download, Building2, Mail, Phone, Plus, Edit, Trash2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
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
import { useRouter } from "next/navigation"

export default function VendorsPage() {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [businessTypeFilter, setBusinessTypeFilter] = useState("all")
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)
  const [statistics, setStatistics] = useState({
    total: 0,
    active: 0,
    pending: 0,
    suspended: 0,
    rejected: 0,
  })
  const [deleteDialog, setDeleteDialog] = useState({ open: false, vendor: null as any })
  const router = useRouter()

  const fetchVendors = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        search: searchTerm,
        status: statusFilter,
        businessType: businessTypeFilter,
        limit: "100",
      })

      const response = await fetch(`/api/vendors?${params}`)
      const result = await response.json()

      if (result.success) {
        setVendors(result.data)
        setStatistics(result.statistics)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch vendors",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong while fetching vendors",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVendors()
  }, [searchTerm, statusFilter, businessTypeFilter])

  const handleAddVendor = () => {
    router.push("/admin/vendors/add")
  }

  const handleEditVendor = (vendor: any) => {
    router.push(`/admin/vendors/edit/${vendor._id}`)
  }

  const handleDeleteVendor = async (vendor: any) => {
    try {
      const response = await fetch(`/api/vendors/${vendor._id}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Success",
          description: "Vendor deleted successfully",
        })
        fetchVendors()
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
        description: "Failed to delete vendor",
        variant: "destructive",
      })
    }
    setDeleteDialog({ open: false, vendor: null })
  }

  const handleStatusChange = async (vendorId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/vendors/${vendorId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Success",
          description: "Vendor status updated successfully",
        })
        fetchVendors()
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
        description: "Failed to update vendor status",
        variant: "destructive",
      })
    }
  }

  const handleViewVendor = (vendor: any) => {
    router.push(`/admin/vendors/view/${vendor._id}`)
  }

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

  const exportVendors = async () => {
    try {
      const response = await fetch("/api/vendors?limit=1000")
      const result = await response.json()

      if (result.success) {
        const csvContent = [
          ["Business Name", "Owner Name", "Email", "Phone", "Business Type", "Status", "Registration Date"].join(","),
          ...result.data.map((vendor: any) =>
            [
              vendor.name,
              vendor.ownerName,
              vendor.email,
              vendor.phone,
              vendor.businessType,
              vendor.status,
              new Date(vendor.registrationDate).toLocaleDateString(),
            ].join(","),
          ),
        ].join("\n")

        const blob = new Blob([csvContent], { type: "text/csv" })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `vendors-${new Date().toISOString().split("T")[0]}.csv`
        a.click()
        window.URL.revokeObjectURL(url)

        toast({
          title: "Success",
          description: "Vendors data exported successfully",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export vendors data",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
          <p className="mt-4">Loading vendors...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vendor Management</h1>
          <p className="text-muted-foreground">View and manage registered vendor partners</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleAddVendor}>
            <Plus className="mr-2 h-4 w-4" />
            Add Vendor
          </Button>
          <Button variant="outline" onClick={exportVendors}>
            <Download className="mr-2 h-4 w-4" />
            Export Vendors
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vendors</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.total}</div>
            <p className="text-xs text-muted-foreground">Registered partners</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Vendors</CardTitle>
            <Building2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{statistics.active}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Vendors</CardTitle>
            <Building2 className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{statistics.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspended</CardTitle>
            <Building2 className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{statistics.suspended}</div>
            <p className="text-xs text-muted-foreground">Suspended accounts</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registered Vendors</CardTitle>
          <CardDescription>All vendors who have registered on the platform</CardDescription>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, owner, or email..."
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
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={businessTypeFilter} onValueChange={setBusinessTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Business type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Hostel">Hostel</SelectItem>
                <SelectItem value="PG">PG</SelectItem>
                <SelectItem value="Both">Both</SelectItem>
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
                  <TableHead>Business Info</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vendors.map((vendor: any) => (
                  <TableRow key={vendor._id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{vendor.name}</div>
                        <div className="text-sm text-muted-foreground">Owner: {vendor.ownerName}</div>
                        <div className="text-xs text-muted-foreground">
                          Reg: {new Date(vendor.registrationDate).toLocaleDateString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Mail className="h-3 w-3 mr-1" />
                          {vendor.email}
                        </div>
                        <div className="flex items-center text-sm">
                          <Phone className="h-3 w-3 mr-1" />
                          {vendor.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{vendor.businessType}</Badge>
                    </TableCell>
                    <TableCell>
                      <Select value={vendor.status} onValueChange={(value) => handleStatusChange(vendor._id, value)}>
                        <SelectTrigger className="w-[120px]">
                          <Badge variant={getStatusColor(vendor.status)}>{vendor.status}</Badge>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="suspended">Suspended</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleViewVendor(vendor)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleEditVendor(vendor)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleteDialog({ open: true, vendor })}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, vendor: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the vendor account for{" "}
              <strong>{deleteDialog.vendor?.name}</strong> and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDeleteVendor(deleteDialog.vendor)}
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
