import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import Referral from "@/lib/models/referral"
import Student from "@/lib/models/student"

export async function GET() {
  try {
    await connectDB()

    // Populate both referred and referrer student documents
    const data = await Referral.find({})
      .populate({
        path: "referredId",
        model: Student,
        select:
          "name email phone college course year address parentContact status registrationDate lastLogin totalBookings currentBooking createdAt updatedAt",
      })
      .populate({
        path: "referrerId",
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
      referrer: r.referrerId
        ? {
            _id: String(r.referrerId._id),
            name: r.referrerId.name,
            email: r.referrerId.email,
            phone: r.referrerId.phone,
            college: r.referrerId.college,
            course: r.referrerId.course,
            year: r.referrerId.year,
            address: r.referrerId.address,
            parentContact: r.referrerId.parentContact,
            status: r.referrerId.status,
            registrationDate: r.referrerId.registrationDate,
            lastLogin: r.referrerId.lastLogin,
            totalBookings: r.referrerId.totalBookings,
            currentBooking: r.referrerId.currentBooking || null,
            createdAt: r.referrerId.createdAt,
            updatedAt: r.referrerId.updatedAt,
          }
        : null,
    }))

    return NextResponse.json({ referrals })
  } catch (e) {
    console.error("[admin-referrals][GET]", e)
    return NextResponse.json({ error: "Failed to load referrals" }, { status: 500 })
  }
}
