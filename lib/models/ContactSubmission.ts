import { Schema, type Document, models, model } from "mongoose"

export interface IContactSubmission extends Document {
  name: string
  email: string
  phone: string
  role: "Tenant" | "Property Owner" | "Other"
  description: string
  status: "new" | "read" | "responded"
  createdAt: Date
}

const ContactSubmissionSchema = new Schema<IContactSubmission>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Mobile is required"],
      trim: true,
    },
    role: {
      type: String,
      enum: ["Tenant", "Property Owner", "Other"],
      required: [true, "Role is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["new", "read", "responded"],
      default: "new",
    },
  },
  { timestamps: true },
)

const ContactSubmission =
  models.ContactSubmission || model<IContactSubmission>("ContactSubmission", ContactSubmissionSchema)
export default ContactSubmission
