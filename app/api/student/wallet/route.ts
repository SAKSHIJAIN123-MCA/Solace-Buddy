import { NextResponse } from "next/server"
import mongoose from "mongoose"
import Payment from "@/lib/models/payment"
import WalletRequest from "@/lib/models/wallet-request"
import { connectDB } from "@/lib/db"
import { getCurrentStudentFromCookie } from "@/lib/auth"

export async function GET() {
  try {
    // Get student from JWT cookie
    const student = await getCurrentStudentFromCookie()
    if (!student) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    await connectDB()
    const studentObjectId = new mongoose.Types.ObjectId(student._id)

    // Wallet balance aggregation
    const [balanceAgg] = await Payment.aggregate([
      { $match: { student: studentObjectId } },
      {
        $group: {
          _id: "$student",
          credits: {
            $sum: {
              $cond: [{ $eq: ["$type", "credit"] }, "$amount", 0],
            },
          },
          debits: {
            $sum: {
              $cond: [{ $eq: ["$type", "debit"] }, "$amount", 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          balance: { $subtract: ["$credits", "$debits"] },
        },
      },
    ])

    const totalAmount = balanceAgg?.balance || 0

    // Pending requested amount
    const [requestedAgg] = await WalletRequest.aggregate([
      { $match: { student: studentObjectId, status: "pending" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ])

    const requestedAmount = requestedAgg?.total || 0

    // All payments
    const payments = await Payment.find({ student: studentObjectId })
      .sort({ createdAt: -1 })
      .lean()

    // All wallet requests
    const requests = await WalletRequest.find({ student: studentObjectId })
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({
      success: true,
      data: {
        totalAmount,
        requestedAmount,
        pendingAmount: requestedAmount, // same as requested
        payments,
        requests,
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch wallet data" },
      { status: 500 }
    )
  }
}
