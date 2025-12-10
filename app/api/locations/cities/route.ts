import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { City, type ICity } from "@/lib/models/location"

export async function GET() {
  try {
    await connectDB()
    const cities: ICity[] = await City.find({}).populate({
      path: "state",
      populate: {
        path: "country",
      },
    })
    return NextResponse.json({ success: true, data: cities })
  } catch (error) {
    console.error("Error fetching cities:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch cities" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await connectDB()
    const body = await request.json()
    const { name, stateId } = body

    if (!name || !stateId) {
      return NextResponse.json({ success: false, error: "Missing required fields: name, stateId" }, { status: 400 })
    }

    const newCity: ICity = await City.create({ name, state: stateId })
    await newCity.populate({
      path: "state",
      populate: {
        path: "country",
      },
    })
    return NextResponse.json({ success: true, data: newCity }, { status: 201 })
  } catch (error: any) {
    console.error("Error creating city:", error)
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: "City with this name already exists in this state." },
        { status: 409 },
      )
    }
    return NextResponse.json({ success: false, error: "Failed to create city" }, { status: 500 })
  }
}
