import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { State, type IState } from "@/lib/models/location"

export async function GET() {
  try {
    await connectDB()
    const states: IState[] = await State.find({}).populate("country")
    return NextResponse.json({ success: true, data: states })
  } catch (error) {
    console.error("Error fetching states:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch states" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await connectDB()
    const body = await request.json()
    const { name, countryId } = body

    if (!name || !countryId) {
      return NextResponse.json({ success: false, error: "Missing required fields: name, countryId" }, { status: 400 })
    }

    const newState: IState = await State.create({ name, country: countryId })
    await newState.populate("country") // Populate to return full country object
    return NextResponse.json({ success: true, data: newState }, { status: 201 })
  } catch (error: any) {
    console.error("Error creating state:", error)
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: "State with this name already exists in this country." },
        { status: 409 },
      )
    }
    return NextResponse.json({ success: false, error: "Failed to create state" }, { status: 500 })
  }
}
