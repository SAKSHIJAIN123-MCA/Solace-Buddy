"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

type CityItem = string | { id?: string; name?: string; value?: string }

interface StudentFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  student?: any
  mode: "add" | "edit"
}

export function StudentForm({ isOpen, onClose, onSuccess, student, mode }: StudentFormProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [cities, setCities] = useState<CityItem[]>([])
  const [loadingCities, setLoadingCities] = useState(true)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    city: "",
    phone: "",
  })

  useEffect(() => {
    if (student && mode === "edit") {
      setFormData({
        name: student.name || "",
        email: student.email || "",
        city: student.city || "",
        phone: student.phone || "",
      })
    } else {
      setFormData({ name: "", email: "", city: "", phone: "" })
    }
  }, [student, mode, isOpen])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch("/api/popular-cities")
        const data = await res.json()
        if (!mounted) return
        if (data?.success && Array.isArray(data.data)) setCities(data.data)
        else if (Array.isArray(data)) setCities(data)
      } catch (e) {
        // non-blocking
      } finally {
        if (mounted) setLoadingCities(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  const normalizeCityLabel = (c: CityItem) => (typeof c === "string" ? c : c?.name || c?.value || "")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setLoading(true)
    try {
      const url = mode === "add" ? "/api/students" : `/api/students/${student._id}`
      const method = mode === "add" ? "POST" : "PUT"

      const payload: any = {
        name: formData.name,
        email: formData.email,
        city: formData.city,
        phone: formData.phone,
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const result = await response.json()
      if (result.success) {
        toast({ title: "Success", description: result.message || "Saved" })
        onSuccess()
        onClose()
      } else {
        toast({ title: "Error", description: result.error || "Failed to save", variant: "destructive" })
      }
    } catch {
      toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Add New Student" : "Edit Student"}</DialogTitle>
          <DialogDescription>
            {mode === "add"
              ? "Fill in the details to add a new student. Password will be auto-generated and sent to their email."
              : "Update the student information below."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Enter full name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="Enter email address"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Mobile Number *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="Enter mobile number"
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="city">City *</Label>
              <Select value={formData.city} onValueChange={(v) => handleChange("city", v)} disabled={loadingCities}>
                <SelectTrigger id="city">
                  <SelectValue placeholder={loadingCities ? "Loading cities..." : "Select city"} />
                </SelectTrigger>
                <SelectContent>
                  {cities?.length
                    ? cities.map((c, idx) => {
                        const label = normalizeCityLabel(c)
                        if (!label) return null
                        return (
                          <SelectItem key={typeof c === "string" ? c : c?.id || label || idx} value={label}>
                            {label}
                          </SelectItem>
                        )
                      })
                    : !loadingCities && (
                        <div className="px-2 py-1.5 text-sm text-muted-foreground">No cities found</div>
                      )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === "add" ? "Add Student" : "Update Student"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
