import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import Payment from "@/lib/models/payment"
import Student from "@/lib/models/student"
import mongoose from "mongoose"

type Params = { params: { id: string } }

export async function PUT(req: Request, { params }: Params) {
  try {
    const { id } = params
    const body = await req.json()
    const { studentId, type, amount, note } = body || {}

    await connectDB()

    const currentPayment = await Payment.findById(id).lean()
    if (!currentPayment) return NextResponse.json({ error: "Payment not found" }, { status: 404 })

    const update: any = {}
    let targetStudentId = currentPayment.student

    if (studentId) {
      const exists = await Student.findById(studentId).lean()
      if (!exists) return NextResponse.json({ error: "Student not found" }, { status: 404 })
      update.student = studentId
      targetStudentId = new mongoose.Types.ObjectId(String(studentId))
    }
    if (type) {
      if (!["credit", "debit"].includes(type)) {
        return NextResponse.json({ error: "type must be 'credit' or 'debit'" }, { status: 400 })
      }
      update.type = type
    }
    if (typeof amount === "number") update.amount = amount
    if (typeof note === "string") update.note = note

    const newType = type || currentPayment.type
    const newAmount = typeof amount === "number" ? amount : currentPayment.amount

    if (newType === "debit") {
      // Calculate balance excluding current payment
      const [balanceAgg] = await Payment.aggregate([
        {
          $match: {
            student: targetStudentId,
            _id: { $ne: new mongoose.Types.ObjectId(String(id)) }, // exclude current payment
          },
        },
        {
          $group: {
            _id: "$student",
            credits: { $sum: { $cond: [{ $eq: ["$type", "credit"] }, "$amount", 0] } },
            debits: { $sum: { $cond: [{ $eq: ["$type", "debit"] }, "$amount", 0] } },
          },
        },
        { $project: { _id: 0, balance: { $subtract: ["$credits", "$debits"] } } },
      ])

      const currentBalance = balanceAgg?.balance || 0
      if (currentBalance < newAmount) {
        return NextResponse.json(
          {
            error: `Insufficient balance. Available balance: ₹${currentBalance}, Debit amount: ₹${newAmount}`,
          },
          { status: 400 },
        )
      }
    }

    const updated = await Payment.findByIdAndUpdate(id, update, { new: true }).populate({
      path: "student",
      select: "name email phone college course year status",
    })
    if (!updated) return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    return NextResponse.json({ payment: updated })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to update payment" }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { id } = params
    await connectDB()
    const deleted = await Payment.findByIdAndDelete(id)
    if (!deleted) return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to delete payment" }, { status: 500 })
  }
}
