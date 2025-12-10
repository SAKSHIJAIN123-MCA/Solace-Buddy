import mongoose, { type Document, Schema } from "mongoose"

export interface IStudent extends Document {
  name: string
  email: string
  city: string
  phone?: string
  college?: string
  course?: string
  year?: string
  address?: string
  parentContact?: string
  status: "active" | "inactive" | "suspended"
  registrationDate: Date
  lastLogin: Date
  totalBookings: number
  currentBooking?: string
  createdAt: Date
  updatedAt: Date
}

const StudentSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot be more than 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"],
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
      maxlength: [100, "City cannot be more than 100 characters"],
    },
    phone: {
      type: String,
      match: [/^[+]?[1-9][\d]{0,15}$/, "Please enter a valid phone number"],
    },
    college: {
      type: String,
      trim: true,
      maxlength: [200, "College name cannot be more than 200 characters"],
    },
    course: {
      type: String,
      trim: true,
      maxlength: [100, "Course name cannot be more than 100 characters"],
    },
    year: {
      type: String,
      enum: ["1st Year", "2nd Year", "3rd Year", "Final Year", "Post Graduate"],
    },
    address: {
      type: String,
      trim: true,
      maxlength: [300, "Address cannot be more than 300 characters"],
    },
    parentContact: {
      type: String,
      match: [/^[+]?[1-9][\d]{0,15}$/, "Please enter a valid parent contact number"],
    },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },
    registrationDate: {
      type: Date,
      default: Date.now,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    totalBookings: {
      type: Number,
      default: 0,
      min: 0,
    },
    currentBooking: {
      type: String,
      trim: true,
      maxlength: [200, "Current booking cannot be more than 200 characters"],
    },
  },
  {
    timestamps: true,
  },
)

// Create indexes for better performance
StudentSchema.index({ email: 1 })
StudentSchema.index({ status: 1 })
StudentSchema.index({ college: 1 })
StudentSchema.index({ registrationDate: -1 })

export default mongoose.models.Student || mongoose.model<IStudent>("Student", StudentSchema)
