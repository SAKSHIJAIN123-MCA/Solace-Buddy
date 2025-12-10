import { Schema, type Document, model, models } from "mongoose"

// TypeScript Interface
export interface IHeroSlide extends Document {
  title: string
  subtitle?: string
  description?: string
  image: string
  link?: string
  buttonText?: string
  isActive: boolean
  order: number
  createdAt?: Date
  updatedAt?: Date
}

// Schema Definition
const HeroSlideSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    subtitle: { type: String, default: "" },
    description: { type: String, default: "" },
    image: { type: String, required: true },
    link: { type: String, default: "" },
    buttonText: { type: String, default: "Learn More" },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  },
)

// Model Export
const HeroSlide = models.HeroSlide || model<IHeroSlide>("HeroSlide", HeroSlideSchema)
export default HeroSlide
