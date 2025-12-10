import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import StudentAuth from "@/lib/models/student-auth"
import PasswordReset from "@/lib/models/password-reset"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json()

    if (!token || !password) {
      return NextResponse.json({ error: "Token and password are required" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    await connectDB()

    // Find and validate reset token
    const resetRecord = await PasswordReset.findOne({
      token,
      used: false,
      expiresAt: { $gt: new Date() },
    })

    if (!resetRecord) {
      return NextResponse.json({ error: "Invalid or expired reset token" }, { status: 400 })
    }

    // Find student auth record
    const studentAuth = await StudentAuth.findOne({ email: resetRecord.email })
    if (!studentAuth) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 })
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(password, 10)

    // Update password
    await StudentAuth.findByIdAndUpdate(studentAuth._id, { passwordHash })

    // Mark reset token as used
    await PasswordReset.findByIdAndUpdate(resetRecord._id, { used: true })

    return NextResponse.json({ message: "Password reset successfully" })
  } catch (error) {
    console.error("[reset-password]", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
