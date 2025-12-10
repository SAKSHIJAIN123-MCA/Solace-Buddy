import type mongoose from "mongoose"
import { Schema, models, model } from "mongoose"

export type PackageName = "silver" | "gold" | "platinum"

export interface AdvanceRule {
  percent: number // e.g., 25 means 25%
  minRupees: number // e.g., 2500
}

export interface PackageDoc extends mongoose.Document {
  name: string
  features: {
    freeListingOnWebsite: boolean
    freeSocialMediaPromotion: boolean
    top5SearchResult: boolean
    bannerOnHomePageRecommendedBadge: boolean
    pricePerTenantPlacement: boolean
  }
  advanceRule: AdvanceRule
  active: boolean
  createdAt: Date
  updatedAt: Date
}

const FeaturesSchema = new Schema(
  {
    freeListingOnWebsite: { type: Boolean, default: false },
    freeSocialMediaPromotion: { type: Boolean, default: false },
    top5SearchResult: { type: Boolean, default: false },
    bannerOnHomePageRecommendedBadge: { type: Boolean, default: false },
    pricePerTenantPlacement: { type: Boolean, default: false },
  },
  { _id: false },
)

const PackageSchema = new Schema<PackageDoc>(
  {
    name: { type: String, required: true, trim: true, lowercase: true, unique: true },
    features: { type: FeaturesSchema, default: () => ({}) },
    advanceRule: {
      type: new Schema<AdvanceRule>(
        {
          percent: { type: Number, default: 30, min: 0, max: 1000 }, // allow up to 1000 for future flexibility
          minRupees: { type: Number, default: 3000, min: 0 },
        },
        { _id: false },
      ),
      default: () => ({ percent: 30, minRupees: 3000 }),
    },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
)

export default (models.Package as mongoose.Model<PackageDoc>) || model<PackageDoc>("Package", PackageSchema)
