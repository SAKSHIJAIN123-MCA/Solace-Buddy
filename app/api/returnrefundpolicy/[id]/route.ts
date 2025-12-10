import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { ReturnRefundPolicy } from "@/lib/models/return-refund-policy"

export async function GET(_: any, { params }: { params: { id: string } }) {
  await connectDB()
  const policy = await ReturnRefundPolicy.findById(params.id)
  return NextResponse.json(policy)
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  await connectDB()
  const body = await req.json()
  const policy = await ReturnRefundPolicy.findByIdAndUpdate(params.id, body, { new: true })
  return NextResponse.json(policy)
}

export async function DELETE(_: any, { params }: { params: { id: string } }) {
  await connectDB()
  await ReturnRefundPolicy.findByIdAndDelete(params.id)
  return NextResponse.json({ message: "Deleted" })
}
