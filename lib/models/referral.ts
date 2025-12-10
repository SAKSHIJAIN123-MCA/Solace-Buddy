import mongoose, { Schema, type Document, type Types } from "mongoose"

export interface IReferral extends Document {
  referrerId: Types.ObjectId
  referredId: Types.ObjectId
  createdAt: Date
}

const ReferralSchema = new Schema<IReferral>(
  {
    referrerId: { type: Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    referredId: { type: Schema.Types.ObjectId, ref: "Student", required: true, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
)

export default mongoose.models.Referral || mongoose.model<IReferral>("Referral", ReferralSchema)
