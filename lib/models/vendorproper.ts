import mongoose, { type Document, Schema } from "mongoose"

export interface IBed extends Document {
  bedNumber: string
  status: "occupied" | "available" | "maintenance" | "notice" | "onbook"
  studentId?: string
  studentName?: string
  rentDueDate?: Date
  noticeDate?: Date
  bookingDate?: Date
}

export interface IRoom extends Document {
  roomNumber: string
  name: string
  noOfSharing: 1 | 2 | 3 | 4 | 5 | 6 | 7
  acType: "AC" | "Non AC"
  bedSize: "Single" | "Double" | "Other"
  displayName: string // Auto-generated from above 3 fields
  totalBeds: number
  occupiedBeds: number
  availableBeds: number
  onNoticeBeds: number
  onBookBeds: number
  rent: number 
  bathroomType?: string
  amenities: string[]
  description?: string
  balcony: boolean
  isActive: boolean
  beds: IBed[]
}

export interface IVendorProperty extends Document {
  vendorId: mongoose.Types.ObjectId
  propertyId: string
  name: string
  type: "Hostel" | "PG" | "Both"
  city: string
  state: string
  area: string
  pincode: string
  contactNumber: string
  alternateNumber?: string
  email?: string
  gender: "male" | "female" | "coed"
  nearbyLandmark?: string
  totalRooms: number
  totalBeds: number
  occupiedBeds: number
  availableBeds: number
  bedsOnNotice: number
  bedsOnBook: number
  monthlyRevenue: number
  rooms: IRoom[]
  amenities: mongoose.Types.ObjectId[]
  rules: string[]
  description?: string
  nearbyPlaces?: string
  images: string[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  pgNickName?: string
  ownerName?: string
  ownerMobile?: string
  caretakerName?: string
  caretakerMobile?: string
  depositType?: "one_rent" | "custom"
  depositAmount?: number
  package?: string
  mainImage?: string
  commonPhotos?: string[]
  slug?: string
  isFeatured?: boolean
  mapLink?: string
  withFood?: boolean
  withoutFood?: boolean
   status?: "public" | "draft"
}

const BedSchema: Schema = new Schema({
  bedNumber: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["occupied", "available", "maintenance", "notice", "onbook"],
    default: "available",
  },
  studentId: {
    type: String,
    trim: true,
  },
  studentName: {
    type: String,
    trim: true,
  },
  rentDueDate: {
    type: Date,
  },
  noticeDate: {
    type: Date,
  },
  bookingDate: {
    type: Date,
  },
})

const RoomSchema: Schema = new Schema({
  roomNumber: {
    type: String,
  },
  name: {
    type: String,
  },
  noOfSharing: {
    type: Number,
    enum: [1, 2, 3, 4, 5, 6, 7],
    required: [true, "Number of sharing is required"],
  },
  acType: {
    type: String,
    enum: ["AC", "Non AC"],
    required: [true, "AC type is required"],
  },
  bedSize: {
    type: String,
    enum: ["Single", "Double", "Other"],
    required: [true, "Bed size is required"],
  },
  displayName: {
    type: String,
    required: [true, "Display name is required"],
  },
  totalBeds: {
    type: Number,
    required: [true, "Total beds is required"],
    min: [1, "Total beds must be at least 1"],
  },
  occupiedBeds: {
    type: Number,
    default: 0,
    min: [0, "Occupied beds cannot be negative"],
  },
  availableBeds: {
    type: Number,
    default: 0,
    min: [0, "Available beds cannot be negative"],
  },
  onNoticeBeds: {
    type: Number,
    default: 0,
    min: [0, "On notice beds cannot be negative"],
  },
  onBookBeds: {
    type: Number,
    default: 0,
    min: [0, "On book beds cannot be negative"],
  },
  rent: {
    type: Number,
    required: [true, "Rent is required"],
    min: [0, "Rent cannot be negative"],
  },
  bathroomType: {
    type: String,
    enum: ["attached", "common"],
  },
  amenities: [
    {
      type: String,
      trim: true,
    },
  ],
  description: {
    type: String,
    trim: true,
  },
  balcony: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  beds: [BedSchema],
})

