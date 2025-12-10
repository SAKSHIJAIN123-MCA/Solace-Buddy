"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Loader2, Edit, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { IBlogPost } from "@/lib/models/blog"
import Image from "next/image"

export default function BlogPage() {
  const { toast } = useToast()
  const [blogPosts, setBlogPosts] = useState<IBlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentPost, setCurrentPost] = useState<IBlogPost | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    tags: "",
    metaDescription: "",
    status: "draft",
    image: "",
  })

  const fetchBlogPosts = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/blog")
      const result = await response.json()
      if (result.success) {
        setBlogPosts(result.data)
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
        description: "Failed to fetch blog posts.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchBlogPosts()
  }, [fetchBlogPosts])

  const handleFormChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.title.trim()) {
      errors.title = "Title is required"
    }
    if (!formData.content.trim()) {
      errors.content = "Content is required"
    }
    if (!formData.status) {
      errors.status = "Status is required"
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    try {
      const formDataObj = new FormData()
      formDataObj.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formDataObj,
      })

      const result = await response.json()
      if (result.url) {
        setFormData((prev) => ({ ...prev, image: result.url }))
        toast({
          title: "Success",
          description: "Image uploaded successfully",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to upload image",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Image upload error:", error)
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      })
    } finally {
      setUploadingImage(false)
    }
  }

  const resetFormData = () => {
    setFormData({ title: "", content: "", tags: "", metaDescription: "", status: "draft", image: "" })
    setValidationErrors({})
  }

  const handleAddPost = async () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      const result = await response.json()
      if (result.success) {
        toast({ title: "Success", description: "Blog post created successfully." })
        setIsAddDialogOpen(false)
        resetFormData()
        fetchBlogPosts()
      } else {
        toast({ title: "Error", description: result.error || "Failed to create blog post", variant: "destructive" })
      }
    } catch (error) {
      console.error("[v0] Error creating blog post:", error)
      toast({ title: "Error", description: "Failed to create blog post.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleEditClick = (post: IBlogPost) => {
    setCurrentPost(post)
    setFormData({
      title: post.title,
      content: post.content,
      tags: post.tags.join(", "),
      metaDescription: post.metaDescription,
      status: post.status,
      image: post.image || "",
    })
    setValidationErrors({})
    setIsEditDialogOpen(true)
  }

  const handleUpdatePost = async () => {
    if (!currentPost) return

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/blog/${currentPost._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      const result = await response.json()
      if (result.success) {
        toast({ title: "Success", description: "Blog post updated successfully." })
        setIsEditDialogOpen(false)
        setCurrentPost(null)
        resetFormData()
        fetchBlogPosts()
      } else {
        toast({ title: "Error", description: result.error || "Failed to update blog post", variant: "destructive" })
      }
    } catch (error) {
      console.error("[v0] Error updating blog post:", error)
      toast({ title: "Error", description: "Failed to update blog post.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePost = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return

    setLoading(true)
    try {
      const response = await fetch(`/api/blog/${id}`, {
        method: "DELETE",
      })
      const result = await response.json()
      if (result.success) {
        toast({ title: "Success", description: "Blog post deleted successfully." })
        fetchBlogPosts()
      } else {
        toast({ title: "Error", description: result.error, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete blog post.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Blog Management</h1>
          <p className="text-muted-foreground">Manage blog posts and content</p>
        </div>
        <Button
          onClick={() => {
            setIsAddDialogOpen(true)
            resetFormData()
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Post
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Posts</CardTitle>
          <CardDescription>Latest blog posts and articles</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
          ) : blogPosts.length === 0 ? (
            <p className="text-center text-muted-foreground">No blog posts found. Create one!</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {blogPosts.map((post) => (
                  <TableRow key={post._id}>
                    <TableCell>
                      {post.image ? (
                        <div className="relative w-12 h-12">
                          <Image
                            src={post.image || "/placeholder.svg"}
                            alt={post.title}
                            fill
                            className="object-cover rounded"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                          No image
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{post.title}</TableCell>
                    <TableCell>
                      <Badge variant={post.status === "published" ? "default" : "secondary"}>{post.status}</Badge>
                    </TableCell>
                    <TableCell>{post.views}</TableCell>
                    <TableCell>{new Date(post.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditClick(post)}>
                          <Edit className="h-4 w-4 mr-1" /> Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeletePost(post._id)}>
                          <Trash2 className="h-4 w-4 mr-1" /> Delete
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

      {/* Add New Post Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Blog Post</DialogTitle>
            <DialogDescription>Write and publish a new blog post</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="image">Featured Image</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="flex-1"
                />
                {uploadingImage && <Loader2 className="h-4 w-4 animate-spin" />}
              </div>
              {formData.image && (
                <div className="mt-2 relative w-full h-40">
                  <Image
                    src={formData.image || "/placeholder.svg"}
                    alt="Preview"
                    fill
                    className="object-cover rounded"
                  />
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="title">
                Post Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleFormChange("title", e.target.value)}
                placeholder="Enter post title"
                className={validationErrors.title ? "border-red-500" : ""}
              />
              {validationErrors.title && <p className="text-red-500 text-sm mt-1">{validationErrors.title}</p>}
            </div>
            <div>
              <Label htmlFor="status">
                Status <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.status} onValueChange={(value) => handleFormChange("status", value)}>
                <SelectTrigger className={validationErrors.status ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
              {validationErrors.status && <p className="text-red-500 text-sm mt-1">{validationErrors.status}</p>}
            </div>
            <div>
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => handleFormChange("tags", e.target.value)}
                placeholder="hostel, student, accommodation"
              />
            </div>
            <div>
              <Label htmlFor="metaDescription">Meta Description</Label>
              <Textarea
                id="metaDescription"
                value={formData.metaDescription}
                onChange={(e) => handleFormChange("metaDescription", e.target.value)}
                placeholder="Brief description for SEO"
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="content">
                Content <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => handleFormChange("content", e.target.value)}
                placeholder="Write your blog post content here..."
                rows={10}
                className={validationErrors.content ? "border-red-500" : ""}
              />
              {validationErrors.content && <p className="text-red-500 text-sm mt-1">{validationErrors.content}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddPost} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Post
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Post Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Blog Post</DialogTitle>
            <DialogDescription>Modify the content and details of your blog post</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-image">Featured Image</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="edit-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="flex-1"
                />
                {uploadingImage && <Loader2 className="h-4 w-4 animate-spin" />}
              </div>
              {formData.image && (
                <div className="mt-2 relative w-full h-40">
                  <Image
                    src={formData.image || "/placeholder.svg"}
                    alt="Preview"
                    fill
                    className="object-cover rounded"
                  />
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="edit-title">
                Post Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => handleFormChange("title", e.target.value)}
                placeholder="Enter post title"
                className={validationErrors.title ? "border-red-500" : ""}
              />
              {validationErrors.title && <p className="text-red-500 text-sm mt-1">{validationErrors.title}</p>}
            </div>
            <div>
              <Label htmlFor="edit-status">
                Status <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.status} onValueChange={(value) => handleFormChange("status", value)}>
                <SelectTrigger className={validationErrors.status ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
              {validationErrors.status && <p className="text-red-500 text-sm mt-1">{validationErrors.status}</p>}
            </div>
            <div>
              <Label htmlFor="edit-tags">Tags (comma separated)</Label>
              <Input
                id="edit-tags"
                value={formData.tags}
                onChange={(e) => handleFormChange("tags", e.target.value)}
                placeholder="hostel, student, accommodation"
              />
            </div>
            <div>
              <Label htmlFor="edit-metaDescription">Meta Description</Label>
              <Textarea
                id="edit-metaDescription"
                value={formData.metaDescription}
                onChange={(e) => handleFormChange("metaDescription", e.target.value)}
                placeholder="Brief description for SEO"
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="edit-content">
                Content <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="edit-content"
                value={formData.content}
                onChange={(e) => handleFormChange("content", e.target.value)}
                placeholder="Write your blog post content here..."
                rows={10}
                className={validationErrors.content ? "border-red-500" : ""}
              />
              {validationErrors.content && <p className="text-red-500 text-sm mt-1">{validationErrors.content}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePost} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
