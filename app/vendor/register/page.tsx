"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Building2, Mail, Phone, User, Lock } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useVendor } from "@/components/vendor-auth-provider"

export default function VendorRegisterPage() {
  const { toast } = useToast()
  const router = useRouter()
  const { login } = useVendor()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    ownerName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    businessType: "PG",
  })
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setFormErrors({}) // Clear previous errors

    try {
      const response = await fetch("/api/vendor-auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Registration Successful",
          description: "Welcome! Redirecting to your dashboard...",
        })
        login(result.data.vendor)
        router.push("/vendor")
      } else {
        if (result.errors) {
          setFormErrors(result.errors)
        }
        toast({
          title: "Registration Failed",
          description: result.message || "Something went wrong. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Client-side error:", error)
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
    // Clear error for the specific field when user starts typing
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <Building2 className="mx-auto h-12 w-12 text-blue-600" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Register as Vendor Partner</h2>
          <p className="mt-2 text-sm text-gray-600">Join our platform and start managing your properties</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Vendor Registration</CardTitle>
            <CardDescription>Fill in your business details to create your vendor account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Business Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Business Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Business Name *</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        placeholder="Enter business name"
                        className="pl-10"
                        aria-invalid={formErrors.name ? "true" : "false"}
                        aria-describedby="name-error"
                      />
                    </div>
                    {formErrors.name && (
                      <p id="name-error" className="text-red-500 text-sm mt-1">
                        {formErrors.name}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ownerName">Owner Name *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="ownerName"
                        value={formData.ownerName}
                        onChange={(e) => handleChange("ownerName", e.target.value)}
                        placeholder="Enter owner name"
                        className="pl-10"
                        aria-invalid={formErrors.ownerName ? "true" : "false"}
                        aria-describedby="ownerName-error"
                      />
                    </div>
                    {formErrors.ownerName && (
                      <p id="ownerName-error" className="text-red-500 text-sm mt-1">
                        {formErrors.ownerName}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        placeholder="Enter email address"
                        className="pl-10"
                        aria-invalid={formErrors.email ? "true" : "false"}
                        aria-describedby="email-error"
                      />
                    </div>
                    {formErrors.email && (
                      <p id="email-error" className="text-red-500 text-sm mt-1">
                        {formErrors.email}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleChange("phone", e.target.value)}
                        placeholder="+91 9876543210"
                        className="pl-10"
                        aria-invalid={formErrors.phone ? "true" : "false"}
                        aria-describedby="phone-error"
                      />
                    </div>
                    {formErrors.phone && (
                      <p id="phone-error" className="text-red-500 text-sm mt-1">
                        {formErrors.phone}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessType">Business Type *</Label>
                  <Select value={formData.businessType} onValueChange={(value) => handleChange("businessType", value)}>
                    <SelectTrigger
                      aria-invalid={formErrors.businessType ? "true" : "false"}
                      aria-describedby="businessType-error"
                    >
                      <SelectValue placeholder="Select business type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Hostel">Hostel</SelectItem>
                      <SelectItem value="PG">PG</SelectItem>
                      <SelectItem value="Both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                  {formErrors.businessType && (
                    <p id="businessType-error" className="text-red-500 text-sm mt-1">
                      {formErrors.businessType}
                    </p>
                  )}
                </div>
              </div>

              {/* Account Security */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Account Security</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => handleChange("password", e.target.value)}
                        placeholder="Enter password"
                        className="pl-10"
                        aria-invalid={formErrors.password ? "true" : "false"}
                        aria-describedby="password-error"
                      />
                    </div>
                    {formErrors.password && (
                      <p id="password-error" className="text-red-500 text-sm mt-1">
                        {formErrors.password}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleChange("confirmPassword", e.target.value)}
                        placeholder="Confirm password"
                        className="pl-10"
                        aria-invalid={formErrors.confirmPassword ? "true" : "false"}
                        aria-describedby="confirmPassword-error"
                      />
                    </div>
                    {formErrors.confirmPassword && (
                      <p id="confirmPassword-error" className="text-red-500 text-sm mt-1">
                        {formErrors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col space-y-4">
                <Button type="submit" disabled={loading} className="w-full">
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Vendor Account
                </Button>

                <div className="text-center">
                  <span className="text-sm text-gray-600">
                    Already have an account?{" "}
                    <Link href="/vendor/login" className="font-medium text-blue-600 hover:text-blue-500">
                      Sign in here
                    </Link>
                  </span>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
