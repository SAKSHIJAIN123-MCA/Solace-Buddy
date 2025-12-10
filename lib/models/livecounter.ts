import mongoose, { Schema, type Document, type Model } from "mongoose"

export interface ILiveCounter extends Document {
  label?: string
  value?: number
  icon?: string
  order?: number
  isActive?: boolean
  createdAt?: Date
  updatedAt?: Date
}

const LiveCounterSchema: Schema = new Schema(
  {
    label: {
      type: String,
      required: false,
    },
    value: {
      type: Number,
      required: false,
      default: 0,
    },
    icon: {
      type: String,
      required: false,
    },
    order: {
      type: Number,
      required: false,
      default: 0,
    },
    isActive: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
  {
    timestamps: true,
  },
)

const LiveCounter: Model<ILiveCounter> =
  mongoose.models.LiveCounter || mongoose.model<ILiveCounter>("LiveCounter", LiveCounterSchema)

export default LiveCounter
