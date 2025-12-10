import mongoose, { Schema, Document, Model } from 'mongoose';

// Define the interface for an Amenity document
export interface IAmenity extends Document {
  name: string;
  description: string;
  icon: string; // This will now store a Base64 encoded image string
  status: 'active' | 'inactive';
}

// Define the Mongoose Schema
const AmenitySchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, default: '' },
  icon: { type: String, required: true }, // Store Base64 string
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, {
  timestamps: true, // Adds createdAt and updatedAt timestamps
});

// Create and export the Mongoose Model
const Amenity: Model<IAmenity> = mongoose.models.Amenity || mongoose.model<IAmenity>('Amenity', AmenitySchema);

export default Amenity;
