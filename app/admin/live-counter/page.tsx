"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pencil, Trash2, Plus, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Switch } from "@/components/ui/switch"

interface LiveCounter {
  _id: string
  label?: string
  value?: number
  icon?: string
  order?: number
  isActive?: boolean
}

export default function LiveCounterAdmin() {
  const [counters, setCounters] = useState<LiveCounter[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    label: "",
    value: 0,
    icon: "",
    order: 0,
    isActive: true,
  })

  useEffect(() => {
    fetchCounters()
  }, [])

  const fetchCounters = async () => {
    try {
      const response = await fetch("/api/livecounter")
      const data = await response.json()
      if (data.success) {
        setCounters(data.data)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch counters",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingId ? `/api/livecounter/${editingId}` : "/api/livecounter"
      const method = editingId ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: editingId ? "Counter updated successfully" : "Counter created successfully",
        })
        resetForm()
        fetchCounters()
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (counter: LiveCounter) => {
    setFormData({
      label: counter.label || "",
      value: counter.value || 0,
      icon: counter.icon || "",
      order: counter.order || 0,
      isActive: counter.isActive ?? true,
    })
    setEditingId(counter._id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this counter?")) return

    try {
      const response = await fetch(`/api/livecounter/${id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Counter deleted successfully",
        })
        fetchCounters()
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete counter",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      label: "",
      value: 0,
      icon: "",
      order: 0,
      isActive: true,
    })
    setEditingId(null)
    setShowForm(false)
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Live Counter Management</h1>
          <p className="text-muted-foreground">Manage your live counter statistics</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? <X className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
          {showForm ? "Cancel" : "Add Counter"}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editingId ? "Edit Counter" : "Add New Counter"}</CardTitle>
            <CardDescription>{editingId ? "Update the counter details" : "Create a new live counter"}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="label">Label</Label>
                  <Input
                    id="label"
                    placeholder="e.g., Listed PGs"
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="value">Value</Label>
                  <Input
                    id="value"
                    type="number"
                    placeholder="e.g., 520"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="icon">Icon (Lucide Icon Name)</Label>
                  <Input
                    id="icon"
                    placeholder="e.g., Home, Users, Calendar"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="order">Order</Label>
                  <Input
                    id="order"
                    type="number"
                    placeholder="e.g., 1"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>

              <div className="flex gap-2">
                <Button type="submit">{editingId ? "Update" : "Create"} Counter</Button>
                {editingId && (
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel Edit
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Counters</CardTitle>
          <CardDescription>View and manage all live counters</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-4">Loading...</p>
          ) : counters.length === 0 ? (
            <p className="text-center py-4 text-muted-foreground">No counters found. Create one to get started.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Label</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Icon</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {counters.map((counter) => (
                    <TableRow key={counter._id}>
                      <TableCell className="font-medium">{counter.label || "N/A"}</TableCell>
                      <TableCell>{counter.value || 0}</TableCell>
                      <TableCell>{counter.icon || "N/A"}</TableCell>
                      <TableCell>{counter.order || 0}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            counter.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}
                        >
                          {counter.isActive ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(counter)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(counter._id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
