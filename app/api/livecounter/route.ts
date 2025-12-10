import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import LiveCounter from "@/lib/models/livecounter"

// GET - Fetch all live counters
export async function GET() {
  try {
    await connectDB()
    const counters = await LiveCounter.find({ isActive: true }).sort({ order: 1 })
    return NextResponse.json({ success: true, data: counters }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// POST - Create a new live counter
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()
    const counter = await LiveCounter.create(body)
    return NextResponse.json({ success: true, data: counter }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
