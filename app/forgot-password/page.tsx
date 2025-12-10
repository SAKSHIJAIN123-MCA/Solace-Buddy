"use client"

import type React from "react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState("")

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      const res = await fetch("/api/student/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data?.error || "Failed to send reset email")

      setMessage(data.message)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
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
                <h1 className="text-pretty text-2xl font-semibold tracking-tight md:text-3xl">Forgot Password</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>

              {message ? (
                <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4">
                  <p className="text-sm text-green-800">{message}</p>
                </div>
              ) : (
                <form className="grid gap-4" onSubmit={onSubmit}>
                  <div className="grid gap-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-11 rounded-xl"
                      placeholder="you@example.com"
                      autoComplete="email"
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
                    {loading ? "Sending..." : "Send Reset Link"}
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
