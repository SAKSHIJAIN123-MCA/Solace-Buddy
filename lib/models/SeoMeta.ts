import { Schema, models, model } from "mongoose"

const SeoMetaSchema = new Schema(
  {
    pageType: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    keywords: { type: [String], required: true, default: [] },
  },
  { timestamps: true },
)

export const SeoMeta = models.SeoMeta || model("SeoMeta", SeoMetaSchema)
