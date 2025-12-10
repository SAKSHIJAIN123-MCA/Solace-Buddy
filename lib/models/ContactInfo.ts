import { Schema, type Document, models, model } from "mongoose"

export interface IContactInfo extends Document {
  type: string
  title: string
  content: Record<string, string>
  icon: string
  order: number
}

const ContactInfoSchema = new Schema<IContactInfo>(
  {
    type: {
      type: String,
      required: [true, "Type is required"],
      enum: ["address", "phone", "email", "hours"],
      trim: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    content: {
      type: Map,
      of: String,
      required: [true, "Content is required"],
    },
    icon: {
      type: String,
      required: [true, "Icon is required"],
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
)

const ContactInfo = models.ContactInfo || model<IContactInfo>("ContactInfo", ContactInfoSchema)
export default ContactInfo
