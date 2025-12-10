import { NextResponse } from "next/server"
import { getCurrentStudentFromCookie } from "@/lib/auth"
import { connectDB } from "@/lib/db"
import StudentAuth from "@/lib/models/student-auth"
import bcrypt from "bcryptjs"

export async function PUT(req: Request) {
  try {
    const student = await getCurrentStudentFromCookie()
    if (!student) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { currentPassword, newPassword, confirmPassword } = await req.json()

    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json({ error: "All password fields are required" }, { status: 400 })
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ error: "New passwords do not match" }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "New password must be at least 6 characters long" }, { status: 400 })
    }

    await connectDB()

    const auth = await StudentAuth.findOne({ studentId: student._id })
    if (!auth) {
      return NextResponse.json({ error: "Authentication record not found" }, { status: 404 })
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, auth.passwordHash)
    if (!isCurrentPasswordValid) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10)

    // Update password
    await StudentAuth.findByIdAndUpdate(auth._id, { passwordHash: newPasswordHash })

    return NextResponse.json({ message: "Password changed successfully" })
  } catch (error) {
    console.error("[change-password]", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
