import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import Student from "@/lib/models/student"

export async function GET(request: NextRequest) {
  try {
    // Add admin authentication check here if needed

    await connectDB()

    const students = await Student.find({ status: "active" })
      .select("_id name email phone college course year")
      .sort({ name: 1 })
      .lean()

    const formattedStudents = students.map((student) => ({
      ...student,
      _id: String(student._id),
    }))

    return NextResponse.json({ students: formattedStudents })
  } catch (error) {
    console.error("Error fetching students:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
