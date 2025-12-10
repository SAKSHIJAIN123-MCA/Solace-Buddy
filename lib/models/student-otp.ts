import mongoose, { Schema, type Document } from "mongoose"

export interface IStudentOTP extends Document {
  email: string
  codeHash: string
  purpose: "register" | "login"
  expiresAt: Date
  used: boolean
  attempts: number
  createdAt: Date
  updatedAt: Date
}

const StudentOTPSchema = new Schema<IStudentOTP>(
  {
    email: { type: String, required: true, index: true, lowercase: true },
    codeHash: { type: String, required: true },
    purpose: { type: String, enum: ["register", "login"], required: true },
    expiresAt: { type: Date, required: true, index: { expires: "15m" } },
    used: { type: Boolean, default: false, index: true },
    attempts: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
)

export default mongoose.models.StudentOTP || mongoose.model<IStudentOTP>("StudentOTP", StudentOTPSchema)
