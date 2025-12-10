import mongoose from "mongoose";

export interface IPrivacyPolicy extends mongoose.Document {
  title: string;
  description: string;
  updatedAt: Date;
}

const privacyPolicySchema = new mongoose.Schema<IPrivacyPolicy>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
  },
  { timestamps: true }
);

export const PrivacyPolicy =
  mongoose.models.PrivacyPolicy || mongoose.model<IPrivacyPolicy>("PrivacyPolicy", privacyPolicySchema);
