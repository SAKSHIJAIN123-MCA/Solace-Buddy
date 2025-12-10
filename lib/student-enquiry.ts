import mongoose, { type Document, Schema } from "mongoose"

export interface IStudentEnquiry extends Document {
  studentName: string
  email: string
  phone: string
  subject: string
  message: string
  preferredLocation?: string
  budget?: string
  accommodationType?: "Hostel" | "PG" | "Both"
  duration?: string
  moveInDate?: Date
  college?: string
  course?: string
  year?: string
  gender?: "Male" | "Female" | "Other"
  status: "pending" | "responded" | "closed" | "spam"
  priority: "low" | "medium" | "high"
  source: "website" | "phone" | "email" | "referral" | "other"
  response?: string
  respondedAt?: Date
  respondedBy?: string
  notes?: string
  followUpDate?: Date
  assignedTo?: string
  createdAt: Date
  updatedAt: Date
}

const StudentEnquirySchema: Schema = new Schema(
  {
    studentName: {
      type: String,
      required: [true, "Student name is required"],
      trim: true,
      maxlength: [100, "Student name cannot be more than 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      match: [/^[+]?[1-9][\d]{0,15}$/, "Please enter a valid phone number"],
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
      maxlength: [300, "Subject cannot be more than 300 characters"],
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      maxlength: [2000, "Message cannot be more than 2000 characters"],
    },
    preferredLocation: {
      type: String,
      trim: true,
      maxlength: [200, "Preferred location cannot be more than 200 characters"],
    },
    budget: {
      type: String,
      trim: true,
      maxlength: [50, "Budget cannot be more than 50 characters"],
    },
    accommodationType: {
      type: String,
      enum: ["Hostel", "PG", "Both"],
    },
    duration: {
      type: String,
      trim: true,
      maxlength: [50, "Duration cannot be more than 50 characters"],
    },
    moveInDate: {
      type: Date,
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
      enum: ["1st Year", "2nd Year", "3rd Year", "Final Year", "Post Graduate", "Working Professional"],
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },
    status: {
      type: String,
      enum: ["pending", "responded", "closed", "spam"],
      default: "pending",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    source: {
      type: String,
      enum: ["website", "phone", "email", "referral", "other"],
      default: "website",
    },
    response: {
      type: String,
      trim: true,
      maxlength: [2000, "Response cannot be more than 2000 characters"],
    },
    respondedAt: {
      type: Date,
    },
    respondedBy: {
      type: String,
      trim: true,
      maxlength: [100, "Responded by cannot be more than 100 characters"],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, "Notes cannot be more than 1000 characters"],
    },
    followUpDate: {
      type: Date,
    },
    assignedTo: {
      type: String,
      trim: true,
      maxlength: [100, "Assigned to cannot be more than 100 characters"],
    },
  },
  {
    timestamps: true,
  },
)

// Create indexes for better performance
StudentEnquirySchema.index({ email: 1 })
StudentEnquirySchema.index({ status: 1 })
StudentEnquirySchema.index({ priority: 1 })
StudentEnquirySchema.index({ preferredLocation: 1 })
StudentEnquirySchema.index({ accommodationType: 1 })
StudentEnquirySchema.index({ createdAt: -1 })
StudentEnquirySchema.index({ followUpDate: 1 })

export default mongoose.models.StudentEnquiry || mongoose.model<IStudentEnquiry>("StudentEnquiry", StudentEnquirySchema)
