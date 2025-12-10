"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"

interface StudentEnquiryResponseDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  enquiry: any
}

export function StudentEnquiryResponseDialog({
  isOpen,
  onClose,
  onSuccess,
  enquiry,
}: StudentEnquiryResponseDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    response: "",
    status: "responded",
    priority: enquiry?.priority || "medium",
    notes: "",
    followUpDate: "",
    respondedBy: "Admin",
    assignedTo: "",
  })

  useEffect(() => {
    if (enquiry && isOpen) {
      setFormData({
        response: enquiry.response || "",
        status: enquiry.status || "responded",
        priority: enquiry.priority || "medium",
        notes: enquiry.notes || "",
        followUpDate: enquiry.followUpDate ? new Date(enquiry.followUpDate).toISOString().split("T")[0] : "",
        respondedBy: enquiry.respondedBy || "Admin",
        assignedTo: enquiry.assignedTo || "",
      })
    }
  }, [enquiry, isOpen])

  const isEditing = enquiry?.response && enquiry.response.trim() !== ""

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/student-enquiries/${enquiry._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Success",
          description: isEditing ? "Response updated successfully" : "Response sent successfully",
        })
        onSuccess()
        onClose()
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
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Response" : "Respond to Student Enquiry"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? `Edit your response to ${enquiry?.studentName}'s enquiry about "${enquiry?.subject}"`
              : `Send a response to ${enquiry?.studentName}'s enquiry about "${enquiry?.subject}"`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="response">Response Message *</Label>
            <Textarea
              id="response"
              value={formData.response}
              onChange={(e) => handleChange("response", e.target.value)}
              placeholder="Type your response here..."
              required
              rows={5}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="responded">Responded</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="pending">Keep Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={formData.priority} onValueChange={(value) => handleChange("priority", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Internal Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="Add any internal notes..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="followUpDate">Follow-up Date (Optional)</Label>
              <Input
                id="followUpDate"
                type="date"
                value={formData.followUpDate}
                onChange={(e) => handleChange("followUpDate", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignedTo">Assign To (Optional)</Label>
              <Input
                id="assignedTo"
                value={formData.assignedTo}
                onChange={(e) => handleChange("assignedTo", e.target.value)}
                placeholder="Team member name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="respondedBy">Responded By</Label>
            <Input
              id="respondedBy"
              value={formData.respondedBy}
              onChange={(e) => handleChange("respondedBy", e.target.value)}
              placeholder="Your name"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Update Response" : "Send Response"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
