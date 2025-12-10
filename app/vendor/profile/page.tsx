"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Loader2, User, Mail, Phone, Lock, Building2 } from "lucide-react"
import { useVendor } from "@/components/vendor-auth-provider"

interface ProfileData {
  name: string
  ownerName: string
  email: string
  phone: string
}

interface ProfileErrors {
  name?: string
  ownerName?: string
  email?: string
  phone?: string
}

interface PasswordErrors {
  currentPassword?: string
  newPassword?: string
  confirmPassword?: string
}

export default function VendorProfilePage() {
  const { toast } = useToast()
  const { vendor } = useVendor()

  const [profileData, setProfileData] = useState<ProfileData>({
    name: "",
    ownerName: "",
    email: "",
    phone: "",
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [profileLoading, setProfileLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)
  const [profileErrors, setProfileErrors] = useState<ProfileErrors>({})
  const [passwordErrors, setPasswordErrors] = useState<PasswordErrors>({})

  // Fetch profile data on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/vendor/profile", {
          method: "GET",
          credentials: "include",
        })

        const result = await response.json()

        if (result.success) {
          setProfileData(result.data)
        } else {
          toast({
            title: "Error",
            description: "Failed to load profile data",
            variant: "destructive",
          })
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        })
      } finally {
        setDataLoading(false)
      }
    }

    if (vendor) {
      fetchProfile()
    }
  }, [vendor, toast])

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileLoading(true)
    setProfileErrors({})

    try {
      const response = await fetch("/api/vendor/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(profileData),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Success",
          description: "Profile updated successfully",
        })
        setProfileData(result.data)
      } else {
        if (result.errors) {
          setProfileErrors(result.errors)
        }
        toast({
          title: "Error",
          description: result.message || "Failed to update profile",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setProfileLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordLoading(true)
    setPasswordErrors({})

    try {
      const response = await fetch("/api/vendor/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(passwordData),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Success",
          description: "Password changed successfully",
        })
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        })
      } else {
        if (result.errors) {
          setPasswordErrors(result.errors)
        }
        toast({
          title: "Error",
          description: result.message || "Failed to change password",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to change password",
        variant: "destructive",
      })
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleProfileChange = (field: keyof ProfileData, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }))
    if (profileErrors[field]) {
      setProfileErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const handlePasswordChange = (field: keyof typeof passwordData, value: string) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }))
    if (passwordErrors[field as keyof PasswordErrors]) {
      setPasswordErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-gray-900 mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center">
          <Building2 className="mx-auto h-12 w-12 text-gray-900 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Vendor Profile</h1>
          <p className="text-gray-600 mt-2">Manage your account information and security</p>
        </div>

        {/* Profile Update Section */}
        <Card className="border-gray-200">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="text-gray-900">Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-900">
                    Business Name *
                  </Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => handleProfileChange("name", e.target.value)}
                      placeholder="Enter business name"
                      className="pl-10 border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                    />
                  </div>
                  {profileErrors.name && <p className="text-red-600 text-sm">{profileErrors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ownerName" className="text-gray-900">
                    Owner Name *
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="ownerName"
                      value={profileData.ownerName}
                      onChange={(e) => handleProfileChange("ownerName", e.target.value)}
                      placeholder="Enter owner name"
                      className="pl-10 border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                    />
                  </div>
                  {profileErrors.ownerName && <p className="text-red-600 text-sm">{profileErrors.ownerName}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-900">
                    Email Address *
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => handleProfileChange("email", e.target.value)}
                      placeholder="Enter email address"
                      className="pl-10 border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                    />
                  </div>
                  {profileErrors.email && <p className="text-red-600 text-sm">{profileErrors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-gray-900">
                    Phone Number *
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) => handleProfileChange("phone", e.target.value)}
                      placeholder="Enter phone number"
                      className="pl-10 border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                    />
                  </div>
                  {profileErrors.phone && <p className="text-red-600 text-sm">{profileErrors.phone}</p>}
                </div>
              </div>

              <Button
                type="submit"
                disabled={profileLoading}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white"
              >
                {profileLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Profile
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Password Change Section */}
        <Card className="border-gray-200">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="text-gray-900">Change Password</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="text-gray-900">
                  Current Password *
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => handlePasswordChange("currentPassword", e.target.value)}
                    placeholder="Enter current password"
                    className="pl-10 border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                  />
                </div>
                {passwordErrors.currentPassword && (
                  <p className="text-red-600 text-sm">{passwordErrors.currentPassword}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-gray-900">
                    New Password *
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
                      placeholder="Enter new password"
                      className="pl-10 border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                    />
                  </div>
                  {passwordErrors.newPassword && <p className="text-red-600 text-sm">{passwordErrors.newPassword}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-gray-900">
                    Confirm New Password *
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
                      placeholder="Confirm new password"
                      className="pl-10 border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                    />
                  </div>
                  {passwordErrors.confirmPassword && (
                    <p className="text-red-600 text-sm">{passwordErrors.confirmPassword}</p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                disabled={passwordLoading}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white"
              >
                {passwordLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Change Password
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
