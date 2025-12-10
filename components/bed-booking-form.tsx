"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer"
import { ArrowLeft, X, AlertCircle, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { DatePicker } from "@/components/date-picker"

interface BedBookingFormProps {
  open: boolean
  onClose: () => void
  onBack: () => void
  propertyId: string
  propertyName: string
  roomId: string
  roomName: string
  bedId: string
  bedNumber: string
  rent: number
  packageTier?: string
}

export function BedBookingForm({
  open,
  onClose,
  onBack,
  propertyId,
  propertyName,
  roomId,
  roomName,
  bedId,
  bedNumber,
  rent,
  packageTier,
}: BedBookingFormProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [fetchedPackage, setFetchedPackage] = useState<string | undefined>(undefined)
  const [packageRule, setPackageRule] = useState<{ percent: number; minRupees: number } | null>(null)
  const [notification, setNotification] = useState<{
    type: "error" | "success"
    message: string
    show: boolean
  }>({
    type: "error",
    message: "",
    show: false,
  })

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobileNumber: "",
    checkInDate: "",
    totalAmount: rent,
    advanceAmount: 0,
  })

  useEffect(() => {
    let active = true
    async function loadPackage() {
      if (!propertyId || !open) return
      try {
        const res = await fetch("/api/admin/vendor-properties")
        const json = await res.json()
        if (json?.success && Array.isArray(json?.data)) {
          const found =
            json.data.find((p: any) => p?._id === propertyId) ||
            json.data.find((p: any) => p?.propertyId === propertyId)
          const pkg = (found?.package || "").toString().trim() || undefined
          if (active) setFetchedPackage(pkg)
        } else {
          if (active) setFetchedPackage(undefined)
        }
      } catch (err) {
        if (active) setFetchedPackage(undefined)
      }
    }
    loadPackage()
    return () => {
      active = false
    }
  }, [propertyId, open])

  const effectivePackage = fetchedPackage ?? packageTier

  useEffect(() => {
    let active = true
    async function loadRule() {
      const t = (effectivePackage || "").toString().trim().toLowerCase()
      if (!t || !open) {
        if (active) setPackageRule(null)
        return
      }
      try {
        const res = await fetch(`/api/public/packages?name=${encodeURIComponent(t)}`)
        const j = await res.json()
        if (active && j?.success && Array.isArray(j?.data) && j.data[0]?.advanceRule) {
          setPackageRule({
            percent: Number(j.data[0].advanceRule.percent) || 0,
            minRupees: Number(j.data[0].advanceRule.minRupees) || 0,
          })
        } else if (active) {
          setPackageRule(null)
        }
      } catch {
        if (active) setPackageRule(null)
      }
    }
    loadRule()
    return () => {
      active = false
    }
  }, [effectivePackage, open])

  const computeAdvance = (monthlyRent: number) => {
    const r = Number(monthlyRent) || 0
    if (packageRule) {
      const pct = Math.max(0, Number(packageRule.percent) || 0)
      const minRs = Math.max(0, Number(packageRule.minRupees) || 0)
      const byPercent = Math.floor(r * (pct / 100))
      return Math.max(byPercent, minRs)
    }
    return Math.floor(r * 0.3)
  }

  const displayPackage = (tier?: string) => {
    const t = (tier || "").trim()
    if (!t) return "Silver"
    return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }

  useEffect(() => {
    if (open) {
      setFormData({
        name: "",
        email: "",
        mobileNumber: "",
        checkInDate: "",
        totalAmount: rent,
        advanceAmount: computeAdvance(rent),
      })
      setLoading(false)
      setNotification({ type: "error", message: "", show: false })
    }
  }, [open, rent, roomId, bedId, effectivePackage, packageRule])

  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification((prev) => ({ ...prev, show: false }))
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [notification.show])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      setNotification({
        type: "error",
        message: "Please enter your full name",
        show: true,
      })
      return
    }

    if (!formData.email.trim()) {
      setNotification({
        type: "error",
        message: "Please enter your email address",
        show: true,
      })
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setNotification({
        type: "error",
        message: "Please enter a valid email address",
        show: true,
      })
      return
    }

    if (!formData.mobileNumber.trim()) {
      setNotification({
        type: "error",
        message: "Please enter your mobile number",
        show: true,
      })
      return
    }

    const phoneRegex = /^[0-9]{10}$/
    if (!phoneRegex.test(formData.mobileNumber)) {
      setNotification({
        type: "error",
        message: "Please enter a valid 10-digit mobile number",
        show: true,
      })
      return
    }

    if (!formData.checkInDate) {
      setNotification({
        type: "error",
        message: "Please select your check-in date",
        show: true,
      })
      return
    }

    try {
      setLoading(true)

      const submissionData = {
        name: formData.name,
        email: formData.email,
        mobileNumber: formData.mobileNumber,
        checkInDate: formData.checkInDate,
        totalAmount: formData.totalAmount,
        advanceAmount: formData.advanceAmount,
        propertyId,
        roomId,
        bedId,
        bookingSource: "frontend",
      }

      console.log("[v0] Submitting booking data:", submissionData)

      const response = await fetch("/api/frontend/booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      })

      const result = await response.json()
      console.log("[v0] API response:", result)

      if (response.ok && result.success) {
        setNotification({
          type: "success",
          message:
            "Your booking request is submitted. One of our executives will contact you for further process. In case of Urgent Booking Do call us on +91-9662347192",
          show: true,
        })

        setTimeout(() => {
          onClose()
        }, 3000)
      } else {
        setNotification({
          type: "error",
          message: result.error || "Please login",
          show: true,
        })
      }
    } catch (error) {
      console.error("[v0] Booking submission error:", error)
      setNotification({
        type: "error",
        message: "Please login",
        show: true,
      })
    } finally {
      setLoading(false)
    }
  }

  const formatINR = (amount: number) => {
    if (typeof amount !== "number" || isNaN(amount)) {
      return "0"
    }
    return amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })
  }

  return (
    <>
      <Drawer open={open} onOpenChange={onClose} direction="right">
        <DrawerContent className="h-full w-[400px] max-w-[90vw] flex flex-col ml-auto bg-white/95 backdrop-blur-sm border-l shadow-xl">
          <DrawerHeader className="flex items-center justify-between border-b pb-4 flex-shrink-0">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <DrawerTitle className="text-lg font-semibold text-gray-900">Book Now</DrawerTitle>
                <p className="text-sm text-gray-600">
                  {roomName} • {propertyName}
                </p>
              </div>
            </div>
            <DrawerClose asChild>
              <Button variant="ghost" size="sm">
                <X className="w-4 h-4" />
              </Button>
            </DrawerClose>
          </DrawerHeader>

          <div className="flex-1 p-4 overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Booking Summary */}
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h3 className="font-semibold text-purple-900 mb-2">Booking Summary</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-purple-700">Property Name:</span>
                    <span className="font-medium text-purple-900">{propertyName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-700">Room Name:</span>
                    <span className="font-medium text-purple-900">{roomName} </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-700">Monthly Rent:</span>
                    <span className="font-medium text-purple-900">₹{formatINR(rent)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-700">Booking Amount:</span>
                    <span className="font-medium text-purple-900">₹{formatINR(formData.advanceAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Personal Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Personal Details</h3>

                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email address"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mobileNumber">Mobile Number *</Label>
                  <Input
                    id="mobileNumber"
                    name="mobileNumber"
                    type="tel"
                    value={formData.mobileNumber}
                    onChange={handleInputChange}
                    placeholder="Enter your 10-digit mobile number"
                    maxLength="10"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="checkInDate">Preferred Check-in Date *</Label>
                  <DatePicker
                    id="checkInDate"
                    value={formData.checkInDate}
                    onChange={(date) => setFormData((prev) => ({ ...prev, checkInDate: date }))}
                    min={new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>
              </div>
            </form>
          </div>

          <div className="p-4 border-t bg-gray-50 flex-shrink-0">
            <Button
              onClick={handleSubmit}
              className="w-full bg-[#2e057f] hover:bg-[#2e057f]/90 text-white"
              disabled={loading}
            >
              {loading ? "Submitting..." : "SUBMIT BOOKING REQUEST"}
            </Button>
          </div>
        </DrawerContent>
      </Drawer>

     {notification.show && (
  <div className="fixed bottom-4 right-4 z-[9999] animate-in fade-in slide-in-from-bottom-2 duration-300">
    <div
      className={`flex items-start gap-3 px-4 py-3 rounded-lg shadow-lg border ${
        notification.type === "error"
          ? "bg-red-50 border-red-200 text-red-800"
          : "bg-green-50 border-green-200 text-green-800"
      } max-w-sm`}
    >
      {notification.type === "error" ? (
        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
      ) : (
        <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
      )}

      <div className="flex-1">
        <p className="text-sm font-medium">{notification.message}</p>
      </div>
    </div>
  </div>
)}

    </>
  )
}

export default BedBookingForm
