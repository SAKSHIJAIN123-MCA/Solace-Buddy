import { NextResponse } from "next/server"
import mongoose from "mongoose"
import Payment from "@/lib/models/payment"
import Student from "@/lib/models/student"
import { connectDB } from "@/lib/db"

export async function GET() {
  try {
    await connectDB()
    const payments = await Payment.find({})
      .populate({ path: "student", model: Student, select: "name email phone college course year" })
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({ success: true, data: payments })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch payments" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    await connectDB()
    const body = await req.json()
    const { student, type, amount, note } = body

    if (!student || !type || typeof amount === "undefined") {
      return NextResponse.json({ success: false, error: "student, type and amount are required" }, { status: 400 })
    }
    if (!["credit", "debit"].includes(type)) {
      return NextResponse.json({ success: false, error: "type must be credit or debit" }, { status: 400 })
    }
    const parsedAmount = Number(amount)
    if (Number.isNaN(parsedAmount) || parsedAmount < 0) {
      return NextResponse.json({ success: false, error: "amount must be a non-negative number" }, { status: 400 })
    }

    // ensure student exists
    const exists = await Student.findById(new mongoose.Types.ObjectId(String(student))).lean()
    if (!exists) {
      return NextResponse.json({ success: false, error: "Student not found" }, { status: 404 })
    }

    if (type === "debit") {
      const [balanceAgg] = await Payment.aggregate([
        { $match: { student: new mongoose.Types.ObjectId(String(student)) } },
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
      if (currentBalance < parsedAmount) {
        return NextResponse.json(
          {
            success: false,
            error: `Insufficient balance. Current balance: ₹${currentBalance}, Debit amount: ₹${parsedAmount}`,
          },
          { status: 400 },
        )
      }
    }

    const created = await Payment.create({ student, type, amount: parsedAmount, note })
    return NextResponse.json({ success: true, data: created })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to add payment" }, { status: 500 })
  }
}
