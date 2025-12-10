import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { City, type ICity } from "@/lib/models/location"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const { id } = params
    const body = await request.json()
    const { name, stateId } = body

    const updatedCity: ICity | null = await City.findByIdAndUpdate(
      id,
      { name, state: stateId },
      { new: true, runValidators: true },
    )
    if (!updatedCity) {
      return NextResponse.json({ success: false, error: "City not found" }, { status: 404 })
    }
    await updatedCity.populate({
      path: "state",
      populate: {
        path: "country",
      },
    })
    return NextResponse.json({ success: true, data: updatedCity })
  } catch (error: any) {
    console.error("Error updating city:", error)
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: "City with this name already exists in this state." },
        { status: 409 },
      )
    }
    return NextResponse.json({ success: false, error: "Failed to update city" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const { id } = params
    const deletedCity: ICity | null = await City.findByIdAndDelete(id)
    if (!deletedCity) {
      return NextResponse.json({ success: false, error: "City not found" }, { status: 404 })
    }
    return NextResponse.json({ success: true, message: "City deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting city:", error)
    return NextResponse.json({ success: false, error: "Failed to delete city" }, { status: 500 })
  }
}
