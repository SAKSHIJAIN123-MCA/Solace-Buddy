import mongoose from "mongoose"

export interface IReturnRefundPolicy extends mongoose.Document {
  title: string
  description: string
  updatedAt: Date
}

const returnRefundPolicySchema = new mongoose.Schema<IReturnRefundPolicy>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
  },
  { timestamps: true },
)

export const ReturnRefundPolicy =
  mongoose.models.ReturnRefundPolicy ||
  mongoose.model<IReturnRefundPolicy>("ReturnRefundPolicy", returnRefundPolicySchema)
