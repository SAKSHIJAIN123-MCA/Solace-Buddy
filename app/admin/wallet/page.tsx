"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Plus, WalletIcon, Pencil, Trash } from "lucide-react"

type StudentLite = {
  _id: string
  name: string
  email?: string
  phone?: string
  college?: string
  course?: string
  year?: string
}

type PaymentRow = {
  _id: string
  type: "credit" | "debit"
  amount: number
  note?: string
  createdAt: string
  student: StudentLite
}

export default function AdminWalletPage() {
  const { toast } = useToast()
  const [payments, setPayments] = useState<PaymentRow[]>([])
  const [students, setStudents] = useState<StudentLite[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<PaymentRow | null>(null) // track editing payment
  const [errorDialog, setErrorDialog] = useState<{ open: boolean; title: string; message: string }>({
    open: false,
    title: "",
    message: "",
  })
  const [form, setForm] = useState<{ student: string; type: "credit" | "debit" | ""; amount: string; note: string }>({
    student: "",
    type: "",
    amount: "",
    note: "",
  })

  const totalCredits = useMemo(
    () => payments.reduce((sum, p) => sum + (p.type === "credit" ? p.amount : 0), 0),
    [payments],
  )
  const totalDebits = useMemo(
    () => payments.reduce((sum, p) => sum + (p.type === "debit" ? p.amount : 0), 0),
    [payments],
  )

  useEffect(() => {
    fetchPayments()
    fetchStudents()
  }, [])

  async function fetchPayments() {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/payments")
      const json = await res.json()
      if (json.success) {
        setPayments(json.data)
      } else {
        toast({ title: "Error", description: json.error || "Failed to fetch payments", variant: "destructive" })
      }
    } catch (e) {
      toast({ title: "Error", description: "Failed to fetch payments", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  async function fetchStudents() {
    try {
      // same as add-booking page (fetch from /api/students)
      const res = await fetch("/api/students?limit=1000")
      const json = await res.json()
      if (json.success) {
        setStudents(json.data)
      }
    } catch (e) {
      // no-op
    }
  }

  function resetForm() {
    setForm({ student: "", type: "", amount: "", note: "" })
    setEditing(null) // clear editing
  }

  async function onSubmit() {
    if (!form.student || !form.type || !form.amount) {
      toast({ title: "Validation", description: "Please fill all required fields", variant: "destructive" })
      return
    }
    const amountNum = Number(form.amount)
    if (Number.isNaN(amountNum) || amountNum < 0) {
      toast({ title: "Validation", description: "Amount must be non-negative number", variant: "destructive" })
      return
    }

    try {
      const url = editing ? `/api/admin/payments/${editing._id}` : "/api/admin/payments"
      const method = editing ? "PUT" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student: form.student, type: form.type, amount: amountNum, note: form.note }),
      })
      const json = await res.json()
      if (json.success || json.payment) {
        toast({ title: "Success", description: editing ? "Payment updated" : "Payment added" })
        setOpen(false)
        resetForm()
        fetchPayments()
      } else {
        const errorMessage = json.error || "Failed to save payment"
        const isInsufficientBalance = errorMessage.includes("Insufficient balance")

        if (isInsufficientBalance) {
          setErrorDialog({
            open: true,
            title: "Insufficient Balance",
            message: errorMessage,
          })
        } else {
          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive",
          })
        }
      }
    } catch (e) {
      toast({ title: "Error", description: "Failed to save payment", variant: "destructive" })
    }
  }

  function onEdit(p: PaymentRow) {
    setEditing(p)
    setForm({
      student: p.student?._id || "",
      type: p.type,
      amount: String(p.amount),
      note: p.note || "",
    })
    setOpen(true)
  }

  async function onDelete(id: string) {
    const ok = window.confirm("Delete this payment?")
    if (!ok) return
    try {
      const res = await fetch(`/api/admin/payments/${id}`, { method: "DELETE" })
      const json = await res.json()
      if (json.ok) {
        toast({ title: "Deleted", description: "Payment removed" })
        fetchPayments()
      } else {
        toast({ title: "Error", description: json.error || "Failed to delete", variant: "destructive" })
      }
    } catch {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Wallet</h1>
          <p className="text-muted-foreground">View and manage wallet transactions</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Payment
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
            <CardDescription>All time credited</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-green-600">₹{totalCredits.toLocaleString()}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Debits</CardTitle>
            <CardDescription>All time debited</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-red-600">₹{totalDebits.toLocaleString()}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-medium">Balance</CardTitle>
                <CardDescription>Credits - Debits</CardDescription>
              </div>
              <WalletIcon className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="text-2xl font-bold">₹{(totalCredits - totalDebits).toLocaleString()}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payments</CardTitle>
          <CardDescription>All wallet transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading payments...</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Note</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead> {/* actions column */}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((p) => (
                    <TableRow key={p._id}>
                      <TableCell>
                        <div className="font-medium">{p.student?.name || "-"}</div>
                        <div className="text-xs text-muted-foreground">{p.student?.email}</div>
                      </TableCell>
                      <TableCell className={p.type === "credit" ? "text-green-600" : "text-red-600"}>
                        {p.type}
                      </TableCell>
                      <TableCell>₹{p.amount.toLocaleString()}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{p.note || "-"}</TableCell>
                      <TableCell className="text-sm">{new Date(p.createdAt).toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => onEdit(p)}>
                            <Pencil className="h-4 w-4 mr-1" /> Edit
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => onDelete(p._id)}>
                            <Trash className="h-4 w-4 mr-1" /> Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {payments.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                        No payments yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v)
          if (!v) resetForm()
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Payment" : "Add Payment"}</DialogTitle> {/* dynamic title */}
            <DialogDescription>
              {editing ? "Update wallet transaction" : "Credit or debit a student wallet"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Student</Label>
              <Select value={form.student} onValueChange={(v) => setForm((f) => ({ ...f, student: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a student from the list" />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {students.map((s) => (
                    <SelectItem key={s._id} value={s._id}>
                      <div className="flex flex-col py-1">
                        <span className="font-medium text-base">{s.name}</span>
                        <span className="text-xs text-muted-foreground">{s.email}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v: "credit" | "debit") => setForm((f) => ({ ...f, type: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit">Credit</SelectItem>
                  <SelectItem value="debit">Debit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Amount (₹)</Label>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                placeholder="e.g. 20"
              />
            </div>

            <div className="space-y-2">
              <Label>Note (optional)</Label>
              <Input
                value={form.note}
                onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                placeholder="Reason or comment"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setOpen(false)
                  resetForm()
                }}
              >
                Cancel
              </Button>
              <Button onClick={onSubmit}>{editing ? "Update" : "Save"}</Button> {/* dynamic CTA */}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={errorDialog.open} onOpenChange={(open) => setErrorDialog((prev) => ({ ...prev, open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">⚠️ {errorDialog.title}</AlertDialogTitle>
            <AlertDialogDescription className="text-base">{errorDialog.message}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setErrorDialog((prev) => ({ ...prev, open: false }))}>
              Understood
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
