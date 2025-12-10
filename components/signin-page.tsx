"use client"

import type React from "react"
import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const verifyMode = searchParams.get("verify") === "1"
  const emailFromQuery = searchParams.get("email") || ""

  const [open, setOpen] = useState(true)
  const [form, setForm] = useState({ email: "", password: "" })
  const [otpEmail, setOtpEmail] = useState(emailFromQuery)
  const [otpCode, setOtpCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [otpLoading, setOtpLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [otpError, setOtpError] = useState<string | null>(null)

  useEffect(() => {
    if (emailFromQuery) setOtpEmail(emailFromQuery)
  }, [emailFromQuery])

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) {
      // Close popup -> go back or home
      if (window.history.length > 1) router.back()
      else router.push("/")
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/student/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Login failed")
      router.push("/student/dashboard")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function onVerifyOTP(e: React.FormEvent) {
    e.preventDefault()
    setOtpLoading(true)
    setOtpError(null)
    try {
      const res = await fetch("/api/student/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: otpEmail, code: otpCode }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Verification failed")
      router.push("/student/dashboard")
    } catch (err: any) {
      setOtpError(err.message)
    } finally {
      setOtpLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl p-0 overflow-hidden">
        <div className="p-6 md:p-8">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-pretty text-2xl font-semibold tracking-tight">
              {verifyMode ? "Verify Email" : "Sign In"}
            </DialogTitle>
            <DialogDescription className="text-sm">
              {verifyMode
                ? "Enter the code sent to your email to complete sign-in."
                : "Welcome back! Access your student dashboard."}
            </DialogDescription>
          </DialogHeader>

          {verifyMode ? (
            <>
              <form className="mb-4 grid gap-4" onSubmit={onVerifyOTP}>
                <div className="grid gap-2">
                  <Label htmlFor="otpEmail" className="text-sm font-medium">
                    Email
                  </Label>
                  <Input
                    id="otpEmail"
                    type="email"
                    value={otpEmail}
                    onChange={(e) => setOtpEmail(e.target.value)}
                    className="h-11 rounded-xl"
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="otpCode" className="text-sm font-medium">
                    Verification code
                  </Label>
                  <Input
                    id="otpCode"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="h-11 rounded-xl tracking-widest"
                    placeholder="6-digit code"
                    required
                  />
                </div>
                {otpError ? (
                  <p className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                    {otpError}
                  </p>
                ) : null}
                <Button
                  disabled={otpLoading}
                  type="submit"
                  className="h-11 rounded-xl bg-[#300b7a] text-white transition hover:bg-teal-700"
                >
                  {otpLoading ? "Verifying..." : "Verify & Sign In"}
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground">
                Prefer password?{" "}
                <Link
                  href="/signin"
                  className="font-medium text-[#2e057f] underline underline-offset-4 hover:text-teal-800"
                >
                  Go to Sign In
                </Link>
                .
              </p>
            </>
          ) : (
            <>
              <form className="grid gap-4" onSubmit={onSubmit}>
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email*
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="h-11 rounded-xl"
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Password*
                    </Label>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="h-11 rounded-xl"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                  />
                </div>

                {error ? (
                  <p className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                    {error}
                  </p>
                ) : null}

                <Button
                  disabled={loading}
                  type="submit"
                  className="h-11 rounded-xl bg-[#300b7a] text-white transition hover:bg-teal-700"
                >
                  {loading ? "Signing in..." : "Sign In"}
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/signup"
                    className="font-medium text-[#2e057f] underline underline-offset-4 hover:text-teal-800"
                  >
                    Sign Up
                  </Link>
                </div>

                  <div className="text-center text-sm text-muted-foreground">
               
                  <Link
                    href="/forgot-password"
                    className="font-medium text-[#2e057f] underline underline-offset-4 hover:text-teal-800"
                  >
                   Forgot Password
                  </Link>
                </div>
              </form>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
