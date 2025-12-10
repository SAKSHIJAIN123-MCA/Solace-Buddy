import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import KYC from "@/lib/models/kyc"
import { getCurrentStudentFromCookie } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const student = await getCurrentStudentFromCookie()
    if (!student) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const studentId = (student as any)._id || (student as any).id
    const kyc = await KYC.findOne({ studentId }).lean()

    return NextResponse.json({ kyc })
  } catch (error) {
    console.error("Error fetching KYC:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const student = await getCurrentStudentFromCookie()
    if (!student) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    await connectDB()

    const studentId = (student as any)._id || (student as any).id

    const requiredFields = [
      "name",
      "mobileNumber",
      "email",
      "permanentAddress",
      "dateOfBirth",
      "caste",
      "maritalStatus",
      "passportSizePhoto",
      "nativeCity",
      "nativeState",
      "aadharCardFront",
      "aadharCardBack",
      "residentialProof",
      "profession",
      "collegeCompanyName",
      "collegeCompanyAddress",
      "studyingWorkingSince",
      "proofOfLocation",
      "fatherName",
      "fatherMobileNumber",
      "criminalHistory",
      "agreeToRules",
      "agreeToVerification",
      "agreeLockInPeriod",
      "pgStartDate",
      "agreeTermsConditions",
    ]

    if (body.isCompleted) {
      const missingFields = requiredFields.filter((field) => !body[field])
      if (missingFields.length > 0) {
        return NextResponse.json({ error: `Missing required fields: ${missingFields.join(", ")}` }, { status: 400 })
      }
    }

    // Check if KYC already exists
    let kyc = await KYC.findOne({ studentId })

    if (kyc) {
      // Update existing KYC
      Object.assign(kyc, body)
      if (body.isCompleted) {
        kyc.submittedAt = new Date()
      }
      await kyc.save()
    } else {
      // Create new KYC
      kyc = new KYC({
        ...body,
        studentId,
        submittedAt: body.isCompleted ? new Date() : undefined,
      })
      await kyc.save()
    }

    return NextResponse.json({ success: true, kyc })
  } catch (error) {
    console.error("Error saving KYC:", error)
    if (error instanceof Error && error.message.includes("validation")) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
