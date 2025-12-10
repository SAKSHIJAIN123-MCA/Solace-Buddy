import mongoose, { Schema, type Document } from "mongoose"

export interface IBanner extends Document {
  title: string
  subtitle: string
  description: string
  buttonText: string
  buttonLink: string
  backgroundImage: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const BannerSchema = new Schema<IBanner>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subtitle: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    buttonText: {
      type: String,
      required: true,
      trim: true,
    },
    buttonLink: {
      type: String,
      required: true,
      trim: true,
    },
    backgroundImage: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
)

// Now multiple banners can be active simultaneously

export const Banner = mongoose.models.Banner || mongoose.model<IBanner>("Banner", BannerSchema)
