import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Student from "@/lib/models/student";
import StudentAuth from "@/lib/models/student-auth";
import Referral from "@/lib/models/referral";
import bcrypt from "bcryptjs";
import { sendEmail } from "@/lib/mailer";
import StudentOTP from "@/lib/models/student-otp";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, city, phone, password, ref } = body || {};

    if (!name || !email || !city || !phone || !password) {
      return NextResponse.json(
        { error: "name, email, city, phone and password are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const existing = await Student.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    const student = await Student.create({
      name,
      email,
      city,
      phone,
    });

    const passwordHash = await bcrypt.hash(password, 10);
    await StudentAuth.create({ studentId: student._id, email, passwordHash });

    if (ref && String(ref) !== String(student._id)) {
      try {
        await Referral.create({ referrerId: ref, referredId: student._id });
      } catch {
        // ignore referral errors
      }
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const codeHash = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await StudentOTP.create({
      email: email.toLowerCase(),
      codeHash,
      purpose: "register",
      expiresAt,
    });
    await sendEmail({
      to: email,
      subject: "OTP for SolaceBuddy Sign Up",
      text: `Dear User,\n\nYour OTP for completing the signup is: ${code}\n\nThis OTP is valid for 10 minutes. Please do not share it with anyone.\n\nIf you did not request this, you can ignore this message.\n\nRegards,\nTeam SolaceBuddy.`,
      html: `
        <p>Dear User,</p>
        <p>Your OTP for completing the signup is: <strong>${code}</strong></p>
        <p>This OTP is valid for 10 minutes. Please do not share it with anyone.</p>
        <p>If you did not request this, you can ignore this message.</p>
        <p>Regards,<br>Team SolaceBuddy.</p>
        
<table width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px; border-collapse: collapse;">
  <tr>
    <td align="center" style="padding: 0; margin: 0;">
      <img 
        src="https://solacebuddy.com/emailban.png" 
        alt="SolaceBuddy Banner" 
        width="100%" 
        style="display: block; width: 100%; max-width: 700px; height: auto; border: none; outline: none; text-decoration: none;">
    </td>
  </tr>
</table>

      `,
    });

    return NextResponse.json({
      message: "Registered. OTP sent to email.",
      student: {
        _id: String(student._id),
        name: student.name,
        email: student.email,
        phone: student.phone,
      },
    });
  } catch (e) {
    console.error("[register]", e);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