const VendorPropertySchema: Schema = new Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VendorAuth",
      required: [true, "Vendor ID is required"],
    },
    propertyId: {
      type: String,
      unique: true,
    },
    name: {
      type: String,
      required: [true, "Property name is required"],
      trim: true,
      maxlength: [200, "Property name cannot be more than 200 characters"],
    },
    type: {
      type: String,
      enum: ["Hostel", "PG", "Both"],
      required: [true, "Property type is required"],
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
      maxlength: [100, "City name cannot be more than 100 characters"],
    },
    state: {
      type: String,
      required: [true, "State is required"],
      trim: true,
      maxlength: [100, "State name cannot be more than 100 characters"],
    },
    area: {
      type: String,
      required: [true, "Area is required"],
      trim: true,
      maxlength: [150, "Area cannot be more than 150 characters"],
    },
    pincode: {
      type: String,
      required: [true, "Pincode is required"],
      match: [/^[1-9][0-9]{5}$/, "Please enter a valid pincode"],
    },
    contactNumber: {
      type: String,
      required: [true, "Contact number is required"],
      match: [/^[6-9]\d{9}$/, "Please enter a valid contact number"],
    },
    alternateNumber: {
      type: String,
      match: [/^[6-9]\d{9}$/, "Please enter a valid alternate number"],
    },
    email: {
      type: String,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"],
    },
    gender: {
      type: String,
      enum: ["male", "female", "coed"],
      required: [true, "Gender preference is required"],
    },
    nearbyLandmark: {
      type: String,
      trim: true,
      maxlength: [200, "Nearby landmark cannot be more than 200 characters"],
    },
    totalRooms: {
      type: Number,
      default: 0,
      min: [0, "Total rooms cannot be negative"],
    },
    totalBeds: {
      type: Number,
      default: 0,
      min: [0, "Total beds cannot be negative"],
    },
    occupiedBeds: {
      type: Number,
      default: 0,
      min: [0, "Occupied beds cannot be negative"],
    },
    availableBeds: {
      type: Number,
      default: 0,
      min: [0, "Available beds cannot be negative"],
    },
    bedsOnNotice: {
      type: Number,
      default: 0,
      min: [0, "Beds on notice cannot be negative"],
    },
    bedsOnBook: {
      type: Number,
      default: 0,
      min: [0, "Beds on book cannot be negative"],
    },
    monthlyRevenue: {
      type: Number,
      default: 0,
      min: [0, "Monthly revenue cannot be negative"],
    },
    rooms: [RoomSchema],
    amenities: [{ type: mongoose.Schema.Types.ObjectId, ref: "Amenity" }],
    rules: [{ type: String, trim: true }],
    description: { type: String, trim: true },
    nearbyPlaces: { type: String, trim: true },
    images: [{ type: String, trim: true }],
    isActive: { type: Boolean, default: true },
    slug: { type: String, trim: true, lowercase: true, unique: true, index: true },
    pgNickName: { type: String, trim: true, maxlength: 200 },
    ownerName: { type: String, trim: true, maxlength: 120 },
    ownerMobile: { type: String, match: [/^[6-9]\d{9}$/, "Please enter a valid mobile number"] },
    caretakerName: { type: String, trim: true, maxlength: 120 },
    caretakerMobile: { type: String, match: [/^[6-9]\d{9}$/, "Please enter a valid mobile number"] },
    depositType: { type: String, enum: ["one_rent", "custom"], default: "one_rent" },
    depositAmount: { type: Number, min: [0, "Deposit cannot be negative"], default: 0 },
    package: { type: String, trim: true },
    mainImage: { type: String, trim: true },
    commonPhotos: [{ type: String, trim: true }],
    isFeatured: { type: Boolean, default: false },
    mapLink: { type: String, trim: true },
    withFood: { type: Boolean, default: false },
    withoutFood: { type: Boolean, default: false },
     status: { type: String, enum: ["public", "draft"], default: "draft" },
  },
  {
    timestamps: true,
  },
)

// Create indexes for better performance
VendorPropertySchema.index({ vendorId: 1 })
VendorPropertySchema.index({ city: 1 })
VendorPropertySchema.index({ state: 1 })
VendorPropertySchema.index({ area: 1 })
VendorPropertySchema.index({ type: 1 })
VendorPropertySchema.index({ isActive: 1 })
VendorPropertySchema.index({ slug: 1 }, { unique: true })

const CounterSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  seq: { type: Number, default: 1740 },
})
const Counter = mongoose.models.Counter || mongoose.model("Counter", CounterSchema)

VendorPropertySchema.pre("save", async function (next) {
  if (!this.propertyId) {
    const counter = await Counter.findOneAndUpdate(
      { name: "propertyId" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true },
    )
    this.propertyId = `PG-${counter.seq}`
  }
  next()
})

