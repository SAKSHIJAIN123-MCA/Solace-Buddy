import { NextResponse } from "next/server"
import mongoose from "mongoose"
import Payment from "@/lib/models/payment"
import WalletRequest from "@/lib/models/wallet-request"
import { connectDB } from "@/lib/db"

export async function GET(req: Request) {
  try {
    await connectDB()
    const { searchParams } = new URL(req.url)
    const studentId = searchParams.get("student")

    if (!studentId) {
      return NextResponse.json({ success: false, error: "student parameter is required" }, { status: 400 })
    }

    const studentObjectId = new mongoose.Types.ObjectId(String(studentId))

    // Get wallet balance
    const [balanceAgg] = await Payment.aggregate([
      { $match: { student: studentObjectId } },
      {
        $group: {
          _id: "$student",
          credits: { $sum: { $cond: [{ $eq: ["$type", "credit"] }, "$amount", 0] } },
          debits: { $sum: { $cond: [{ $eq: ["$type", "debit"] }, "$amount", 0] } },
        },
      },
      { $project: { _id: 0, balance: { $subtract: ["$credits", "$debits"] } } },
    ])

    const totalAmount = balanceAgg?.balance || 0

    // Get requested amount (pending requests)
    const [requestedAgg] = await WalletRequest.aggregate([
      { $match: { student: studentObjectId, status: "pending" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ])

    const requestedAmount = requestedAgg?.total || 0

    // Get payments (admin responses)
    const payments = await Payment.find({ student: studentObjectId }).sort({ createdAt: -1 }).lean()

    // Get wallet requests
    const requests = await WalletRequest.find({ student: studentObjectId }).sort({ createdAt: -1 }).lean()

    return NextResponse.json({
      success: true,
      data: {
        totalAmount,
        requestedAmount,
        pendingAmount: requestedAmount, // same as requested for now
        payments,
        requests,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch wallet data" }, { status: 500 })
  }
}
