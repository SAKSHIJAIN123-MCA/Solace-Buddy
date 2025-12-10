import { NextResponse } from "next/server"
import { getCurrentStudentFromCookie } from "@/lib/auth"
import { connectDB } from "@/lib/db"
import Referral from "@/lib/models/referral"
import Student from "@/lib/models/student"
import mongoose from "mongoose"

export async function GET() {
  try {
    const student = await getCurrentStudentFromCookie()
    if (!student) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    const studentId = (student as any)._id || (student as any).id

    // Get referrals where this student is the referrer
    const data = await Referral.find({
      referrerId: new mongoose.Types.ObjectId(String(studentId)),
    })
      .populate({
        path: "referredId",
        model: Student,
        select:
          "name email phone college course year address parentContact status registrationDate lastLogin totalBookings currentBooking createdAt updatedAt",
      })
      .sort({ createdAt: -1 })
      .lean()

    const referrals = (data || []).map((r: any) => ({
      _id: String(r._id),
      createdAt: r.createdAt,
      referred: r.referredId
        ? {
            _id: String(r.referredId._id),
            name: r.referredId.name,
            email: r.referredId.email,
            phone: r.referredId.phone,
            college: r.referredId.college,
            course: r.referredId.course,
            year: r.referredId.year,
            address: r.referredId.address,
            parentContact: r.referredId.parentContact,
            status: r.referredId.status,
            registrationDate: r.referredId.registrationDate,
            lastLogin: r.referredId.lastLogin,
            totalBookings: r.referredId.totalBookings,
            currentBooking: r.referredId.currentBooking || null,
            createdAt: r.referredId.createdAt,
            updatedAt: r.referredId.updatedAt,
          }
        : null,
    }))

    return NextResponse.json({ referrals })
  } catch (e) {
    console.error("[student-referrals][GET]", e)
    return NextResponse.json({ error: "Failed to load referrals" }, { status: 500 })
  }
}
