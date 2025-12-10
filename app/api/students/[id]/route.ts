import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import Student from "@/lib/models/student"
import StudentAuth from "@/lib/models/student-auth"
import bcrypt from "bcryptjs"
import mongoose from "mongoose"

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ success: false, error: "Invalid student ID" }, { status: 400 })
    }
    const student = await Student.findById(params.id, { name: 1, email: 1, city: 1, phone: 1, createdAt: 1 })
    if (!student) return NextResponse.json({ success: false, error: "Student not found" }, { status: 404 })
    return NextResponse.json({ success: true, data: student })
  } catch (error: any) {
    console.error("[students/:id] GET error:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ success: false, error: "Invalid student ID" }, { status: 400 })
    }
    const body = await request.json()
    const payload: any = {}

    if (typeof body.name === "string") payload.name = body.name
    if (typeof body.email === "string") payload.email = body.email
    if (typeof body.city === "string") payload.city = body.city
    if (typeof body.phone === "string") payload.phone = body.phone

    // guard duplicate email
    if (payload.email) {
      const exists = await Student.findOne({ email: payload.email, _id: { $ne: params.id } })
      if (exists) {
        return NextResponse.json({ success: false, error: "Student with this email already exists" }, { status: 400 })
      }
    }

    if (body.password) {
      const salt = await bcrypt.genSalt(10)
      const passwordHash = await bcrypt.hash(body.password, salt)

      await StudentAuth.findOneAndUpdate(
        { studentId: params.id },
        { passwordHash, email: payload.email || undefined },
        { runValidators: true },
      )
    }

    const student = await Student.findByIdAndUpdate(
      params.id,
      { ...payload, updatedAt: new Date() },
      { new: true, runValidators: true, fields: { name: 1, email: 1, city: 1, phone: 1, createdAt: 1 } },
    )
    if (!student) return NextResponse.json({ success: false, error: "Student not found" }, { status: 404 })
    return NextResponse.json({ success: true, data: student, message: "Student updated successfully" })
  } catch (error: any) {
    console.error("[students/:id] PUT error:", error)
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err: any) => err.message)
      return NextResponse.json({ success: false, error: errors.join(", ") }, { status: 400 })
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ success: false, error: "Invalid student ID" }, { status: 400 })
    }

    await StudentAuth.deleteOne({ studentId: params.id })

    const student = await Student.findByIdAndDelete(params.id)
    if (!student) return NextResponse.json({ success: false, error: "Student not found" }, { status: 404 })
    return NextResponse.json({ success: true, message: "Student deleted successfully" })
  } catch (error: any) {
    console.error("[students/:id] DELETE error:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
