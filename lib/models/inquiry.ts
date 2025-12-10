import mongoose from "mongoose"

const inquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    mobile: { type: String, required: true },
    email: { type: String, required: true },
    gender: { type: String, required: true },
    neededFrom: { type: String, required: true },
    city: { type: String, required: true },
    areas: [{ type: String, required: true }],
    otherRequirements: { type: String },
    acPreference: { type: String },
    sharingPreference: [{ type: String }],
    budget: { type: String },
    preferredVisitDate: { type: String },
    submittedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  },
)

export const Inquiry = mongoose.models.Inquiry || mongoose.model("Inquiry", inquirySchema)
