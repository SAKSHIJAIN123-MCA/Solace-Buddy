import mongoose, { type Document, Schema } from "mongoose"

export interface IWishlist extends Document {
  userId: string // For now using string, can be ObjectId later when user auth is implemented
  propertyId: mongoose.Types.ObjectId
  property?: {
    _id: string
    propertyId: string
    name: string
    type: "Hostel" | "PG" | "Both"
    address: string
    city: string
    state: string
    gender: "male" | "female" | "coed"
    rentRange: { min: number; max: number }
    totalBeds: number
    availableBeds: number
    amenities: string[]
    images: string[]
    nearbyLandmark?: string
    slug?: string
  }
  createdAt: Date
  updatedAt: Date
}

const WishlistSchema: Schema = new Schema(
  {
    userId: {
      type: String,
      required: [true, "User ID is required"],
      trim: true,
    },
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VendorProperty",
      required: [true, "Property ID is required"],
    },
  },
  {
    timestamps: true,
  },
)

// Create compound index to prevent duplicate entries
WishlistSchema.index({ userId: 1, propertyId: 1 }, { unique: true })

// Create indexes for better performance
WishlistSchema.index({ userId: 1 })
WishlistSchema.index({ propertyId: 1 })
WishlistSchema.index({ createdAt: -1 })

const Wishlist = mongoose.models.Wishlist || mongoose.model<IWishlist>("Wishlist", WishlistSchema)

export default Wishlist
