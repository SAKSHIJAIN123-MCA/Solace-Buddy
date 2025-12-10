import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import KYC from "@/lib/models/kyc"
import Student from "@/lib/models/student"

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const kycRecords = await KYC.find({})
      .populate({
        path: "studentId",
        model: Student,
        select: "name email phone college course year",
      })
      .sort({ createdAt: -1 })
      .lean()

    const formattedRecords = kycRecords
      .filter((record) => record.studentId !== null)
      .map((record) => ({
        ...record,
        _id: String(record._id),
        studentId: String(record.studentId._id),
        student: record.studentId,
      }))

    return NextResponse.json({ kycRecords: formattedRecords })
  } catch (error) {
    console.error("Error fetching KYC records:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    await connectDB()

    // Check if KYC already exists for this student
    const existingKYC = await KYC.findOne({ studentId: body.studentId })
    if (existingKYC) {
      return NextResponse.json({ error: "KYC already exists for this student" }, { status: 400 })
    }

    const kyc = new KYC({
      ...body,
      submittedAt: body.isCompleted ? new Date() : undefined,
    })
    await kyc.save()

    return NextResponse.json({ success: true, kyc })
  } catch (error) {
    console.error("Error creating KYC:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
