import type mongoose from "mongoose"
import { Schema, models, model, type Model } from "mongoose"

export interface IPayment {
  _id?: mongoose.Types.ObjectId
  student: mongoose.Types.ObjectId
  type: "credit" | "debit"
  amount: number
  note?: string
  createdAt?: Date
  updatedAt?: Date
}

const PaymentSchema = new Schema<IPayment>(
  {
    student: { type: Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    type: { type: String, enum: ["credit", "debit"], required: true },
    amount: { type: Number, required: true, min: 0 },
    note: { type: String },
  },
  { timestamps: true },
)

PaymentSchema.index({ student: 1, createdAt: -1 })

export default (models.Payment as Model<IPayment>) || model<IPayment>("Payment", PaymentSchema)
