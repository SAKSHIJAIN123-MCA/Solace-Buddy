"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Plus, Edit, Trash2, MoreHorizontal, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

interface IHeroSlide {
  _id: string
  title: string
  subtitle?: string
  description?: string
  image: string
  link?: string
  buttonText?: string
  isActive: boolean
  order: number
}

export default function HeroSlidesAdminPage() {
  const { toast } = useToast()
  const [slides, setSlides] = useState<IHeroSlide[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [slideToDelete, setSlideToDelete] = useState<IHeroSlide | null>(null)

  const fetchSlides = async () => {
    try {
      const res = await fetch("/api/admin/hero")
      const data = await res.json()
      setSlides(data.slides || [])
    } catch {
      toast({
        title: "Error",
        description: "Failed to load hero slides",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    fetchSlides()
  }, [])

  const handleDeleteClick = (slide: IHeroSlide) => {
    setSlideToDelete(slide)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!slideToDelete) return
    try {
      await fetch(`/api/admin/hero/${slideToDelete._id}`, {
        method: "DELETE",
      })
      toast({
        title: "Deleted",
        description: "Hero slide deleted successfully.",
      })
      fetchSlides()
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete hero slide",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setSlideToDelete(null)
    }
  }

  const toggleActive = async (slide: IHeroSlide) => {
    try {
      await fetch(`/api/admin/hero/${slide._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...slide, isActive: !slide.isActive }),
      })
      toast({
        title: "Updated",
        description: `Hero slide ${!slide.isActive ? "activated" : "deactivated"} successfully.`,
      })
      fetchSlides()
    } catch {
      toast({
        title: "Error",
        description: "Failed to update hero slide",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6 p-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Hero Slides</h1>
        <Link href="/admin/hero/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Slide
          </Button>
        </Link>
      </div>

      <div className="bg-white shadow rounded p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Image</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Subtitle</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Link</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {slides.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                  No hero slides found.
                </TableCell>
              </TableRow>
            ) : (
              slides.map((slide) => (
                <TableRow key={slide._id}>
                  <TableCell>
                    <Badge variant="outline">{slide.order}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="relative w-20 h-12 rounded overflow-hidden">
                      <Image
                        src={slide.image || "/placeholder.svg"}
                        alt={slide.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[200px]">
                    <div className="truncate" title={slide.title}>
                      {slide.title}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[150px]">
                    <div className="truncate" title={slide.subtitle}>
                      {slide.subtitle || "-"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={slide.isActive ? "default" : "secondary"}>
                      {slide.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[150px]">
                    <div className="truncate" title={slide.link}>
                      {slide.link || "-"}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/hero/${slide._id}`}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleActive(slide)}>
                          {slide.isActive ? (
                            <>
                              <EyeOff className="mr-2 h-4 w-4" /> Deactivate
                            </>
                          ) : (
                            <>
                              <Eye className="mr-2 h-4 w-4" /> Activate
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteClick(slide)} className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this hero slide? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
