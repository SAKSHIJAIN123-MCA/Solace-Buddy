import jwt from "jsonwebtoken"
import { cookies } from "next/headers"
import { connectDB } from "@/lib/db"
import Student from "@/lib/models/student"

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  console.warn("[auth] Missing JWT_SECRET. Set it in Project Settings.")
}

export interface JWTPayload {
  sid: string
  exp?: number
}

export function signToken(studentId: string) {
  return jwt.sign({ sid: studentId } as JWTPayload, JWT_SECRET!, { expiresIn: "7d" })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET!) as JWTPayload
  } catch {
    return null
  }
}

export async function getCurrentStudentFromCookie() {
  // ✅ MUST await cookies()
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value

  if (!token) return null

  const payload = verifyToken(token)
  if (!payload?.sid) return null

  await connectDB()

  const s = await Student.findById(payload.sid).lean()
  if (!s) return null

  return { _id: String(s._id), name: s.name, email: s.email }
}
