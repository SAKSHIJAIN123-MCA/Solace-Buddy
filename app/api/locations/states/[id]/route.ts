import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { State, type IState } from "@/lib/models/location"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const { id } = params
    const body = await request.json()
    const { name, countryId } = body

    const updatedState: IState | null = await State.findByIdAndUpdate(
      id,
      { name, country: countryId },
      { new: true, runValidators: true },
    )
    if (!updatedState) {
      return NextResponse.json({ success: false, error: "State not found" }, { status: 404 })
    }
    await updatedState.populate("country")
    return NextResponse.json({ success: true, data: updatedState })
  } catch (error: any) {
    console.error("Error updating state:", error)
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: "State with this name already exists in this country." },
        { status: 409 },
      )
    }
    return NextResponse.json({ success: false, error: "Failed to update state" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const { id } = params
    const deletedState: IState | null = await State.findByIdAndDelete(id)
    if (!deletedState) {
      return NextResponse.json({ success: false, error: "State not found" }, { status: 404 })
    }
    return NextResponse.json({ success: true, message: "State deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting state:", error)
    return NextResponse.json({ success: false, error: "Failed to delete state" }, { status: 500 })
  }
}
