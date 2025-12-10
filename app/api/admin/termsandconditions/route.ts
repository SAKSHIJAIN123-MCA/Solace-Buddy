import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { TermsAndConditions } from "@/lib/models/terms-and-conditions"

export async function GET() {
  await connectDB()
  const policies = await TermsAndConditions.find().sort({ updatedAt: -1 })
  return NextResponse.json(policies)
}

export async function POST(req: Request) {
  await connectDB()
  const body = await req.json()
  const policy = await TermsAndConditions.create(body)
  return NextResponse.json(policy, { status: 201 })
}
