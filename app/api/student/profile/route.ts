import { NextResponse } from "next/server"
import { getCurrentStudentFromCookie } from "@/lib/auth"
import { connectDB } from "@/lib/db"
import Student from "@/lib/models/student"
import StudentAuth from "@/lib/models/student-auth"

export async function GET() {
  try {
    const student = await getCurrentStudentFromCookie()
    if (!student) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    const fullStudent = await Student.findById(student._id).lean()
    if (!fullStudent) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    return NextResponse.json({
      student: {
        _id: String(fullStudent._id),
        name: fullStudent.name,
        email: fullStudent.email,
        phone: fullStudent.phone,
      },
    })
  } catch (error) {
    console.error("[profile-get]", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const student = await getCurrentStudentFromCookie()
    if (!student) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, email, phone } = await req.json()

    if (!name || !email || !phone) {
      return NextResponse.json({ error: "Name, email, and phone are required" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Validate phone format
    const phoneRegex = /^[+]?[1-9][\d]{0,15}$/
    if (!phoneRegex.test(phone)) {
      return NextResponse.json({ error: "Invalid phone number format" }, { status: 400 })
    }

    await connectDB()

    // Check if email is already taken by another student
    const existingStudent = await Student.findOne({ email, _id: { $ne: student._id } })
    if (existingStudent) {
      return NextResponse.json({ error: "Email is already taken" }, { status: 409 })
    }

    const existingAuth = await StudentAuth.findOne({
      email,
      studentId: { $ne: student._id },
    })
    if (existingAuth) {
      return NextResponse.json({ error: "Email is already taken" }, { status: 409 })
    }

    const [updatedStudent, updatedAuth] = await Promise.all([
      Student.findByIdAndUpdate(student._id, { name, email, phone }, { new: true, runValidators: true }).lean(),
      StudentAuth.findOneAndUpdate({ studentId: student._id }, { email }, { new: true, runValidators: true }).lean(),
    ])

    if (!updatedStudent) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    if (!updatedAuth) {
      return NextResponse.json({ error: "Student authentication record not found" }, { status: 404 })
    }

    return NextResponse.json({
      message: "Profile updated successfully",
      student: {
        _id: String(updatedStudent._id),
        name: updatedStudent.name,
        email: updatedStudent.email,
        phone: updatedStudent.phone,
      },
    })
  } catch (error) {
    console.error("[profile-update]", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
