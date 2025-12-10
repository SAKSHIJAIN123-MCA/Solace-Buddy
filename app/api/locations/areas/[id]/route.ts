import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { Area, type IArea } from "@/lib/models/location"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const { id } = params
    const body = await request.json()
    const { name, cityId } = body

    const updatedArea: IArea | null = await Area.findByIdAndUpdate(
      id,
      { name, city: cityId },
      { new: true, runValidators: true },
    )
    if (!updatedArea) {
      return NextResponse.json({ success: false, error: "Area not found" }, { status: 404 })
    }
    await updatedArea.populate({
      path: "city",
      populate: {
        path: "state",
        populate: {
          path: "country",
        },
      },
    })
    return NextResponse.json({ success: true, data: updatedArea })
  } catch (error: any) {
    console.error("Error updating area:", error)
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: "Area with this name already exists in this city." },
        { status: 409 },
      )
    }
    return NextResponse.json({ success: false, error: "Failed to update area" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const { id } = params
    const deletedArea: IArea | null = await Area.findByIdAndDelete(id)
    if (!deletedArea) {
      return NextResponse.json({ success: false, error: "Area not found" }, { status: 404 })
    }
    return NextResponse.json({ success: true, message: "Area deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting area:", error)
    return NextResponse.json({ success: false, error: "Failed to delete area" }, { status: 500 })
  }
}
