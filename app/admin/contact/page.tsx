"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Plus, Edit, Save, X, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"

interface ContactInfoItem {
  _id: string
  type: string
  title: string
  content: Record<string, string>
  icon: string
  order: number
}

interface ContactSubmission {
  _id: string
  name: string
  email: string
  phone?: string
  role: string // e.g., "Tenant" | "Property Owner" | "Other"
  description: string
  status: "new" | "read" | "responded"
  createdAt: string
}

export default function AdminContactPage() {
  const { toast } = useToast()
  const [contactInfo, setContactInfo] = useState<ContactInfoItem[]>([])
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [submissionsLoading, setSubmissionsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("info")

  // For editing contact info
  const [isEditing, setIsEditing] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [formData, setFormData] = useState({
    type: "address",
    title: "",
    content: {} as Record<string, string>,
    icon: "MapPin",
    order: 0,
  })

  // For content fields
  const [contentFields, setContentFields] = useState<{ key: string; value: string }[]>([])

  // For viewing a submission
  const [viewingSubmission, setViewingSubmission] = useState<ContactSubmission | null>(null)

  useEffect(() => {
    fetchContactInfo()
    fetchSubmissions()
  }, [])

  const fetchContactInfo = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/contact-info")
      if (response.ok) {
        const data = await response.json()
        setContactInfo(data)
      } else {
        console.error("Failed to fetch contact information")
      }
    } catch (error) {
      console.error("Error fetching contact information:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSubmissions = async () => {
    try {
      setSubmissionsLoading(true)
      const response = await fetch("/api/contact-submissions")
      if (response.ok) {
        const data = await response.json()
        setSubmissions(data)
      } else {
        console.error("Failed to fetch contact submissions")
      }
    } catch (error) {
      console.error("Error fetching contact submissions:", error)
    } finally {
      setSubmissionsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleContentFieldChange = (index: number, field: "key" | "value", value: string) => {
    const updatedFields = [...contentFields]
    updatedFields[index][field] = value
    setContentFields(updatedFields)
  }

  const addContentField = () => {
    setContentFields([...contentFields, { key: "", value: "" }])
  }

  const removeContentField = (index: number) => {
    const updatedFields = [...contentFields]
    updatedFields.splice(index, 1)
    setContentFields(updatedFields)
  }

  const startAdding = () => {
    setIsAdding(true)
    setIsEditing(null)
    setFormData({
      type: "address",
      title: "",
      content: {},
      icon: "MapPin",
      order: contactInfo.length + 1,
    })
    setContentFields([{ key: "", value: "" }])
  }

  const cancelAdding = () => {
    setIsAdding(false)
    setContentFields([])
  }

  const startEditing = (item: ContactInfoItem) => {
    setIsEditing(item._id)
    setIsAdding(false)
    setFormData({
      type: item.type,
      title: item.title,
      content: { ...item.content },
      icon: item.icon,
      order: item.order,
    })

    // Convert content object to array of key-value pairs for editing
    const fields = Object.entries(item.content).map(([key, value]) => ({
      key,
      value,
    }))
    setContentFields(fields)
  }

  const cancelEditing = () => {
    setIsEditing(null)
    setContentFields([])
  }

  const saveContactInfo = async () => {
    // Convert content fields to object
    const contentObject: Record<string, string> = {}
    contentFields.forEach((field) => {
      if (field.key.trim() && field.value.trim()) {
        contentObject[field.key.trim()] = field.value.trim()
      }
    })

    const dataToSave = {
      ...formData,
      content: contentObject,
    }

    try {
      const response = await fetch("/api/contact-info", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSave),
      })

      if (response.ok) {
        toast({
          title: "Contact information added successfully",
        })
        setIsAdding(false)
        setContentFields([])
        fetchContactInfo()
      } else {
        toast({
          title: "Failed to add contact information",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error adding contact information:", error)
      toast({
        title: "An error occurred",
        variant: "destructive",
      })
    }
  }

  const updateContactInfo = async () => {
    if (!isEditing) return

    // Convert content fields to object
    const contentObject: Record<string, string> = {}
    contentFields.forEach((field) => {
      if (field.key.trim() && field.value.trim()) {
        contentObject[field.key.trim()] = field.value.trim()
      }
    })

    const dataToUpdate = {
      ...formData,
      content: contentObject,
    }

    try {
      const response = await fetch(`/api/contact-info/${isEditing}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToUpdate),
      })

      if (response.ok) {
        toast({
          title: "Contact information updated successfully",
        })
        setIsEditing(null)
        setContentFields([])
        fetchContactInfo()
      } else {
        toast({
          title: "Failed to update contact information",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating contact information:", error)
      toast({
        title: "An error occurred",
        variant: "destructive",
      })
    }
  }

  const deleteContactInfo = async (id: string) => {
    try {
      const response = await fetch(`/api/contact-info/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Contact information deleted successfully",
        })
        fetchContactInfo()
      } else {
        toast({
          title: "Failed to delete contact information",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting contact information:", error)
      toast({
        title: "An error occurred",
        variant: "destructive",
      })
    }
  }

  const deleteSubmission = async (id: string) => {
    try {
      const response = await fetch(`/api/contact-submissions/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Submission deleted successfully",
        })
        fetchSubmissions()
        if (viewingSubmission && viewingSubmission._id === id) {
          setViewingSubmission(null)
        }
      } else {
        toast({
          title: "Failed to delete submission",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting submission:", error)
      toast({
        title: "An error occurred",
        variant: "destructive",
      })
    }
  }

  const updateSubmissionStatus = async (id: string, status: "new" | "read" | "responded") => {
    try {
      const response = await fetch(`/api/contact-submissions/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        toast({
          title: "Submission status updated",
        })
        fetchSubmissions()
        if (viewingSubmission && viewingSubmission._id === id) {
          setViewingSubmission({ ...viewingSubmission, status })
        }
      } else {
        toast({
          title: "Failed to update submission status",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating submission status:", error)
      toast({
        title: "An error occurred",
        variant: "destructive",
      })
    }
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800"
      case "read":
        return "bg-yellow-100 text-yellow-800"
      case "responded":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString()
  }

  if (loading && submissionsLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8 px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 leading-10">Contact Management</h1>
            <p className="text-gray-600">Manage contact information and view form submissions</p>
          </div>
          <div className="flex gap-4">
            <Link href="/admin/faqs">
              <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50">
                Manage FAQs
              </button>
            </Link>
            <Link href="/contact">
              <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50">
                View Contact Page
              </button>
            </Link>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="info">Contact Information</TabsTrigger>
            <TabsTrigger value="submissions">Form Submissions</TabsTrigger>
          </TabsList>

          <TabsContent value="info">
            <div className="mb-6 flex justify-end">
              <Button onClick={startAdding} className="bg-[#2e057f] hover:bg-[#2e057f] text-white">
                <Plus size={16} className="mr-2" /> Add Contact Information
              </Button>
            </div>

            {isAdding && (
              <div className="bg-white p-6 rounded-lg shadow-md mb-8 border border-gray-200">
                <h2 className="text-xl font-semibold mb-4">Add Contact Information</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                        Type
                      </label>
                      <select
                        id="type"
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="address">Address</option>
                        <option value="phone">Phone</option>
                        <option value="email">Email</option>
                        <option value="hours">Business Hours</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                        Title
                      </label>
                      <Input
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="e.g., Visit Us"
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="icon" className="block text-sm font-medium text-gray-700 mb-1">
                        Icon
                      </label>
                      <select
                        id="icon"
                        name="icon"
                        value={formData.icon}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="MapPin">Map Pin</option>
                        <option value="Phone">Phone</option>
                        <option value="Mail">Mail</option>
                        <option value="Clock">Clock</option>
                        <option value="MessageSquare">Message</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-1">
                        Display Order
                      </label>
                      <Input
                        id="order"
                        name="order"
                        type="number"
                        value={formData.order}
                        onChange={handleInputChange}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700">Content Fields</label>
                      <Button type="button" onClick={addContentField} variant="outline" size="sm">
                        <Plus size={14} className="mr-1" /> Add Field
                      </Button>
                    </div>

                    {contentFields.map((field, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <Input
                          placeholder="Field name"
                          value={field.key}
                          onChange={(e) => handleContentFieldChange(index, "key", e.target.value)}
                          className="w-1/3"
                        />
                        <Input
                          placeholder="Value"
                          value={field.value}
                          onChange={(e) => handleContentFieldChange(index, "value", e.target.value)}
                          className="w-2/3"
                        />
                        <Button
                          type="button"
                          onClick={() => removeContentField(index)}
                          variant="outline"
                          size="icon"
                          className="flex-shrink-0"
                        >
                          <X size={14} />
                        </Button>
                      </div>
                    ))}

                    {contentFields.length === 0 && (
                      <p className="text-sm text-gray-500 italic">No content fields added yet.</p>
                    )}
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <Button type="button" onClick={cancelAdding} variant="outline">
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={saveContactInfo}
                      className="bg-[#2e057f] hover:bg-[#2e057f] text-white"
                    >
                      <Save size={16} className="mr-2" /> Save
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {isEditing && (
              <div className="bg-white p-6 rounded-lg shadow-md mb-8 border border-gray-200">
                <h2 className="text-xl font-semibold mb-4">Edit Contact Information</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="edit-type" className="block text-sm font-medium text-gray-700 mb-1">
                        Type
                      </label>
                      <select
                        id="edit-type"
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="address">Address</option>
                        <option value="phone">Phone</option>
                        <option value="email">Email</option>
                        <option value="hours">Business Hours</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700 mb-1">
                        Title
                      </label>
                      <Input
                        id="edit-title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="e.g., Visit Us"
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="edit-icon" className="block text-sm font-medium text-gray-700 mb-1">
                        Icon
                      </label>
                      <select
                        id="edit-icon"
                        name="icon"
                        value={formData.icon}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="MapPin">Map Pin</option>
                        <option value="Phone">Phone</option>
                        <option value="Mail">Mail</option>
                        <option value="Clock">Clock</option>
                        <option value="MessageSquare">Message</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="edit-order" className="block text-sm font-medium text-gray-700 mb-1">
                        Display Order
                      </label>
                      <Input
                        id="edit-order"
                        name="order"
                        type="number"
                        value={formData.order}
                        onChange={handleInputChange}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700">Content Fields</label>
                      <Button type="button" onClick={addContentField} variant="outline" size="sm">
                        <Plus size={14} className="mr-1" /> Add Field
                      </Button>
                    </div>

                    {contentFields.map((field, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <Input
                          placeholder="Field name"
                          value={field.key}
                          onChange={(e) => handleContentFieldChange(index, "key", e.target.value)}
                          className="w-1/3"
                        />
                        <Input
                          placeholder="Value"
                          value={field.value}
                          onChange={(e) => handleContentFieldChange(index, "value", e.target.value)}
                          className="w-2/3"
                        />
                        <Button
                          type="button"
                          onClick={() => removeContentField(index)}
                          variant="outline"
                          size="icon"
                          className="flex-shrink-0"
                        >
                          <X size={14} />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <Button type="button" onClick={cancelEditing} variant="outline">
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={updateContactInfo}
                      className="bg-[#2e057f] hover:bg-[#2e057f] text-white"
                    >
                      <Save size={16} className="mr-2" /> Update
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Contact Info List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {contactInfo.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-gray-500">
                    No contact information found. Add your first contact information item.
                  </p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Type
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Title
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Content Preview
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Order
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {contactInfo.map((item) => (
                      <tr key={item._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-teal-100 text-[#2e057f]">
                            {item.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{item.title}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500 max-w-xs truncate">
                            {Object.entries(item.content)
                              .map(([key, value]) => (
                                <div key={key} className="truncate">
                                  <span className="font-medium">{key}:</span> {value}
                                </div>
                              ))
                              .slice(0, 2)}
                            {Object.keys(item.content).length > 2 && (
                              <span className="text-xs text-gray-400">
                                + {Object.keys(item.content).length - 2} more fields
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.order}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <Button
                              onClick={() => startEditing(item)}
                              variant="outline"
                              size="sm"
                              className="text-[#2e057f] hover:text-[#2e057f]"
                            >
                              <Edit size={16} />
                            </Button>
                            <DeleteConfirmationDialog
                              title="Delete Contact Information"
                              description="Are you sure you want to delete this contact information? This action cannot be undone."
                              itemName={item.title}
                              onConfirm={() => deleteContactInfo(item._id)}
                              buttonSize="icon"
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </TabsContent>

          <TabsContent value="submissions">
            {viewingSubmission ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-6">
                  <Button
                    onClick={() => setViewingSubmission(null)}
                    variant="outline"
                    className="flex items-center gap-1"
                  >
                    <ArrowLeft size={16} /> Back to submissions
                  </Button>
                  <div className="flex gap-2">
                    <select
                      value={viewingSubmission.status}
                      onChange={(e) =>
                        updateSubmissionStatus(viewingSubmission._id, e.target.value as "new" | "read" | "responded")
                      }
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="new">New</option>
                      <option value="read">Read</option>
                      <option value="responded">Responded</option>
                    </select>
                    <DeleteConfirmationDialog
                      title="Delete Submission"
                      description="Are you sure you want to delete this contact submission? This action cannot be undone."
                      itemName={viewingSubmission.name}
                      onConfirm={() => deleteSubmission(viewingSubmission._id)}
                      buttonText="Delete"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <h2 className="text-2xl font-semibold mb-2">Submission Details</h2>
                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500">
                    <div>
                      <span className="font-medium">From:</span> {viewingSubmission.name} ({viewingSubmission.email})
                    </div>
                    {viewingSubmission.phone && (
                      <div>
                        <span className="font-medium">Phone:</span> {viewingSubmission.phone}
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Role:</span> {viewingSubmission.role}
                    </div>
                    <div>
                      <span className="font-medium">Date:</span> {formatDate(viewingSubmission.createdAt)}
                    </div>
                    <div>
                      <span className="font-medium">Status:</span>{" "}
                      <span className={`px-2 py-0.5 rounded-full ${getStatusBadgeClass(viewingSubmission.status)}`}>
                        {viewingSubmission.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Description:</h3>
                  <p className="whitespace-pre-wrap text-gray-800">{viewingSubmission.description}</p>
                </div>

                <div className="mt-6 flex gap-4">
                  <Button
                    onClick={() =>
                      (window.location.href = `mailto:${viewingSubmission.email}?subject=Re:%20Your%20contact%20form%20submission`)
                    }
                    className="bg-[#2e057f] hover:bg-[#2e057f] text-white"
                  >
                    Reply via Email
                  </Button>
                  {viewingSubmission.phone && (
                    <Button onClick={() => (window.location.href = `tel:${viewingSubmission.phone}`)} variant="outline">
                      Call {viewingSubmission.phone}
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                {submissions.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-gray-500">No form submissions found yet.</p>
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Name
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Role
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Date
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Status
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {submissions.map((submission) => (
                        <tr
                          key={submission._id}
                          className={submission.status === "new" ? "bg-blue-50" : ""}
                          onClick={() => setViewingSubmission(submission)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900">{submission.name}</div>
                            <div className="text-sm text-gray-500">{submission.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 truncate max-w-xs">{submission.role}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(submission.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                                submission.status,
                              )}`}
                            >
                              {submission.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end gap-2">
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setViewingSubmission(submission)
                                }}
                                variant="outline"
                                size="sm"
                              >
                                View
                              </Button>
                              <div onClick={(e) => e.stopPropagation()}>
                                <DeleteConfirmationDialog
                                  title="Delete Submission"
                                  description="Are you sure you want to delete this contact submission? This action cannot be undone."
                                  itemName={submission.name}
                                  onConfirm={() => deleteSubmission(submission._id)}
                                  buttonSize="icon"
                                />
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
