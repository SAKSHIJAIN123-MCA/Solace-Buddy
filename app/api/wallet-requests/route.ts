import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import WalletRequest from "@/lib/models/wallet-request"
import mongoose from "mongoose"
import { getCurrentStudentFromCookie } from "@/lib/auth"

// 🚀 Create a new wallet request
export async function POST(req: Request) {
  try {
    await connectDB()

    const student = await getCurrentStudentFromCookie()
    if (!student) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { amount, paymentMethod, note } = body

    // Validate amount
    if (typeof amount !== "number" || amount < 1) {
      return NextResponse.json(
        { success: false, error: "Amount must be a positive number" },
        { status: 400 }
      )
    }

    // Validate payment method
    if (!["upi", "bank_transfer"].includes(paymentMethod)) {
      return NextResponse.json({ success: false, error: "Invalid payment method" }, { status: 400 })
    }

    // Create wallet request
    const walletRequest = new WalletRequest({
      student: new mongoose.Types.ObjectId(student._id),
      amount,
      paymentMethod,
      note: note || undefined,
      status: "pending",
    })

    await walletRequest.save()

    return NextResponse.json({
      success: true,
      data: walletRequest,
      message: "Wallet request submitted successfully",
    })
  } catch (error: any) {
    console.error("Error creating wallet request:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create wallet request" },
      { status: 500 }
    )
  }
}

// 🚀 Fetch wallet requests (for student or admin)
export async function GET(req: Request) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status") || "all"
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const page = Number.parseInt(searchParams.get("page") || "1")

    const student = await getCurrentStudentFromCookie()
    if (!student) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    // Build query: only fetch logged-in student's requests
    const query: any = { student: new mongoose.Types.ObjectId(student._id) }

    if (status !== "all") {
      query.status = status
    }

    // Get wallet requests
    const requests = await WalletRequest.find(query)
      .populate("student", "name email phone college course")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean()

    const total = await WalletRequest.countDocuments(query)

    return NextResponse.json({
      success: true,
      data: requests,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    console.error("Error fetching wallet requests:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch wallet requests" },
      { status: 500 }
    )
  }
}