// Update bed counts when rooms are modified - FIXED TO ONLY COUNT ACTIVE ROOMS
VendorPropertySchema.pre("save", function (next) {
  let totalBeds = 0
  let occupiedBeds = 0
  let availableBeds = 0
  let bedsOnNotice = 0
  let bedsOnBook = 0
  let monthlyRevenue = 0

  const activeRooms = this.rooms.filter((room) => room.isActive)

  activeRooms.forEach((room) => {
    totalBeds += room.totalBeds
    room.beds.forEach((bed) => {
      switch (bed.status) {
        case "occupied":
          occupiedBeds++
          monthlyRevenue += room.rent
          break
        case "available":
          availableBeds++
          break
        case "notice":
          bedsOnNotice++
          monthlyRevenue += room.rent
          break
        case "onbook":
          bedsOnBook++
          break
      }
    })
    room.occupiedBeds = room.beds.filter((bed) => bed.status === "occupied").length
    room.availableBeds = room.beds.filter((bed) => bed.status === "available").length
    room.onNoticeBeds = room.beds.filter((bed) => bed.status === "notice").length
    room.onBookBeds = room.beds.filter((bed) => bed.status === "onbook").length
  })

  this.totalBeds = totalBeds
  this.occupiedBeds = occupiedBeds
  this.availableBeds = availableBeds
  this.bedsOnNotice = bedsOnNotice
  this.bedsOnBook = bedsOnBook
  this.totalRooms = activeRooms.length
  this.monthlyRevenue = monthlyRevenue

  next()
})

// Keep images array in sync for backwards compatibility
VendorPropertySchema.pre("save", function (next) {
  try {
    const currentImages: string[] = Array.isArray((this as any).images) ? (this as any).images : []
    const main: string[] = (this as any).mainImage ? [(this as any).mainImage] : []
    const commons: string[] = Array.isArray((this as any).commonPhotos) ? (this as any).commonPhotos.slice(0, 8) : []
    const merged = Array.from(new Set([...main, ...commons].filter(Boolean)))
    ;(this as any).images = merged
  } catch {}
  next()
})

// Generate slug on create/save and when name changes
VendorPropertySchema.pre("save", async function (next) {
  try {
    // If slug already exists and name hasn't changed, keep it
    const needsSlug =
      !this.slug || this.isModified("name") || (!this.slug && (this as any).pgNickName && this.isModified("pgNickName"))

    if (needsSlug) {
      const Model = mongoose.models.VendorProperty as any
      const baseSource = this.name || (this as any).pgNickName || this.propertyId || this._id?.toString()
      const base = toSlug(baseSource)
      this.slug = await generateUniqueSlug(Model, base, this._id as any)
    }
    next()
  } catch (err) {
    next(err as any)
  }
})

// Handle slug when updating via findOneAndUpdate (PUT routes)
VendorPropertySchema.pre("findOneAndUpdate", async function (next) {
  try {
    const update = (this.getUpdate() || {}) as any
    const set = update.$set || update

    // If name or pgNickName is being updated, recompute slug
    if (set?.name || set?.pgNickName) {
      const doc = await (this as any).model.findOne(this.getQuery()).select("_id propertyId")
      const baseSource = set.name || set.pgNickName || doc?.propertyId || doc?._id?.toString()
      const base = toSlug(baseSource)
      const Model = (this as any).model
      const uniqueSlug = await generateUniqueSlug(Model, base, doc?._id)
      if (update.$set) update.$set.slug = uniqueSlug
      else update.slug = uniqueSlug
    }
    next()
  } catch (err) {
    next(err as any)
  }
})

function toSlug(input: string) {
  return String(input || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
}

async function generateUniqueSlug(
  model: typeof mongoose.models.VendorProperty,
  base: string,
  excludeId?: mongoose.Types.ObjectId,
) {
  const candidate = base || "property"
  let suffix = 0

  // Try candidate, then candidate-2, -3, ...
  // Note: we keep 1 as plain candidate to avoid "-1"
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const slugToTest = suffix <= 1 ? candidate : `${candidate}-${suffix}`
    const existing = await model.findOne(
      excludeId ? { slug: slugToTest, _id: { $ne: excludeId } } : { slug: slugToTest },
    )
    if (!existing) return slugToTest
    suffix++
  }
}

const VendorProperty =
  mongoose.models.VendorProperty || mongoose.model<IVendorProperty>("VendorProperty", VendorPropertySchema)

export default VendorProperty
