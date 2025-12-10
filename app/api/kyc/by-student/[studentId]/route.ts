import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import KYC from "@/lib/models/kyc"
import Student from "@/lib/models/student"

export async function GET(_request: NextRequest, { params }: { params: { studentId: string } }) {
  try {
    await connectDB()

    const kyc = await KYC.findOne({ studentId: params.studentId })
      .populate({
        path: "studentId",
        model: Student,
        select: "name email phone college course year",
      })
      .lean()

    if (!kyc) {
      return NextResponse.json({ success: true, kyc: null })
    }

    // normalize ids
    const normalized = {
      ...kyc,
      _id: String(kyc._id),
      studentId: String((kyc as any).studentId?._id || kyc.studentId),
      student:
        (kyc as any).studentId && typeof (kyc as any).studentId === "object" ? (kyc as any).studentId : undefined,
    }

    return NextResponse.json({ success: true, kyc: normalized })
  } catch (error) {
    console.error("Error fetching KYC by student:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
