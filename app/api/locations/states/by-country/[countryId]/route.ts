import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { State, type IState } from "@/lib/models/location"

export async function GET(request: Request, { params }: { params: { countryId: string } }) {
  try {
    await connectDB()
    const { countryId } = params

    const states: IState[] = await State.find({ country: countryId }).populate("country")
    return NextResponse.json({ success: true, data: states })
  } catch (error) {
    console.error("Error fetching states by country:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch states" }, { status: 500 })
  }
}
