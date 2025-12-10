import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Student from "@/lib/models/student";
import StudentOTP from "@/lib/models/student-otp";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth";
import { sendEmail } from "@/lib/mailer"; // ✅ Added import

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();
    if (!email || !code) {
      return NextResponse.json(
        { error: "Email and code are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const otp = await StudentOTP.findOne({
      email: email.toLowerCase(),
      used: false,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (!otp) {
      return NextResponse.json(
        { error: "Invalid or expired code" },
        { status: 400 }
      );
    }

    const ok = await bcrypt.compare(code, otp.codeHash);
    otp.attempts += 1;
    if (!ok) {
      await otp.save();
      return NextResponse.json({ error: "Invalid code" }, { status: 400 });
    }

    otp.used = true;
    await otp.save();

    // Find student
    const student = await Student.findOne({ email: email.toLowerCase() });
    if (!student) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    // ======================================================
    // ✅ SEND WELCOME EMAIL AFTER SUCCESSFUL VERIFICATION
    // ======================================================
    await sendEmail({
      to: email,
      subject: "Welcome to SolaceBuddy Family",
      text: `Dear ${student.name},\n\nYour account has been successfully verified and welcome to the family. Start Exploring your stay directly from here: www.solacebuddy.com.\n\nAdditionally, you can subscribe to our official Social Media Handles to get regular updates from us.\n\nWhatsapp SolaceBuddy Channel: https://tinyurl.com/solacewhatsapp\nInstagram SolaceBuddy: http://www.instagram.com/solacebuddy\n\nRegards,\nTeam SolaceBuddy.`,
      html: `
        <p>Dear ${student.name},</p>
        <p>Your account has been successfully verified and welcome to the family. Start Exploring your stay directly from here: <a href="https://www.solacebuddy.com" style="color: #2d1b69; text-decoration: none; font-weight: bold;">www.solacebuddy.com</a>.</p>
        <p>Additionally, you can subscribe to our official Social Media Handles to get regular updates from us.</p>
        <p>
          <strong>Whatsapp SolaceBuddy Channel:</strong> <a href="https://tinyurl.com/solacewhatsapp" style="color: #2d1b69; text-decoration: none;">Subscribe Now</a><br>
          <strong>Instagram SolaceBuddy:</strong> <a href="http://www.instagram.com/solacebuddy" style="color: #2d1b69; text-decoration: none;">Follow Now</a>
        </p>
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
    })

    // ======================================================

    // Create token
    const token = signToken(String(student._id));

    const res = NextResponse.json({
      message: "Verified",
      student: {
        _id: String(student._id),
        name: student.name,
        email: student.email,
      },
    });

    res.cookies.set("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (e) {
    console.error("[otp/verify]", e);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
