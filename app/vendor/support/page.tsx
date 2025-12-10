"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { MessageSquare, Send, Phone, Mail, MapPin, Building2, Hash } from "lucide-react"

export default function VendorSupportPage() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    vendorName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    location: "",
    businessType: "",
    propertyCount: "",
    priority: "medium",
    source: "website",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Convert propertyCount to number if provided
      const submitData = {
        ...formData,
        propertyCount: formData.propertyCount ? Number.parseInt(formData.propertyCount) : undefined,
      }

      const response = await fetch("/api/vendor-enquiries", {
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
          vendorName: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
          location: "",
          businessType: "",
          propertyCount: "",
          priority: "medium",
          source: "website",
        })
      } else {
        toast({
          title: "Submission Failed",
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
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <MessageSquare className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Support Center</h1>
          <p className="text-muted-foreground">Get help with your vendor account and partnership enquiries</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Support Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Submit Support Request
              </CardTitle>
              <CardDescription>
                Fill out the form below and our support team will get back to you as soon as possible.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-foreground">Contact Information</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="vendorName">Vendor Name</Label>
                      <Input
                        id="vendorName"
                        placeholder="Enter your business/vendor name"
                        value={formData.vendorName}
                        onChange={(e) => handleInputChange("vendorName", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        placeholder="+91 9876543210"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        placeholder="City, State"
                        value={formData.location}
                        onChange={(e) => handleInputChange("location", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Business Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-foreground">Business Details</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="businessType">Business Type</Label>
                      <Select
                        value={formData.businessType}
                        onValueChange={(value) => handleInputChange("businessType", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select business type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Hostel">Hostel</SelectItem>
                          <SelectItem value="PG">PG (Paying Guest)</SelectItem>
                          <SelectItem value="Both">Both Hostel & PG</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="propertyCount">Number of Properties</Label>
                      <Input
                        id="propertyCount"
                        type="number"
                        placeholder="e.g., 3"
                        min="0"
                        value={formData.propertyCount}
                        onChange={(e) => handleInputChange("propertyCount", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Enquiry Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-foreground">Enquiry Details</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority Level</Label>
                      <Select value={formData.priority} onValueChange={(value) => handleInputChange("priority", value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low Priority</SelectItem>
                          <SelectItem value="medium">Medium Priority</SelectItem>
                          <SelectItem value="high">High Priority</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="source">How did you hear about us?</Label>
                      <Select value={formData.source} onValueChange={(value) => handleInputChange("source", value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="website">Website</SelectItem>
                          <SelectItem value="phone">Phone Call</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="referral">Referral</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      placeholder="Brief description of your enquiry"
                      value={formData.subject}
                      onChange={(e) => handleInputChange("subject", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Please provide detailed information about your enquiry, requirements, or the issue you're facing..."
                      rows={6}
                      value={formData.message}
                      onChange={(e) => handleInputChange("message", e.target.value)}
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Submit Support Request
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Support Information Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email Support</p>
                  <p className="text-sm text-muted-foreground">support@solacebuddy.com</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Phone Support</p>
                  <p className="text-sm text-muted-foreground">+91 9876543210</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Office Address</p>
                  <p className="text-sm text-muted-foreground">Mumbai, Maharashtra</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Partnership Benefits
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <Hash className="h-4 w-4 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Increased Visibility</p>
                  <p className="text-xs text-muted-foreground">Reach thousands of students</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Hash className="h-4 w-4 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Easy Management</p>
                  <p className="text-xs text-muted-foreground">Simple dashboard to manage bookings</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Hash className="h-4 w-4 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium">24/7 Support</p>
                  <p className="text-xs text-muted-foreground">Dedicated support team</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Response Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>High Priority</span>
                  <span className="text-red-600 font-medium">2-4 hours</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Medium Priority</span>
                  <span className="text-yellow-600 font-medium">4-8 hours</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Low Priority</span>
                  <span className="text-green-600 font-medium">24-48 hours</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
