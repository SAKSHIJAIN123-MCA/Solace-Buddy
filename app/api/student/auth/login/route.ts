import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import Student from "@/lib/models/student"
import StudentAuth from "@/lib/models/student-auth"
import bcrypt from "bcryptjs"
import { signToken } from "@/lib/auth"

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    await connectDB()

    const auth = await StudentAuth.findOne({ email })
    if (!auth) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })

    const ok = await bcrypt.compare(password, auth.passwordHash)
    if (!ok) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })

    const student = await Student.findById(auth.studentId)
    if (!student) return NextResponse.json({ error: "Account not found" }, { status: 404 })

    student.lastLogin = new Date()
    await student.save()

    const token = signToken(String(student._id))
    const res = NextResponse.json({
      message: "Logged in",
      student: { _id: String(student._id), name: student.name, email: student.email },
    })
    res.cookies.set("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    })
    return res
  } catch (e) {
    console.error("[login]", e)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
