import mongoose, { type Document, Schema } from "mongoose"

export interface IVisitRequest extends Document {
  propertyId: mongoose.Types.ObjectId
  propertyName: string
  fullName: string
  mobile: string
  email: string
  visitDate: Date
  visitTime: "12pm-3pm" | "4pm-7pm"
  status: "pending" | "confirmed" | "completed" | "cancelled"
  notes?: string
  createdAt: Date
  updatedAt: Date
}

const VisitRequestSchema: Schema = new Schema(
  {
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VendorProperty",
      required: [true, "Property ID is required"],
    },
    propertyName: {
      type: String,
      required: [true, "Property name is required"],
      trim: true,
    },
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      maxlength: [100, "Full name cannot be more than 100 characters"],
    },
    mobile: {
      type: String,
      required: [true, "Mobile number is required"],
      match: [/^[6-9]\d{9}$/, "Please enter a valid mobile number"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"],
      trim: true,
    },
    visitDate: {
      type: Date,
      required: [true, "Visit date is required"],
    },
    visitTime: {
      type: String,
      enum: ["12pm-3pm", "4pm-7pm"],
      required: [true, "Visit time is required"],
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Notes cannot be more than 500 characters"],
    },
  },
  {
    timestamps: true,
  },
)

// Create indexes for better performance
VisitRequestSchema.index({ propertyId: 1 })
VisitRequestSchema.index({ mobile: 1 })
VisitRequestSchema.index({ email: 1 })
VisitRequestSchema.index({ visitDate: 1 })
VisitRequestSchema.index({ status: 1 })
VisitRequestSchema.index({ createdAt: -1 })

const VisitRequest = mongoose.models.VisitRequest || mongoose.model<IVisitRequest>("VisitRequest", VisitRequestSchema)

export default VisitRequest
