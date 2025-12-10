import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import LiveCounter from "@/lib/models/livecounter"

// GET - Fetch single live counter by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const counter = await LiveCounter.findById(params.id)

    if (!counter) {
      return NextResponse.json({ success: false, error: "Counter not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: counter }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// PUT - Update live counter by ID
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const body = await request.json()
    const counter = await LiveCounter.findByIdAndUpdate(params.id, body, { new: true, runValidators: true })

    if (!counter) {
      return NextResponse.json({ success: false, error: "Counter not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: counter }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// DELETE - Delete live counter by ID
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const counter = await LiveCounter.findByIdAndDelete(params.id)

    if (!counter) {
      return NextResponse.json({ success: false, error: "Counter not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Counter deleted successfully" }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
