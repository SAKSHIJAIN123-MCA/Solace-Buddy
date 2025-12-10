import mongoose, { type Document, Schema } from "mongoose"

export interface IVendor extends Document {
  name: string
  ownerName: string
  email: string
  phone: string
  businessType: "Hostel" | "PG" | "Both"
  status: "active" | "pending" | "suspended" | "rejected"
  registrationDate: Date
  verificationStatus: "verified" | "pending" | "rejected"
  createdAt: Date
  updatedAt: Date
}

const VendorSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Business name is required"],
      trim: true,
      maxlength: [200, "Business name cannot be more than 200 characters"],
    },
    ownerName: {
      type: String,
      required: [true, "Owner name is required"],
      trim: true,
      maxlength: [100, "Owner name cannot be more than 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      match: [/^[+]?[1-9][\d]{0,15}$/, "Please enter a valid phone number"],
    },
    businessType: {
      type: String,
      required: [true, "Business type is required"],
      enum: ["Hostel", "PG", "Both"],
    },
    status: {
      type: String,
      enum: ["active", "pending", "suspended", "rejected"],
      default: "pending",
    },
    registrationDate: {
      type: Date,
      default: Date.now,
    },
    verificationStatus: {
      type: String,
      enum: ["verified", "pending", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
)

VendorSchema.index({ email: 1 })
VendorSchema.index({ status: 1 })
VendorSchema.index({ verificationStatus: 1 })
VendorSchema.index({ businessType: 1 })
VendorSchema.index({ registrationDate: -1 })

export default mongoose.models.Vendor || mongoose.model<IVendor>("Vendor", VendorSchema)
