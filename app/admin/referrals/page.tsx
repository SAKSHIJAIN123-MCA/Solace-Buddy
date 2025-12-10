"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"

type StudentLite = {
  _id: string
  name: string
  email: string
  phone: string
  college: string
  course: string
  year: string
  address: string
  parentContact: string
  status: string
  registrationDate?: string
  lastLogin?: string
  totalBookings?: number
  currentBooking?: string | null
  createdAt?: string
  updatedAt?: string
}

type ReferralItem = {
  _id: string
  createdAt: string
  referred: StudentLite | null
  referrer: StudentLite | null
}

export default function AdminReferralsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<ReferralItem[]>([])
  const [open, setOpen] = useState(false)
  const [selectedReferrer, setSelectedReferrer] = useState<StudentLite | null>(null)

  useEffect(() => {
    ;(async () => {
      try {
        setLoading(true)
        const res = await fetch("/api/admin/referrals", { cache: "no-store" })
        const data = await res.json()
        if (!res.ok) throw new Error(data?.error || "Failed to load")
        setItems(data.referrals || [])
      } catch (e: any) {
        setError(e.message || "Failed to load")
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const rows = useMemo(() => items, [items])

  return (
    <main className="container mx-auto px-4 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-balance">Referrals</h1>
        <Link href={"/admin/wallet"}>
        <Button>
         Wallet
        </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-balance">Referred registrations</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6">Loading...</div>
          ) : error ? (
            <div className="p-6 text-red-600">{error}</div>
          ) : rows.length === 0 ? (
            <div className="p-6 text-muted-foreground">No referrals yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr className="text-left">
                    <th className="px-4 py-3">Registered At</th>
                    <th className="px-4 py-3">Student (Referred)</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">College</th>
                    <th className="px-4 py-3">Course/Year</th>
                    <th className="px-4 py-3">Refer By</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r._id} className="border-t">
                      <td className="px-4 py-3">{new Date(r.createdAt).toLocaleString()}</td>
                      <td className="px-4 py-3">{r.referred?.name || "-"}</td>
                      <td className="px-4 py-3">{r.referred?.email || "-"}</td>
                      <td className="px-4 py-3">{r.referred?.phone || "-"}</td>
                      <td className="px-4 py-3">{r.referred?.college || "-"}</td>
                      <td className="px-4 py-3">
                        {r.referred?.course || "-"} {r.referred?.year ? ` / ${r.referred?.year}` : ""}
                      </td>
                      <td className="px-4 py-3">
                        {r.referrer ? (
                          <button
                            className="text-primary underline underline-offset-2"
                            onClick={() => {
                              setSelectedReferrer(r.referrer!)
                              setOpen(true)
                            }}
                          >
                            {r.referrer.name}
                          </button>
                        ) : (
                          "-"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Referrer details</DialogTitle>
          </DialogHeader>
          {selectedReferrer ? (
            <div className="space-y-3">
              <div>
                <p className="font-medium">{selectedReferrer.name}</p>
                <p className="text-muted-foreground">{selectedReferrer.email}</p>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-3">
                <Info label="Phone" value={selectedReferrer.phone} />
                <Info label="College" value={selectedReferrer.college} />
                <Info label="Course" value={selectedReferrer.course} />
                <Info label="Year" value={selectedReferrer.year} />
                <Info label="Status" value={selectedReferrer.status} />
                <Info label="Parent Contact" value={selectedReferrer.parentContact} />
                <Info label="Total Bookings" value={String(selectedReferrer.totalBookings ?? 0)} />
                <Info label="Current Booking" value={selectedReferrer.currentBooking || "-"} />
              </div>
              <Separator />
              <div>
                <p className="text-xs text-muted-foreground">
                  Joined:{" "}
                  {selectedReferrer.registrationDate
                    ? new Date(selectedReferrer.registrationDate).toLocaleString()
                    : "-"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Last Login: {selectedReferrer.lastLogin ? new Date(selectedReferrer.lastLogin).toLocaleString() : "-"}
                </p>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </main>
  )
}

function Info({ label, value }: { label: string; value?: string }) {
  return (
    <div className="text-sm">
      <p className="text-muted-foreground">{label}</p>
      <p className="font-medium">{value || "-"}</p>
    </div>
  )
}
