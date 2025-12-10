import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { Country, type ICountry } from "@/lib/models/location"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const { id } = params
    const body = await request.json()
    const { name, code } = body

    const updatedCountry: ICountry | null = await Country.findByIdAndUpdate(
      id,
      { name, code },
      { new: true, runValidators: true },
    )
    if (!updatedCountry) {
      return NextResponse.json({ success: false, error: "Country not found" }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: updatedCountry })
  } catch (error: any) {
    console.error("Error updating country:", error)
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: "Country with this name or code already exists." },
        { status: 409 },
      )
    }
    return NextResponse.json({ success: false, error: "Failed to update country" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const { id } = params
    const deletedCountry: ICountry | null = await Country.findByIdAndDelete(id)
    if (!deletedCountry) {
      return NextResponse.json({ success: false, error: "Country not found" }, { status: 404 })
    }
    return NextResponse.json({ success: true, message: "Country deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting country:", error)
    return NextResponse.json({ success: false, error: "Failed to delete country" }, { status: 500 })
  }
}
