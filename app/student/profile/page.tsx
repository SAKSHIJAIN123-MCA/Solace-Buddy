"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

interface Student {
  _id: string
  name: string
  email: string
  phone: string
}

export default function ProfilePage() {
  const [student, setStudent] = useState<Student | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/student/profile")
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Failed to fetch profile")

      setStudent(data.student)
      setProfileForm({
        name: data.student.name,
        email: data.student.email,
        phone: data.student.phone,
      })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdating(true)
    setError(null)
    setSuccess(null)

    try {
      const res = await fetch("/api/student/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileForm),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Failed to update profile")

      setStudent(data.student)
      setSuccess("Profile updated successfully!")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUpdating(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setChangingPassword(true)
    setError(null)
    setSuccess(null)

    try {
      const res = await fetch("/api/student/change-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passwordForm),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Failed to change password")

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
      setSuccess("Password changed successfully!")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setChangingPassword(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black">Profile Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account information and security</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800">{success}</p>
        </div>
      )}

      {/* Profile Update Section */}
      <Card className="mb-8 border-gray-200">
        <CardHeader>
          <CardTitle className="text-black">Profile Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-black font-medium">
                Name *
              </Label>
              <Input
                id="name"
                type="text"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="mt-1 border-gray-300 focus:border-black focus:ring-black"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-black font-medium">
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                className="mt-1 border-gray-300 focus:border-black focus:ring-black"
                placeholder="Enter your email address"
                required
              />
            </div>

            <div>
              <Label htmlFor="phone" className="text-black font-medium">
                Phone *
              </Label>
              <Input
                id="phone"
                type="tel"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                className="mt-1 border-gray-300 focus:border-black focus:ring-black"
                placeholder="Enter your phone number"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={updating}
              className="w-full bg-black text-white hover:bg-gray-800 focus:ring-black"
            >
              {updating ? "Updating..." : "Update Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Separator className="my-8 bg-gray-200" />

      {/* Password Change Section */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-black">Change Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <Label htmlFor="currentPassword" className="text-black font-medium">
                Current Password *
              </Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                className="mt-1 border-gray-300 focus:border-black focus:ring-black"
                placeholder="Enter your current password"
                required
              />
            </div>

            <div>
              <Label htmlFor="newPassword" className="text-black font-medium">
                New Password *
              </Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="mt-1 border-gray-300 focus:border-black focus:ring-black"
                placeholder="Enter your new password"
                minLength={6}
                required
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="text-black font-medium">
                Confirm New Password *
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                className="mt-1 border-gray-300 focus:border-black focus:ring-black"
                placeholder="Confirm your new password"
                minLength={6}
                required
              />
            </div>

            <Button
              type="submit"
              disabled={changingPassword}
              className="w-full bg-black text-white hover:bg-gray-800 focus:ring-black"
            >
              {changingPassword ? "Changing Password..." : "Change Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
