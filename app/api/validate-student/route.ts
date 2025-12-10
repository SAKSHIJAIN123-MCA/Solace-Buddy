import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import Student from "@/lib/models/student"

// POST - Validate if student exists with matching details
export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const { name, collegeName, mobileNumber } = body

    // Validate required fields
    if (!name || !collegeName || !mobileNumber) {
      return NextResponse.json(
        {
          success: false,
          error: "Name, college name, and mobile number are required",
        },
        { status: 400 },
      )
    }

    // Check if student exists with matching details
    const student = await Student.findOne({
      phone: mobileNumber,
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") }, // Case insensitive exact match
      college: { $regex: new RegExp(`^${collegeName.trim()}$`, "i") }, // Case insensitive exact match
    })

    if (student) {
      return NextResponse.json({
        success: true,
        studentExists: true,
        message: "Student found in records",
      })
    } else {
      return NextResponse.json({
        success: true,
        studentExists: false,
        message: "Student not found in records",
      })
    }
  } catch (error: any) {
    console.error("Error validating student:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to validate student details",
      },
      { status: 500 },
    )
  }
}
