"use client"

import type React from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export default function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  })

  useEffect(() => {
    if (!token) {
      setError("Invalid reset link")
    }
  }, [token])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!token) {
      setError("Invalid reset link")
      return
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/student/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: form.password }),
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data?.error || "Failed to reset password")

      setSuccess(true)
      setTimeout(() => {
        router.push("/signin")
      }, 2000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <main className="min-h-[50dvh] w-full px-4 py-6 md:py-6 bg-[url('/back2.png')]">
        <div className="mx-auto max-w-md">
          <Card>
            <CardContent className="p-6 text-center">
              <h1 className="text-xl font-semibold text-destructive mb-2">Invalid Reset Link</h1>
              <p className="text-muted-foreground mb-4">This password reset link is invalid or has expired.</p>
              <Link href="/forgot-password" className="text-[#2e057f] underline hover:text-teal-800">
                Request a new reset link
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-[50dvh] w-full px-4 py-6 md:py-6 bg-[url('/back2.png')]">
      <div className="mx-auto grid max-w-5xl grid-cols-1 overflow-hidden rounded-2xl border bg-background shadow-lg md:grid-cols-2">
        {/* Left: full-bleed hostel/PG image */}
        <div className="relative hidden md:block">
          <Image
            src="/hostel-pg.jpg"
            alt="Modern hostel/PG interior"
            fill
            priority
            className="object-cover"
            sizes="(max-width: 768px) 0px, 50vw"
          />
        </div>

        {/* Right: form side */}
        <div className="flex items-center">
          <Card className="w-full border-0 shadow-none">
            <CardContent className="mx-auto w-full max-w-md p-6 md:p-10">
              <div className="mb-6 text-center">
                <h1 className="text-pretty text-2xl font-semibold tracking-tight md:text-3xl">Reset Password</h1>
                <p className="mt-2 text-sm text-muted-foreground">Enter your new password below.</p>
              </div>

              {success ? (
                <div className="text-center">
                  <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4">
                    <p className="text-sm text-green-800">Password reset successfully! Redirecting to sign in...</p>
                  </div>
                </div>
              ) : (
                <form className="grid gap-4" onSubmit={onSubmit}>
                  <div className="grid gap-2">
                    <Label htmlFor="password" className="text-sm font-medium">
                      New Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="h-11 rounded-xl"
                      placeholder="••••••••"
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium">
                      Confirm New Password
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={form.confirmPassword}
                      onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                      className="h-11 rounded-xl"
                      placeholder="••••••••"
                      required
                    />
                  </div>

                  {error && (
                    <p className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                      {error}
                    </p>
                  )}

                  <Button
                    disabled={loading}
                    type="submit"
                    className="h-11 rounded-xl bg-[#300b7a] text-white transition hover:bg-teal-700"
                  >
                    {loading ? "Resetting..." : "Reset Password"}
                  </Button>
                </form>
              )}

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Remember your password?{" "}
                  <Link
                    href="/signin"
                    className="font-medium text-[#2e057f] underline underline-offset-4 hover:text-teal-800"
                  >
                    Sign In
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
