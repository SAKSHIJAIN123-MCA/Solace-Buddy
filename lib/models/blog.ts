import mongoose, { Schema, type Document, type Model } from "mongoose"

export interface IBlogPost extends Document {
  title: string
  author: string
  status: "draft" | "published"
  date: Date
  views: number
  content: string
  tags: string[]
  metaDescription: string
  image?: string // URL to the uploaded image
  slug?: string // URL-friendly slug for routing
}

const BlogPostSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    author: { type: String, required: true, default: "Admin" },
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    date: { type: Date, default: Date.now },
    views: { type: Number, default: 0 },
    content: { type: String, required: true },
    tags: { type: [String], default: [] },
    metaDescription: { type: String, default: "" },
    image: { type: String, default: "" }, // Added image field
    slug: { type: String, unique: true, sparse: true }, // Added slug field for routing
  },
  {
    timestamps: true,
  },
)

const BlogPost: Model<IBlogPost> = mongoose.models.BlogPost || mongoose.model<IBlogPost>("BlogPost", BlogPostSchema)

export default BlogPost
