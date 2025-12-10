import mongoose, { Schema, type Document } from "mongoose"

export interface IPasswordReset extends Document {
  email: string
  token: string
  expiresAt: Date
  used: boolean
  createdAt: Date
}

const PasswordResetSchema = new Schema<IPasswordReset>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    used: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
)

// Auto-delete expired tokens
PasswordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export default mongoose.models.PasswordReset || mongoose.model<IPasswordReset>("PasswordReset", PasswordResetSchema)
