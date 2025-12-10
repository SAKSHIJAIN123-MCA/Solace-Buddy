import mongoose, { Schema, type Document } from "mongoose"

export interface IBooking extends Document {
  bookingId: string
  student: mongoose.Types.ObjectId
  property: mongoose.Types.ObjectId
  room: mongoose.Types.ObjectId
  bed: mongoose.Types.ObjectId
  checkInDate: Date
  totalAmount: number
  advanceAmount: number
  remainingAmount: number
  paymentMethod: string
  paymentScreenshot?: string
  paymentStatus: string
  bookingStatus: "pending" | "confirmed" | "cancelled" | "completed"
  bookingSource: "frontend" | "admin"
  specialRequests?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

function normalizePaymentStatus(v: any) {
  const s = (v ?? "").toString()
  switch (s) {
    case "pending":
      return "Pending"
    case "partial":
      return "Partially Paid"
    case "completed":
      return "Full Amount Paid"
    case "Pending":
    case "Booking Amount Paid":
    case "Full Amount Paid":
    case "Partially Paid":
      return s
    default:
      return s
  }
}

const BookingSchema: Schema = new Schema(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
      default: () => "BK" + Date.now().toString().slice(-8) + Math.random().toString(36).substr(2, 4).toUpperCase(),
    },
    student: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: [true, "Student is required"],
    },
    property: {
      type: Schema.Types.ObjectId,
      ref: "VendorProperty",
      required: [true, "Property is required"],
    },
    room: {
      type: Schema.Types.ObjectId,
      required: [true, "Room is required"],
    },
    bed: {
      type: Schema.Types.ObjectId,
      required: [true, "Bed is required"],
    },
    checkInDate: {
      type: Date,
      required: [true, "Check-in date is required"],
    },
    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
      min: [0, "Total amount cannot be negative"],
    },
    advanceAmount: {
      type: Number,
      required: [true, "Advance amount is required"],
      min: [0, "Advance amount cannot be negative"],
    },
    remainingAmount: {
      type: Number,
      required: [true, "Remaining amount is required"],
      min: [0, "Remaining amount cannot be negative"],
    },
    paymentMethod: {
      type: String,
      required: [true, "Payment method is required"],
      enum: ["Cash", "UPI", "Bank Transfer", "Credit Card", "Debit Card", "Online"],
    },
    paymentScreenshot: {
      type: String,
      trim: true,
    },
    paymentStatus: {
      type: String,
      default: "Pending",
      set: normalizePaymentStatus,
    },
    bookingStatus: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },
    bookingSource: {
      type: String,
      enum: ["frontend", "admin"],
      default: "admin",
    },
    specialRequests: {
      type: String,
      trim: true,
      maxlength: [500, "Special requests cannot exceed 500 characters"],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, "Notes cannot exceed 1000 characters"],
    },
  },
  {
    timestamps: true,
  },
)

// Indexes for better performance
BookingSchema.index({ bookingId: 1 })
BookingSchema.index({ student: 1 })
BookingSchema.index({ property: 1 })
BookingSchema.index({ room: 1 })
BookingSchema.index({ bed: 1 })
BookingSchema.index({ bookingStatus: 1 })
BookingSchema.index({ checkInDate: 1 })

// Pre-save middleware to calculate remaining amount
BookingSchema.pre("save", function (next) {
  if (this.isModified("totalAmount") || this.isModified("advanceAmount")) {
    this.remainingAmount = this.totalAmount - this.advanceAmount
  }
  next()
})

const Booking = mongoose.models.Booking || mongoose.model<IBooking>("Booking", BookingSchema)

export default Booking
export { normalizePaymentStatus }
