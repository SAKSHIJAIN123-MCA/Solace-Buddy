"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash2, Loader2, ImageIcon } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { type IAmenity } from "@/lib/models/amenity"

export default function AmenitiesPage() {
  const { toast } = useToast()
  const [amenities, setAmenities] = useState<IAmenity[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogLoading, setDialogLoading] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingAmenity, setEditingAmenity] = useState<IAmenity | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "", // This will store the Base64 string
    status: "active",
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [iconPreview, setIconPreview] = useState<string | null>(null) // For displaying image preview

  const fetchAmenities = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/amenities')
      const result = await response.json()
      if (result.success) {
        setAmenities(result.data)
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
        description: "Failed to fetch amenities.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchAmenities()
  }, [fetchAmenities])

  const handleFormChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);

      // Create a preview URL for the selected file
      const reader = new FileReader();
      reader.onloadend = () => {
        setIconPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedFile(null);
      setIconPreview(null);
    }
  }

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const resetFormData = () => {
    setFormData({ name: "", description: "", icon: "", status: "active" })
    setSelectedFile(null)
    setIconPreview(null)
  }

  const handleSave = async () => {
    setDialogLoading(true)
    let iconBase64 = formData.icon; // Use existing Base64 if no new file is selected

    if (selectedFile) {
      try {
        iconBase64 = await convertFileToBase64(selectedFile);
      } catch (error) {
        toast({ title: "Error", description: "Failed to convert image to Base64.", variant: "destructive" });
        setDialogLoading(false);
        return;
      }
    }

    if (!iconBase64) {
      toast({ title: "Error", description: "Icon image is required.", variant: "destructive" });
      setDialogLoading(false);
      return;
    }

    const method = editingAmenity ? 'PUT' : 'POST'
    const url = editingAmenity ? `/api/amenities/${editingAmenity._id}` : `/api/amenities`

    const body = {
      name: formData.name,
      description: formData.description,
      icon: iconBase64, // Send the Base64 string
      status: formData.status,
    }

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const result = await response.json()

      if (result.success) {
        toast({
          title: "Success",
          description: `Amenity ${editingAmenity ? "updated" : "created"} successfully.`,
        })
        setIsAddDialogOpen(false)
        setEditingAmenity(null)
        resetFormData()
        fetchAmenities()
      } else {
        toast({ title: "Error", description: result.error, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: `Failed to ${editingAmenity ? "update" : "create"} amenity.`, variant: "destructive" })
    } finally {
      setDialogLoading(false)
    }
  }

  const handleEditClick = (amenity: IAmenity) => {
    setEditingAmenity(amenity)
    setFormData({
      name: amenity.name,
      description: amenity.description,
      icon: amenity.icon, // Set current Base64 string
      status: amenity.status,
    })
    setSelectedFile(null); // Clear any previously selected file
    setIconPreview(amenity.icon); // Set preview to current icon
    setIsAddDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this amenity?")) return

    setLoading(true)
    try {
      const response = await fetch(`/api/amenities/${id}`, {
        method: 'DELETE',
      })
      const result = await response.json()
      if (result.success) {
        toast({ title: "Success", description: "Amenity deleted successfully." })
        fetchAmenities()
      } else {
        toast({ title: "Error", description: result.error, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete amenity.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const filteredAmenities = amenities.filter(
    (amenity) =>
      amenity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      amenity.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Amenities Management</h1>
          <p className="text-muted-foreground">Manage available amenities for hostels and PGs</p>
        </div>
        <Button
          onClick={() => {
            setEditingAmenity(null)
            resetFormData()
            setIsAddDialogOpen(true)
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add New Amenity
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Amenities</CardTitle>
          <CardDescription>Configure amenities that can be offered by properties</CardDescription>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search amenities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
          ) : filteredAmenities.length === 0 ? (
            <p className="text-center text-muted-foreground">No amenities found. Add one!</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Icon</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAmenities.map((amenity) => (
                  <TableRow key={amenity._id}>
                    <TableCell className="font-medium">{amenity.name}</TableCell>
                    <TableCell>{amenity.description}</TableCell>
                    <TableCell>
                      {amenity.icon ? (
                        <img src={amenity.icon || "/placeholder.svg"} alt={amenity.name} className="h-6 w-6 object-contain" />
                      ) : (
                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={amenity.status === "active" ? "default" : "secondary"}>{amenity.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditClick(amenity)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(amenity._id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingAmenity ? "Edit" : "Add New"} Amenity</DialogTitle>
            <DialogDescription>
              {editingAmenity ? "Update" : "Create a new"} amenity that can be offered by properties
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
           
            <div>
              <Label htmlFor="name">Amenity Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleFormChange('name', e.target.value)}
                placeholder="Enter amenity name"
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
                placeholder="Enter amenity description"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="icon-upload">Icon Image</Label>
              <Input
                id="icon-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
              {(iconPreview || editingAmenity?.icon) && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Preview:</span>
                  <img src={iconPreview || editingAmenity?.icon || "/placeholder.svg"} alt="Icon Preview" className="h-8 w-8 object-contain border rounded" />
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleFormChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={dialogLoading}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={dialogLoading || (!selectedFile && !editingAmenity?.icon)}>
              {dialogLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingAmenity ? "Update" : "Create"} Amenity
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
