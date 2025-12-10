import nodemailer from "nodemailer"

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT || 587),
  secure: Number(SMTP_PORT || 587) === 465,
  auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
})

export async function sendEmail(opts: { to: string; subject: string; text?: string; html?: string }) {
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_FROM) {
    console.warn("[mailer] SMTP env not fully configured, skipping email send.")
    return { skipped: true }
  }
  const info = await transporter.sendMail({
    from: SMTP_FROM,
    to: opts.to,
    subject: opts.subject,
    text: opts.text,
    html: opts.html,
  })
  return info
}
