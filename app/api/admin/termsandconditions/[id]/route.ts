import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { TermsAndConditions } from "@/lib/models/terms-and-conditions"

export async function GET(_: any, { params }: { params: { id: string } }) {
  await connectDB()
  const policy = await TermsAndConditions.findById(params.id)
  return NextResponse.json(policy)
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  await connectDB()
  const body = await req.json()
  const policy = await TermsAndConditions.findByIdAndUpdate(params.id, body, { new: true })
  return NextResponse.json(policy)
}

export async function DELETE(_: any, { params }: { params: { id: string } }) {
  await connectDB()
  await TermsAndConditions.findByIdAndDelete(params.id)
  return NextResponse.json({ message: "Deleted" })
}
