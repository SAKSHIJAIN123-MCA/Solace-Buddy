import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { ReturnRefundPolicy } from "@/lib/models/return-refund-policy"

export async function GET() {
  await connectDB()
  const policies = await ReturnRefundPolicy.find().sort({ updatedAt: -1 })
  return NextResponse.json(policies)
}

export async function POST(req: Request) {
  await connectDB()
  const body = await req.json()
  const policy = await ReturnRefundPolicy.create(body)
  return NextResponse.json(policy, { status: 201 })
}
