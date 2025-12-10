import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { City, type ICity } from "@/lib/models/location"

export async function GET(request: Request, { params }: { params: { stateId: string } }) {
  try {
    await connectDB()
    const { stateId } = params

    const cities: ICity[] = await City.find({ state: stateId }).populate({
      path: "state",
      populate: {
        path: "country",
      },
    })
    return NextResponse.json({ success: true, data: cities })
  } catch (error) {
    console.error("Error fetching cities by state:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch cities" }, { status: 500 })
  }
}
