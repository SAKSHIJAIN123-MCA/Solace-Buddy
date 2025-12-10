import { redirect } from "next/navigation"
import { getCurrentStudentFromCookie } from "@/lib/auth"
import { connectDB } from "@/lib/db"
import mongoose from "mongoose"
import Payment from "@/lib/models/payment"
import Referral from "@/lib/models/referral"
import Student from "@/lib/models/student"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function StudentDashboardPage() {
  const student = await getCurrentStudentFromCookie()
  if (!student) redirect("/signin")

  await connectDB()
  const studentId = (student as any)._id || (student as any).id
  let wallet = 0
  let referralsCount = 0
  let referralsList: any[] = []

  try {
    const [agg] = await Payment.aggregate([
      { $match: { student: new mongoose.Types.ObjectId(String(studentId)) } },
      {
        $group: {
          _id: "$student",
          credits: { $sum: { $cond: [{ $eq: ["$type", "credit"] }, "$amount", 0] } },
          debits: { $sum: { $cond: [{ $eq: ["$type", "debit"] }, "$amount", 0] } },
        },
      },
      { $project: { _id: 0, wallet: { $subtract: ["$credits", "$debits"] } } },
    ])
    wallet = (agg?.wallet as number) ?? 0

    referralsCount = await Referral.countDocuments({
      referrerId: new mongoose.Types.ObjectId(String(studentId)),
    })

    // Fetch detailed referrals list
    const referralsData = await Referral.find({
      referrerId: new mongoose.Types.ObjectId(String(studentId)),
    })
      .populate({
        path: "referredId",
        model: Student,
        select: "name email phone college course year address parentContact status registrationDate createdAt",
      })
      .sort({ createdAt: -1 })
      .lean()

    referralsList = (referralsData || []).map((r: any) => ({
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
            createdAt: r.referredId.createdAt,
          }
        : null,
    }))
  } catch (e) {
    // Handle error
  }

  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-balance">Welcome, {student.name}</h1>
        <p className="text-muted-foreground">This is your dashboard.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Referrals</p>
          <p className="text-2xl font-semibold">{referralsCount}</p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Wallet Amount</p>
          <p className="text-2xl font-semibold">₹{wallet.toLocaleString()}</p>
        </div>
      </div>

    {/*  {referralsList.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-balance">My Referrals</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr className="text-left">
                    <th className="px-4 py-3">Registered At</th>
                    <th className="px-4 py-3">Student Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">College</th>
                    <th className="px-4 py-3">Course/Year</th>
                  </tr>
                </thead>
                <tbody>
                  {referralsList.map((r) => (
                    <tr key={r._id} className="border-t">
                      <td className="px-4 py-3">{new Date(r.createdAt).toLocaleString()}</td>
                      <td className="px-4 py-3">{r.referred?.name || "-"}</td>
                      <td className="px-4 py-3">{r.referred?.email || "-"}</td>
                      <td className="px-4 py-3">{r.referred?.phone || "-"}</td>
                      <td className="px-4 py-3">{r.referred?.college || "-"}</td>
                      <td className="px-4 py-3">
                        {r.referred?.course || "-"} {r.referred?.year ? ` / ${r.referred?.year}` : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )} */}
    </main>
  )
}
