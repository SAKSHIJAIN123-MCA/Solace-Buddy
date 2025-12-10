"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, Eye, Plus, Edit, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { StudentForm } from "@/components/student-form"

export default function AdminStudentsPage() {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<"add" | "edit">("add")
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, limit: 100, total: 0 })

  const fetchStudents = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        search: searchTerm,
        limit: String(pagination.limit),
        page: String(pagination.page),
      })
      const res = await fetch(`/api/students?${params}`)
      const result = await res.json()
      if (result.success) {
        setStudents(result.data || [])
        setPagination(result.pagination || { page: 1, limit: 100, total: result.data?.length || 0 })
      } else {
        toast({ title: "Error", description: result.error || "Failed to fetch students", variant: "destructive" })
      }
    } catch {
      toast({ title: "Error", description: "Something went wrong while fetching students", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStudents()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm])

  const handleAddStudent = () => {
    setFormMode("add")
    setSelectedStudent(null)
    setIsFormOpen(true)
  }

  const handleEditStudent = (student: any) => {
    setFormMode("edit")
    setSelectedStudent(student)
    setIsFormOpen(true)
  }

  const handleDeleteStudent = async (student: any) => {
    try {
      const res = await fetch(`/api/students/${student._id}`, { method: "DELETE" })
      const result = await res.json()
      if (result.success) {
        toast({ title: "Success", description: "Student deleted successfully" })
        fetchStudents()
      } else {
        toast({ title: "Error", description: result.error, variant: "destructive" })
      }
    } catch {
      toast({ title: "Error", description: "Failed to delete student", variant: "destructive" })
    }
  }

  const handleViewStudent = (student: any) => {
    setSelectedStudent(student)
    setIsViewDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2" />
          <p className="mt-3">Loading students...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Students Management</h1>
          <p className="text-muted-foreground py-2">View and manage registered student accounts</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleAddStudent}>
            <Plus className="mr-2 h-4 w-4" />
            Add Student
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registered Students</CardTitle>
          <CardDescription>All students who have registered on the platform</CardDescription>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or city"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead className="w-[180px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((s) => (
                  <TableRow key={s._id}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell>{s.email}</TableCell>
                    <TableCell>{s.phone || "-"}</TableCell>
                    <TableCell>{s.city || "-"}</TableCell>
                    <TableCell>{s.createdAt ? new Date(s.createdAt).toLocaleDateString() : "-"}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleViewStudent(s)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleEditStudent(s)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteStudent(s)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {students.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No students found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* View Student Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Student Details</DialogTitle>
            <DialogDescription>Basic information</DialogDescription>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-3">
              <div>
                <span className="font-medium">Name:</span> {selectedStudent.name}
              </div>
              <div>
                <span className="font-medium">Email:</span> {selectedStudent.email}
              </div>
              <div>
                <span className="font-medium">Mobile:</span> {selectedStudent.phone || "-"}
              </div>
              <div>
                <span className="font-medium">City:</span> {selectedStudent.city || "-"}
              </div>
              <div>
                <span className="font-medium">Registered:</span>{" "}
                {selectedStudent.createdAt ? new Date(selectedStudent.createdAt).toLocaleString() : "-"}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add/Edit Student Form */}
      <StudentForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={fetchStudents}
        student={selectedStudent}
        mode={formMode}
      />
    </div>
  )
}
