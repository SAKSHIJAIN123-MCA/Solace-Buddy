"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Wallet, CreditCard, Clock, CheckCircle, XCircle, IndianRupee } from "lucide-react"

type WalletRequest = {
  _id: string
  amount: number
  paymentMethod: "upi" | "bank_transfer"
  status: "pending" | "approved" | "rejected"
  note?: string
  adminNote?: string
  createdAt: string
}

type Payment = {
  _id: string
  type: "credit" | "debit"
  amount: number
  note?: string
  createdAt: string
}

type WalletData = {
  totalAmount: number
  requestedAmount: number
  pendingAmount: number
  payments: Payment[]
  requests: WalletRequest[]
}

export default function StudentWalletPage() {
  const { toast } = useToast()
  const [walletData, setWalletData] = useState<WalletData | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    amount: "",
    paymentMethod: "",
    note: "",
  })

  useEffect(() => {
    fetchWalletData()
  }, [])

  async function fetchWalletData() {
    try {
      setLoading(true)
      const res = await fetch("/api/student/wallet") // ✅ no studentId param
      const json = await res.json()
      if (json.success) {
        setWalletData(json.data)
      } else {
        toast({
          title: "Error",
          description: json.error || "Failed to fetch wallet data",
          variant: "destructive",
        })
      }
    } catch (e) {
      toast({ title: "Error", description: "Failed to fetch wallet data", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!form.amount || !form.paymentMethod) {
      toast({ title: "Validation", description: "Please fill all required fields", variant: "destructive" })
      return
    }

    const amountNum = Number(form.amount)
    if (Number.isNaN(amountNum) || amountNum < 1) {
      toast({ title: "Validation", description: "Amount must be a positive number", variant: "destructive" })
      return
    }

    try {
      setSubmitting(true)
      const res = await fetch("/api/wallet-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amountNum,
          paymentMethod: form.paymentMethod,
          note: form.note,
        }), // ✅ no studentId, server will use JWT
      })

      const json = await res.json()
      if (json.success) {
        toast({ title: "Success", description: "Wallet request submitted successfully" })
        setForm({ amount: "", paymentMethod: "", note: "" })
        fetchWalletData()
      } else {
        toast({ title: "Error", description: json.error || "Failed to submit request", variant: "destructive" })
      }
    } catch (e) {
      toast({ title: "Error", description: "Failed to submit request", variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "approved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading wallet data...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Wallet className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Wallet</h1>
          <p className="text-muted-foreground">Manage your wallet balance and requests</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <IndianRupee className="h-4 w-4" />
              Total Amount
            </CardTitle>
            <CardDescription>Current wallet balance</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-green-600">
            ₹{walletData?.totalAmount?.toLocaleString() || 0}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Requested Amount
            </CardTitle>
            <CardDescription>Pending requests total</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-yellow-600">
            ₹{walletData?.requestedAmount?.toLocaleString() || 0}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Pending Amount
            </CardTitle>
            <CardDescription>Awaiting approval</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-blue-600">
            ₹{walletData?.pendingAmount?.toLocaleString() || 0}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <IndianRupee className="h-4 w-4" />
              Debit Amount
            </CardTitle>
            <CardDescription>Available after requests</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-red-600">
            ₹{((walletData?.totalAmount || 0) - (walletData?.requestedAmount || 0)).toLocaleString()}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Request Wallet Amount</CardTitle>
          <CardDescription>Submit a request to add money to your wallet</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₹) *</Label>
                <Input
                  id="amount"
                  type="number"
                  min="1"
                  step="1"
                  value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                  placeholder="Enter amount"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Payment Method *</Label>
                <Select value={form.paymentMethod} onValueChange={(v) => setForm((f) => ({ ...f, paymentMethod: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">Note (Optional)</Label>
              <Textarea
                id="note"
                value={form.note}
                onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                placeholder="Any additional information..."
                rows={3}
              />
            </div>

            <Button type="submit" disabled={submitting} className="w-full md:w-auto">
              {submitting ? "Submitting..." : "Submit Request"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Wallet Requests */}
        <Card>
          <CardHeader>
            <CardTitle>My Requests</CardTitle>
            <CardDescription>Your wallet amount requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {walletData?.requests?.length ? (
                walletData.requests.map((request) => (
                  <div key={request._id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(request.status)}
                        <span className="font-medium">₹{request.amount.toLocaleString()}</span>
                      </div>
                      <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <div>Method: {request.paymentMethod === "upi" ? "UPI" : "Bank Transfer"}</div>
                      <div>Date: {new Date(request.createdAt).toLocaleDateString()}</div>
                      {request.note && <div>Note: {request.note}</div>}
                      {request.adminNote && (
                        <div className="mt-2 p-2 bg-blue-50 rounded text-blue-800">Admin Note: {request.adminNote}</div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">No requests yet</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Payment History */}
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
            <CardDescription>Credits and debits from admin</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {walletData?.payments?.length ? (
                walletData.payments.map((payment) => (
                  <div key={payment._id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {payment.type === "credit" ? (
                          <div className="h-2 w-2 bg-green-500 rounded-full" />
                        ) : (
                          <div className="h-2 w-2 bg-red-500 rounded-full" />
                        )}
                        <span className="font-medium">₹{payment.amount.toLocaleString()}</span>
                      </div>
                      <Badge
                        className={
                          payment.type === "credit" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }
                      >
                        {payment.type}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <div>Date: {new Date(payment.createdAt).toLocaleDateString()}</div>
                      {payment.note && <div className="mt-2 p-2 bg-gray-50 rounded">Admin Note: {payment.note}</div>}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">No payments yet</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
