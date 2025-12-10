import type mongoose from "mongoose"
import { Schema, models, model, type Model } from "mongoose"

export interface IWalletRequest {
  _id?: mongoose.Types.ObjectId
  student: mongoose.Types.ObjectId
  amount: number
  paymentMethod: "upi" | "bank_transfer"
  status: "pending" | "approved" | "rejected"
  note?: string
  adminNote?: string
  createdAt?: Date
  updatedAt?: Date
}

const WalletRequestSchema = new Schema<IWalletRequest>(
  {
    student: { type: Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    amount: { type: Number, required: true, min: 1 },
    paymentMethod: { type: String, enum: ["upi", "bank_transfer"], required: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    note: { type: String },
    adminNote: { type: String },
  },
  { timestamps: true },
)

WalletRequestSchema.index({ student: 1, createdAt: -1 })
WalletRequestSchema.index({ status: 1, createdAt: -1 })

export default (models.WalletRequest as Model<IWalletRequest>) ||
  model<IWalletRequest>("WalletRequest", WalletRequestSchema)
