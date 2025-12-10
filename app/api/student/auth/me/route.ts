import { NextResponse } from "next/server"
import { getCurrentStudentFromCookie } from "@/lib/auth"

export async function GET() {
  const student = await getCurrentStudentFromCookie()
  if (!student) return NextResponse.json({ authenticated: false })
  return NextResponse.json({ authenticated: true, student })
}
