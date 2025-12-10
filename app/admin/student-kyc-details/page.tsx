"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Eye, Search, Filter, CheckCircle, Clock, AlertCircle, Plus, Edit, Trash2, Download } from "lucide-react"
import { KYCFormDialog } from "@/components/admin/kyc-form-dialog"
import { toast } from "sonner"
import Image from "next/image"

interface KYCRecord {
  _id: string
  studentId: string
  student: {
    name: string
    email: string
    phone: string
    college: string
    course: string
    year: string
  }
  name: string
  mobileNumber: string
  email: string
  profession: string
  collegeCompanyName: string
  fatherName: string
  fatherMobileNumber: string
  pgStartDate: string
  currentStep: number
  isCompleted: boolean
  submittedAt: string
  createdAt: string
  updatedAt: string
  passportSizePhoto: string
  aadharCardFront: string
  aadharCardBack: string
  residentialProof: string
  proofOfLocation: string
}

export default function AdminKYCDetailsPage() {
  const [kycRecords, setKycRecords] = useState<KYCRecord[]>([])
  const [filteredRecords, setFilteredRecords] = useState<KYCRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedRecord, setSelectedRecord] = useState<KYCRecord | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<KYCRecord | null>(null)

  useEffect(() => {
    fetchKYCRecords()
  }, [])

  useEffect(() => {
    filterRecords()
  }, [kycRecords, searchTerm, statusFilter])

  const fetchKYCRecords = async () => {
    try {
      const response = await fetch("/api/admin/kyc")
      if (response.ok) {
        const data = await response.json()
        setKycRecords(data.kycRecords || [])
      } else {
        toast.error("Failed to fetch KYC records")
      }
    } catch (error) {
      console.error("Error fetching KYC records:", error)
      toast.error("Error fetching KYC records")
    } finally {
      setLoading(false)
    }
  }

  const filterRecords = () => {
    let filtered = kycRecords

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (record) =>
          record.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.mobileNumber?.includes(searchTerm) ||
          record.collegeCompanyName?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      if (statusFilter === "completed") {
        filtered = filtered.filter((record) => record.isCompleted)
      } else if (statusFilter === "pending") {
        filtered = filtered.filter((record) => !record.isCompleted)
      } else if (statusFilter === "in-progress") {
        filtered = filtered.filter((record) => !record.isCompleted && record.currentStep > 1)
      }
    }

    setFilteredRecords(filtered)
  }

  const getStatusBadge = (record: KYCRecord) => {
    if (record.isCompleted) {
      return (
        <Badge className="bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Completed
        </Badge>
      )
    } else if (record.currentStep > 1) {
      return (
        <Badge className="bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3 mr-1" />
          In Progress
        </Badge>
      )
    } else {
      return (
        <Badge className="bg-gray-100 text-gray-800">
          <AlertCircle className="w-3 h-3 mr-1" />
          Not Started
        </Badge>
      )
    }
  }

  const renderKYCDetails = (record: KYCRecord) => {
    return (
      <div className="space-y-6 max-h-[70vh] overflow-y-auto">
        {/* Personal Details */}
        <div>
          <h4 className="font-semibold text-lg mb-3">Personal Details</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-gray-600">Name:</p>
              <p>{record.name || "-"}</p>
            </div>
            <div>
              <p className="font-medium text-gray-600">Mobile:</p>
              <p>{record.mobileNumber || "-"}</p>
            </div>
            <div>
              <p className="font-medium text-gray-600">Email:</p>
              <p>{record.email || "-"}</p>
            </div>
            <div>
              <p className="font-medium text-gray-600">Status:</p>
              {getStatusBadge(record)}
            </div>
          </div>
        </div>

        {/* Student Information */}
        <div>
          <h4 className="font-semibold text-lg mb-3">Student Information</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-gray-600">Student Name:</p>
              <p>{record.student?.name || "-"}</p>
            </div>
            <div>
              <p className="font-medium text-gray-600">College:</p>
              <p>{record.student?.college || "-"}</p>
            </div>
            <div>
              <p className="font-medium text-gray-600">Course:</p>
              <p>{record.student?.course || "-"}</p>
            </div>
            <div>
              <p className="font-medium text-gray-600">Year:</p>
              <p>{record.student?.year || "-"}</p>
            </div>
          </div>
        </div>

        {/* Professional Details */}
        <div>
          <h4 className="font-semibold text-lg mb-3">Professional Details</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-gray-600">Profession:</p>
              <p>{record.profession || "-"}</p>
            </div>
            <div>
              <p className="font-medium text-gray-600">College/Company:</p>
              <p>{record.collegeCompanyName || "-"}</p>
            </div>
          </div>
        </div>

        {/* Family Details */}
        <div>
          <h4 className="font-semibold text-lg mb-3">Family Details</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-gray-600">Father's Name:</p>
              <p>{record.fatherName || "-"}</p>
            </div>
            <div>
              <p className="font-medium text-gray-600">Father's Mobile:</p>
              <p>{record.fatherMobileNumber || "-"}</p>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-lg mb-3">Submitted Documents</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {record.passportSizePhoto && (
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Passport Photo</p>
                <Image
                  src={record.passportSizePhoto || "/placeholder.svg"}
                  alt="Passport"
                  width={150}
                  height={150}
                  className="rounded border object-cover"
                />
              </div>
            )}
            {record.aadharCardFront && (
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Aadhar Front</p>
                <Image
                  src={record.aadharCardFront || "/placeholder.svg"}
                  alt="Aadhar Front"
                  width={150}
                  height={150}
                  className="rounded border object-cover"
                />
              </div>
            )}
            {record.aadharCardBack && (
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Aadhar Back</p>
                <Image
                  src={record.aadharCardBack || "/placeholder.svg"}
                  alt="Aadhar Back"
                  width={150}
                  height={150}
                  className="rounded border object-cover"
                />
              </div>
            )}
            {record.residentialProof && (
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Residential Proof</p>
                <Image
                  src={record.residentialProof || "/placeholder.svg"}
                  alt="Residential Proof"
                  width={150}
                  height={150}
                  className="rounded border object-cover"
                />
              </div>
            )}
            {record.proofOfLocation && (
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Proof of Location</p>
                <Image
                  src={record.proofOfLocation || "/placeholder.svg"}
                  alt="Proof of Location"
                  width={150}
                  height={150}
                  className="rounded border object-cover"
                />
              </div>
            )}
          </div>
        </div>

        {/* Submission Details */}
        <div>
          <h4 className="font-semibold text-lg mb-3">Submission Details</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-gray-600">Created At:</p>
              <p>{new Date(record.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <p className="font-medium text-gray-600">Last Updated:</p>
              <p>{new Date(record.updatedAt).toLocaleString()}</p>
            </div>
            {record.submittedAt && (
              <div>
                <p className="font-medium text-gray-600">Submitted At:</p>
                <p>{new Date(record.submittedAt).toLocaleString()}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this KYC record?")) {
      return
    }

    try {
      const response = await fetch(`/api/admin/kyc/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("KYC deleted successfully")
        fetchKYCRecords()
      } else {
        toast.error("Failed to delete KYC")
      }
    } catch (error) {
      console.error("Error deleting KYC:", error)
      toast.error("Error deleting KYC")
    }
  }

  const handleEdit = (record: KYCRecord) => {
    setEditingRecord(record)
    setIsFormOpen(true)
  }

  const handleAdd = () => {
    setEditingRecord(null)
    setIsFormOpen(true)
  }

  const handleFormClose = (refresh?: boolean) => {
    setIsFormOpen(false)
    setEditingRecord(null)
    if (refresh) {
      fetchKYCRecords()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading KYC records...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-balance">Student KYC Details</h1>
          <p className="text-muted-foreground">Manage and view all student KYC submissions</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Add KYC
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by name, email, mobile, or college..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="pending">Not Started</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{kycRecords.filter((r) => r.isCompleted).length}</p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {kycRecords.filter((r) => !r.isCompleted && r.currentStep > 1).length}
              </p>
              <p className="text-sm text-gray-600">In Progress</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-600">
                {kycRecords.filter((r) => r.currentStep === 1 && !r.isCompleted).length}
              </p>
              <p className="text-sm text-gray-600">Not Started</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* KYC Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>KYC Records ({filteredRecords.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredRecords.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No KYC records found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr className="text-left">
                    <th className="px-4 py-3">Student Name</th>
                    <th className="px-4 py-3">KYC Name</th>
                    <th className="px-4 py-3">Mobile</th>
                    <th className="px-4 py-3">College/Company</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Progress</th>
                    <th className="px-4 py-3">Created</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((record) => (
                    <tr key={record._id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium">{record.student?.name || "-"}</p>
                          <p className="text-xs text-gray-500">{record.student?.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">{record.name || "-"}</td>
                      <td className="px-4 py-3">{record.mobileNumber || "-"}</td>
                      <td className="px-4 py-3">
                        <div>
                          <p>{record.collegeCompanyName || record.student?.college || "-"}</p>
                          <p className="text-xs text-gray-500">{record.profession || "-"}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">{getStatusBadge(record)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${(record.currentStep / 4) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-xs">{record.currentStep}/4</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">{new Date(record.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => setSelectedRecord(record)}>
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl">
                              <DialogHeader>
                                <DialogTitle>KYC Details - {record.name || record.student?.name}</DialogTitle>
                              </DialogHeader>
                              {selectedRecord && renderKYCDetails(selectedRecord)}
                            </DialogContent>
                          </Dialog>
                          <Button variant="outline" size="sm" onClick={() => handleEdit(record)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDelete(record._id)}>
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`/api/admin/kyc/${record._id}/pdf`, "_blank")}
                          >
                            <Download className="w-4 h-4 mr-1" />
                            PDF
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* KYC Form Dialog */}
      <KYCFormDialog open={isFormOpen} onClose={handleFormClose} editingRecord={editingRecord} />
    </div>
  )
}
