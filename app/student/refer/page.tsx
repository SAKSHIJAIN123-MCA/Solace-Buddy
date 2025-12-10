"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function ReferPage() {
  const [refUrl, setRefUrl] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [referrals, setReferrals] = useState<any[]>([])

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/student/auth/me")
        const data = await res.json()
        if (!data?.authenticated) {
          window.location.href = "/signin"
          return
        }
        setRefUrl(`${window.location.origin}/signup?ref=${data.student._id}`)
      } catch {
        setError("Unable to load referral link")
      }
    }
    load()
  }, [])

  useEffect(() => {
    async function loadReferrals() {
      try {
        const res = await fetch("/api/referrals")
        const data = await res.json()
        if (data?.referrals) {
          setReferrals(data.referrals)
        }
      } catch {
        // ignore errors for now
      }
    }
    loadReferrals()
  }, [])

  const canCopy = useMemo(() => Boolean(refUrl), [refUrl])

  return (
    <main className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-balance">Your referral link</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          {error ? <p className="text-red-600">{error}</p> : null}
          <div className="flex items-center gap-2">
            <input className="flex-1 border rounded-md h-10 px-3" readOnly value={refUrl} aria-label="Referral link" />
            <Button
              onClick={async () => {
                if (!refUrl) return
                await navigator.clipboard.writeText(refUrl)
              }}
              disabled={!canCopy}
            >
              Copy
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">Share this link with friends to invite them to sign up.</p>
        </CardContent>
      </Card>

      {referrals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-balance">My Referrals</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr className="text-left">
                    <th className="px-4 py-3">Registered At</th>
                    <th className="px-4 py-3">Student Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">College</th>
                    <th className="px-4 py-3">Course/Year</th>
                  </tr>
                </thead>
                <tbody>
                  {referrals.map((r) => (
                    <tr key={r._id} className="border-t">
                      <td className="px-4 py-3">{new Date(r.createdAt).toLocaleString()}</td>
                      <td className="px-4 py-3">{r.referred?.name || "-"}</td>
                      <td className="px-4 py-3">{r.referred?.email || "-"}</td>
                      <td className="px-4 py-3">{r.referred?.phone || "-"}</td>
                      <td className="px-4 py-3">{r.referred?.college || "-"}</td>
                      <td className="px-4 py-3">
                        {r.referred?.course || "-"} {r.referred?.year ? ` / ${r.referred?.year}` : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </main>
  )
}
