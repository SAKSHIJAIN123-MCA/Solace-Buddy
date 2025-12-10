import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import WalletRequest from "@/lib/models/wallet-request"

type Params = { params: { id: string } }

export async function PUT(req: Request, { params }: Params) {
  try {
    const { id } = params
    const body = await req.json()
    const { status, adminNote } = body

    await connectDB()

    const update: any = {}
    if (status) update.status = status
    if (typeof adminNote === "string") update.adminNote = adminNote

    const updated = await WalletRequest.findByIdAndUpdate(id, update, { new: true })
    if (!updated) {
      return NextResponse.json({ success: false, error: "Request not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: updated })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to update request" }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { id } = params
    await connectDB()

    const deleted = await WalletRequest.findByIdAndDelete(id)
    if (!deleted) {
      return NextResponse.json({ success: false, error: "Request not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to delete request" }, { status: 500 })
  }
}
