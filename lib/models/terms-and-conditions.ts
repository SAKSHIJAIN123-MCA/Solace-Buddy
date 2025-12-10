import mongoose from "mongoose"

export interface ITermsAndConditions extends mongoose.Document {
  title: string
  description: string
  updatedAt: Date
}

const termsAndConditionsSchema = new mongoose.Schema<ITermsAndConditions>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
  },
  { timestamps: true },
)

export const TermsAndConditions =
  mongoose.models.TermsAndConditions ||
  mongoose.model<ITermsAndConditions>("TermsAndConditions", termsAndConditionsSchema)
