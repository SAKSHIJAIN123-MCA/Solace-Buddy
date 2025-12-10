import mongoose, { Schema, type Document, type Model } from "mongoose"

// Interfaces for documents
export interface ICountry extends Document {
  name: string
  code: string
}

export interface IState extends Document {
  name: string
  country: mongoose.Types.ObjectId | ICountry
}

export interface ICity extends Document {
  name: string
  state: mongoose.Types.ObjectId | IState
}

export interface IArea extends Document {
  name: string
  city: mongoose.Types.ObjectId | ICity
}

// Schemas
const CountrySchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    code: { type: String, required: true, unique: true, uppercase: true },
  },
  { timestamps: true },
)

const StateSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    country: { type: Schema.Types.ObjectId, ref: "Country", required: true },
  },
  { timestamps: true },
)

// Add compound index to ensure unique state names within a country
StateSchema.index({ name: 1, country: 1 }, { unique: true })

const CitySchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    state: { type: Schema.Types.ObjectId, ref: "State", required: true },
  },
  { timestamps: true },
)

// Add compound index to ensure unique city names within a state
CitySchema.index({ name: 1, state: 1 }, { unique: true })

const AreaSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    city: { type: Schema.Types.ObjectId, ref: "City", required: true },
  },
  { timestamps: true },
)

// Add compound index to ensure unique area names within a city
AreaSchema.index({ name: 1, city: 1 }, { unique: true })

// Models
const Country: Model<ICountry> = mongoose.models.Country || mongoose.model<ICountry>("Country", CountrySchema)
const State: Model<IState> = mongoose.models.State || mongoose.model<IState>("State", StateSchema)
const City: Model<ICity> = mongoose.models.City || mongoose.model<ICity>("City", CitySchema)
const Area: Model<IArea> = mongoose.models.Area || mongoose.model<IArea>("Area", AreaSchema)

export { Country, State, City, Area }
