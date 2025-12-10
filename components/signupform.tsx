"use client"

import type React from "react"
import { useEffect, useMemo, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type CityItem = string | { id?: string; name?: string; value?: string }

export default function SignupPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const ref = searchParams.get("ref") || undefined

  // Step management: "form" -> "otp" -> "success"
  const [step, setStep] = useState<"form" | "otp" | "success">("form")

  const [form, setForm] = useState({
    name: "",
    email: "",
    city: "",
    phone: "",
    password: "",
  })

  // Popular cities state
  const [cities, setCities] = useState<CityItem[]>([])
  const [loadingCities, setLoadingCities] = useState(true)

  // Submit / error loading states
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // OTP states
  const [otp, setOtp] = useState("")
  const [otpLoading, setOtpLoading] = useState(false)
  const [otpError, setOtpError] = useState<string | null>(null)

  const disabled = useMemo(() => {
    return !form.name || !form.email || !form.city || !form.phone || !form.password
  }, [form])

  useEffect(() => {
    fetchPopularCities()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchPopularCities = async () => {
    try {
      const response = await fetch("/api/popular-cities")
      const data = await response.json()
      if (data?.success) {
        setCities(data.data || [])
      } else if (Array.isArray(data)) {
        setCities(data)
      }
    } catch (error) {
      console.error("Failed to fetch popular cities:", error)
    } finally {
      setLoadingCities(false)
    }
  }

  function normalizeCityLabel(item: CityItem) {
    if (typeof item === "string") return item
    return item?.name || item?.value || ""
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const payload = {
        name: form.name,
        email: form.email,
        city: form.city,
        phone: form.phone,
        password: form.password,
        ref,
      }

      const res = await fetch("/api/student/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Registration failed")

      setStep("otp")
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
        body: JSON.stringify({ email: form.email, code: otp }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Verification failed")

      setStep("success")
      // Redirect to dashboard after a short delay
      setTimeout(() => router.push("/student/dashboard"), 900)
    } catch (err: any) {
      setOtpError(err.message)
    } finally {
      setOtpLoading(false)
    }
  }

  async function resendOTP() {
    try {
      setOtpLoading(true)
      setOtpError(null)
      const res = await fetch("/api/student/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, purpose: "register" }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Failed to resend OTP")
    } catch (e: any) {
      setOtpError(e.message)
    } finally {
      setOtpLoading(false)
    }
  }

  return (
    <main className="container mx-auto px-4 py-12 min-h-screen relative overflow-hidden bg-[url('/back2.png')] bg-cover bg-center">
      <section className="mx-auto max-w-3xl rounded-2xl border bg-background shadow-lg overflow-hidden relative z-10">
        <div className="p-8 md:p-10 bg-gray-100">
          <header className="mb-7">
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-balance">Create your account</h1>
            <p className="text-muted-foreground mt-2">Register with your details to continue.</p>
          </header>

          {step === "form" && (
            <form onSubmit={onSubmit} className="grid grid-cols-1 gap-5">
              <div>
                <Label htmlFor="name" className="text-base text-foreground/80 font-medium">
                  Name
                </Label>
                <Input
                  id="name"
                  className="h-12 rounded-xl text-base"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  autoComplete="name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-base text-foreground/80 font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  className="h-12 rounded-xl text-base"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  autoComplete="email"
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone" className="text-base text-foreground/80 font-medium">
                  Mobile Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  className="h-12 rounded-xl text-base"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+91 9876543210"
                  autoComplete="tel"
                  required
                />
              </div>

              <div>
                <Label className="text-base text-foreground/80 font-medium">City</Label>
                <Select
                  value={form.city}
                  onValueChange={(val) => setForm({ ...form, city: val })}
                  disabled={loadingCities}
                >
                  <SelectTrigger className="h-12 rounded-xl text-base">
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

              <div>
                <Label htmlFor="password" className="text-base text-foreground/80 font-medium">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  className="h-12 rounded-xl text-base"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  autoComplete="new-password"
                  placeholder="Enter a strong password"
                  required
                />
              </div>

              {error ? (
                <p className="text-red-600 text-base" role="alert" aria-live="polite">
                  {error}
                </p>
              ) : null}

              <div className="mt-1 flex items-center justify-between">
                <p className="text-base text-muted-foreground">
                  Already have an account?{" "}
                  <Link className="text-primary underline underline-offset-4 font-medium" href="/signin">
                    Log In
                  </Link>
                </p>
                <Button
                  type="submit"
                  disabled={loading || disabled}
                  className="rounded-full px-10 h-12 bg-[#2E057F] hover:bg-emerald-800 text-base font-medium"
                >
                  {loading ? "Creating..." : "Continue"}
                </Button>
              </div>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={onVerifyOTP} className="grid gap-5 rounded-xl border bg-card p-4">
              <div className="grid gap-2">
                <Label htmlFor="otpEmail" className="text-sm font-medium">
                  Email
                </Label>
                <Input id="otpEmail" type="email" value={form.email} disabled className="h-11 rounded-xl" />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="otpCode" className="text-sm font-medium">
                  Email OTP
                </Label>
                <Input
                  id="otpCode"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
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

              <div className="flex items-center justify-between">
                <Button
                  type="button"
                  onClick={resendOTP}
                  disabled={otpLoading}
                  variant="secondary"
                  className="h-11 rounded-xl"
                >
                  Resend OTP
                </Button>
                <Button
                  disabled={otpLoading}
                  type="submit"
                  className="h-11 rounded-xl bg-[#300b7a] text-white transition hover:bg-teal-700"
                >
                  {otpLoading ? "Verifying..." : "Verify & Finish"}
                </Button>
              </div>
            </form>
          )}

          {step === "success" && (
            <div className="rounded-xl border bg-card p-6 text-center">
              <h2 className="text-xl font-semibold">Success!</h2>
              <p className="mt-2 text-muted-foreground">Your account is verified. Redirecting to your dashboard...</p>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
