"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Send, MessageSquare, Eye, Clock, CheckCircle, Plus, X } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function StudentSupportPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [enquiriesLoading, setEnquiriesLoading] = useState(true)
  const [moveInDate, setMoveInDate] = useState<Date>()
  const [enquiries, setEnquiries] = useState([])
  const [selectedEnquiry, setSelectedEnquiry] = useState<any>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    studentName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    preferredLocation: "",
    budget: "",
    accommodationType: "",
    duration: "",
    college: "",
    course: "",
    year: "",
    gender: "",
    priority: "medium",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const fetchEnquiries = async () => {
    try {
      setEnquiriesLoading(true)
      const response = await fetch("/api/student-enquiries?limit=50")
      const result = await response.json()

      if (result.success) {
        setEnquiries(result.data)
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
      setEnquiriesLoading(false)
    }
  }

  useEffect(() => {
    fetchEnquiries()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const submitData = {
        ...formData,
        moveInDate: moveInDate?.toISOString(),
        source: "website",
      }

      const response = await fetch("/api/student-enquiries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Support Request Submitted",
          description: "Your enquiry has been submitted successfully. We'll get back to you soon!",
        })

        // Reset form
        setFormData({
          studentName: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
          preferredLocation: "",
          budget: "",
          accommodationType: "",
          duration: "",
          college: "",
          course: "",
          year: "",
          gender: "",
          priority: "medium",
        })
        setMoveInDate(undefined)

        setShowForm(false)

        // Refresh enquiries list
        fetchEnquiries()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to submit your enquiry. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleViewEnquiry = (enquiry: any) => {
    setSelectedEnquiry(enquiry)
    setIsViewDialogOpen(true)
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "responded":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "closed":
        return <CheckCircle className="h-4 w-4 text-gray-600" />
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />
    }
  }

  return (
    <main className="space-y-6">
      {showForm ? (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-balance">Submit New Support Request</h1>
              <p className="text-muted-foreground">Fill out the form below with your enquiry details.</p>
            </div>
            <Button variant="outline" onClick={() => setShowForm(false)}>
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
          </div>

          {/* Submit New Enquiry Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Submit New Support Request
              </CardTitle>
              <CardDescription>
                Fill out the form below with your enquiry details. All fields are optional, but providing more
                information helps us assist you better.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="studentName">Student Name</Label>
                      <Input
                        id="studentName"
                        value={formData.studentName}
                        onChange={(e) => handleInputChange("studentName", e.target.value)}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="Enter your email address"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Academic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Academic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="college">College/University</Label>
                      <Input
                        id="college"
                        value={formData.college}
                        onChange={(e) => handleInputChange("college", e.target.value)}
                        placeholder="Enter your college name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="course">Course</Label>
                      <Input
                        id="course"
                        value={formData.course}
                        onChange={(e) => handleInputChange("course", e.target.value)}
                        placeholder="Enter your course"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="year">Year</Label>
                      <Select value={formData.year} onValueChange={(value) => handleInputChange("year", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1st Year">1st Year</SelectItem>
                          <SelectItem value="2nd Year">2nd Year</SelectItem>
                          <SelectItem value="3rd Year">3rd Year</SelectItem>
                          <SelectItem value="Final Year">Final Year</SelectItem>
                          <SelectItem value="Post Graduate">Post Graduate</SelectItem>
                          <SelectItem value="Working Professional">Working Professional</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Enquiry Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Enquiry Details</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        value={formData.subject}
                        onChange={(e) => handleInputChange("subject", e.target.value)}
                        placeholder="Brief subject of your enquiry"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => handleInputChange("message", e.target.value)}
                        placeholder="Describe your enquiry in detail..."
                        rows={4}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority</Label>
                      <Select value={formData.priority} onValueChange={(value) => handleInputChange("priority", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Accommodation Preferences (Optional) */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Accommodation Preferences (Optional)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="accommodationType">Accommodation Type</Label>
                      <Select
                        value={formData.accommodationType}
                        onValueChange={(value) => handleInputChange("accommodationType", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select accommodation type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Hostel">Hostel</SelectItem>
                          <SelectItem value="PG">PG</SelectItem>
                          <SelectItem value="Both">Both</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="preferredLocation">Preferred Location</Label>
                      <Input
                        id="preferredLocation"
                        value={formData.preferredLocation}
                        onChange={(e) => handleInputChange("preferredLocation", e.target.value)}
                        placeholder="Enter preferred location"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="budget">Budget Range</Label>
                      <Input
                        id="budget"
                        value={formData.budget}
                        onChange={(e) => handleInputChange("budget", e.target.value)}
                        placeholder="e.g., ₹5000-8000 per month"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration</Label>
                      <Input
                        id="duration"
                        value={formData.duration}
                        onChange={(e) => handleInputChange("duration", e.target.value)}
                        placeholder="e.g., 6 months, 1 year"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Move-in Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !moveInDate && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {moveInDate ? format(moveInDate, "PPP") : "Select move-in date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={moveInDate} onSelect={setMoveInDate} initialFocus />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={loading} className="min-w-[120px]">
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Submitting...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Send className="h-4 w-4" />
                        Submit Enquiry
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          <div>
            <h1 className="text-2xl font-semibold text-balance">Support & Enquiry</h1>
            <p className="text-muted-foreground">Track your submitted enquiries and view responses from our team.</p>
          </div>

          {/* Previous Enquiries Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Your Previous Enquiries
                  </CardTitle>
                  <CardDescription>
                    Track the status of your submitted enquiries and view responses from our team.
                  </CardDescription>
                </div>
                <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Send Request
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {enquiriesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  <p className="ml-2">Loading enquiries...</p>
                </div>
              ) : enquiries.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No enquiries submitted yet. Click "Send Request" to submit your first enquiry!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {enquiries.slice(0, 10).map((enquiry: any) => (
                    <div key={enquiry._id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getStatusIcon(enquiry.status)}
                            <h3 className="font-medium">{enquiry.subject}</h3>
                            <Badge variant={getStatusColor(enquiry.status)} className="text-xs">
                              {enquiry.status}
                            </Badge>
                            <Badge variant="outline" className={cn("text-xs", getPriorityColor(enquiry.priority))}>
                              {enquiry.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{enquiry.message}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Submitted: {new Date(enquiry.createdAt).toLocaleDateString()}</span>
                            {enquiry.respondedAt && (
                              <span>Responded: {new Date(enquiry.respondedAt).toLocaleDateString()}</span>
                            )}
                            {enquiry.preferredLocation && <span>Location: {enquiry.preferredLocation}</span>}
                            {enquiry.accommodationType && <span>Type: {enquiry.accommodationType}</span>}
                          </div>
                          {enquiry.response && (
                            <div className="mt-3 p-3 bg-blue-50 rounded-md">
                              <p className="text-sm font-medium text-blue-900 mb-1">Response from our team:</p>
                              <p className="text-sm text-blue-800">{enquiry.response}</p>
                              {enquiry.respondedBy && (
                                <p className="text-xs text-blue-600 mt-1">- {enquiry.respondedBy}</p>
                              )}
                            </div>
                          )}
                        </div>
                        <Button variant="outline" size="sm" onClick={() => handleViewEnquiry(enquiry)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* View Enquiry Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Enquiry Details</DialogTitle>
            <DialogDescription>Complete information about your enquiry</DialogDescription>
          </DialogHeader>
          {selectedEnquiry && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-2">Student Information</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium">Name:</span> {selectedEnquiry.studentName}
                    </div>
                    <div>
                      <span className="font-medium">Email:</span> {selectedEnquiry.email}
                    </div>
                    <div>
                      <span className="font-medium">Phone:</span> {selectedEnquiry.phone}
                    </div>
                    {selectedEnquiry.college && (
                      <div>
                        <span className="font-medium">College:</span> {selectedEnquiry.college}
                      </div>
                    )}
                    {selectedEnquiry.course && (
                      <div>
                        <span className="font-medium">Course:</span> {selectedEnquiry.course}
                      </div>
                    )}
                    {selectedEnquiry.year && (
                      <div>
                        <span className="font-medium">Year:</span> {selectedEnquiry.year}
                      </div>
                    )}
                    {selectedEnquiry.gender && (
                      <div>
                        <span className="font-medium">Gender:</span> {selectedEnquiry.gender}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-2">Enquiry Information</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium">Subject:</span> {selectedEnquiry.subject}
                    </div>
                    {selectedEnquiry.preferredLocation && (
                      <div>
                        <span className="font-medium">Preferred Location:</span> {selectedEnquiry.preferredLocation}
                      </div>
                    )}
                    {selectedEnquiry.budget && (
                      <div>
                        <span className="font-medium">Budget:</span> {selectedEnquiry.budget}
                      </div>
                    )}
                    {selectedEnquiry.accommodationType && (
                      <div>
                        <span className="font-medium">Type:</span>{" "}
                        <Badge variant="outline">{selectedEnquiry.accommodationType}</Badge>
                      </div>
                    )}
                    {selectedEnquiry.duration && (
                      <div>
                        <span className="font-medium">Duration:</span> {selectedEnquiry.duration}
                      </div>
                    )}
                    {selectedEnquiry.moveInDate && (
                      <div>
                        <span className="font-medium">Move-in Date:</span>{" "}
                        {new Date(selectedEnquiry.moveInDate).toLocaleDateString()}
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Status:</span>{" "}
                      <Badge variant={getStatusColor(selectedEnquiry.status)}>{selectedEnquiry.status}</Badge>
                    </div>
                    <div>
                      <span className="font-medium">Priority:</span>{" "}
                      <Badge variant="outline" className={getPriorityColor(selectedEnquiry.priority)}>
                        {selectedEnquiry.priority}
                      </Badge>
                    </div>
                    <div>
                      <span className="font-medium">Submitted:</span>{" "}
                      {new Date(selectedEnquiry.createdAt).toLocaleDateString()}
                    </div>
                    {selectedEnquiry.respondedAt && (
                      <div>
                        <span className="font-medium">Responded:</span>{" "}
                        {new Date(selectedEnquiry.respondedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-2">Your Message</h3>
                <div className="bg-gray-50 p-3 rounded-md text-sm">{selectedEnquiry.message}</div>
              </div>
              {selectedEnquiry.response && (
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-2">Our Response</h3>
                  <div className="bg-blue-50 p-3 rounded-md text-sm">{selectedEnquiry.response}</div>
                  {selectedEnquiry.respondedBy && (
                    <p className="text-xs text-muted-foreground mt-1">Responded by: {selectedEnquiry.respondedBy}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  )
}
