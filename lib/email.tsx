import nodemailer from "nodemailer"

// Create transporter with your SMTP credentials
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number.parseInt(process.env.SMTP_PORT || "587"),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || "23ca10sa61@mitsgwl.ac.in",
    pass: process.env.SMTP_PASS || "sohfkipxkisunhgh",
  },
  tls: {
    rejectUnauthorized: false,
  },
})

export async function sendPasswordResetEmail(email: string, resetToken: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`

  const mailOptions = {
    from: process.env.SMTP_FROM || "23ca10sa61@mitsgwl.ac.in",
    to: email,
    subject: "Password Reset Request",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
        <p style="color: #666; font-size: 16px;">
          You have requested to reset your password. Click the button below to reset your password:
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #000; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
            Reset Password
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">
          If the button doesn't work, copy and paste this link into your browser:
        </p>
        <p style="color: #007bff; word-break: break-all; font-size: 14px;">
          ${resetUrl}
        </p>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          This link will expire in 15 minutes. If you didn't request this password reset, please ignore this email.
        </p>
      </div>
    `,
  }

  try {
    console.log("[v0] Attempting to send email to:", email)
    console.log("[v0] SMTP Config:", {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER,
      from: process.env.SMTP_FROM,
    })

    const info = await transporter.sendMail(mailOptions)
    console.log("[v0] Email sent successfully:", info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("[v0] Email sending failed:", error)
    throw new Error(`Failed to send email: ${error}`)
  }
}

// Test email connection
export async function testEmailConnection() {
  try {
    await transporter.verify()
    console.log("[v0] SMTP connection verified successfully")
    return true
  } catch (error) {
    console.error("[v0] SMTP connection failed:", error)
    return false
  }
}
