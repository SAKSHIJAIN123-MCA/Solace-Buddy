import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import KYC from "@/lib/models/kyc"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    await connectDB()

    const kyc = await KYC.findById(params.id)
    if (!kyc) {
      return NextResponse.json({ error: "KYC not found" }, { status: 404 })
    }

    Object.assign(kyc, body)
    if (body.isCompleted && !kyc.submittedAt) {
      kyc.submittedAt = new Date()
    }
    await kyc.save()

    return NextResponse.json({ success: true, kyc })
  } catch (error) {
    console.error("Error updating KYC:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const kyc = await KYC.findByIdAndDelete(params.id)
    if (!kyc) {
      return NextResponse.json({ error: "KYC not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "KYC deleted successfully" })
  } catch (error) {
    console.error("Error deleting KYC:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
